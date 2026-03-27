import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
})

export function createHeader() {
  return {
    'Content-Type': 'application/json',
  }
}

export function createHeaderToken(token: string) {
  return {
    Origin: 'http://localhost:3000',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

type UserRole = 'client' | 'admin' | 'clinAdmin' | 'superAdmin'

export interface ApiResponse<T> {
  message: string
  body: T
}

export type AuthResponse = {
  session: {
    id: string
    createdAt: string
    updatedAt: string
    userId: string
    expiresAt: string
    token: string
    ipAddress?: string | null
    userAgent?: string | null
  }
  user: {
    id: string
    createdAt: string
    updatedAt: string
    email: string
    emailVerified: boolean
    name: string
    image?: string | null
    role: UserRole
  }
  org: {
    id: string
    name: string
    hCode: string
    bCode: string
  }
}

export type LogoutResponse = {
  success: boolean
}

export type LoginResponse = {
  redirect: boolean
  token: string
  url: string
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image?: string | null
    createdAt: string
    updatedAt: string
    role: UserRole
  }
}

export type OrderStatus =
  | 'shipped'
  | 'delivered'
  | 'canceled'
  | 'extracted'
  | 'distributed'
  | 'analyzed'

export type OrderResponse = {
  id: string
  lot: string
  orderedVerify: boolean
  orderedBy: string
  orderedAt: string
  receivedBy: string | null
  receivedAt: string | null
  receivedCheck: boolean | null
  receivedNote: string | null
  canceled: boolean | null
  canceledBy: string | null
  canceledNote: string | null
}

export type CaseResponse = {
  id: string
  createdAt: string
  updatedAt: string
  updatedBy: string
  hospitalId: string
  hospitalCode: string
  biobankCode: string
  age: number
  sex: 'male' | 'female' | 'unknown'
  clinicalStatus: string
  liverStatus: string
  etioloty: string[]
  additionalEtiology: string[]
  note: string
}

export type sampleDupResponse = {
  caseId: string
  bCode: string
  orderId: string
}

export type SampleLot = {
  orderDate: string
  lotId: string
  visit: number
  afp: number | null
  mainPeak: number | null
  conc: number | null
  score: number | null
  note: string | null
  sampleId: string
}

export type SampleLotAnalysis = {
  code: string
  age: number
  sex: string
  hospital: string
  customer: string
  lots: SampleLot[]
}

export type QCSample = {
  code: string
  note: string | null
  pass: boolean | null
  updatedAt: Date | null
}

export type QCDetails = {
  updatedBy: string
  pass: boolean
  sample: QCSample[]
}

export type DistributionStage = {
  id: string
  status: 'completed' | 'pending'
  canceled: boolean
  label: string
  date: string
  location: string
  qc: QCDetails
}

export interface PatientData {
  id: string
  patientName: string
  age: number
  sex: 'Male' | 'Female'
  collectionDate: string
  clinicalNotes: string
  predictionScore: number
  technologist: string
  pathologist: string
}

export interface PatientReportProps {
  data: PatientData
}

export interface ClinicalReportProps {
  data: PatientData
  ref: React.RefObject<HTMLDivElement>
}

export type TrackingResponse = {
  lotId: string | null
  customerName: string
  status: string
  orderDate: Date
  lastLocation: string
}

export type TrackingLot = {
  id: string
  canceled: boolean | null
  customer: string
  currentStatus: string
  lastUpdate: Date
  history: {
    status: string
    label: string
    date: Date | null
    location: string | undefined
    qc: {
      updatedBy: string | undefined
      pass: boolean
      sample: {
        code: string
        note: string | null
        pass: boolean | null
        updatedAt: Date | null
      }[]
    }
  }[]
}

export type OrderStatusUpdate = {
  lotId: string
  stageLabel: 'shipped' | 'delivered' | 'extracted' | 'distributed' | 'analyzed'
  qData: { code: string; pass: boolean; note?: string | null | undefined }[]
}

export type SampleForAnalysis = {
  bCode: string
  hCode: string
  age: number
  sex: 'male' | 'female'
  sampleId: string
}

export type DistData = {
  distId: string
  passQC: boolean | null
  bin1: number | null
  bin2: number | null
  bin3: number | null
  bin4: number | null
  bin5: number | null
  bin6: number | null
  bin7: number | null
  bin8: number | null
  bin9: number | null
  bin10: number | null
  bin11: number | null
  bin12: number | null
  bin13: number | null
  bin14: number | null
  bin15: number | null
  bin16: number | null
  bin17: number | null
  bin18: number | null
  bin19: number | null
  bin20: number | null
  note: string
  afp: number | null
  mainPeak: number | null
  conc: number | null
}

type BinKeys =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20

export type Bins = { [K in BinKeys as `bin${K}`]: number }

export interface FullDistPayload extends Bins {
  bCode: string
  age: number
  sex: 'male' | 'female'
  distId: string | null
  afp: number
  mainPeak: number
  conc: number
  note: string | null
  passQC: boolean
}

export type DistPayload = {
  bCode: string
  age: number
  sex: 'male' | 'female'
  distId: string | null
  afp: number
  mainPeak: number
  conc: number
  note: string | null
  passQC: boolean
  // This defines the bins 1 through 20
} & { [key in `bin${number}`]: number }

export type PredictScore = {
  score: number
}

export type ReportSample = {
  hCode: string
  bCode: string
  age: string
  sex: string
  afp: number | null
  mainPeak: number | null
  conc: number | null
  score: number | null
}
