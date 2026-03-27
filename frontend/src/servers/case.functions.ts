import { createServerFn } from '@tanstack/react-start'
import axios from 'axios'
import { api, ApiResponse, CaseResponse, createHeaderToken } from './types'
import { authMiddleware } from '@/middlewares/auth.middleware'

export const getLatestCase = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const hCode = context.session?.org?.hCode
      if (!hCode) return { success: false, message: 'No hCode in session' }

      try {
        const latestCaseResponse = await api.get<ApiResponse<CaseResponse>>(
          `/api/cases/latest/${hCode}`,
          {
            headers: createHeaderToken(context.session?.session.token),
          },
        )

        const latestCase = latestCaseResponse.data?.body

        if (!latestCase || latestCase === undefined) {
          return { success: true, bCode: 'never' }
        }

        const bCode = latestCase.biobankCode ?? 'never'

        return {
          success: true,
          bCode: bCode,
        }
      } catch (err) {
        console.log(err)

        return { success: true, bCode: 'never' }
      }
    } catch (error) {
      console.error(
        'Detailed Backend Error:',
        axios.isAxiosError(error) ? error.response?.data : error,
      )
      return {
        success: true,
        bCode: 'never',
      }
    }
  })
