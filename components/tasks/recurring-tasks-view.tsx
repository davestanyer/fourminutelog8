"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { RecurringTasks } from "@/components/tasks/recurring-tasks"
import { Task } from "@/components/tasks/tasks-view"
import { useRecurringTasks } from "@/lib/hooks/use-recurring-tasks"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "sonner"

export function RecurringTasksView() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { tasks, loading, addTask, updateTask, deleteTask } = useRecurringTasks()
  const { user } = useAuth()

  const formattedTasks: Task[] = tasks.map(task => ({
    id: task.id,
    title: task.title,
    time: task.time || undefined,
    type: "recurring" as const,
    schedule: {
      frequency: task.frequency,
      weekDay: task.week_day || undefined,
      monthDay: task.month_day || undefined
    },
    client: task.clients?.name,
    client_emoji: task.clients?.emoji,
    project: task.projects?.name,
    client_id: task.client_id || undefined,
    project_id: task.project_id || undefined,
    createdAt: new Date(task.created_at)
  }))

  const handleAddTask = async (task: Omit<Task, "id" | "createdAt">) => {
    try {
      if (!user) {
        toast.error("Please sign in to create tasks")
        return
      }

      console.log('Adding task with data:', task)

      await addTask(
        task.title,
        task.schedule!.frequency,
        {
          time: task.time,
          client_id: task.client_id,
          project_id: task.project_id,
          weekDay: task.schedule?.weekDay,
          monthDay: task.schedule?.monthDay
        }
      )
      setShowCreateDialog(false)
      toast.success("Task created successfully")
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create task")
    }
  }

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      if (!user) {
        toast.error("Please sign in to update tasks")
        return
      }

      await updateTask(id, {
        title: updates.title,
        time: updates.time,
        client_id: updates.client_id,
        project_id: updates.project_id,
        frequency: updates.schedule?.frequency,
        week_day: updates.schedule?.weekDay,
        month_day: updates.schedule?.monthDay
      })
      toast.success("Task updated successfully")
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      if (!user) {
        toast.error("Please sign in to delete tasks")
        return
      }

      await deleteTask(id)
      toast.success("Task deleted successfully")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please sign in to manage your recurring tasks</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Recurring Tasks</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <RecurringTasks
        tasks={formattedTasks}
        onDelete={handleDeleteTask}
        onUpdate={handleUpdateTask}
      />

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleAddTask}
        type="recurring"
      />
    </Card>
  )
}