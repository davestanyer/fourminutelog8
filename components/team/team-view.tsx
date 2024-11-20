"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CreateTeamMemberDialog } from "@/components/team/create-team-member-dialog"

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  avatar?: string
  status: "active" | "offline" | "busy"
}

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const addMember = (member: Omit<TeamMember, "id">) => {
    setMembers([
      ...members,
      {
        ...member,
        id: crypto.randomUUID(),
      },
    ])
    setShowCreateDialog(false)
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Team Members</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : (
                  <AvatarFallback>
                    {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.email}</div>
              </div>
              <Badge variant="secondary">{member.role}</Badge>
            </div>
            <Badge
              variant={
                member.status === "active" ? "default" :
                member.status === "busy" ? "destructive" : "secondary"
              }
            >
              {member.status}
            </Badge>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No team members yet. Click "Add Member" to get started.
          </p>
        )}
      </div>

      <CreateTeamMemberDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={addMember}
      />
    </Card>
  )
}