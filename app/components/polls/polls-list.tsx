"use client"

import { useState } from "react"
import PollCard from "./poll-card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

// Mock data for demonstration
const mockPolls = [
  {
    id: "1",
    question: "What's your favorite programming language?",
    description: "Choose the language you enjoy working with the most",
    options: [
      { id: "1-1", text: "JavaScript/TypeScript", votes: 45 },
      { id: "1-2", text: "Python", votes: 38 },
      { id: "1-3", text: "Java", votes: 22 },
      { id: "1-4", text: "C++", votes: 15 }
    ],
    totalVotes: 120
  },
  {
    id: "2",
    question: "Which framework do you prefer for web development?",
    description: "Select your go-to framework for building web applications",
    options: [
      { id: "2-1", text: "React", votes: 52 },
      { id: "2-2", text: "Vue.js", votes: 28 },
      { id: "2-3", text: "Angular", votes: 20 },
      { id: "2-4", text: "Svelte", votes: 12 }
    ],
    totalVotes: 112
  }
]

export default function PollsList() {
  const [polls, setPolls] = useState(mockPolls)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "recent" | "popular">("all")

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          options: poll.options.map(option => 
            option.id === optionId 
              ? { ...option, votes: option.votes + 1 }
              : option
          ),
          totalVotes: poll.totalVotes + 1
        }
      }
      return poll
    }))
  }

  const filteredPolls = polls.filter(poll =>
    poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search polls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("recent")}
          >
            Recent
          </Button>
          <Button
            variant={filter === "popular" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("popular")}
          >
            Popular
          </Button>
        </div>
      </div>

      {/* Polls List */}
      <div className="space-y-6">
        {filteredPolls.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No polls found matching your search.</p>
          </div>
        ) : (
          filteredPolls.map(poll => (
            <PollCard
              key={poll.id}
              {...poll}
              onVote={(optionId) => handleVote(poll.id, optionId)}
            />
          ))
        )}
      </div>
    </div>
  )
}
