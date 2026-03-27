import { createServerFn } from '@tanstack/react-start'
import { CasesArrVisitSchema } from '@backend/schemas/case.schema'
import axios from 'axios'
import {
  api,
  ApiResponse,
  AuthResponse,
  CaseResponse,
  createHeaderToken,
  OrderResponse,
  TrackingResponse,
} from './types'
import { getCookie } from '@tanstack/react-start/server'

export const addOrders = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => CasesArrVisitSchema.parse(data))
  .handler(
    async ({
      data,
    }): Promise<
      | { success: true; message: string }
      | { success: false; message: string }
      | undefined
    > => {
      const token = getCookie('token')
      if (!token) {
        return { success: false, message: 'Authentication required.' }
      }

      const response = await api.get<AuthResponse>(
        `/api/users/getSession/${token}`,
        { headers: createHeaderToken(token) },
      )

      if (!response.data || !response.data.session) {
        return { success: false, message: 'Your session not found.' }
      }

      try {
        const orderResponse = await api.post<ApiResponse<OrderResponse>>(
          '/api/orders/create',
          {},
          { headers: createHeaderToken(token) },
        )

        if (!orderResponse.data) {
          return { success: false, message: 'Already have this order.' }
        }

        const filteredData = data.filter((item) => item.visit === 1)
        const existingCaseItems = data.filter((item) => item.visit > 1)
        const payload = filteredData.map(
          ({ caseId, visit, note, ...rest }) => rest,
        )

        if (filteredData.length > 0) {
          const caseResponse = await api.post<ApiResponse<CaseResponse[]>>(
            '/api/cases/create',
            payload,
            { headers: createHeaderToken(token) },
          )

          if (!caseResponse.data) {
            return { success: false, message: 'Already have these cases.' }
          }

          const samplesResponse = await api.post<ApiResponse<CaseResponse[]>>(
            '/api/samples/create',
            caseResponse.data.body.map((item) => ({
              caseId: item.id,
              orderId: orderResponse.data.body.id,
            })),
            { headers: createHeaderToken(token) },
          )

          if (!samplesResponse.data) {
            return { success: false, message: 'Already have these samples.' }
          }
        }

        if (existingCaseItems.length > 0) {
          await api.post<ApiResponse<CaseResponse[]>>(
            '/api/samples/create',
            existingCaseItems.map((item) => ({
              caseId: item.caseId,
              orderId: orderResponse.data.body.id,
            })),
            { headers: createHeaderToken(token) },
          )
        }

        try {
          await api.post(
            '/api/orders/notify',
            {
              lotId: orderResponse.data.body.lot,
              orgSlug: response.data.org.hCode,
              date: new Date(),
              cases: data.map((item) => ({
                bCode: item.biobankCode,
                visit: item.visit,
              })),
            },
            { headers: createHeaderToken(token) },
          )
        } catch (error) {
          console.log('Can not send notify')
        }

        return { success: true, message: 'Placed order successful.' }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Centralized backend error handling
          return {
            success: false,
            message:
              error.response?.data?.message ??
              'Request failed. Please try again.',
          }
        }

        return { success: false, message: 'Internal Server Error' }
      }
    },
  )

export const getOrders = createServerFn({ method: 'GET' }).handler(
  async (): Promise<TrackingResponse[] | null> => {
    const token = getCookie('token')

    if (!token) return null

    try {
      // 1. Validate Session
      const response = await api.get<AuthResponse>(
        `/api/users/getSession/${token}`,
        { headers: createHeaderToken(token) },
      )

      if (!response.data?.session) {
        return null
      }

      // 2. Fetch Tracking Data
      const trackingResponse = await api.get<ApiResponse<TrackingResponse[]>>(
        '/api/tracking',
        { headers: createHeaderToken(token) },
      )

      // Ensure the body exists and is an array
      const orders = trackingResponse.data?.body

      if (!orders || !Array.isArray(orders)) {
        return null
      }

      return orders
    } catch (error) {
      // Explicitly return null so the return type remains consistent
      if (axios.isAxiosError(error)) {
        console.error('Backend Error:', error.response?.data)
      }
      return null
    }
  },
)
