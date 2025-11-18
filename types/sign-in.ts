import { z } from "zod"

export const signInSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export type SignInInput = z.infer<typeof signInSchema>

export interface AuthUser {
  id: string
  name: string
  username: string
}

export interface SignInResponse {
  authID: string
  user: AuthUser & {
    accessToken: string
    refreshToken: string
  }
}

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export type AuthErrorCode =
  | "INVALID_FORM"
  | "UNAUTHORIZED"
  | "INVALID_CREDENTIALS"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "INTERNAL_SERVER_ERROR"
