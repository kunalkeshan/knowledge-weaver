import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

// OAuth redirects (e.g. Google login) use this URL. Set BETTER_AUTH_URL in .env to your app's
// public URL (e.g. https://yourdomain.com). In Google Cloud Console, add this as an authorized
// redirect URI: {BETTER_AUTH_URL}/api/auth/callback/google
const baseURL = process.env.BETTER_AUTH_URL

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'credential'],
      allowDifferentEmails: false,
    },
  },
  trustedOrigins: [
    ...(baseURL ? [baseURL] : []),
    'https://sharla-unblossoming-caressingly.ngrok-free.dev',
  ],
})
