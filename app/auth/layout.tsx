import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50">
      <div className="w-full max-w-md p-4">
        {children}
      </div>
    </div>
  )
}