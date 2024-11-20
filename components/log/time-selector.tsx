"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface TimeSelectorProps {
  onSelect: (time: string) => void
}

export function TimeSelector({ onSelect }: TimeSelectorProps) {
  const [hours, setHours] = useState("0")
  const [minutes, setMinutes] = useState("0")

  const quickTimes = ["15m", "30m", "1h", "2h", "4h"]

  return (
    <Card className="p-4 absolute z-10 bg-background shadow-lg">
      <div className="space-y-4">
        <div className="flex gap-2">
          {quickTimes.map((time) => (
            <Button
              key={time}
              variant="outline"
              size="sm"
              onClick={() => onSelect(time)}
            >
              {time}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            min="0"
            max="23"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-20"
          />
          <span>h</span>
          <Input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-20"
          />
          <span>m</span>
          <Button
            onClick={() => {
              const time = `${hours}h ${minutes}m`
              onSelect(time.trim())
            }}
          >
            Set
          </Button>
        </div>
      </div>
    </Card>
  )
}