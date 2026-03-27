import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Capitalize,
  formatCode,
  formatNumber,
  formattedDatetime,
} from '@/lib/utils'
import { getLotsByBCode } from '@/servers/predict.function'
import { getSessionFn } from '@/servers/user.functions'
import { Link } from '@tanstack/react-router'
import {
  createFileRoute,
  redirect,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import {
  Check,
  CircleQuestionMark,
  MapPin,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import z from 'zod'

const searchSchema = z.object({
  q: z.string().optional(),
})

export const Route = createFileRoute('/analysis/')({
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
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ deps: { q }, context }) => {
    if (!q) return { session: context.session, sample: null }

    const response = await getLotsByBCode({ data: q })

    return {
      session: context.session,
      sample: response.success ? response.data : null,
    }
  },
  component: AnalysisComponent,
})

function AnalysisComponent() {
  const { q } = useSearch({ from: '/analysis/' })
  const navigate = useNavigate({ from: '/analysis/' })
  const { sample } = Route.useLoaderData() // Data from the database via loader

  const [searchValue, setSearchValue] = useState(q || '')

  // Initialize tableData as an empty array
  const [tableData, setTableData] = useState<any[]>([])

  // SYNC: Whenever the database 'sample' changes, update our editable state
  useEffect(() => {
    if (sample && sample.lots) {
      setTableData(sample.lots)
    } else {
      setTableData([])
    }
  }, [sample])

  const executeSearch = () => {
    navigate({
      search: (prev) => ({ ...prev, q: searchValue || undefined }),
      replace: true,
    })
  }

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analysis Your Sample
          </h1>
          <p className="text-muted-foreground">
            Enter your order <span className="italic">Case ID</span> to analyze
            distributions.
          </p>
        </div>

        <div className="relative group -mt-2 grid grid-cols-[1fr_auto] gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

            <Input
              id="search-bar"
              placeholder="Type Case ID"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
              className="pl-10 pr-10 h-12 text-base shadow-sm focus-visible:ring-primary uppercase"
            />

            {/* Clear button logic: Clear local state AND navigate to undefined */}
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue('')
                  navigate({
                    search: (prev) => ({ ...prev, q: undefined }),
                    replace: true,
                  })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-md"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <Button onClick={executeSearch} className="h-12 px-8">
            Search
          </Button>
        </div>
      </header>

      {q ? (
        sample ? (
          <Card className="h-fit min-h-75">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    Biobank ID: {formatCode(sample.code.toUpperCase(), 2)} (
                    {Capitalize(sample.sex)}, {sample.age})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <UserRound className="w-3 h-3" /> Updated: {sample.customer}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {sample.hospital}
                  </p>
                </div>
                <Badge
                  variant={'outline'}
                  className="text-green-800 bg-green-100  hover:bg-green-100"
                >
                  ANALYZED
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Lot ID</TableHead>
                      <TableHead className="text-center">Visit</TableHead>
                      <TableHead className="text-center">
                        Ordered Date
                      </TableHead>
                      <TableHead className="text-center">AFP</TableHead>
                      <TableHead className="text-center">Main-peak</TableHead>
                      <TableHead className="flex flex-row items-center gap-1">
                        cfDNA Conc.
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CircleQuestionMark className="w-3 h-3 mr-2 mt-1 color-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="flex items-center justify-center w-45">
                            <p className="text-center">
                              Total concentration of cell-free DNA (ug/mL
                              plasma)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                      <TableHead className="w-30">CEliver Score</TableHead>
                      <TableHead className="w-70">Note</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {tableData.map((row) => (
                      <TableRow key={row.lotId}>
                        <TableCell className="font-bold underline underline-offset-2">
                          <Link
                            to={`/analysis/$lotId/$bCode`}
                            params={{ lotId: row.lotId, bCode: q }}
                          >
                            <span className="underline underline-offset-2">
                              {row.lotId.toUpperCase()}
                            </span>
                          </Link>
                        </TableCell>

                        {/* Example: Visit (Read-only vs Input) */}
                        <TableCell className="italic text-sm text-muted-foreground text-center">
                          V{row.visit}
                        </TableCell>

                        <TableCell className="italic text-sm text-muted-foreground text-center">
                          {formattedDatetime(row.orderDate)}
                        </TableCell>

                        <TableCell className="text-sm text-right pr-5">
                          {!row.afp ? '-' : formatNumber(row.afp)}
                        </TableCell>

                        <TableCell className="text-sm text-center">
                          {!row.mainPeak
                            ? '-'
                            : new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 0,
                                useGrouping: true,
                              }).format(row.mainPeak)}
                        </TableCell>

                        <TableCell className="text-sm text-right pr-20">
                          {!row.conc ? '-' : formatNumber(row.conc)}
                        </TableCell>

                        {/* Example: QC Pass (Text vs Select) */}
                        <TableCell className="w-30 text-center">
                          {!row.score ? (
                            '-'
                          ) : row.score < 0.4 ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 hover:bg-green-100 w-15"
                            >
                              <Check className="w-3 h-3 mr-1" />{' '}
                              {formatNumber(row.score)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-red-100 text-red-800 hover:bg-red-100 w-15"
                            >
                              <X className="w-3 h-3 mr-1" />{' '}
                              {formatNumber(row.score)}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="italic text-sm text-muted-foreground">
                          {!row.note ? '-' : row.note}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          // 2. Show "Not Found" if 'q' exists but no data matches
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
            <Search className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No results found for "{q}"</p>
            <p className="text-sm text-muted-foreground">
              Please check the Lot ID and try again.
            </p>
          </div>
        )
      ) : (
        // 3. Optional: Show an empty state/instruction when no search has been made
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <div className="bg-muted rounded-full p-6 mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Ready to Analyze</h2>
          <p className="text-muted-foreground max-w-sm">
            Enter a Case ID above and click search to retrieve sample
            distributions and QC data.
          </p>
        </div>
      )}
    </div>
  )
}
