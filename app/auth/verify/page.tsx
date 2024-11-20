export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent you a verification link. Please check your email to verify your account.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            After verifying your email, you can sign in to your account.
          </p>
        </div>
      </div>
    </div>
  )
}