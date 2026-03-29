import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { FileDropzone } from '@/components/FileDropzone'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Tooltip as TableTooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import {
  Capitalize,
  formatCode,
  formatNumber,
  transformToChartData,
} from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, CircleQuestionMark, Loader2, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { getSessionFn } from '@/servers/user.functions'
import { calJensenShanon, checkRunConsistency } from '@/lib/jensen-shannon'
import { getSampleForPredict } from '@/servers/sample.functions'
import { getDistByID } from '@/servers/dist.functions'
import { Input } from '@/components/ui/input'
import { predictScoreFn } from '@/servers/predict.function'
import { Bins, FullDistPayload } from '@/servers/types'

const parseFile = (
  file: File,
  columnIndices: number[],
  bCode: string,
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    // Handle CSV
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: false, // Set to false to work with raw arrays/indices
        skipEmptyLines: true,
        complete: (results) => {
          // 1. Skip first 2 rows
          const dataWithoutHeaders = results.data.slice(2)

          // 2. Map only specific column indices
          const filteredData = dataWithoutHeaders.map((row: any) =>
            columnIndices.map((index) => row[index]),
          )

          const finalData = filteredData.filter(
            (row) => String(row[0]) === bCode,
          )

          resolve(finalData)
        },
        error: (error) => reject(error),
      })
    }

    // Handle XLSX
    else if (file.name.endsWith('.xlsx')) {
      reader.onload = (e) => {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        // 1. Convert to array of arrays (aoa)
        // range: 2 tells SheetJS to start reading from the 3rd row (index 2)
        const json = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          range: 2,
        }) as any[][]

        // 2. Map only specific column indices
        const filteredData = json.map((row) =>
          columnIndices.map((index) => row[index]),
        )

        const finalData = filteredData.filter((row) => String(row[0]) === bCode)

        resolve(finalData)
      }
      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    }
  })
}

const chartConfig = {
  cases: {
    label: 'Cases',
    color: 'var(--chart-1)',
  },
  forecastedCases: {
    label: 'Forecasted Cases',
    color: 'var(--chart-2)',
  },
}

export const Route = createFileRoute('/analysis/$lotId/$bCode')({
  beforeLoad: async ({ params }) => {
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

    const searchSample = await getSampleForPredict({
      data: { lotId: params.lotId, bCode: params.bCode },
    })

    if (!searchSample?.data) {
      throw redirect({ to: '/analysis' })
    }

    return {
      session,
      searchSample,
    }
  },
  loader: async ({ context, params }) => {
    // Access searchSample from context (passed down from beforeLoad)
    const { searchSample } = context

    // Now we use the sampleId we validated in beforeLoad
    const dists = await getDistByID({
      data: searchSample.data.sampleId,
    })

    return {
      session: context.session,
      sample: {
        // formatCode and params are available here
        hCode: searchSample.data.hCode,
        bCode: params.bCode,
        lotId: params.lotId,
        age: searchSample.data.age,
        sex: searchSample.data.sex,
        sampleId: searchSample.data.sampleId,
      },
      dists: dists?.success ? dists.data : [],
    }
  },
  component: AnalysisSampleComponent,
})

