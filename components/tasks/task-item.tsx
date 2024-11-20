"use client"

import { useState } from "react"
import { Square, Clock, Briefcase, Trash2, Pencil, Check, X, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: {
    id: string
    content: string
    time?: string
    client?: string
    project?: string
    is_recurring?: boolean
  }
  onComplete: () => void
  onUpdate: (updates: { content?: string; time?: string }) => void
  onDelete: () => void
  onTimeClick: () => void
}

export function TaskItem({
  task,
  onComplete,
  onUpdate,
  onDelete,
  onTimeClick
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(task.content)

  return (
    <div className="group flex items-center gap-2 p-2 rounded-md hover:bg-accent">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onComplete}
      >
        <Square className="h-4 w-4" />
      </Button>

      {isEditing ? (
        <>
          <Input
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              onUpdate({ content: editedContent })
              setIsEditing(false)
            }}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setEditedContent(task.content)
              setIsEditing(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <div className={cn(
            "flex-1 flex items-center gap-2",
            task.is_recurring && "text-primary"
          )}>
            {task.is_recurring && (
              <RotateCw className="h-4 w-4 shrink-0" />
            )}
            <span>{task.content}</span>
          </div>
          
          {task.time && (
            <Badge variant="secondary" className="h-6">
              <Clock className="h-3 w-3 mr-1" />
              {task.time}
            </Badge>
          )}
          
          {(task.client || task.project) && (
            <Badge variant="outline" className="h-6">
              <Briefcase className="h-3 w-3 mr-1" />
              {task.client}
              {task.project && ` / ${task.project}`}
            </Badge>
          )}

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onTimeClick}
            >
              <Clock className="h-4 w-4" />
            </Button>
            {!task.is_recurring && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setIsEditing(true)
                    setEditedContent(task.content)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}