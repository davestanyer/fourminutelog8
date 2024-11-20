"use client"

import { useState, KeyboardEvent } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PlanTomorrowProps {
  onPlan: (tasks: string[]) => void
}

export function PlanTomorrow({ onPlan }: PlanTomorrowProps) {
  const [tasks, setTasks] = useState<string[]>([])
  const [newTask, setNewTask] = useState("")

  const handleAddTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, newTask.trim()]
      setTasks(updatedTasks)
      onPlan(updatedTasks)
      setNewTask("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTask.trim()) {
      handleAddTask()
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Plan for Tomorrow</h2>
      
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-accent/50">
            {task}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a task for tomorrow (press Enter to save)"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button size="icon" onClick={handleAddTask}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}