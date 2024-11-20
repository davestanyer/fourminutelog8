"use client"

import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClientCard } from "@/components/clients/client-card"
import { CreateClientDialog } from "@/components/clients/create-client-dialog"
import { useState } from "react"
import { useClients } from "@/lib/hooks/use-clients"
import { toast } from "sonner"

export function ClientList() {
  const [open, setOpen] = useState(false)
  const { clients, loading, addClient, addProject } = useClients()

  const handleAddClient = async (client: { name: string; emoji: string; color: string; tags: string[] }) => {
    try {
      await addClient(client.name, client.emoji, client.color, client.tags)
      setOpen(false)
      toast.success("Client added successfully")
    } catch (error) {
      console.error('Error adding client:', error)
      toast.error("Failed to add client")
    }
  }

  const handleAddProject = async (clientId: string, project: { name: string; description?: string }) => {
    try {
      await addProject(clientId, project.name, project.description)
      toast.success("Project added successfully")
    } catch (error) {
      console.error('Error adding project:', error)
      toast.error("Failed to add project")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <ClientCard 
            key={client.id} 
            client={client}
            onAddProject={handleAddProject}
          />
        ))}
        {clients.length === 0 && (
          <div className="col-span-full">
            <p className="text-center text-muted-foreground py-8">
              No clients yet. Click &quot;Add Client&quot; to get started.
            </p>
          </div>
        )}
      </div>

      <CreateClientDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleAddClient}
      />
    </div>
  )
}