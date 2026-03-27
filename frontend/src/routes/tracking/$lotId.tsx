import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useState } from 'react'
import {
  MapPin,
  Calendar,
  Check,
  X,
  ChevronRight,
  ChartSpline,
  TestTubeDiagonal,
  Package,
  Truck,
  ClipboardPlus,
  UserRound,
  Database,
  Pencil,
  CircleX,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCode, formattedDatetime } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CancelOrNot, NavigationGuard } from '@/components/WarningCard'
import { OrderStatusUpdate, QCSample } from '@/servers/types'
import { Separator } from '@/components/ui/separator'
import { getSessionFn } from '@/servers/user.functions'
import {
  cancelOrder,
  getOrderByLot,
  updateOrderStatus,
} from '@/servers/tracking.function'

const stagesConfig = {
  shipped: {
    label: 'Sample Order',
    icon: Truck,
  },
  delivered: {
    label: 'Lab Reception',
    icon: Package,
  },
  extracted: {
    label: 'cfDNA Extraction',
    icon: TestTubeDiagonal,
  },
  distributed: {
    label: 'Quality Review',
    icon: ChartSpline,
  },
  analyzed: {
    label: 'CEliver Prediction',
    icon: ClipboardPlus,
  },
} as const

export const Route = createFileRoute('/tracking/$lotId')({
  beforeLoad: async () => {
    const session = await getSessionFn()

    if (!session?.user) {
      throw redirect({
        to: '/login',
      })
    }

    if (session?.user.role === 'client' || session?.user.role === 'clinAdmin') {
      throw redirect({
        to: '/dashboard',
      })
    }

    return {
      session,
    }
  },
  loader: async ({ context, params }) => {
    // 2. MOCK DATA (Updated to match your new status keys)
    const LotData = await getOrderByLot({ data: params.lotId })
    return {
      session: context.session,
      lotFound: LotData.success,
      data: LotData.data,
    }
  },
  component: TrackingLotComponent,
})

