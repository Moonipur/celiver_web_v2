import { authMiddleware } from '@/middlewares/auth.middleware'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { OrgSchema, OrgUpdateSchema } from '@backend/schemas/org.schema'
import { UserUpdateSchema } from '@backend/schemas/user.schema'
import {
  AdminDashboard,
  api,
  ApiResponse,
  createHeaderToken,
  OrgInput,
  User,
} from './types'

export const DashboardAdmin = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const response = await api.get<ApiResponse<AdminDashboard>>(
        `/api/admin`,
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

export const CreateOrg = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(OrgSchema)
  .handler(async ({ context, data }) => {
    const org = data

    try {
      const response = await api.post<ApiResponse<OrgInput>>(
        `/api/orgs/create`,
        org,
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

export const UpdateOrg = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(OrgUpdateSchema)
  .handler(async ({ context, data }) => {
    const org = data

    try {
      const response = await api.post<ApiResponse<OrgInput>>(
        `/api/orgs/update`,
        org,
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

export const DeleteOrg = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.string())
  .handler(async ({ context, data }) => {
    const orgId = data

    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/api/orgs/delete/${orgId}`,
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

export const UpdateUser = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(UserUpdateSchema)
  .handler(async ({ context, data }) => {
    const user = data

    try {
      const response = await api.post<ApiResponse<User>>(
        `/api/users/update`,
        user,
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

export const DeleteUser = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(z.string())
  .handler(async ({ context, data }) => {
    const userId = data

    try {
      const response = await api.delete<ApiResponse<boolean>>(
        `/api/users/delete/${userId}`,
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
