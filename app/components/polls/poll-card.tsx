"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card"

/**
 * Interface for poll option data
 */
interface PollOption {
  /** Unique identifier for the option */
  id: string
  /** Text content of the option */
  text: string
  /** Number of votes this option has received */
  votes: number
}

/**
 * Props interface for PollCard component
 */
interface PollCardProps {
  /** Unique identifier for the poll */
  id: string
  /** The poll question text */
  question: string
  /** Optional description providing additional context */
  description?: string
  /** Array of poll options with vote counts */
  options: PollOption[]
  /** Total number of votes across all options */
  totalVotes: number
  /** Whether the user has already voted on this poll */
  isVoted?: boolean
  /** Callback function called when user submits a vote */
  onVote?: (optionId: string) => void
}

/**
 * Poll Card Component
 * 
 * Displays a poll with its question, description, options, and voting interface.
 * Shows vote results with percentage bars when the user has voted.
 * Handles vote selection and submission through the onVote callback.
 * 
 * @param props - PollCard component props
 * @returns JSX element containing the poll card
 */
export default function PollCard({ 
  id, 
  question, 
  description, 
  options, 
  totalVotes, 
  isVoted = false,
  onVote 
}: PollCardProps) {
  // State for tracking which option the user has selected
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  /**
   * Handle vote submission
   * 
   * Calls the onVote callback with the selected option ID if a valid
   * option is selected and the callback is provided.
   */
  const handleVote = () => {
    if (selectedOption && onVote) {
      onVote(selectedOption)
    }
  }

  /**
   * Calculate vote percentage for an option
   * 
   * @param votes - Number of votes for the option
   * @returns Percentage of total votes (rounded to nearest integer)
   */
  const getVotePercentage = (votes: number) => {
    if (totalVotes === 0) return 0
    return Math.round((votes / totalVotes) * 100)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{question}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Render each poll option */}
        {options.map((option) => (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              {/* Radio button for option selection */}
              <input
                type="radio"
                id={option.id}
                name={`poll-${id}`}
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => setSelectedOption(e.target.value)}
                disabled={isVoted}
                className="h-4 w-4"
              />
              {/* Option text label */}
              <label htmlFor={option.id} className="flex-1 text-sm font-medium">
                {option.text}
              </label>
              {/* Vote percentage display (shown after voting) */}
              {isVoted && (
                <span className="text-sm text-muted-foreground">
                  {getVotePercentage(option.votes)}%
                </span>
              )}
            </div>
            {/* Vote percentage bar (shown after voting) */}
            {isVoted && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getVotePercentage(option.votes)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {/* Total vote count */}
        <span className="text-sm text-muted-foreground">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </span>
        {/* Vote button (hidden after voting) */}
        {!isVoted && (
          <Button 
            onClick={handleVote} 
            disabled={!selectedOption}
            size="sm"
          >
            Vote
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
