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

export const DeleteDist = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.string())
  .handler(async ({ context, data }) => {
    const distId = data

    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/api/dists/delete/${distId}`,
        {
          headers: createHeaderToken(context.session?.session.token),
        },
      )

      if (!response.data.body) {
        return {
          success: false,
          data: null,
        }
      }

      return {
        success: true,
        data: response.data.body,
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
      }
    }
  })