function TrackingLotComponent() {
  const { lotFound, data } = Route.useLoaderData()

  const router = useRouter()

  if (!lotFound || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <p className="text-muted-foreground">
          No tracking data found for this order.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const stagesSequence = [
    'shipped',
    'delivered',
    'extracted',
    'distributed',
    'analyzed',
  ]

  const currentStepIndex = stagesSequence.indexOf(data.currentStatus)

  // Initialize state with the "current" active stage (or the last completed one)
  const activeStageData =
    data.history.find((h) => h.label === data.currentStatus) || data.history[0]
  const [selectedStage, setSelectedStage] = useState(activeStageData)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [isPassAll, setIsPassAll] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const editingState = () => {
    setIsEditingMode(!isEditingMode)
  }

  const dirtyState = () => {
    if (isEditingMode === true) {
      setIsDirty(true)
      return true
    } else {
      return false
    }
  }

  const handleClick = (item: any) => {
    const checkDirty = dirtyState()

    if (!checkDirty) {
      setSelectedStage(item)
      setIsPassAll(false)
    } else {
      setSelectedStage(selectedStage)
    }
  }

  const handleRowChange = (
    code: string,
    field: 'pass' | 'note',
    value: any,
  ) => {
    // 2. Update the specific row in the state
    setSelectedStage((prevStage) => {
      if (!prevStage || !prevStage.qc) return prevStage

      const updatedSamples = prevStage.qc.sample.map((item) => {
        // Find the specific row we are editing
        if (item.code === code) {
          return {
            ...item,
            [field]: value,
          }
        }
        return item
      })

      return {
        ...prevStage,
        qc: {
          ...prevStage.qc,
          sample: updatedSamples,
        },
      }
    })
  }

  const handleUpdate = async (samples: QCSample[] | undefined) => {
    if (!samples) return

    const finalSamples = samples.map((item) => {
      if (isPassAll) {
        return {
          ...item,
          pass: true,
          note: item.note,
        }
      }

      return item
    })

    try {
      const payload: OrderStatusUpdate = {
        lotId: data.id,
        stageLabel: selectedStage.label as OrderStatusUpdate['stageLabel'],
        qData: finalSamples.map((item) => ({
          code: item.code,
          pass: item.pass ?? false,
          note: item.note ?? undefined,
        })),
      }

      await updateOrderStatus({ data: payload })

      setSelectedStage((prevStage) => {
        if (!prevStage || !prevStage.qc) return prevStage

        return {
          ...prevStage,
          qc: {
            ...prevStage.qc,
            pass: isPassAll,
            sample: finalSamples,
          },
        }
      })

      await router.invalidate()

      setIsEditingMode(false)
      setIsDirty(false)
    } catch (error) {
      console.error('Failed to save QC data to the database:', error)
    }
  }

  const handleOpenModal = () => setConfirmCancel(true)

  const executeCancelation = async () => {
    setConfirmCancel(false) // Close modal first

    try {
      await cancelOrder({ data: data.id })
      await router.invalidate()
      console.log('Order canceled successfully')
    } catch (error) {
      alert('Could not cancel the order. Please try again.')
    }
  }

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Order: <span className="uppercase">{data.id}</span>
        </h1>
        <p className="text-muted-foreground flex items-center gap-1 mt-1">
          <Calendar className="w-3 h-3" /> Last updated:{' '}
          {formattedDatetime(data.lastUpdate)}
        </p>
      </header>

      {/* Main Grid: Left (Timeline) and Right (Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6">
        {/* LEFT: TIMELINE */}
        <Card className="h-auto">
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 -mt-4">
            {data.history.map((item, index) => {
              const config =
                stagesConfig[item.label as keyof typeof stagesConfig]
              const stageIndex = stagesSequence.indexOf(item.label)
              const isSelected = selectedStage.status === item.label
              const isCurrent = item.status === 'current'

              const isThisStepComplete = item.status === 'completed'

              const IconComponent = config.icon
              let circleColorClass =
                'bg-background border-muted text-muted-foreground'

              const getStepStatusClasses = (
                item: any,
                isCanceled: boolean | null,
              ) => {
                if (isCanceled) return 'bg-red-50 border-red-500 text-red-600'
                if (item.qc?.pass === true)
                  return 'bg-green-50 border-green-500 text-green-600'
                return 'bg-yellow-50 border-yellow-500 text-yellow-600'
              }

              if (stageIndex <= currentStepIndex) {
                circleColorClass = getStepStatusClasses(item, data.canceled)
              }

              return (
                <div
                  key={item.label}
                  onClick={() => handleClick(item)}
                  // REFINE 1: Increased horizontal padding (px-4) and negative margin (-mx-4)
                  // This moves the "bg-border" further away from the circle for a cleaner look.
                  className={`flex items-stretch gap-6 cursor-pointer group transition-all duration-200 px-4 -mx-4 rounded-xl ${
                    isSelected ? 'bg-accent/60' : 'hover:bg-accent/30'
                  }`}
                >
                  {/* --- ICON COLUMN --- */}
                  <div
                    key={item.label}
                    className="relative flex items-start gap-4 pb-8"
                  >
                    {index !== data.history.length - 1 && (
                      <div
                        className={`absolute top-10 -bottom-8 w-0.5 left-1/2 -translate-x-1/2 z-0 transition-colors duration-700 ease-in-out ${
                          data.canceled
                            ? 'bg-red-500'
                            : isThisStepComplete
                              ? 'bg-green-500' // Solid green if step is finished
                              : 'bg-muted' // Future lines
                        }`}
                      />
                    )}

                    {/* THE ICON CIRCLE */}
                    <div
                      className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full border-2 transition-colors z-10 ${circleColorClass}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  {/* --- TEXT COLUMN --- */}
                  {/* REFINE 3: 'py-1' centers the text block vertically with the icon slightly better */}
                  {/* 'pb-10' increases the spacing between this step and the next one */}
                  <div className="flex-1 pb-4 py-1 mt-2">
                    <div className="flex justify-between items-center">
                      <div
                        className={`font-semibold text-base ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        <h3
                          className={`font-medium ${!isThisStepComplete && !isCurrent ? 'text-muted-foreground' : ''}`}
                        >
                          {config.label}
                        </h3>
                      </div>
                      {isSelected && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground animate-in fade-in slide-in-from-left-1" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.date ? formattedDatetime(item.date) : '-'}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
          {!data.canceled && (
            <div className="flex items-center justify-center flex-col space-y-4">
              <Separator className="" />
              <Button
                className=" bg-red-400 hover:bg-red-500"
                onClick={handleOpenModal}
              >
                <CircleX />
                Cancel order
              </Button>
            </div>
          )}
        </Card>

        {/* RIGHT: DETAILS & QC */}
        <Card className="h-fit min-h-75">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {
                    stagesConfig[
                      selectedStage.label as keyof typeof stagesConfig
                    ]?.label
                  }
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <UserRound className="w-3 h-3" /> Updated:{' '}
                  {selectedStage.qc?.updatedBy}
                </p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {selectedStage.location}
                </p>
              </div>
              <Badge
                variant={
                  selectedStage.status === 'completed'
                    ? 'destructive'
                    : 'outline'
                }
                className={`${selectedStage.qc?.pass ? 'text-green-800' : 'text-red-800'} ${
                  selectedStage.qc?.pass
                    ? 'bg-green-100  hover:bg-green-100'
                    : 'bg-red-100 hover:bg-red-100'
                }`}
              >
                {selectedStage.label.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {/* Same QC Table Logic as before... */}
            {selectedStage.qc ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-30">Patient Code</TableHead>
                      <TableHead className="w-30">QC Result</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-center w-40">
                        Updated At
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  {!isEditingMode ? (
                    <TableBody>
                      {selectedStage.qc.sample.map((p) => {
                        return (
                          <TableRow key={p.code}>
                            <TableCell className="text-muted-foreground text-sm w-40">
                              {selectedStage.label === 'analyzed' ? (
                                <Link
                                  to={`/analysis/$lotId/$bCode`}
                                  params={{ lotId: data.id, bCode: p.code }}
                                >
                                  <span className="underline underline-offset-2">
                                    {formatCode(p.code, 2)}
                                  </span>
                                </Link>
                              ) : (
                                formatCode(p.code, 2)
                              )}
                            </TableCell>

                            <TableCell>
                              {p.pass ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-800 hover:bg-green-100 w-15"
                                >
                                  <Check className="w-3 h-3 mr-1" /> Pass
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-red-100 text-red-800 hover:bg-red-100 w-15"
                                >
                                  <X className="w-3 h-3 mr-1" /> Fail
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="italic text-muted-foreground text-sm">
                              {p.note}
                            </TableCell>

                            <TableCell className="font-medium w-40">
                              <div className="flex items-center gap-2 justify-center">
                                {p.updatedAt
                                  ? formattedDatetime(p.updatedAt)
                                  : '-'}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  ) : (
                    <TableBody>
                      {selectedStage.qc.sample.map((p) => (
                        <TableRow key={p.code}>
                          <TableCell className="text-muted-foreground text-sm w-25">
                            {p.code}
                          </TableCell>

                          {/* 1. Editable QC Result */}
                          <TableCell className="w-30">
                            <Select
                              value={p.pass ? 'pass' : 'fail'}
                              onValueChange={(val) =>
                                handleRowChange(p.code, 'pass', val === 'pass')
                              } // ✅ Added Handler
                            >
                              <SelectTrigger className="h-8 w-30">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pass">
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800 hover:bg-green-100 w-15"
                                  >
                                    <Check className="w-3 h-3 mr-1" /> Pass
                                  </Badge>
                                </SelectItem>
                                <SelectItem value="fail">
                                  <Badge
                                    variant="secondary"
                                    className="bg-red-100 text-red-800 hover:bg-red-100 w-15"
                                  >
                                    <X className="w-3 h-3 mr-1" /> Fail
                                  </Badge>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>

                          {/* 2. Editable Note */}
                          <TableCell>
                            <Input
                              className="h-8 text-sm italic"
                              placeholder="Add note..."
                              value={p.note || ''}
                              onChange={(e) =>
                                handleRowChange(p.code, 'note', e.target.value)
                              } // ✅ Added Handler
                            />
                          </TableCell>

                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {p.updatedAt
                                ? formattedDatetime(p.updatedAt)
                                : '-'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                No QC data for this stage.
              </div>
            )}
          </CardContent>
          {isEditingMode ? (
            <div className="flex flex-col gap-4">
              {/* Note: I removed the <form> wrapper entirely */}

              <div className="flex justify-end gap-4 p-4 border-t">
                {/* 1. Pass All Switch */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pass-all-mode"
                    checked={isPassAll}
                    onCheckedChange={(checked) => setIsPassAll(checked)}
                  />
                  <Label htmlFor="pass-all-mode">All Samples Pass</Label>
                </div>

                {/* 2. The Save Button */}
                <Button
                  type="button" // <--- CRITICAL: Prevents browser from trying to "submit" a form
                  onClick={() => handleUpdate(selectedStage.qc?.sample)}
                  disabled={
                    !selectedStage.qc?.sample ||
                    selectedStage.qc.sample.length === 0
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Save All to Database
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-4 p-4 border-t">
              <Button
                type="button"
                onClick={editingState}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Mode
              </Button>
            </div>
          )}
        </Card>
      </div>

      <NavigationGuard
        isOpen={isDirty}
        onConfirm={() => handleUpdate(selectedStage.qc?.sample)}
        onCancel={() => setIsDirty(false)}
      />

      <CancelOrNot
        isOpen={confirmCancel}
        onConfirm={executeCancelation}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  )
}
