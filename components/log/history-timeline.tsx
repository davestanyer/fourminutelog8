"use client"

import { useState } from "react"
import { format, isSameDay } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Tag, Briefcase, ChevronDown, ChevronUp } from "lucide-react"
import { useTasks } from "@/lib/hooks/use-tasks"
import { cn } from "@/lib/utils"
import { Database } from "@/lib/database.types"

type Task = Database['public']['Tables']['tasks']['Row'] & {
  task_client_tags?: Database['public']['Views']['task_client_tags']['Row'] | null
  task_project_tags?: Database['public']['Views']['task_project_tags']['Row'] | null
}

interface HistoryTimelineProps {
  excludeDate?: Date
  limit?: number
}

export function HistoryTimeline({ excludeDate, limit = 10 }: HistoryTimelineProps) {
  const [showAll, setShowAll] = useState(false)
  const { tasks: allTasks, loading } = useTasks()

  // Filter completed tasks
  const completedTasks = allTasks.filter(task => task.completed && task.completed_at)

  // Group tasks by date
  const groupedTasks = completedTasks.reduce((acc: { [key: string]: Task[] }, task) => {
    if (!task.completed_at) return acc
    
    const date = format(new Date(task.completed_at), 'yyyy-MM-dd')
    
    // Skip tasks from the excluded date
    if (excludeDate && isSameDay(new Date(task.completed_at), excludeDate)) {
      return acc
    }
    
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(task)
    return acc
  }, {})

  // Convert to array and sort by date
  const sortedDates = Object.entries(groupedTasks)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
    .slice(0, showAll ? undefined : limit)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (sortedDates.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No previous activity found
      </p>
    )
  }

  return (
    <div className="relative space-y-8">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border" />

      {sortedDates.map(([date, tasks]) => (
        <div key={date} className="relative grid grid-cols-[40px,1fr] gap-4">
          {/* Timeline dot */}
          <div className="relative flex justify-center">
            <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">
              {format(new Date(date), 'EEEE, MMMM d')}
            </h4>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "pl-4 border-l-2 border-muted",
                    "hover:border-primary transition-colors"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {task.completed_at && (
                        <span>{format(new Date(task.completed_at), 'h:mm a')}</span>
                      )}
                    </div>
                    <p>{task.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {task.time && (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time}
                        </Badge>
                      )}
                      
                      {task.task_client_tags && (
                        <Badge 
                          variant="outline" 
                          className="gap-1"
                          style={{
                            backgroundColor: `${task.task_client_tags.color}20`,
                            borderColor: task.task_client_tags.color
                          }}
                        >
                          <Briefcase className="h-3 w-3" />
                          <span>
                            {task.task_client_tags.emoji} {task.task_client_tags.name}
                          </span>
                          {task.task_project_tags && (
                            <>
                              <span className="mx-1">/</span>
                              {task.task_project_tags.name}
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {Object.keys(groupedTasks).length > limit && (
        <div className="flex justify-center pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="gap-2"
          >
            {showAll ? (
              <>
                Show Less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Show More
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}