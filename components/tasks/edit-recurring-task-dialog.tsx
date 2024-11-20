"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Task } from "./tasks-view"
import { useClients } from "@/lib/hooks/use-clients"

interface EditRecurringTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (updates: Partial<Task>) => void
}

const DURATIONS = [
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "3h", label: "3 hours" },
  { value: "4h", label: "4 hours" },
  { value: "8h", label: "8 hours" },
]

export function EditRecurringTaskDialog({
  task,
  open,
  onOpenChange,
  onSubmit,
}: EditRecurringTaskDialogProps) {
  const [title, setTitle] = useState(task.title)
  const [duration, setDuration] = useState(task.time || "")
  const [frequency, setFrequency] = useState(task.schedule?.frequency || "daily")
  const [weekDay, setWeekDay] = useState(task.schedule?.weekDay || 1)
  const [monthDay, setMonthDay] = useState(task.schedule?.monthDay || 1)
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  const { clients, loading: clientsLoading } = useClients()

  // Find the selected client and project based on task.client and task.project
  useEffect(() => {
    if (task.client && clients.length > 0) {
      const client = clients.find(c => c.name === task.client)
      if (client) {
        setSelectedClientId(client.id)
        if (task.project && client.projects) {
          const project = client.projects.find(p => p.name === task.project)
          if (project) {
            setSelectedProjectId(project.id)
          }
        }
      }
    }
  }, [task, clients])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedClient = clients.find(c => c.id === selectedClientId)
    const selectedProject = selectedClient?.projects?.find(p => p.id === selectedProjectId)

    onSubmit({
      title,
      time: duration,
      client: selectedClient?.name,
      project: selectedProject?.name,
      schedule: {
        frequency: frequency as "daily" | "weekly" | "monthly",
        ...(frequency === "weekly" ? { weekDay } : {}),
        ...(frequency === "monthly" ? { monthDay } : {})
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Recurring Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={selectedClientId} onValueChange={(value) => {
              setSelectedClientId(value)
              setSelectedProjectId("") // Reset project when client changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.emoji} {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClientId && (
            <div className="space-y-2">
              <Label>Project (Optional)</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {clients
                    .find(c => c.id === selectedClientId)
                    ?.projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "weekly" && (
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select value={weekDay.toString()} onValueChange={(value) => setWeekDay(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="space-y-2">
              <Label>Day of Month</Label>
              <Select value={monthDay.toString()} onValueChange={(value) => setMonthDay(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}