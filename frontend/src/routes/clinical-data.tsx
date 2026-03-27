import { getSessionFn } from '@/servers/user.functions'
import { createFileRoute, redirect } from '@tanstack/react-router'
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
import { Database, Edit2, Hospital, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { PatientRecord } from '@/servers/types'

export const mockPatientData: PatientRecord[] = [
  {
    id: 'rec_001',
    code: 'PT-1045',
    bcode: 'BIO-A-01',
    visit: 'V1',
    age: 42,
    sex: 'male',
    clinicalStatus: 'stable',
    liverStatus: 'fatty liver',
    etiology: ['NAFLD'], // Array example
    addEtiology: 'Obesity,Hypertension', // Array example
    note: 'Advised lifestyle modifications. Return in 6 months.',
  },
  {
    id: 'rec_002',
    code: 'PT-2099',
    bcode: 'BIO-B-42',
    visit: 'V3',
    age: 58,
    sex: 'female',
    clinicalStatus: 'critical',
    liverStatus: 'cirrhosis',
    etiology: ['HBV'], // String example
    addEtiology: '', // String example
    note: 'Pending ultrasound results.',
  },
  {
    id: 'rec_003',
    code: 'PT-3301',
    bcode: 'BIO-C-11',
    visit: 'V2',
    age: 65,
    sex: 'male',
    clinicalStatus: 'observation',
    liverStatus: 'fibrosis',
    etiology: ['HCV', 'Alcohol'],
    addEtiology: 'Type 2 Diabetes',
    note: 'Started antiviral therapy.',
  },
  {
    id: 'rec_004',
    code: 'PT-4112',
    bcode: 'BIO-A-09',
    visit: 'V1',
    age: 31,
    sex: 'female',
    clinicalStatus: 'discharged',
    liverStatus: 'normal',
    etiology: [],
    addEtiology: '',
    note: 'Routine screening. No abnormalities detected.',
  },
  {
    id: 'rec_005',
    code: 'PT-5055',
    bcode: 'BIO-D-88',
    visit: 'V4',
    age: 50,
    sex: 'male',
    clinicalStatus: 'stable',
    liverStatus: 'steatohepatitis',
    etiology: ['NASH'],
    addEtiology: 'Hyperlipidemia,Obesity',
    note: '', // Empty note to test your fallback '-'
  },
]

export const Route = createFileRoute('/clinical-data')({
  beforeLoad: async () => {
    const session = await getSessionFn()

    if (!session?.user) {
      throw redirect({
        to: '/login',
      })
    }

    if (session?.user.role === 'client' || session?.user.role === 'admin') {
      throw redirect({
        to: '/dashboard',
      })
    }

    return {
      session,
    }
  },
  loader: async ({ context }) => {
    //   const latestBCode = await getLatestCase()

    return { session: context.session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useLoaderData()
  //   const [patients, setPatients] = useState<PatientRecord[]>([])
  const [patients, setPatients] = useState<PatientRecord[]>(mockPatientData)

  React.useEffect(() => {
    const saved = localStorage.getItem('pending_clinical')
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
      localStorage.setItem('pending_clinical', JSON.stringify(patients))
    } else {
      localStorage.removeItem('pending_clinical')
    }
  }, [patients])

  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Clinical Data</h1>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Hospital className="w-5 h-5" />
            <CardTitle>
              {session.org.name} ({session.org.hCode})
            </CardTitle>
          </div>

          <Button
            className="w-20"
            variant={'outline'}
            onClick={() => {
              setPatients([])
              localStorage.removeItem('pending_clinical')
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
                      //   onClick={() => startEdit(p)}
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
        {/* <form onSubmit={handleSubmit}> */}
        <form>
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
