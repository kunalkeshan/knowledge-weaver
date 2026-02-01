'use client'

import { ButtonLink, PlainButtonLink } from '@/components/elements/button'
import { ChevronIcon } from '@/components/icons/chevron-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'

/**
 * Isolated CTA section buttons: Get started → register when logged out, Go to app →
 * dashboard when logged in. "Book a demo" stays as-is with no destination. Uses a
 * skeleton for the primary button while session is loading so the section is not blocked.
 */
export function CallToActionAuthCta() {
  const { data: session, isPending } = authClient.useSession()

  return (
    <div className="flex items-center gap-4">
      {isPending ? (
        <Skeleton className="h-12 w-28 rounded-full" aria-hidden="true" />
      ) : session?.user ? (
        <ButtonLink href="/dashboard" size="lg">
          Go to app
        </ButtonLink>
      ) : (
        <ButtonLink href="/register" size="lg">
          Get started
        </ButtonLink>
      )}

      <PlainButtonLink href="#" size="lg">
        Book a demo <ChevronIcon />
      </PlainButtonLink>
    </div>
  )
}
