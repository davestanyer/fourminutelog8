"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Task } from "./tasks-view"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useClients } from "@/lib/hooks/use-clients"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (task: Omit<Task, "id" | "createdAt">) => void
  type: "recurring" | "one-off"
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

export function CreateTaskDialog({ open, onOpenChange, onSubmit, type }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily")
  const [weekDay, setWeekDay] = useState<number>(1)
  const [monthDay, setMonthDay] = useState<number>(1)
  const [startDate, setStartDate] = useState<Date>()
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  const { clients, loading: clientsLoading } = useClients()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Selected client ID:', selectedClientId)
    console.log('Selected project ID:', selectedProjectId)

    const taskData = {
      title,
      type,
      time: duration || undefined,
      client_id: selectedClientId || undefined,
      project_id: selectedProjectId || undefined,
      ...(type === "recurring" ? {
        schedule: {
          frequency,
          ...(frequency === "weekly" ? { weekDay } : {}),
          ...(frequency === "monthly" ? { monthDay } : {})
        }
      } : {
        startDate: startDate?.toISOString()
      })
    }

    console.log('Submitting task data:', taskData)
    onSubmit(taskData)
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDuration("")
    setFrequency("daily")
    setWeekDay(1)
    setMonthDay(1)
    setStartDate(undefined)
    setSelectedClientId("")
    setSelectedProjectId("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create {type === "recurring" ? "Recurring" : "One-off"} Task
          </DialogTitle>
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
            <Select 
              value={selectedClientId} 
              onValueChange={(value) => {
                console.log('Setting client ID:', value)
                setSelectedClientId(value)
                setSelectedProjectId("")
              }}
            >
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
              <Select 
                value={selectedProjectId} 
                onValueChange={(value) => {
                  console.log('Setting project ID:', value)
                  setSelectedProjectId(value)
                }}
              >
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

          {type === "recurring" ? (
            <>
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
                        <SelectItem key={index} value={index.toString()}>
                          {day}
                        </SelectItem>
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
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}