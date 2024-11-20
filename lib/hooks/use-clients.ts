"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'

type Client = Database['public']['Tables']['clients']['Row'] & {
  projects?: Database['public']['Tables']['projects']['Row'][]
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) {
        setClients([])
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .select(`
            *,
            projects (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setClients(data || [])
      } catch (e) {
        setError(e as Error)
        console.error('Error fetching clients:', e)
        toast.error('Failed to load clients')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchClients()

      // Subscribe to changes
      const clientsChannel = supabase
        .channel('clients_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'clients',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchClients()
          }
        )
        .subscribe()

      const projectsChannel = supabase
        .channel('projects_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'projects' 
          }, 
          () => {
            fetchClients()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(clientsChannel)
        supabase.removeChannel(projectsChannel)
      }
    } else {
      setClients([])
      setLoading(false)
    }
  }, [user])

  const addClient = async (
    name: string,
    emoji: string,
    color: string,
    tags?: string[]
  ) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            user_id: user.id,
            name,
            emoji,
            color,
            tags: tags || []
          }
        ])
        .select(`
          *,
          projects (*)
        `)
        .single()

      if (error) throw error

      setClients(prev => [data, ...prev])
      return data
    } catch (e) {
      console.error('Error adding client:', e)
      throw e
    }
  }

  const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          projects (*)
        `)
        .single()

      if (error) throw error

      setClients(prev => prev.map(client => client.id === id ? data : client))
      return data
    } catch (e) {
      console.error('Error updating client:', e)
      throw e
    }
  }

  const deleteClient = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setClients(prev => prev.filter(client => client.id !== id))
    } catch (e) {
      console.error('Error deleting client:', e)
      throw e
    }
  }

  const addProject = async (
    clientId: string,
    name: string,
    description?: string
  ) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      // First verify that the client belongs to the user
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select()
        .eq('id', clientId)
        .eq('user_id', user.id)
        .single()

      if (clientError) throw clientError
      if (!clientData) throw new Error('Client not found')

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            client_id: clientId,
            name,
            description
          }
        ])
        .select()
        .single()

      if (error) throw error

      setClients(prev => prev.map(client => {
        if (client.id === clientId) {
          const projects = Array.isArray(client.projects) ? client.projects : []
          return { ...client, projects: [...projects, data] }
        }
        return client
      }))

      return data
    } catch (e) {
      console.error('Error adding project:', e)
      throw e
    }
  }

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    addProject
  }
}