"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { createPoll } from "../../../lib/actions"
import { useRouter } from "next/navigation"

/**
 * Interface for poll option in the form
 */
interface PollOption {
  /** Unique identifier for the option */
  id: string
  /** Text content of the option */
  text: string
}

/**
 * Create Poll Form Component
 * 
 * Provides a form interface for authenticated users to create new polls.
 * Handles dynamic option management (add/remove options), form validation,
 * and submission to the server. Redirects to polls page on successful creation.
 * 
 * @returns JSX element containing the poll creation form
 */
export default function CreatePollForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state with initial two empty options
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    options: [
      { id: "1", text: "" },
      { id: "2", text: "" }
    ]
  })

  /**
   * Add a new option to the poll
   * 
   * Creates a new empty option with a unique ID and adds it to the options array.
   */
  const addOption = () => {
    const newId = (formData.options.length + 1).toString()
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "" }]
    }))
  }

  /**
   * Remove an option from the poll
   * 
   * Removes the specified option from the options array.
   * Ensures at least 2 options remain (minimum required for a poll).
   * 
   * @param id - ID of the option to remove
   */
  const removeOption = (id: string) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter(option => option.id !== id)
      }))
    }
  }

  /**
   * Update the text content of a specific option
   * 
   * @param id - ID of the option to update
   * @param text - New text content for the option
   */
  const updateOption = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(option =>
        option.id === id ? { ...option, text } : option
      )
    }))
  }

  /**
   * Handle form submission for poll creation
   * 
   * Validates form data, prepares it for the server action,
   * and handles the creation process with appropriate error handling.
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Client-side validation
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

      // Submit poll creation to server
      const result = await createPoll(pollData)

      if (result.success) {
        // Redirect to polls page on successful creation
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
        {/* Error message display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Poll question input */}
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

          {/* Poll description input */}
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

          {/* Dynamic poll options section */}
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
            
            {/* Render each poll option input */}
            {formData.options.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  required
                />
                {/* Remove button (only shown if more than 2 options) */}
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

          {/* Submit button */}
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
