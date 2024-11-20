"use client"

import { useState } from "react"
import { Square, Clock, Tag, Briefcase, Trash2, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/lib/database.types"

type Task = Database['public']['Tables']['tasks']['Row'] & {
  task_client_tags?: Database['public']['Views']['task_client_tags']['Row'] | null
  task_project_tags?: Database['public']['Views']['task_project_tags']['Row'] | null
}

interface TaskItemProps {
  task: Task
  onComplete: () => void
  onUpdate: (updates: { content?: string; time?: string; client_tag_id?: string | null; project_tag_id?: string | null }) => void
  onDelete: () => void
  onTimeClick: () => void
  onTagClick: () => void
}

export function TaskItem({
  task,
  onComplete,
  onUpdate,
  onDelete,
  onTimeClick,
  onTagClick
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
          <div className="flex-1">{task.content}</div>
          
          {task.time && (
            <Badge variant="secondary" className="h-6">
              <Clock className="h-3 w-3 mr-1" />
              {task.time}
            </Badge>
          )}
          
          {task.task_client_tags && (
            <Badge 
              variant="outline" 
              className="h-6"
              style={{
                backgroundColor: `${task.task_client_tags.color}20`,
                borderColor: task.task_client_tags.color
              }}
            >
              <Briefcase className="h-3 w-3 mr-1" />
              <span className="mr-1">
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

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onTimeClick}
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onTagClick}
            >
              <Tag className="h-4 w-4" />
            </Button>
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
          </div>
        </>
      )}
    </div>
  )
}