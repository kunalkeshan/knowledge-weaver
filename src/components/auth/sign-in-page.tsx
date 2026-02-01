import Link from 'next/link'
import { AuthPageLayout } from '@/components/auth-page'
import { GoogleOAuthButton } from '@/components/auth/google-oauth-button'
import { SignInForm } from '@/components/auth/sign-in-form'

export function SignInPage() {
  return (
    <AuthPageLayout
      title="Sign in to Community Knowledge Weaver"
      description="Turn scattered organizational knowledge into actionable learning paths and guided workflows."
      footer={
        <>
          By clicking continue, you agree to our{' '}
          <a
            className="underline underline-offset-4 hover:text-primary"
            href="#"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            className="underline underline-offset-4 hover:text-primary"
            href="#"
          >
            Privacy Policy
          </a>
          .
        </>
      }
    >
      <div className="space-y-4">
        <GoogleOAuthButton errorCallbackURL="/login" />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>
        <SignInForm />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthPageLayout>
  )
}
