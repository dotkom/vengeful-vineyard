import { z } from "zod"

// NB: Also set in env.d.ts

export const envSchema = z.object({
  AUTH0_CLIENT_ID: z.string(),
  VITE_REDIRECT_URI: z.string(),
  AUTH0_ISSUER: z.string(),
  VITE_API_URL: z.string(),
})
