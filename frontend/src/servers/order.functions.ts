import { createServerFn } from '@tanstack/react-start'
import { CasesArrVisitSchema } from '@backend/schemas/case.schema'
import axios from 'axios'
import {
  api,
  ApiResponse,
  CaseResponse,
  createHeaderToken,
  OrderResponse,
  TrackingResponse,
} from './types'
import { authMiddleware } from '@/middlewares/auth.middleware'

export const addOrders = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(CasesArrVisitSchema)
  .handler(
    async ({
      context,
      data,
    }): Promise<
      | { success: true; message: string }
      | { success: false; message: string }
      | undefined
    > => {
      try {
        const orderResponse = await api.post<ApiResponse<OrderResponse>>(
          '/api/orders/create',
          {},
          { headers: createHeaderToken(context.session?.session.token) },
        )

        if (!orderResponse.data) {
          return { success: false, message: 'Already have this order.' }
        }

        const filteredData = data.filter((item) => item.visit === false)
        const existingCaseItems = data.filter((item) => item.visit === true)
        const payload = filteredData.map(
          ({ caseId, visit, note, ...rest }) => rest,
        )

        if (filteredData.length > 0) {
          const caseResponse = await api.post<ApiResponse<CaseResponse[]>>(
            '/api/cases/create',
            payload,
            { headers: createHeaderToken(context.session?.session.token) },
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
            { headers: createHeaderToken(context.session?.session.token) },
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
            { headers: createHeaderToken(context.session?.session.token) },
          )
        }

        // try {
        //   await api.post(
        //     '/api/orders/notify',
        //     {
        //       lotId: orderResponse.data.body.lot,
        //       orgSlug: response.data.org.hCode,
        //       date: new Date(),
        //       cases: data.map((item) => ({
        //         bCode: item.biobankCode,
        //         visit: item.visit,
        //       })),
        //     },
        //     { headers: createHeaderToken(token) },
        //   )
        // } catch (error) {
        //   console.log('Can not send notify')
        // }

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

export const getOrders = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<TrackingResponse[] | null> => {
    try {
      // 2. Fetch Tracking Data
      const trackingResponse = await api.get<ApiResponse<TrackingResponse[]>>(
        '/api/tracking',
        { headers: createHeaderToken(context.session?.session.token) },
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
  })
