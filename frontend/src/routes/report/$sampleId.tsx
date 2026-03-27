import { createFileRoute, redirect } from '@tanstack/react-router'
import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { ClinicalReport } from '@/components/ReportCard'
import { Button } from '@/components/ui/button'
import { FileCheck, Printer } from 'lucide-react'
import { PatientData } from '@/servers/types'
import { getSessionFn } from '@/servers/user.functions'
import { sampleReport } from '@/servers/report.function'

export const Route = createFileRoute('/report/$sampleId')({
  beforeLoad: async ({ params }) => {
    const session = await getSessionFn()

    if (!session?.user) {
      throw redirect({
        to: '/login',
      })
    }

    if (session?.user.role === 'client') {
      throw redirect({
        to: '/dashboard',
      })
    }

    // const sampleData = await sampleReport({
    //   data: params.sampleId,
    // })

    // if (!sampleData.body.score) {
    //   throw redirect({ to: '/analysis' })
    // }

    return {
      session,
      // sampleData,
    }
  },
  loader: async ({ context, params }) => {
    // In a real app, await db.select()...
    return {
      session: context.session,
      data: {
        id: params.sampleId,
        age: 44,
        sex: 'Male',
        collectionDate: '2025-10-16',
        clinicalNotes: 'AFP: 19.95 ng/mL',
        predictionScore: 0.24,
        technologist: 'Jane Smith',
        pathologist: 'Dr. A. Director',
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
    documentTitle: `CEliver_Report_${data.id}`,
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
