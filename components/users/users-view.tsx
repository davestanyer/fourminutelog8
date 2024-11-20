"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Check } from "lucide-react"
import Link from "next/link"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatar?: string
  createdAt: string
}

export function UsersView() {
  const [users, setUsers] = useState<User[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>()

  useEffect(() => {
    const storedUsers = localStorage.getItem('users')
    const storedCurrentUserId = localStorage.getItem('currentUserId')
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    }
    if (storedCurrentUserId) {
      setCurrentUserId(storedCurrentUserId)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('currentUserId', currentUserId)
    }
  }, [currentUserId])

  const addUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setUsers([...users, newUser])
    setShowCreateDialog(false)

    // If this is the first user, set them as current
    if (users.length === 0) {
      setCurrentUserId(newUser.id)
    }
  }

  const switchUser = (userId: string) => {
    setCurrentUserId(userId)
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Users</h2>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
              <div className="flex items-center gap-4">
                {currentUserId === user.id ? (
                  <Badge variant="default">
                    <Check className="h-4 w-4 mr-1" />
                    Current User
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchUser(user.id)}
                  >
                    Switch to User
                  </Button>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No users yet. Click &quot;Add User&quot; to get started.
            </p>
          )}
        </div>
      </Card>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={addUser}
      />
    </div>
  )
}