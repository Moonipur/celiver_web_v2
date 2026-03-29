import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { TrendingUp, Target, Activity } from 'lucide-react'
import { getSessionFn } from '@/servers/user.functions'
import { DashboardMatrix } from '@/servers/perform.function'
import { formatNumber } from '@/lib/utils'

export const Route = createFileRoute('/dashboard')({
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
    return {
      session: context.session,
      matrix: await DashboardMatrix(),
    }
  },
  component: DashboardComponent,
})

const chartConfig = {
  cumulativeCases: {
    label: 'Cases',
    color: 'var(--chart-1)',
  },
}

const barChartConfig = {
  count: {
    label: 'Count',
    color: 'var(--chart-2)',
  },
}

function DashboardComponent() {
  const { matrix } = Route.useLoaderData()

  if (!matrix || !matrix.data) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-md border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <Activity className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No data available</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            We couldn't find any case data for the last 6 months. Try uploading
            new samples.
          </p>
        </div>
      </div>
    )
  }

  const totalSamples = matrix.data.caseCount.reduce(
    (acc, curr) => acc + curr.cases,
    0,
  )
  const expectedSamples = 1200

  const totalCases = matrix.data.caseClass.reduce(
    (acc, curr) => acc + curr.count,
    0,
  )

  let cumulativeSum = 0
  const processedChartData = matrix.data.caseCount.map((item) => {
    cumulativeSum += item.cases
    return {
      ...item,
      cumulativeCases: cumulativeSum,
    }
  })

  return (
    <div className="max-w-7xl p-6 mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Top Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Box 1: Total Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSamples.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulated samples recorded
            </p>
          </CardContent>
        </Card>

        {/* Box 2: Expected Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expected Samples
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expectedSamples.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Samples volume for model validation
            </p>
          </CardContent>
        </Card>

        {/* Box 3: Model Performance Metrics */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Model Performance
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-4 text-center divide-x">
              <div className="flex flex-col space-y-1">
                <span className="text-2xl font-bold text-green-600">
                  {matrix.data.performance.accuracy !== null
                    ? (matrix.data.performance.accuracy * 100).toFixed(1)
                    : '-'}
                  %
                </span>
                <span className="text-xs text-muted-foreground">Accuracy</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-2xl font-bold text-blue-600">
                  {matrix.data.performance.sensitivity !== null
                    ? (matrix.data.performance.sensitivity * 100).toFixed(1)
                    : '-'}
                  %
                </span>
                <span className="text-xs text-muted-foreground">
                  Sensitivity
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-2xl font-bold text-purple-600">
                  {matrix.data.performance.specificity !== null
                    ? (matrix.data.performance.specificity * 100).toFixed(1)
                    : '-'}
                  %
                </span>
                <span className="text-xs text-muted-foreground">
                  Specificity
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart (Takes up 2/3 of the row on large screens) */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Sample Growth</CardTitle>
            <CardDescription>Monthly trend of new cases.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <LineChart
                data={processedChartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
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
                <Line
                  dataKey="cumulativeCases"
                  type="monotone"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={true}
                />
                <ReferenceLine
                  y={expectedSamples}
                  label={{
                    value: 'Expected',
                    position: 'insideTopRight',
                    fill: 'var(--muted-foreground)',
                    fontSize: 12,
                  }}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Horizontal Bar Chart (Takes up 1/3 of the row on large screens) */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Case Distribution (n={totalCases})</CardTitle>
            <CardDescription>Total count by category.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer
              config={barChartConfig}
              className="h-[350px] w-full"
            >
              <BarChart
                data={matrix.data.caseClass}
                layout="vertical"
                margin={{
                  top: 0,
                  right: 15,
                  left: 5,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  horizontal={false}
                  vertical={true}
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--chart-2)"
                  radius={[0, 4, 4, 0]}
                  barSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
