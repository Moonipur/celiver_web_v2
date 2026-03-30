import { authMiddleware } from '@/middlewares/auth.middleware'
import { createServerFn } from '@tanstack/react-start'
import {
  CancelOrderSchema,
  TrackingSchema,
} from '@backend/schemas/tracking.schema'
import z from 'zod'
import {
  api,
  ApiResponse,
  createHeaderToken,
  OrderStatusUpdate,
  TrackingLot,
} from './types'

export const getOrderByLot = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.string().min(12).max(12))
  .handler(async ({ context, data }) => {
    try {
      const lotId = data

      const lotDetails = await api.get<ApiResponse<TrackingLot>>(
        `/api/tracking/${lotId}`,
        {
          headers: createHeaderToken(context.session?.session.token),
        },
      )

      return {
        success: true,
        data: lotDetails.data.body,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
      }
    }
  })

export const updateOrderStatus = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(TrackingSchema)
  .handler(async ({ context, data }) => {
    try {
      const response = await api.post<ApiResponse<OrderStatusUpdate>>(
        `/api/tracking/update/${data.lotId}`,
        { ...data },
        {
          headers: createHeaderToken(context.session?.session.token),
        },
      )

      return response.data
    } catch (error: any) {
      console.error(
        'API Error Response:',
        error.response?.data || error.message,
      )

      throw new Error(error.response?.data?.message || 'Failed to update order')
    }
  })

export const cancelOrder = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(CancelOrderSchema)
  .handler(async ({ context, data }) => {
    try {
      const response = await api.post<ApiResponse<TrackingLot>>(
        `/api/tracking/cancel`,
        data,
        {
          headers: createHeaderToken(context.session?.session.token),
        },
      )
      return response.data
    } catch (error) {
      console.error('Failed to cancel order:', error)
      throw new Error('Cancellation failed')
    }
  })
