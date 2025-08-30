"use client"

import { useState, useEffect } from "react"
import PollCard from "./poll-card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Poll } from "../../../lib/actions"

interface PollsListProps {
  initialPolls: Poll[]
}

export default function PollsList({ initialPolls }: PollsListProps) {
  const [polls, setPolls] = useState<Poll[]>(initialPolls)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "recent" | "popular">("all")
  const [isLoading, setIsLoading] = useState(false)

  // Update polls when initialPolls changes (e.g., after creating a new poll)
  useEffect(() => {
    setPolls(initialPolls)
  }, [initialPolls])

  const handleVote = async (pollId: string, optionId: string) => {
    // TODO: Implement actual voting functionality with server action
    // For now, just update the local state
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

  const getFilteredPolls = () => {
    let filtered = polls

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(poll =>
        poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    switch (filter) {
      case "recent":
        filtered = filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case "popular":
        filtered = filtered.sort((a, b) => b.totalVotes - a.totalVotes)
        break
      default:
        // "all" - already sorted by creation date from server
        break
    }

    return filtered
  }

  const filteredPolls = getFilteredPolls()

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
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading polls...</p>
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm ? (
              <p className="text-muted-foreground">No polls found matching your search.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">No polls available yet.</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to create a poll!
                </p>
              </div>
            )}
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
