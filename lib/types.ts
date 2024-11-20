export interface Task {
  id: string
  user_id: string
  content: string
  completed: boolean
  completed_at: string | null
  time: string | null
  tags: string[]
  created_at: string
}

export interface RecurringTask {
  id: string
  user_id: string
  title: string
  time: string | null
  tags: string[]
  frequency: 'daily' | 'weekly' | 'monthly'
  week_day: number | null
  month_day: number | null
  created_at: string
}

export interface TodoTask {
  id: string
  content: string
  completed: boolean
  time?: string
  tags?: string[]
}

export interface CompletedTask {
  id: string
  content: string
  time?: string
  tags?: string[]
  completedAt: string
}