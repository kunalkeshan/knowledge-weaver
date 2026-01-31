import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Particles } from '@/components/ui/particles'
import { ChevronLeftIcon } from 'lucide-react'
import type React from 'react'

interface AuthPageLayoutProps {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthPageLayout({
  title,
  description,
  children,
  footer,
}: AuthPageLayoutProps) {
  return (
    <div className="relative w-full md:h-screen md:overflow-hidden">
      <Particles
        className="absolute inset-0"
        color="#666666"
        ease={20}
        quantity={120}
      />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4">
        <Button asChild className="absolute top-4 left-4" variant="ghost">
          <a href="/">
            <ChevronLeftIcon />
            Home
          </a>
        </Button>

        <div className="mx-auto space-y-4 sm:w-sm">
          <Logo className="h-6" />
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-2xl tracking-wide">{title}</h1>
            <p className="text-base text-muted-foreground">{description}</p>
          </div>
          {children}
          {footer && (
            <div className="mt-8 text-muted-foreground text-sm">{footer}</div>
          )}
        </div>
      </div>
    </div>
  )
}
