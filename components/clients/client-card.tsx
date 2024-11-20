"use client"

import { useState } from "react"
import { PlusCircle, FolderOpen } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateProjectDialog } from "@/components/clients/create-project-dialog"
import { Database } from "@/lib/database.types"

type Client = Database['public']['Tables']['clients']['Row'] & {
  projects?: Database['public']['Tables']['projects']['Row'][]
}

interface ClientCardProps {
  client: Client
  onAddProject: (clientId: string, project: { name: string; description?: string }) => void
}

export function ClientCard({ client, onAddProject }: ClientCardProps) {
  const [showProjectDialog, setShowProjectDialog] = useState(false)

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{client.emoji}</span>
              <h3 className="font-semibold tracking-tight">{client.name}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {client.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  style={{ backgroundColor: client.color + "20" }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Projects</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setShowProjectDialog(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
          <div className="space-y-1">
            {client.projects?.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent group"
              >
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{project.name}</span>
                {project.description && (
                  <span className="text-xs text-muted-foreground hidden group-hover:inline">
                    - {project.description}
                  </span>
                )}
              </div>
            ))}
            {(!client.projects || client.projects.length === 0) && (
              <p className="text-sm text-muted-foreground py-2">
                No projects yet
              </p>
            )}
          </div>
        </div>
      </div>

      <CreateProjectDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onSubmit={(project) => {
          onAddProject(client.id, project)
          setShowProjectDialog(false)
        }}
      />
    </Card>
  )
}