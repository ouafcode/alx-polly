"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Poll, updatePoll } from "../../../lib/actions"
import { PlusCircle, X } from "lucide-react"

interface EditPollFormProps {
  poll: Poll
}

export default function EditPollForm({ poll }: EditPollFormProps) {
  const router = useRouter()
  const [question, setQuestion] = useState(poll.question)
  const [description, setDescription] = useState(poll.description || "")
  const [options, setOptions] = useState(
    poll.options.map(option => ({ id: option.id, text: option.text }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), text: "" }])
  }

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setError("A poll must have at least 2 options")
      return
    }
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index].text = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    if (!question.trim()) {
      setError("Question is required")
      return
    }

    if (options.length < 2) {
      setError("A poll must have at least 2 options")
      return
    }

    if (options.some(option => !option.text.trim())) {
      setError("All options must have text")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updatePoll(poll.id, {
        question,
        description: description || undefined,
        options
      })

      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(result.error || "Failed to update poll")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for your poll"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-4">
          <Label>Options</Label>
          {options.map((option, index) => (
            <div key={option.id || index} className="flex items-center gap-2">
              <Input
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOption(index)}
                disabled={isSubmitting || options.length <= 2}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            disabled={isSubmitting}
            className="mt-2"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Option
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Poll"}
        </Button>
      </div>
    </form>
  )
}