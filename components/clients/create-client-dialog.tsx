"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const EMOJI_OPTIONS = ["💼", "🏢", "🏗️", "🏭", "🏪", "🏬", "🏦", "🏫", "🏨", "🏛️", "🏤", "🎯", "💫", "⭐", "🌟", "✨", "💡", "🔥", "⚡", "🌈"]

interface CreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (client: { name: string; emoji: string; color: string; tags: string[] }) => void
}

export function CreateClientDialog({ open, onOpenChange, onSubmit }: CreateClientDialogProps) {
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("💼")
  const [color, setColor] = useState("#6366f1")
  const [tags, setTags] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      emoji,
      color,
      tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
    })
    setName("")
    setEmoji("💼")
    setColor("#6366f1")
    setTags("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Select Emoji</Label>
            <ScrollArea className="h-20 w-full rounded-md border">
              <div className="p-4 grid grid-cols-8 gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <Button
                    key={e}
                    type="button"
                    variant={emoji === e ? "default" : "ghost"}
                    className="h-8 w-8 p-0"
                    onClick={() => setEmoji(e)}
                  >
                    {e}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Brand Color</Label>
            <Input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., active, priority, ongoing"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Client</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}