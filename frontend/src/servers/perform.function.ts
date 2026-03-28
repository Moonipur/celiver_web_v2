import { authMiddleware } from '@/middlewares/auth.middleware'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { api, ApiResponse, createHeaderToken, DashboardMtxType } from './types'

export const DashboardMatrix = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const response = await api.get<ApiResponse<DashboardMtxType>>(
        `/api/perform`,
        {
          headers: createHeaderToken(context.session?.session.token),
        },
      )

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
