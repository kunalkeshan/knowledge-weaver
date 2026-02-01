import Link from 'next/link'
import { AuthPageLayout } from '@/components/auth-page'
import { GoogleOAuthButton } from '@/components/auth/google-oauth-button'
import { SignUpForm } from '@/components/auth/sign-up-form'

export function SignUpPage() {
  return (
    <AuthPageLayout
      title="Create your account"
      description="Start organizing your knowledge and building learning paths."
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
        <GoogleOAuthButton errorCallbackURL="/register" />
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
        <SignUpForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthPageLayout>
  )
}
