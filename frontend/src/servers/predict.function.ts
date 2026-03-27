import { authMiddleware } from '@/middlewares/auth.middleware'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import {
  api,
  ApiResponse,
  createHeaderToken,
  PredictScore,
  SampleLotAnalysis,
} from './types'
import { PredictInputSchema } from '@backend/schemas/predict.schema'

export const getLotsByBCode = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(z.string().min(7).max(7))
  .handler(async ({ context, data }) => {
    try {
      const bCode = data

      const lotDetails = await api.get<ApiResponse<SampleLotAnalysis>>(
        `/api/predict/${bCode}`,
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

export const predictScoreFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(PredictInputSchema)
  .handler(async ({ context, data }) => {
    try {
      const score = await api.post<ApiResponse<PredictScore>>(
        `/api/predict/analysis/${data.sampleId}`,
        data.analysisData,
        {
          headers: createHeaderToken(context.session?.session.token),
        },
      )

      return {
        success: true,
        data: score.data.body,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
      }
    }
  })
