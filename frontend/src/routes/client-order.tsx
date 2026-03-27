import * as React from 'react'
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus, Trash2, Edit2, X, Database } from 'lucide-react'
import { DiseaseTagInput } from '@/components/DiseaseTagInput'
import { addOrders } from '@/servers/order.functions'
import { getLatestCase } from '@/servers/case.functions'
import { formatCode, numToString, stringToNum } from '@/lib/utils'
import { toast } from 'sonner'
import { checkSampleDup } from '@/servers/sample.functions'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { getSessionFn } from '@/servers/user.functions'

interface PatientRecord {
  id: string
  code: string
  bcode: string | null
  visit: string | null
  age: number
  sex: string
  clinicalStatus: string
  liverStatus: string
  etiology: string[]
  addEtiology: string
  note: string
}

export const Route = createFileRoute('/client-order')({
  beforeLoad: async () => {
    const session = await getSessionFn()

    if (!session?.user) {
      throw redirect({
        to: '/login',
      })
    }

    return {
      session,
    }
  },
  loader: async ({ context }) => {
    const latestBCode = await getLatestCase()

    return { session: context.session, latestBCode: latestBCode }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const navigate = useNavigate()
  const { session, latestBCode } = Route.useLoaderData()
  const orgSlug = session?.org?.hCode

  const [currentBCode, setCurrentBCode] = useState(() => {
    const b = latestBCode?.bCode
    return typeof b === 'string' && b !== 'never' ? stringToNum(b, 2) : 0
  })

  const [patients, setPatients] = useState<PatientRecord[]>([])

  React.useEffect(() => {
    const saved = localStorage.getItem('pending_patients')
    if (saved) {
      try {
        setPatients(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse patients', e)
      }
    }
  }, [])

  React.useEffect(() => {
  if (patients.length > 0) {
    localStorage.setItem('pending_patients', JSON.stringify(patients))
  } else {
    localStorage.removeItem('pending_patients') 
  }
}, [patients])

  const [editingId, setEditingId] = useState<string | null>(null)

  // Entry States
  const [currentCode, setCurrentCode] = useState(`${orgSlug}-`)
  const [currentAge, setCurrentAge] = useState('')
  const [currentSex, setCurrentSex] = useState('')
  const [currentClinical, setCurrentClinical] = useState('')
  const [currentLiver, setCurrentLiver] = useState('')
  const [currentEtiology, setCurrentEtiology] = useState<string[]>([])
  const [additionalEtiology, setAdditionalEtiology] = useState('')
  const [currentNote, setCurrentNote] = useState('')
  const [tagKey, setTagKey] = useState(0) // Used to reset the child component

  const [error, setError] = React.useState<string | null>(null)

  const handleAddOrUpdate = async () => {
    // Validation
    if (currentCode.length < 5) {
      setError('Patient code is too short')
      return
    }
    if (!currentAge || !currentSex || !currentClinical) {
      setError('Please fill in required fields: Age, Sex, and Clinical Status')
      return
    }

    if (!editingId) {
      // --- ADD NEW LOGIC ---
      const caseDup = await checkSampleDup({ data: currentCode.toUpperCase() })
      if (!caseDup.success) return

      let caseId: string | null
      let bCodeNum: string
      let visitNum: number = caseDup.visit + 1

      if (typeof caseDup.bCode === 'string' && caseDup.bCode !== 'never') {
        bCodeNum = formatCode(caseDup.bCode, 2)
      } else {
        const nextSequenceValue = currentBCode + 1
        setCurrentBCode(nextSequenceValue)
        bCodeNum = numToString(session?.org.bCode as string, nextSequenceValue)
      }

      caseId = caseDup.caseId

      const newPatient: PatientRecord = {
        id: caseId === null ? crypto.randomUUID() : caseId,
        code: currentCode.toUpperCase(),
        bcode: bCodeNum,
        visit: `V${visitNum}`,
        age: Number(currentAge),
        sex: currentSex,
        clinicalStatus: currentClinical, // from Select
        liverStatus: currentLiver, // from Radio
        etiology: currentEtiology, // from Checkboxes (Array)
        addEtiology: additionalEtiology,
        note: currentNote,
      }

      setPatients((prev) => [...prev, newPatient])
    } else {
      // --- UPDATE EXISTING LOGIC ---
      setPatients((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                code: currentCode.toUpperCase(),
                age: Number(currentAge),
                sex: currentSex,
                clinicalStatus: currentClinical,
                liverStatus: currentLiver,
                etiology: currentEtiology,
                addEtiology: additionalEtiology,
                note: currentNote,
              }
            : p,
        ),
      )
      setEditingId(null)
    }

    resetForm()
    setError(null)
  }

  const startEdit = (patient: PatientRecord) => {
    setEditingId(patient.id)
    setCurrentCode(patient.code)
    setCurrentAge(patient.age.toString())
    setCurrentSex(patient.sex)
    setCurrentClinical(patient.clinicalStatus)
    setCurrentLiver(patient.liverStatus)
    setCurrentEtiology(Array.isArray(patient.etiology) ? patient.etiology : [])
    setAdditionalEtiology(patient.addEtiology || '')
    setCurrentNote(patient.note)
    setTagKey((prev) => prev + 1)
  }

  const resetForm = () => {
    setEditingId(null)
    setCurrentCode(`${orgSlug}-`)
    setCurrentAge('')
    setCurrentSex('')
    setCurrentClinical('')
    setCurrentLiver('')
    setCurrentEtiology([])
    setAdditionalEtiology('')
    setCurrentNote('')
    setTagKey((prev) => prev + 1)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const payload = patients.map((p) => {
        // 2. Add the current index + 1 to the starting number
        return {
          caseId: p.id,
          hospitalId: session?.org.id,
          hospitalCode: p.code.replace('-', ''),
          biobankCode: p.bcode?.replace('-', ''),
          visit: p.visit !== null ? stringToNum(p?.visit, 1) : null,
          age: p.age,
          sex: p.sex,
          clinicalStatus: p.clinicalStatus.toLowerCase(),
          liverStatus:
            p.liverStatus.toLowerCase() === '' ? null : p.liverStatus,
          etiology: p.etiology,
          additionalEtiology:
            p.addEtiology && p.addEtiology.trim() !== ''
              ? p.addEtiology
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
              : [],
          note: p.note === '' ? null : p.note,
        }
      })

      const order = await addOrders({ data: payload })

      if (order?.success) {
        toast.success(order?.message, { position: 'top-center' })
      } else {
        toast.error(order?.message, { position: 'top-center' })
        return
      }

      await router.invalidate()
      localStorage.removeItem('pending_patients')
      setPatients([])
      setCurrentCode(`${orgSlug}-`)
      setCurrentAge('')

      await navigate({ to: '/client-order' })
    } catch (err) {
      console.error(err)
      // setError('Failed to login. Please try again.')
    }
  }

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Order</h1>

      <Card className={editingId ? 'border-orange-500 shadow-md' : ''}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            {editingId ? (
              <Edit2 className="w-4 h-4 text-orange-500" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {editingId ? 'EDITING PATIENT' : 'ADD NEW PATIENT'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="patient-code">Patient Code</Label>
              <Input
                id="patient-code"
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                type="text"
                className="uppercase"
                placeholder="CMI-01200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
                placeholder="Year"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={currentSex} onValueChange={setCurrentSex}>
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddOrUpdate} className="flex-1">
                {editingId ? 'Update' : 'Add to List'}
              </Button>
              {editingId && (
                <Button variant="outline" size="icon" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* LEFT: Clinical status (Select) */}
              <div className="space-y-2">
                <Label htmlFor="clinical-status">Clinical Status</Label>
                <Select
                  value={currentClinical}
                  onValueChange={setCurrentClinical}
                >
                  <SelectTrigger id="clinical-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="high-risk">High-risk</SelectItem>
                    <SelectItem value="hcc">HCC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CENTER: Disease status (Radio) */}
              <div className="space-y-2">
                <Label id="liver-status">Liver Status</Label>
                <RadioGroup
                  id="liver-status"
                  value={currentLiver}
                  onValueChange={setCurrentLiver}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="chronic" id="chronic" />
                    <Label htmlFor="chronic">Chronic</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cirrhosis" id="cirrhosis" />
                    <Label htmlFor="cirrhosis">Cirrhosis</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* RIGHT: Checkboxes + Other input */}
              <div className="space-y-2">
                <Label id="checkbox-etiology">Etiologies</Label>

                <div className="gap-y-2 space-x-2 flex flex-row flex-wrap max-w-70">
                  {['HBV', 'HCV', 'ALCOHOLIC', 'NASH', 'NAFLD'].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        // currentEtiology is now an array, so .includes works perfectly
                        checked={currentEtiology.includes(item)}
                        onCheckedChange={(checked) =>
                          setCurrentEtiology((prev) =>
                            checked
                              ? [...prev, item]
                              : prev.filter((v) => v !== item),
                          )
                        }
                      />
                      <Label id={item}>{item}</Label>
                    </div>
                  ))}
                </div>

                <DiseaseTagInput
                  key={tagKey}
                  id="type-etiology"
                  initialTags={
                    additionalEtiology ? additionalEtiology.split(', ') : []
                  }
                  onTagsChange={(tags) =>
                    setAdditionalEtiology(tags.join(', '))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label id="note">Note</Label>

                <Textarea
                  id="note"
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Batch List</CardTitle>

          <Button
            className="w-20"
            variant={'outline'}
            onClick={() => {
              setPatients([])
              localStorage.removeItem('pending_patients')
            }}
          >
            Clear All
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25">Code</TableHead>
                <TableHead className="w-25 text-center">Biobank</TableHead>
                <TableHead className="w-15 text-center">Visit</TableHead>
                <TableHead className="w-15 text-center">Age</TableHead>
                <TableHead className="w-15 text-center">Sex</TableHead>
                <TableHead className="w-30 text-center">
                  Clinical Status
                </TableHead>
                <TableHead className="w-30 text-center">Liver Status</TableHead>
                <TableHead className="w-40">Etiologies</TableHead>
                <TableHead className="w-40">Additional Etiol.</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow
                  key={p.id}
                  className={editingId === p.id ? 'bg-orange-50' : ''}
                >
                  <TableCell className="font-bold">{p.code}</TableCell>
                  <TableCell className="text-center">{p.bcode}</TableCell>
                  <TableCell className="text-center">{p.visit}</TableCell>
                  <TableCell className="text-center">{p.age}</TableCell>
                  <TableCell className="text-center capitalize">
                    {p.sex}
                  </TableCell>

                  {/* Refined Variables Display */}
                  <TableCell className="text-center capitalize italic">
                    {p.clinicalStatus}
                  </TableCell>
                  <TableCell className="text-center capitalize italic">
                    {p.liverStatus}
                  </TableCell>
                  <TableCell className="max-w-40">
                    <span className="text-xs font-mono">
                      {Array.isArray(p.etiology)
                        ? p.etiology.join(', ')
                        : p.etiology}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-40">
                    <span className="text-xs font-mono">
                      {Array.isArray(p.addEtiology)
                        ? p.addEtiology.join(', ')
                        : p.addEtiology}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-50 truncate text-muted-foreground">
                    {p.note || '-'}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(p)}
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPatients((prev) => prev.filter((i) => i.id !== p.id))
                      }
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {}
        <form onSubmit={handleSubmit}>
          {/* The Hidden Input: This is the actual "carrier" of your table data */}
          <input
            id="batchTable"
            type="hidden"
            name="batchData"
            value={JSON.stringify(patients)}
          />

          <div className="flex justify-end gap-4 p-4 border-t">
            <p className="text-sm text-muted-foreground self-center">
              Ready to submit {patients.length} records
            </p>
            <Button
              type="submit"
              disabled={patients.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Database className="w-4 h-4 mr-2" />
              Save All to Database
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
