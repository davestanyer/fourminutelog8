"use client"

import { User } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"

interface DashboardViewProps {
  user: User | undefined
}

export function DashboardView({ user }: DashboardViewProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!user) {
    return null
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="flex justify-between items-center">
        <p>Welcome, {user.email}</p>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    </div>
  )
}