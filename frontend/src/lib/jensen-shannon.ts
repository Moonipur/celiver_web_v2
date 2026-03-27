const klDivergence = (p: number[], q: number[]): number => {
  return p.reduce((acc, val, i) => {
    // Standard KL formula: sum(P * log2(P/M))
    // We use a small epsilon to avoid log(0)
    const pVal = val || 1e-10
    const qVal = q[i] || 1e-10
    return acc + pVal * Math.log2(pVal / qVal)
  }, 0)
}

interface ChartRow {
  xaxis: string
  [key: string]: any
}

export const calJensenShanon = (chartData: ChartRow[]) => {
  // 1. Identify the Runs (Series Names like 'Run1', 'Run2', etc.)
  // We exclude 'xaxis' because that is our bin label
  const runKeys = Object.keys(chartData[0]).filter((key) => key !== 'xaxis')

  // 2. Extract the full 20-bin distribution for each Run
  const distributions = runKeys.map((runKey) => {
    const rawValues = chartData.map((row) => Number(row[runKey]) || 0)

    // Normalize to probability distribution (sum to 1)
    const sum = rawValues.reduce((a, b) => a + b, 0)
    return rawValues.map((v) => v / (sum || 1))
  })

  // 3. Calculate Pairwise JS Distance Matrix
  const n = runKeys.length
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const p = distributions[i]
      const q = distributions[j]

      const m = p.map((val, idx) => (val + q[idx]) / 2)

      const divergence = 0.5 * klDivergence(p, m) + 0.5 * klDivergence(q, m)
      const distance = Math.sqrt(divergence)

      matrix[i][j] = matrix[j][i] = distance
    }
  }

  return { labels: runKeys, matrix }
}

export const checkRunConsistency = (
  labels: string[],
  matrix: number[][],
  threshold: number = 0.05,
) => {
  // We want to return an array of objects like { label: string, status: boolean }
  // or a Record<string, boolean>

  const consistencyMap: Record<string, boolean> = {}

  labels.forEach((currentLabel, i) => {
    let isConsistent = false

    for (let j = 0; j < labels.length; j++) {
      if (i === j) continue // Don't compare a run to itself

      // If the distance to any OTHER run is below the threshold,
      // this run is considered part of a valid cluster.
      if (matrix[i][j] < threshold) {
        isConsistent = true
        break
      }
    }

    consistencyMap[currentLabel] = isConsistent
  })

  return consistencyMap
}

// const data = generateMockChartData()
// const { labels, matrix } = calJensenShanon(data)
// const test = checkRunConsistency(labels, matrix)

// console.log(test)
