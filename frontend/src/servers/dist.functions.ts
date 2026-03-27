import { authMiddleware } from '@/middlewares/auth.middleware'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { api, ApiResponse, createHeaderToken, DistData } from './types'

export const getDistByID = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.string())
  .handler(async ({ context, data }) => {
    try {
      const sampleId = data

      const distData = await api.get<ApiResponse<DistData[]>>(
        `/api/dists/${sampleId}`,
        {
          headers: createHeaderToken(context.session?.session.token),
        },
      )

      return {
        success: true,
        data: distData.data.body,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
      }
    }
  })
