"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

interface PollOption {
  id: string
  text: string
}

export default function CreatePollForm() {
  console.log("CreatePollForm component rendering") // Debug log
  
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    options: [
      { id: "1", text: "" },
      { id: "2", text: "" }
    ]
  })

  const addOption = () => {
    console.log("Add option clicked") // Debug log
    const newId = (formData.options.length + 1).toString()
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: "" }]
    }))
  }

  const removeOption = (id: string) => {
    console.log("Remove option clicked for id:", id) // Debug log
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData) // Debug log
    // TODO: Implement poll creation logic
    console.log("Creating poll:", formData)
  }

  const testClick = () => {
    console.log("Test button clicked!")
    alert("Test button is working!")
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
        {/* Test button to debug */}
        <Button onClick={testClick} className="mb-4">
          Test Button - Click Me!
        </Button>
        
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

          <Button type="submit" className="w-full">
            Create Poll
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
