"use client"

import { useState, KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface QuickEntryFormProps {
  onSubmit: (entry: { content: string; time?: string; tags?: string[] }) => void
}

export function QuickEntryForm({ onSubmit }: QuickEntryFormProps) {
  const [content, setContent] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && content.trim()) {
      e.preventDefault()
      
      // Parse time and tags from the content
      const timeMatch = content.match(/\s+(\d+(?:\.\d+)?h|\d+m)\s*$/)
      const tagsMatch = content.match(/\s+#(\w+)/g)
      
      let finalContent = content
      let time: string | undefined
      let tags: string[] | undefined

      // Extract time if present
      if (timeMatch) {
        time = timeMatch[1]
        finalContent = finalContent.replace(timeMatch[0], "")
      }

      // Extract tags if present
      if (tagsMatch) {
        tags = tagsMatch.map(tag => tag.trim().substring(1))
        finalContent = finalContent.replace(/\s+#\w+/g, "")
      }

      onSubmit({
        content: finalContent.trim(),
        time,
        tags,
      })
      setContent("")
    }
  }

  return (
    <div className="relative">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What did you work on? (Press Enter to save, add #tags or time like 30m, 1.5h)"
        className={cn(
          "w-full pr-20 focus-visible:ring-1",
          "placeholder:text-muted-foreground/60",
          "text-base leading-relaxed"
        )}
      />
    </div>
  )
}