function AnalysisSampleComponent() {
  const navigate = useNavigate()
  const { sample, dists } = Route.useLoaderData()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const params = Route.useParams()
  const storageKey = `analysis_data_${params.lotId}_${params.bCode}`

  // CORE STATES
  const [parsedData, setParsedData] = useState<any[]>([]) // For Chart
  const [tableRows, setTableRows] = useState<any[]>([]) // For Table Metadata
  const [qcList, setQcList] = useState<boolean[]>([]) // For QC Badges
  const [numRun, setNumRun] = useState(0) // Total count (DB + Uploaded)

  const selectColumnsIndex = [
    4, 11, 17, 23, 29, 35, 41, 47, 53, 59, 65, 71, 77, 83, 89, 95, 101, 107,
    113, 119, 125,
  ]

  // --- 1. INITIAL SYNC (DATABASE) ---
  useEffect(() => {
    if (dists && dists.length > 0) {
      const rawRows = dists.map((d) => [
        sample.bCode,
        d.bin1,
        d.bin2,
        d.bin3,
        d.bin4,
        d.bin5,
        d.bin6,
        d.bin7,
        d.bin8,
        d.bin9,
        d.bin10,
        d.bin11,
        d.bin12,
        d.bin13,
        d.bin14,
        d.bin15,
        d.bin16,
        d.bin17,
        d.bin18,
        d.bin19,
        d.bin20,
      ])

      const formattedData = transformToChartData(rawRows)
      setParsedData(formattedData)
      setNumRun(dists.length)

      // Initialize table rows from DB
      setTableRows(
        dists.map((d) => ({
          distId: d.distId,
          afp: d.afp,
          mainPeak: d.mainPeak,
          conc: d.conc,
          note: d.note,
          passQC: d.passQC,
          isFromDB: true,
        })),
      )

      // Initial QC
      const { labels, matrix } = calJensenShanon(formattedData)
      const test = checkRunConsistency(labels, matrix)
      setQcList(
        Array.from(
          { length: dists.length },
          (_, i) => test[`Run${i + 1}`] ?? true,
        ),
      )
    }
  }, [dists])

  // --- 2. FILE UPLOAD (APPENDING) ---
  const { mutate, isPending } = useMutation({
    mutationFn: async (files: File[]) => {
      const results = await Promise.all(
        files.map((file) => parseFile(file, selectColumnsIndex, sample.bCode)),
      )
      const newRawData = results.flat().filter((row) => row.length > 0)
      return newRawData
    },
    onSuccess: (newRawData) => {
      // A. Transform only the new data, but label them starting from (current numRun + 1)
      // We need a custom transform or a way to merge.
      // easiest way: Re-transform EVERYTHING combined to ensure X-Axis alignment.

      setTableRows((prevRows) => {
        const newMetadata = newRawData.map(() => ({
          distId: null,
          afp: null,
          mainPeak: null,
          conc: null,
          note: null,
          passQC: false,
          isFromDB: false,
        }))
        const combinedMetadata = [...prevRows, ...newMetadata]

        // Re-calculate the Chart Data based on total combined runs
        // This assumes your transformToChartData can take the original DB rows + new rows
        updateFullDataSet(combinedMetadata, newRawData)

        return combinedMetadata
      })
    },
  })

  // Helper to re-process the whole set when new files arrive
  const updateFullDataSet = (combinedMetadata: any[], newRawRows: any[][]) => {
    // 1. Get existing DB raw rows (Same as your current logic)
    const dbRawRows = dists.map((d) => [
      sample.bCode,
      d.bin1,
      d.bin2,
      d.bin3,
      d.bin4,
      d.bin5,
      d.bin6,
      d.bin7,
      d.bin8,
      d.bin9,
      d.bin10,
      d.bin11,
      d.bin12,
      d.bin13,
      d.bin14,
      d.bin15,
      d.bin16,
      d.bin17,
      d.bin18,
      d.bin19,
      d.bin20,
    ])

    // 2. Combine with new rows from file
    const allRawRows = [...dbRawRows, ...newRawRows]
    const allFormatted = transformToChartData(allRawRows)

    // 3. Update States
    setParsedData(allFormatted)
    setNumRun(allRawRows.length)

    // --- USE combinedMetadata HERE ---
    // This updates the Table to show the combined list (DB + Uploads)
    // setTableRows(combinedMetadata)

    // 4. Update QC for the whole set
    const { labels, matrix } = calJensenShanon(allFormatted)
    const test = checkRunConsistency(labels, matrix)

    setQcList(
      Array.from(
        { length: allRawRows.length },
        (_, i) => test[`Run${i + 1}`] ?? false,
      ),
    )
  }

  const syncDbData = () => {
    const rawRows = dists.map((d) => [
      sample.bCode,
      d.bin1,
      d.bin2,
      d.bin3,
      d.bin4,
      d.bin5,
      d.bin6,
      d.bin7,
      d.bin8,
      d.bin9,
      d.bin10,
      d.bin11,
      d.bin12,
      d.bin13,
      d.bin14,
      d.bin15,
      d.bin16,
      d.bin17,
      d.bin18,
      d.bin19,
      d.bin20,
    ])
    const formattedData = transformToChartData(rawRows)

    setParsedData(formattedData)
    setNumRun(dists.length)
    setTableRows(
      dists.map((d) => ({
        distId: d.distId,
        afp: d.afp,
        mainPeak: d.mainPeak,
        conc: d.conc,
        passQC: d.passQC,
        note: d.note,
        isFromDB: false,
      })),
    )

    const { labels, matrix } = calJensenShanon(formattedData)
    const test = checkRunConsistency(labels, matrix)
    setQcList(
      Array.from(
        { length: dists.length },
        (_, i) => test[`Run${i + 1}`] ?? true,
      ),
    )
  }

  useEffect(() => {
    const savedData = localStorage.getItem(storageKey)

    if (savedData) {
      const parsed = JSON.parse(savedData)
      setParsedData(parsed.parsedData)
      setTableRows(parsed.tableRows)
      setQcList(parsed.qcList)
      setNumRun(parsed.numRun)
    } else if (dists && dists.length > 0) {
      // If no local cache, fallback to your existing DB sync logic
      syncDbData()
    }
  }, [storageKey])

  useEffect(() => {
    // Only save if we actually have data to prevent overwriting with empty arrays
    if (numRun > 0) {
      const dataToSave = {
        parsedData,
        tableRows,
        qcList,
        numRun,
      }
      localStorage.setItem(storageKey, JSON.stringify(dataToSave))
    }
  }, [parsedData, tableRows, qcList, numRun, storageKey])

  const handleCellChange = (index: number, field: string, value: string) => {
    setTableRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const { mutate: handlePredict, isPending: isProcessing } = useMutation({
    mutationFn: async () => {
      // 1. Prepare the payload for the database
      const payload = tableRows.map((row, index): FullDistPayload => {
        const runKey = `Run${index + 1}`
        const binData = {} as Bins

        // 2. Map exactly 20 bins from parsedData
        for (let i = 1; i <= 20; i++) {
          const binKey = `bin${i}` as keyof Bins
          // parsedData is 0-indexed, bins are 1-indexed
          const rawValue = parsedData[i - 1]?.[runKey]
          binData[binKey] = rawValue ? parseFloat(rawValue) : 0
        }

        return {
          bCode: sample.bCode,
          age: sample.age,
          sex: sample.sex,
          distId: (row.distId || null) as string | null,
          afp: (parseFloat(row.afp) || 0) as number,
          mainPeak: (parseInt(row.mainPeak) || 0) as number,
          conc: (parseFloat(row.conc) || 0) as number,
          note: (row.note || null) as string | null,
          passQC: qcList[index] ?? false,
          ...binData,
        }
      })

      // 2. Call your server-side Upsert function
      return await predictScoreFn({
        data: { analysisData: payload, sampleId: sample.sampleId },
      })
    },
    onSuccess: (data) => {
      if (data.data !== null) {
        // 3. Clear the temporary LocalStorage now that it's in the DB
        localStorage.removeItem(storageKey)

        navigate({
          to: '/report/$sampleId',
          params: { sampleId: sample.sampleId },
        })
      }
      console.error(
        'Failed to predict! (Number of run must more than or equeal 2)',
      )
    },
    onError: (error) => {
      console.error('Failed to save data before prediction:', error)
    },
  })

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <header>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Case ID: {formatCode(sample.bCode, 2)}{' '}
            <span className="font-medium">
              ({Capitalize(sample.sex)}, {sample.age})
            </span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1px_1fr] gap-x-10 items-baseline">
        {/* Column 1: Upload (p-10 removed from here to prevent double spacing) */}
        <div className="min-w-sm max-w-lg mx-auto lg:mx-0 py-10">
          <h2 className="text-xl font-bold mb-4 text-center lg:text-left">
            Upload Distributions
          </h2>
          <FileDropzone
            files={selectedFiles}
            onFilesChange={setSelectedFiles}
            isUploading={isPending}
            accept={{
              'text/csv': ['.csv'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                ['.xlsx'],
            }}
          />
          <Button
            key={'upload_btn'}
            className="w-full mt-4"
            disabled={selectedFiles.length === 0 || isPending}
            onClick={() => mutate(selectedFiles)}
          >
            {isPending
              ? 'Uploading...'
              : `Upload ${selectedFiles.length} Files`}
          </Button>

          <Button
            key={'reset_btn'}
            variant="ghost"
            className="w-full mt-2"
            size="sm"
            onClick={() => {
              localStorage.removeItem(storageKey)
              setSelectedFiles([])
              syncDbData()
            }}
          >
            Reset All
          </Button>
        </div>

        {/* Column 2: The Separator (Direct child of grid) */}
        <Separator
          orientation="vertical"
          className="hidden lg:block h-80 bg-border"
        />

        <div className="w-full py-10">
          <Card>
            <CardHeader>
              <CardTitle>cfDNA Size Distribution</CardTitle>
              <CardDescription>
                Fragment size pattern in each run.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-75 w-full">
                <LineChart
                  data={parsedData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="xaxis"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-65}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Legend />
                  {Array.from({ length: numRun }, (_, i) => {
                    return (
                      <Line
                        key={`Run${i + 1}`}
                        dataKey={`Run${i + 1}`}
                        type="monotone"
                        stroke={`var(--chart-${i + 1})`}
                        strokeWidth={2}
                        dot={true}
                      />
                    )
                  })}
                </LineChart>
              </ChartContainer>
            </CardContent>

            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-15">Run</TableHead>
                      <TableHead className="text-center w-30">AFP</TableHead>
                      <TableHead className="text-center w-25">
                        Main-peak
                      </TableHead>
                      <TableHead className="flex items-center justify-end gap-1 w-30">
                        cfDNA Conc.
                        <TableTooltip>
                          <TooltipTrigger asChild>
                            <CircleQuestionMark className="w-3 h-3 mt-1 color-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="flex items-center justify-center w-45 ">
                            <p className="text-center">
                              Total concentration of cell-free DNA (ug/mL
                              plasma)
                            </p>
                          </TooltipContent>
                        </TableTooltip>
                      </TableHead>
                      <TableHead className="text-center w-20">
                        QC pass
                      </TableHead>
                      <TableHead className="text-center w-15">
                        Decision
                      </TableHead>
                      <TableHead className="w-60">Note</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {tableRows.map((row, i) => {
                      const runLabel = `Run${i + 1}`
                      const pass = qcList[i]

                      return (
                        <TableRow key={runLabel}>
                          <TableCell className="italic font-bold text-muted-foreground w-15">
                            {runLabel}
                          </TableCell>
                          <TableCell className="italic text-sm text-center w-30">
                            <Input
                              type="number"
                              key={'afp'}
                              value={row.afp ?? ''}
                              onChange={(e) =>
                                handleCellChange(i, 'afp', e.target.value)
                              }
                              className="w-full h-10 border-none bg-transparent px-3 pr-4 text-right focus:ring-2 focus:ring-purple-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
                              placeholder={
                                !row.afp ? '-' : formatNumber(row.afp)
                              }
                            />
                          </TableCell>
                          <TableCell className="italic text-sm text-center w-25">
                            <Input
                              type="number"
                              key={'mainPeak'}
                              value={row.mainPeak ?? ''}
                              onChange={(e) =>
                                handleCellChange(i, 'mainPeak', e.target.value)
                              }
                              className="w-full h-10 border-none bg-transparent px-3 pr-4 text-center focus:ring-2 focus:ring-purple-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
                              placeholder={!row.mainPeak ? '-' : row.mainPeak}
                            />
                          </TableCell>
                          <TableCell className="italic text-sm text-center w-30">
                            <Input
                              type="number"
                              key={'conc'}
                              value={row.conc ?? ''}
                              onChange={(e) =>
                                handleCellChange(i, 'conc', e.target.value)
                              }
                              className="w-full h-10 border-none bg-transparent px-3 pr-4 text-right focus:ring-2 focus:ring-purple-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
                              placeholder={
                                !row.conc ? '-' : formatNumber(row.conc)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {pass ? (
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
                          <TableCell className="flex items-center justify-center w-15 pt-4.5">
                            <Checkbox
                              checked={qcList[i] ?? false}
                              onCheckedChange={(checked) => {
                                setQcList((prev) => {
                                  const updatedList = [...prev]
                                  updatedList[i] = !!checked
                                  return updatedList
                                })
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              key={'note'}
                              value={row.note ?? ''}
                              onChange={(e) =>
                                handleCellChange(i, 'note', e.target.value)
                              }
                              className="w-full h-10 border-none bg-transparent px-1 outline-none text-muted-foreground"
                              placeholder={!row.note ? '-' : row.note}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>

            {parsedData.length > 0 && (
              <div className="flex items-center justify-center">
                <Button
                  key={'predict_btn'}
                  className="max-w-40 bg-purple-300 hover:bg-purple-400 flex items-center gap-2"
                  variant={'outline'}
                  disabled={isProcessing}
                  onClick={() => handlePredict()}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Predict Score'
                  )}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
