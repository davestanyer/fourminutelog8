"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'

interface TeamMember {
  id: string
  member_id: string
  role: 'admin' | 'member' | 'viewer'
  created_at: string
  user: {
    email: string
    name: string
    avatar_url: string | null
  }
}

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user) {
        setMembers([])
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            *,
            user:member_id (
              email,
              name,
              avatar_url
            )
          `)
          .eq('team_owner_id', user.id)

        if (error) throw error
        setMembers(data || [])
      } catch (error) {
        console.error('Error fetching team members:', error)
        toast.error('Failed to load team members')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTeamMembers()

      const channel = supabase
        .channel('team_members_changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'team_members',
            filter: `team_owner_id=eq.${user.id}`
          },
          () => {
            fetchTeamMembers()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const addMember = async (email: string, role: 'admin' | 'member' | 'viewer' = 'member') => {
    if (!user) {
      throw new Error('Not authenticated')
    }

    try {
      const { data, error } = await supabase
        .rpc('add_team_member', {
          member_email: email,
          member_role: role
        })

      if (error) throw error

      if (!data.success) {
        toast.error(data.message)
        return null
      }

      toast.success('Team member added successfully')
      return data.data
    } catch (error) {
      console.error('Error adding team member:', error)
      toast.error('Failed to add team member')
      throw error
    }
  }

  const removeMember = async (memberId: string) => {
    if (!user) {
      throw new Error('Not authenticated')
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_owner_id', user.id)
        .eq('member_id', memberId)

      if (error) throw error
      toast.success('Team member removed')
    } catch (error) {
      console.error('Error removing team member:', error)
      toast.error('Failed to remove team member')
      throw error
    }
  }

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member' | 'viewer') => {
    if (!user) {
      throw new Error('Not authenticated')
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_owner_id', user.id)
        .eq('member_id', memberId)

      if (error) throw error
      toast.success('Team member role updated')
    } catch (error) {
      console.error('Error updating team member role:', error)
      toast.error('Failed to update team member role')
      throw error
    }
  }

  return {
    members,
    loading,
    addMember,
    removeMember,
    updateMemberRole
  }
}