"use client"

import { Clock, Hash, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LogEntryProps {
  entry: {
    id: string
    content: string
    time?: string
    tags?: string[]
    createdAt: Date
  }
  onDelete: () => void
}

export function LogEntry({ entry, onDelete }: LogEntryProps) {
  return (
    <div className={cn(
      "group flex items-start gap-2 rounded-lg p-2 hover:bg-muted/50",
      "text-sm text-foreground/90"
    )}>
      <span className="mt-1.5">•</span>
      <div className="flex-1 break-words">{entry.content}</div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {entry.time && (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {entry.time}
          </Badge>
        )}
        {entry.tags?.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            <Hash className="h-3 w-3" />
            {tag}
          </Badge>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete entry</span>
        </Button>
      </div>
    </div>
  )
}