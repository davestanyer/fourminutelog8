"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "./users-view"

export function CurrentUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const loadCurrentUser = () => {
      const storedUsers = localStorage.getItem('users')
      const currentUserId = localStorage.getItem('currentUserId')
      
      if (storedUsers && currentUserId) {
        const users = JSON.parse(storedUsers)
        const user = users.find((u: User) => u.id === currentUserId)
        setCurrentUser(user || null)
      }
    }

    loadCurrentUser()
    window.addEventListener('storage', loadCurrentUser)
    
    return () => {
      window.removeEventListener('storage', loadCurrentUser)
    }
  }, [])

  if (!currentUser) {
    return (
      <Link href="/users">
        <Button variant="outline">
          Select User
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/users">
      <Button variant="ghost" className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          {currentUser.avatar ? (
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
          ) : (
            <AvatarFallback>
              {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <span>{currentUser.name}</span>
      </Button>
    </Link>
  )
}