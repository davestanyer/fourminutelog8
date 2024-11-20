"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'

type RecurringTask = Database['public']['Tables']['recurring_tasks']['Row'] & {
  clients?: {
    id: string
    name: string
    emoji: string
  } | null
  projects?: {
    id: string
    name: string
  } | null
}

export function useRecurringTasks() {
  const [tasks, setTasks] = useState<RecurringTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  const fetchTasks = async () => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          *,
          clients (
            id,
            name,
            emoji
          ),
          projects!recurring_tasks_project_id_fkey (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (e) {
      const err = e as Error
      setError(err)
      console.error('Error fetching tasks:', err)
      toast.error('Failed to load recurring tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTasks()

      const channel = supabase
        .channel('recurring_tasks_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'recurring_tasks',
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
    } else {
      setTasks([])
      setLoading(false)
    }
  }, [user])

  const addTask = async (
    title: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    options?: {
      time?: string
      client_id?: string
      project_id?: string
      weekDay?: number
      monthDay?: number
    }
  ) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Create the task data object with all fields
      const taskData = {
        user_id: user.id,
        title,
        frequency,
        time: options?.time || null,
        client_id: options?.client_id || null,
        project_id: options?.project_id || null,
        week_day: options?.weekDay || null,
        month_day: options?.monthDay || null
      }

      console.log('Creating task with data:', JSON.stringify(taskData, null, 2))

      // Validate client and project relationship if both are provided
      if (taskData.client_id && taskData.project_id) {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('client_id')
          .eq('id', taskData.project_id)
          .single()

        if (projectError) throw projectError

        if (projectData.client_id !== taskData.client_id) {
          throw new Error('Project does not belong to the selected client')
        }
      }

      // Insert the task
      const { data, error } = await supabase
        .from('recurring_tasks')
        .insert([taskData])
        .select(`
          *,
          clients (
            id,
            name,
            emoji
          ),
          projects!recurring_tasks_project_id_fkey (
            id,
            name
          )
        `)
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Task created successfully:', JSON.stringify(data, null, 2))
      setTasks(prev => [data, ...prev])
      toast.success('Recurring task created')
      return data
    } catch (e) {
      const err = e as Error
      console.error('Error adding task:', err)
      toast.error('Failed to create recurring task')
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<Omit<RecurringTask, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // Create the update data object
      const updateData = {
        title: updates.title,
        time: updates.time || null,
        client_id: updates.client_id || null,
        project_id: updates.project_id || null,
        frequency: updates.frequency,
        week_day: updates.week_day || null,
        month_day: updates.month_day || null
      }

      console.log('Updating task with data:', JSON.stringify(updateData, null, 2))

      // Validate client and project relationship if both are provided
      if (updateData.client_id && updateData.project_id) {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('client_id')
          .eq('id', updateData.project_id)
          .single()

        if (projectError) throw projectError

        if (projectData.client_id !== updateData.client_id) {
          throw new Error('Project does not belong to the selected client')
        }
      }

      // Update the task
      const { data, error } = await supabase
        .from('recurring_tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          clients (
            id,
            name,
            emoji
          ),
          projects!recurring_tasks_project_id_fkey (
            id,
            name
          )
        `)
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Task updated successfully:', JSON.stringify(data, null, 2))
      setTasks(prev => prev.map(task => task.id === id ? data : task))
      toast.success('Recurring task updated')
      return data
    } catch (e) {
      const err = e as Error
      console.error('Error updating task:', err)
      toast.error('Failed to update recurring task')
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== id))
      toast.success('Recurring task deleted')
    } catch (e) {
      const err = e as Error
      console.error('Error deleting task:', err)
      toast.error('Failed to delete recurring task')
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask
  }
}