"use server"

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createUserProfile(userId: string, email: string, name: string) {
  const supabaseAdmin = createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey
  )

  const { error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        id: userId,
        email,
        name,
        role: 'user'
      }
    ])
    .single()

  if (error) {
    console.error("Profile creation error:", error)
    throw new Error("Failed to create user profile")
  }

  return { success: true }
}