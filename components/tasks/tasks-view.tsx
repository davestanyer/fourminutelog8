"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecurringTasks } from "@/components/tasks/recurring-tasks"
import { OneOffTasks } from "@/components/tasks/one-off-tasks"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { useRecurringTasks } from "@/lib/hooks/use-recurring-tasks"
import { useTasks } from "@/lib/hooks/use-tasks"
import { toast } from "sonner"

export interface Task {
  id: string
  title: string
  time?: string
  type: "recurring" | "one-off"
  schedule?: {
    frequency: "daily" | "weekly" | "monthly"
    weekDay?: number
    monthDay?: number
  }
  startDate?: string
  createdAt: Date
  client?: string
  client_emoji?: string
  project?: string
  client_id?: string
  project_id?: string
}

export function TasksView() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"recurring" | "one-off">("recurring")
  
  const { 
    tasks: recurringTasks, 
    addTask: addRecurringTask,
    updateTask: updateRecurringTask,
    deleteTask: deleteRecurringTask,
    loading: recurringLoading
  } = useRecurringTasks()

  const {
    tasks: oneOffTasks,
    addTask: addOneOffTask,
    updateTask: updateOneOffTask,
    deleteTask: deleteOneOffTask,
    loading: oneOffLoading
  } = useTasks()

  const handleSubmit = async (task: Omit<Task, "id" | "createdAt">) => {
    try {
      if (task.type === "recurring") {
        await addRecurringTask(
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
      } else {
        await addOneOffTask(task.title, task.time)
      }
      setShowCreateDialog(false)
      toast.success("Task created successfully")
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create task")
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    try {
      if (updates.type === "recurring") {
        await updateRecurringTask(id, {
          title: updates.title,
          time: updates.time,
          client_id: updates.client_id,
          project_id: updates.project_id,
          frequency: updates.schedule?.frequency,
          week_day: updates.schedule?.weekDay,
          month_day: updates.schedule?.monthDay
        })
      } else {
        await updateOneOffTask(id, {
          content: updates.title,
          time: updates.time
        })
      }
      toast.success("Task updated successfully")
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    }
  }

  const handleDelete = async (id: string, type: "recurring" | "one-off") => {
    try {
      if (type === "recurring") {
        await deleteRecurringTask(id)
      } else {
        await deleteOneOffTask(id)
      }
      toast.success("Task deleted successfully")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    }
  }

  if (recurringLoading || oneOffLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const formattedRecurringTasks = recurringTasks.map(task => ({
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

  const formattedOneOffTasks = oneOffTasks.map(task => ({
    id: task.id,
    title: task.content,
    time: task.time || undefined,
    type: "one-off" as const,
    createdAt: new Date(task.created_at)
  }))

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Tasks</h1>
      </div>

      <Card className="p-6">
        <Tabs 
          defaultValue="recurring" 
          className="space-y-4"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "recurring" | "one-off")}
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="recurring">Recurring Tasks</TabsTrigger>
              <TabsTrigger value="one-off">One-off Tasks</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <TabsContent value="recurring" className="space-y-4">
            <RecurringTasks
              tasks={formattedRecurringTasks}
              onDelete={(id) => handleDelete(id, "recurring")}
              onUpdate={(id, updates) => handleUpdate(id, { ...updates, type: "recurring" })}
            />
          </TabsContent>

          <TabsContent value="one-off" className="space-y-4">
            <OneOffTasks
              tasks={formattedOneOffTasks}
              onDelete={(id) => handleDelete(id, "one-off")}
              onUpdate={(id, updates) => handleUpdate(id, { ...updates, type: "one-off" })}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleSubmit}
        type={activeTab}
      />
    </div>
  )
}