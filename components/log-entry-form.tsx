"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  duration: z.string().regex(/^\d+$/, {
    message: "Duration must be a number in minutes.",
  }),
  description: z.string().optional(),
  issues: z.string().optional(),
  solution: z.string().optional(),
})

interface LogEntryFormProps {
  onComplete: () => void
}

export function LogEntryForm({ onComplete }: LogEntryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      duration: "",
      description: "",
      issues: "",
      solution: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.success("Entry saved successfully")
    onComplete()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What did you work on?</FormLabel>
              <FormControl>
                <Input placeholder="Task or activity name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Details</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe what you did" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issues"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What broke?</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe any issues encountered" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="solution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How did you fix it?</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your solution" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onComplete}>Cancel</Button>
          <Button type="submit">Save Entry</Button>
        </div>
      </form>
    </Form>
  )
}