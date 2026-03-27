import { PatientData } from '@/servers/types'
import { Activity, AlertCircle, Syringe } from 'lucide-react'
import { forwardRef } from 'react'


export const ClinicalReport = forwardRef<HTMLDivElement, { data: PatientData }>(
  ({ data }, ref) => {
    const isPositive = data.predictionScore >= 0.4
    const barHeight = `${Math.min(data.predictionScore * 100, 100)}%`

    return (
      <div
        ref={ref}
        // Use exact h-[297mm] and overflow-hidden to force a single page constraint
        className="bg-white text-neutral-800 w-[210mm] h-[297mm] mx-auto p-[10mm] relative flex flex-col overflow-hidden shadow-lg print:shadow-none print:w-[210mm] print:h-[297mm] print:m-0 print:p-[10mm] box-border"
      >
        <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

        {/* HEADER */}
        <header className="flex justify-between items-start border-b border-neutral-200 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="border-2 border-blue-700 rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-neutral-900">
                CEliver
              </span>
              <Syringe className="text-red-600 h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-teal-700">
                Case Report
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Generated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] leading-relaxed text-neutral-600">
            <strong className="text-neutral-900 text-[12px]">
              Cancer Research Unit (CRU)
            </strong>
            <br />
            CMUTEAM, Faculty of Medicine
            <br />
            Chiang Mai University
            <br />
            sasimol.ud@cmu.ac.th • 053-934-674
          </div>
        </header>

        {/* PATIENT INFO */}
        <section className="mb-4 shrink-0">
          <h3 className="text-teal-700 font-semibold border-b border-neutral-100 pb-1 mb-1 text-lg">
            Patient Information
          </h3>
          <table className="w-full text-sm border-collapse">
            <tbody className="divide-y divide-neutral-100">
              <InfoRow label="Patient ID" value={data.id} />
              <InfoRow label="Age" value={data.age.toString()} />
              <InfoRow label="Sex" value={data.sex} />
              <InfoRow label="Collection Date" value={data.collectionDate} />
              <InfoRow label="Clinical Notes" value={data.clinicalNotes} />
            </tbody>
          </table>
        </section>

        {/* PREDICTION CHART */}
        <section className="mb-4 shrink-0">
          <h3 className="text-teal-700 font-semibold border-b border-neutral-100 pb-2 mb-3 text-lg">
            Prediction
          </h3>

          {/* Reduced height from h-80 to h-56 to free up vertical space */}
          <div className="border border-neutral-200 rounded-lg p-4 bg-white h-70 flex flex-col relative print:break-inside-avoid">
            <div className="text-[10px] text-neutral-400 mb-2 flex items-center gap-2">
              <Activity size={12} /> Model: CEliver-Classifier v1.0 • Ver:
              2024-05-24
            </div>

            <div className="flex-1 w-[85%] mx-auto relative border-l border-b border-neutral-300 flex items-end justify-center">
              {/* Cut-off Line */}
              <div className="absolute bottom-[40%] left-0 right-0 border-t border-dashed border-neutral-500 z-10"></div>
              <div className="absolute bottom-[42%] left-2 bg-white/80 text-[10px] text-neutral-600 px-1">
                Cut-off (0.40)
              </div>

              {/* The Bar */}
              <div
                className={`w-16 border ${isPositive ? 'bg-red-400  border-red-600' : 'bg-teal-400  border-teal-600'} relative z-20 transition-all duration-500 ease-out`}
                style={{ height: barHeight }}
              >
                <div className="absolute -top-8 w-full text-center">
                  <span className="font-bold text-sm block">
                    {data.predictionScore.toFixed(2)}
                  </span>
                  <div
                    className={`w-2.5 h-2.5 bg-white border-2 ${isPositive ? 'border-red-600' : 'border-teal-600'} rounded-full mx-auto mt-1`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-neutral-400 mt-2">
              Score range: 0.0 - 1.0. Bar indicates predicted probability of HCC
              risk.
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mb-4 shrink-0 print:break-inside-avoid">
          <h3
            className={`${isPositive ? 'text-red-700' : 'text-teal-700'} font-semibold border-b border-neutral-100 pb-2 mb-3 text-lg`}
          >
            Summary
          </h3>
          <div
            className={`${isPositive ? 'bg-red-50 border-red-600' : 'bg-teal-50 border-teal-600'} border-l-4 p-4 text-sm text-neutral-700`}
          >
            The model predicts{' '}
            <strong className={isPositive ? 'text-red-800' : 'text-teal-800'}>
              {isPositive ? 'HCC POSITIVE' : 'HCC NEGATIVE'}
            </strong>{' '}
            with a probability of{' '}
            <strong className={isPositive ? 'text-red-800' : 'text-teal-800'}>
              {data.predictionScore}
            </strong>
            .
          </div>
        </section>

        {/* DISCLAIMER */}
        <section className="mb-3 shrink-0 print:break-inside-avoid">
          <h3 className="text-teal-700 font-semibold border-b border-neutral-100 pb-2 mb-3 text-lg">
            Disclaimer
          </h3>
          <div className="bg-red-50 border-l-4 border-red-600 p-4 text-xs text-neutral-700 flex gap-3">
            <AlertCircle className="text-red-600 shrink-0" size={16} />
            <div>
              <span className="font-bold text-red-700 block mb-1">
                Research Use Only
              </span>
              This is not a clinical diagnostic analysis report. The information
              provided in this report must not be used for clinical diagnosis
              interpretation or for patient management.
            </div>
          </div>
        </section>

        {/* SIGNATURES */}
        {/* Adjusted spacing to fit neatly before the footer */}
        <div className="flex justify-between shrink-0 print:break-inside-avoid">
          <SignatureBlock
            title="Reported By"
            name={data.technologist}
            role="Medical Technologist"
          />
          <SignatureBlock
            title="Verified By"
            name={data.pathologist}
            role="Pathologist / Director"
          />
        </div>

        {/* FOOTER */}
        {/* mt-auto pushes the footer to the absolute bottom of the A4 height boundary */}
        <footer className="mt-auto pt-2 border-t border-neutral-200 flex justify-between text-[9px] text-neutral-400 shrink-0 print:break-inside-avoid">
          <div className="leading-tight">
            <strong>
              Center of Multidisciplinary Technology for Advanced Medicine
              (CMUTEAM)
            </strong>
            <br />
            9th – The 50th Anniversary Building, Faculty of Medicine, Chiang Mai
            University,
            <br />
            110 Intawaroros Road, Si Phum, Muang, Chiang Mai 50200, Thailand
          </div>
          <div>&copy; CEliver • Privacy Policy</div>
        </footer>
      </div>
    )
  },
)

// Helper Components
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="group border-b border-neutral-50 last:border-0">
      {/* Reduced py-2.5 to py-1 to decrease row height */}
      <td className="py-1 w-[30%] font-medium text-neutral-600 align-top text-xs">
        {label}
      </td>
      <td className="py-1 text-neutral-900 font-medium text-xs">
        {value}
      </td>
    </tr>
  )
}

function SignatureBlock({
  title,
  name,
  role,
}: {
  title: string
  name: string
  role: string
}) {
  return (
    <div className="w-[40%] text-center">
      <div className="h-10 border-b border-neutral-400 mb-2"></div>
      <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wide">
        {title}
      </div>
      <div className="text-xs text-neutral-900 mt-1">( {name} )</div>
      <div className="text-[10px] text-neutral-500 mt-1">{role}</div>
      <div className="text-[10px] text-neutral-400 mt-2">
        Date: ____ / ____ / ______
      </div>
    </div>
  )
}