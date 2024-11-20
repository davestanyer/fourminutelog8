"use client"

import { Task } from "./tasks-view"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface OneOffTasksProps {
  tasks: Task[]
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
}

export function OneOffTasks({ tasks, onDelete, onUpdate }: OneOffTasksProps) {
  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <p className="text-center text-muted-foreground">No one-off tasks yet</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-muted-foreground">
                {task.startDate && `Starts ${format(new Date(task.startDate), "PPP")}`}
                {task.time && ` at ${task.time}`}
              </div>
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // TODO: Implement edit functionality
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}