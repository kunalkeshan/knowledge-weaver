import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { SignUpPage } from '@/components/auth/sign-up-page'

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user) {
    redirect('/dashboard')
  }

  return <SignUpPage />
}
