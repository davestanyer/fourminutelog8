"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RecurringTasksView } from "@/components/tasks/recurring-tasks-view"

export default function RecurringPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Tasks</h1>
        </div>
      </div>
      <RecurringTasksView />
    </div>
  )
}