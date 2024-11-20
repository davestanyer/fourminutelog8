"use client"

import { useState, KeyboardEvent } from "react"
import { format } from "date-fns"
import { Plus, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskItem } from "@/components/log/task-item"
import { TimeSelector } from "@/components/log/time-selector"
import { TagSelector } from "@/components/log/tag-selector"

interface LogEntryProps {
  date: Date
  tasks: Array<{
    id: string
    content: string
    time?: string
    tags?: string[]
    createdAt?: string
  }>
  onUpdate: (tasks: Array<{
    id: string
    content: string
    time?: string
    tags?: string[]
    createdAt: string
  }>) => void
  isCollapsed?: boolean
}

export function LogEntry({ date, tasks, onUpdate, isCollapsed = false }: LogEntryProps) {
  const [newTask, setNewTask] = useState("")
  const [showTimeSelector, setShowTimeSelector] = useState(false)
  const [showTagSelector, setShowTagSelector] = useState(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTask.trim()) {
      onUpdate([
        ...tasks,
        {
          id: crypto.randomUUID(),
          content: newTask.trim(),
          createdAt: new Date().toISOString()
        }
      ])
      setNewTask("")
    }
  }

  const updateTask = (id: string, updates: Partial<{ content: string; time: string; tags: string[] }>) => {
    onUpdate(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ))
  }

  const deleteTask = (id: string) => {
    onUpdate(tasks.filter(task => task.id !== id))
  }

  return (
    <div className="space-y-4">      
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={updateTask}
            onDelete={deleteTask}
            isCollapsed={isCollapsed}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Start adding tasks to your log...
          </p>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Add a new task (press Enter to save)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowTimeSelector(!showTimeSelector)}
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setShowTagSelector(!showTagSelector)}
          >
            <Tag className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={() => {
              if (newTask.trim()) {
                onUpdate([
                  ...tasks,
                  {
                    id: crypto.randomUUID(),
                    content: newTask.trim(),
                    createdAt: new Date().toISOString()
                  }
                ])
                setNewTask("")
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showTimeSelector && (
        <TimeSelector
          onSelect={(time) => {
            setShowTimeSelector(false)
          }}
        />
      )}

      {showTagSelector && (
        <TagSelector
          onSelect={(tag) => {
            setShowTagSelector(false)
          }}
        />
      )}
    </div>
  )
}