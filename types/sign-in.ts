import { z } from "zod"

export enum LoginTypeEnum {
  INTERNAL = "INTERNAL",
  GOOGLE = "GOOGLE"
}

export const signInSchema = z.object({
  loginType: z.nativeEnum(LoginTypeEnum).catch(LoginTypeEnum.INTERNAL).default(LoginTypeEnum.INTERNAL),
  username: z.string().optional(),
  password: z.string().optional(),
  token: z.string().optional()
}).superRefine((val, ctx) => {
  if (val.loginType === LoginTypeEnum.INTERNAL) {
    if (!val.username || val.username.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Username is required", path: ["username"] })
    }
    if (!val.password || val.password.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required", path: ["password"] })
    }
  }
  if (val.loginType === LoginTypeEnum.GOOGLE) {
    if (!val.token || val.token.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Token is required", path: ["token"] })
    }
  }
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

export enum AuthErrorCode {
  INVALID_FORM = "INVALID_FORM",
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
}
