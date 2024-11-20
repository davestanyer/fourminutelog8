"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Separator } from "@/components/ui/separator"
import { useTasks } from "@/lib/hooks/use-tasks"
import { TaskList } from "@/components/log/task-list"
import { CompletedTaskList } from "@/components/log/completed-task-list"
import { HistoryTimeline } from "@/components/log/history-timeline"
import { toast } from "sonner"
import { Database } from "@/lib/database.types"

type Task = Database['public']['Tables']['tasks']['Row'] & {
  task_client_tags?: Database['public']['Views']['task_client_tags']['Row'] | null
  task_project_tags?: Database['public']['Views']['task_project_tags']['Row'] | null
  clientKey: string
}

export function DailyLogView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks(selectedDate)

  // Memoize the filtered tasks to prevent unnecessary re-renders
  const { todoTasks, completedTasks } = useMemo(() => {
    return {
      todoTasks: tasks.filter(task => !task.completed),
      completedTasks: tasks.filter(task => task.completed)
    }
  }, [tasks])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleAddTask = async (content: string, isCompleted: boolean = false) => {
    try {
      const task = await addTask(content)
      if (task && isCompleted) {
        await updateTask(task.id, {
          completed: true,
          completed_at: new Date().toISOString()
        })
      }
      toast.success("Task added successfully")
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error("Failed to add task")
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTask(taskId, {
        completed: true,
        completed_at: new Date().toISOString()
      })
      toast.success("Task completed")
    } catch (error) {
      console.error('Error completing task:', error)
      toast.error("Failed to complete task")
    }
  }

  const handleUncompleteTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { 
        completed: false, 
        completed_at: null 
      })
      toast.success("Task moved back to todo")
    } catch (error) {
      console.error('Error uncompleting task:', error)
      toast.error("Failed to move task")
    }
  }

  const handleUpdateTask = async (taskId: string, updates: {
    content?: string
    time?: string
    client_tag_id?: string | null
    project_tag_id?: string | null
  }) => {
    try {
      await updateTask(taskId, updates)
      toast.success("Task updated successfully")
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error("Failed to update task")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      toast.success("Task deleted successfully")
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error("Failed to delete task")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <DatePicker
          date={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <Card className="p-6">
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-bold">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>
        <Separator className="mb-6" />
        
        <div className="mb-8">
          <TaskList
            tasks={todoTasks}
            onAdd={handleAddTask}
            onComplete={handleCompleteTask}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        </div>

        <div className="mb-8">
          <CompletedTaskList
            tasks={completedTasks}
            onAdd={(content) => handleAddTask(content, true)}
            onUncomplete={handleUncompleteTask}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        </div>

        <div className="mt-12">
          <Separator className="mb-8" />
          <h3 className="text-lg font-semibold mb-6">Previous Activity</h3>
          <HistoryTimeline excludeDate={selectedDate} />
        </div>
      </Card>
    </div>
  )
}