"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Tag, ChevronLeft, ChevronRight } from "lucide-react"
import { useTasks } from "@/lib/hooks/use-tasks"

interface HistoryEntry {
  date: Date
  tasks: Array<{
    id: string
    content: string
    time?: string
    tags?: string[]
    completed_at: string
  }>
}

export function HistoryView() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { completedTasks, loading } = useTasks()

  // Group tasks by date
  const groupedTasks = completedTasks.reduce((acc: { [key: string]: HistoryEntry }, task) => {
    const date = format(new Date(task.completed_at), 'yyyy-MM-dd')
    
    if (!acc[date]) {
      acc[date] = {
        date: new Date(date),
        tasks: []
      }
    }
    
    acc[date].tasks.push(task)
    return acc
  }, {})

  // Convert to array and sort by date
  const historyEntries = Object.values(groupedTasks)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  // Paginate entries
  const totalPages = Math.ceil(historyEntries.length / pageSize)
  const paginatedEntries = historyEntries.slice((page - 1) * pageSize, page * pageSize)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity History</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {paginatedEntries.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">No completed tasks found</p>
        </Card>
      ) : (
        paginatedEntries.map((entry) => (
          <Card key={format(entry.date, 'yyyy-MM-dd')} className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {format(entry.date, 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-4">
                {entry.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="min-w-[100px] text-sm text-muted-foreground">
                      {format(new Date(task.completed_at), 'h:mm a')}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p>{task.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {task.time && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {task.time}
                          </Badge>
                        )}
                        {task.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}