import { createFileRoute, redirect } from '@tanstack/react-router'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { ClinicalReport } from '@/components/ReportCard'
import { Button } from '@/components/ui/button'
import { FileCheck, Printer } from 'lucide-react'
import { PatientData } from '@/servers/types'
import { getSessionFn } from '@/servers/user.functions'
import { sampleReport } from '@/servers/report.function'
import { Capitalize, formatNumber, formattedDatetime } from '@/lib/utils'

export const Route = createFileRoute('/report/$sampleId')({
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

    const sampleData = await sampleReport({
      data: params.sampleId,
    })

    if (!sampleData.data || sampleData.data?.score === null) {
      throw redirect({ to: '/analysis' })
    }

    return {
      session,
      sampleData,
    }
  },
  loader: async ({ context, params }) => {
    const { sampleData } = context

    return {
      session: context.session,
      data: {
        id: params.sampleId,
        hCode: sampleData.data.hCode,
        bCode: sampleData.data.bCode,
        age: parseInt(sampleData.data.age),
        sex: Capitalize(sampleData.data.sex),
        collectionDate: formattedDatetime(sampleData.data.orderedDate),
        afpNotes: `AFP: ${!sampleData.data.afp ? '-' : formatNumber(sampleData.data.afp)} ng/mL`,
        concNotes: `Conc: ${!sampleData.data.conc ? '-' : formatNumber(sampleData.data.conc)} ng/mL plasma`,
        mainPeakNotes: `Main-peak: ${!sampleData.data.mainPeak ? '-' : sampleData.data.mainPeak} bp`,
        predictionScore: parseFloat(String(sampleData.data.score ?? '0')),
        technologist: 'Dr. Sasimol Udomruk',
        pathologist: 'Dr. Parunya Chaiyawat',
      } as PatientData,
    }
  },
  component: ReportComponent,
})

// 3. The Main Page Component
function ReportComponent() {
  const { data } = Route.useLoaderData()
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `CEliver_Report_${data.bCode}`,
    // Ensure styles are injected for printing
    onAfterPrint: () => console.log('Print success'),
  })

  return (
    <div className="min-h-screen bg-neutral-100 p-8 flex flex-col items-center gap-6">
      {/* Control Bar (Screen Only) */}
      <div className="w-full max-w-[210mm] flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-700">
            <FileCheck size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-neutral-800">Reviewing Report</h2>
            <p className="text-xs text-neutral-500">ID: {data.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handlePrint()}
            size="sm"
            className="gap-2 bg-teal-700 hover:bg-teal-800 text-white"
          >
            <Printer size={16} /> Print Report
          </Button>
        </div>
      </div>

      {/* The Printable A4 Component */}
      {/* We center it and give it a shadow for the "Paper" look on screen */}
      <div className="shadow-2xl print:shadow-none">
        <ClinicalReport ref={componentRef} data={data} />
      </div>
    </div>
  )
}
