export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // OAuth errors
  unable_to_link_account:
    'Unable to link your account. An account with this email may already exist.',
  oauth_error: 'Something went wrong during sign-in. Please try again.',
  access_denied: 'Sign-in was cancelled. Please try again.',
  invalid_state: 'Your session has expired. Please try again.',

  // Email/password errors
  invalid_credentials: 'Invalid email or password.',
  user_not_found: 'No account found with this email.',
  email_already_exists: 'An account with this email already exists.',

  default: 'An unexpected error occurred.',
}

export function getAuthErrorMessage(
  errorCode: string | null | undefined
): string {
  if (!errorCode) return AUTH_ERROR_MESSAGES.default
  return AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.default
}
