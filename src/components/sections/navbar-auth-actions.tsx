'use client'

import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'

/**
 * Isolated navbar auth section: shows Login + Get started when logged out,
 * link to home/dashboard when logged in. Uses a skeleton while session is loading
 * so the rest of the navbar is not blocked.
 */
export function NavbarAuthActions() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex shrink-0 items-center gap-5" aria-hidden="true">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    )
  }

  if (session?.user) {
    return (
      <ButtonLink href="/dashboard" size="lg">
        Go to app
      </ButtonLink>
    )
  }

  return (
    <>
      <PlainButtonLink href="/login" className="max-sm:hidden" size="lg">
        Log in
      </PlainButtonLink>
      <ButtonLink href="/register" size="lg">
        Get started
      </ButtonLink>
    </>
  )
}
