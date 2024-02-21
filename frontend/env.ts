import { z } from "zod"

// NB: Also set in env.d.ts

export const envSchema = z.object({
  VITE_CLIENT_ID: z.string(),
  VITE_REDIRECT_URI: z.string(),
  VITE_TOKEN_ISSUER: z.string(),
  VITE_API_URL: z.string(),
})
