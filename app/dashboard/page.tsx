"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, Users, Briefcase, RotateCcw } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/log">
          <div className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <Clock className="h-8 w-8 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Daily Log</h2>
            <p className="text-muted-foreground">Track your daily activities and tasks</p>
          </div>
        </Link>

        <Link href="/clients">
          <div className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <Briefcase className="h-8 w-8 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Clients</h2>
            <p className="text-muted-foreground">Manage your client relationships</p>
          </div>
        </Link>

        <Link href="/team">
          <div className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <Users className="h-8 w-8 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Team</h2>
            <p className="text-muted-foreground">Collaborate with your team members</p>
          </div>
        </Link>

        <Link href="/recurring">
          <div className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <RotateCcw className="h-8 w-8 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Recurring Tasks</h2>
            <p className="text-muted-foreground">Manage recurring activities</p>
          </div>
        </Link>
      </div>
    </div>
  )
}