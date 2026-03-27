import { authMiddleware } from '@/middlewares/auth.middleware'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { api, ApiResponse, createHeaderToken, ReportSample } from './types'

export const sampleReport = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.string())
  .handler(async ({ context, data }) => {
    try {
      const sampleId = data
      const response = await api.post<ApiResponse<ReportSample>>(
        `/api/report/${sampleId}`,
        {},
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
