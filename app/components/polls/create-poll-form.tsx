"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { createPoll } from "../../../lib/actions"
import { useRouter } from "next/navigation"

interface PollOption {
  id: string
  text: string
}

export default function CreatePollForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    options: [
      { id: "1", text: "" },
      { id: "2", text: "" }
    ]
  })

  const addOption = () => {
    const newId = (formData.options.length + 1).toString()
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "" }]
    }))
  }

  const removeOption = (id: string) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter(option => option.id !== id)
      }))
    }
  }

  const updateOption = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(option =>
        option.id === id ? { ...option, text } : option
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate form data
      if (!formData.question.trim()) {
        throw new Error("Poll question is required")
      }

      if (formData.options.some(option => !option.text.trim())) {
        throw new Error("All poll options must have text")
      }

      // Prepare data for server action
      const pollData = {
        question: formData.question.trim(),
        description: formData.description.trim() || undefined,
        options: formData.options.map(option => ({ text: option.text.trim() }))
      }

      const result = await createPoll(pollData)

      if (result.success) {
        // Redirect to the polls page or show success message
        router.push("/polls")
      } else {
        setError(result.error || "Failed to create poll")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Create a new poll for others to vote on
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="question" className="text-sm font-medium">
              Poll Question *
            </label>
            <Input
              id="question"
              placeholder="What would you like to ask?"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <Input
              id="description"
              placeholder="Add more context to your poll"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Poll Options *</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                Add Option
              </Button>
            </div>
            
            {formData.options.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  required
                />
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Poll..." : "Create Poll"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
