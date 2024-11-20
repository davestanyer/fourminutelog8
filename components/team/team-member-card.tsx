"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { EditTeamMemberDialog } from "@/components/team/edit-team-member-dialog"
import { TeamMember } from "./team-view"
import { format } from "date-fns"

interface TeamMemberCardProps {
  member: TeamMember
  onUpdate: (updates: Partial<TeamMember>) => void
  onDelete: () => void
}

export function TeamMemberCard({ member, onUpdate, onDelete }: TeamMemberCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              {member.avatar ? (
                <AvatarImage src={member.avatar} alt={member.name} />
              ) : (
                <AvatarFallback>
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Badge variant="secondary">{member.role}</Badge>
          {member.department && (
            <Badge variant="outline">{member.department}</Badge>
          )}
          <p className="text-sm text-muted-foreground">
            Joined {format(new Date(member.joinedAt), 'PP')}
          </p>
        </div>
      </div>

      <EditTeamMemberDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        member={member}
        onSubmit={onUpdate}
      />
    </Card>
  )
}