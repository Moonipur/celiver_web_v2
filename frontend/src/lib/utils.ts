import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, toZonedTime } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function Capitalize(str: string) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const FormatId = (id: string): string => {
  return id.replace('-', '')
}

export const formattedDatetime = (date: string | number | Date): string => {
  const timeZone = 'Asia/Bangkok'
  const zonedDate = toZonedTime(date, timeZone)
  return format(zonedDate, 'yyyy-MM-dd HH:mm:ss', { timeZone })
}

export const numToString = (prefix: string, num: number): string => {
  return prefix + '-' + num.toString().padStart(5, '0')
}

export const stringToNum = (str: string, num: number): number => {
  const match = str.slice(num).match(/\d+/)
  return match ? Number(match[0]) : 0
}

export const formatCode = (str: string, num: number) => {
  if (str.includes('-')) return str // Avoid double hyphens
  return `${str.slice(0, num)}-${str.slice(num)}`
}

export const transformToChartData = (results: any[][]) => {
  const xaxisLabel = [
    '51-60',
    '61-70',
    '71-80',
    '81-90',
    '91-100',
    '101-110',
    '111-120',
    '121-130',
    '131-140',
    '141-150',
    '151-160',
    '161-170',
    '171-180',
    '181-190',
    '191-200',
    '201-210',
    '211-220',
    '221-230',
    '231-240',
    '241-250',
  ]

  const seriesNames = Array.from({ length: results.length }, (_, i) => {
    return `Run${i + 1}`
  })

  interface ChartRow {
    xaxis: string
    [key: string]: any // This allows using string variables as keys
  }

  const chartData = Array.from({ length: xaxisLabel.length }, (_, i) => {
    // 1. Create the base object with the x-axis
    const rowObject: ChartRow = { xaxis: xaxisLabel[i] }

    // 2. Loop to add the dynamic keys (a, b, c)
    seriesNames.forEach((key, index) => {
      rowObject[key] = results[index][i + 1]
    })

    return rowObject
  })

  return chartData
}

export function formatNumber(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '-'

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}
