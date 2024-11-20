import { Navigation } from "@/components/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  )
}