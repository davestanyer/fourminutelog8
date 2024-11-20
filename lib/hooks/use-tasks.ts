"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'

type Task = Database['public']['Tables']['tasks']['Row'] & {
  task_client_tags?: Database['public']['Views']['task_client_tags']['Row'] | null
  task_project_tags?: Database['public']['Views']['task_project_tags']['Row'] | null
}

export function useTasks(date?: Date) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchTasks = async () => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      // First get all tasks
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (taskError) throw taskError

      // Then get client tags for these tasks
      const { data: clientTags, error: clientError } = await supabase
        .from('task_client_tags')
        .select('*')
        .in('task_id', taskData.map(t => t.id))

      if (clientError) throw clientError

      // Then get project tags for these tasks
      const { data: projectTags, error: projectError } = await supabase
        .from('task_project_tags')
        .select('*')
        .in('task_id', taskData.map(t => t.id))

      if (projectError) throw projectError

      // Combine the data
      const tasksWithTags = taskData.map(task => ({
        ...task,
        task_client_tags: clientTags.find(ct => ct.task_id === task.id) || null,
        task_project_tags: projectTags.find(pt => pt.task_id === task.id) || null
      }))

      setTasks(tasksWithTags)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTasks()

      const channel = supabase
        .channel('tasks_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'tasks',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchTasks()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, date])

  const addTask = async (content: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          content,
          completed: false,
          client_tag_id: null,
          project_tag_id: null
        }])
        .select()
        .single()

      if (error) throw error

      setTasks(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Failed to add task')
      throw error
    }
  }

  const updateTask = async (id: string, updates: {
    content?: string
    time?: string
    completed?: boolean
    completed_at?: string | null
    client_tag_id?: string | null
    project_tag_id?: string | null
  }) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // First verify the task exists and belongs to the user
      const { data: existingTask, error: verifyError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (verifyError || !existingTask) {
        throw new Error('Task not found or access denied')
      }

      // If updating tags, ensure project belongs to client
      if (updates.project_tag_id) {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('client_id')
          .eq('id', updates.project_tag_id)
          .single()

        if (projectError || !project) {
          throw new Error('Invalid project selected')
        }

        // If client_tag_id is being updated, ensure it matches the project's client
        if (updates.client_tag_id && updates.client_tag_id !== project.client_id) {
          throw new Error('Project must belong to the selected client')
        }

        // If client_tag_id is not being updated, use the project's client
        if (!updates.client_tag_id) {
          updates.client_tag_id = project.client_id
        }
      }

      // If clearing client, also clear project
      if (updates.client_tag_id === null) {
        updates.project_tag_id = null
      }

      // Update the task
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to update task')

      // Fetch updated tags
      const [{ data: clientTag }, { data: projectTag }] = await Promise.all([
        supabase
          .from('task_client_tags')
          .select('*')
          .eq('task_id', id)
          .maybeSingle(),
        supabase
          .from('task_project_tags')
          .select('*')
          .eq('task_id', id)
          .maybeSingle()
      ])

      const updatedTask = {
        ...data,
        task_client_tags: clientTag || null,
        task_project_tags: projectTag || null
      }

      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ))

      return updatedTask
    } catch (error: any) {
      console.error('Error updating task:', error)
      toast.error(error.message || 'Failed to update task')
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (error: any) {
      console.error('Error deleting task:', error)
      toast.error(error.message || 'Failed to delete task')
      throw error
    }
  }

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask
  }
}