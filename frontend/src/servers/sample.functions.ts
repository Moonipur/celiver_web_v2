import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import axios from 'axios'
import {
  api,
  ApiResponse,
  createHeaderToken,
  sampleDupResponse,
  SampleForAnalysis,
} from './types'
import z from 'zod'
import { authMiddleware } from '@/middlewares/auth.middleware'

export const checkSampleDup = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z
      .string()
      .min(9)
      .max(9)
      .transform((str) => str.replace('-', '')),
  )
  .handler(async ({ context, data }) => {
    try {
      try {
        const sampleDupResponse = await api.get<ApiResponse<sampleDupResponse>>(
          `/api/samples/dup/${data}`,
          {
            headers: createHeaderToken(context.session?.session.token),
          },
        )

        if (
          sampleDupResponse.data?.body &&
          sampleDupResponse.data?.body.found
        ) {
          return {
            success: true,
            caseId: sampleDupResponse.data?.body.caseId,
            bCode: sampleDupResponse.data?.body.bCode,
            visit: sampleDupResponse.data?.body.found,
          }
        }

        return {
          success: true,
          caseId: null,
          bCode: 'never',
          visit: false,
        }
      } catch (err) {
        // If 404, it just means there are no cases yet. Don't crash!
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return {
            success: true,
            caseId: null,
            bCode: 'never',
            visit: false,
          }
        }
        throw err // Rethrow other actual errors (500, etc)
      }
    } catch (error) {
      console.error(
        'Detailed Backend Error:',
        axios.isAxiosError(error) ? error.response?.data : error,
      )
      return {
        success: true,
        caseId: null,
        bCode: 'never',
        visit: false,
      }
    }
  })

export const getSampleForPredict = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      lotId: z.string().min(12).max(12),
      bCode: z.string().min(7).max(7),
    }),
  )
  .handler(async ({ context, data }) => {
    try {
      const { lotId, bCode } = data

      const lotDetails = await api.get<ApiResponse<SampleForAnalysis>>(
        `/api/samples/getSample/${lotId}/${bCode}`,
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
