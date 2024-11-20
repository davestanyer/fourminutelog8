"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogEntry } from "@/components/log-entry"
import { QuickEntryForm } from "@/components/quick-entry-form"

export function DailyLog() {
  const [entries, setEntries] = useState<Array<{
    id: string;
    content: string;
    time?: string;
    tags?: string[];
    createdAt: Date;
  }>>([])

  const addEntry = (entry: { content: string; time?: string; tags?: string[] }) => {
    setEntries([
      ...entries,
      {
        id: crypto.randomUUID(),
        ...entry,
        createdAt: new Date(),
      },
    ])
  }

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="tomorrow">Plan Tomorrow</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <Card className="p-4">
            <QuickEntryForm onSubmit={addEntry} />
            <div className="mt-4 space-y-2">
              {entries.map((entry) => (
                <LogEntry
                  key={entry.id}
                  entry={entry}
                  onDelete={() => deleteEntry(entry.id)}
                />
              ))}
              {entries.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Start typing to add your first entry...
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tomorrow" className="mt-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Plan your tasks for tomorrow</p>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Your activity analytics will appear here</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}