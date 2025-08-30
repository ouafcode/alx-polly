"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface PollCardProps {
  id: string
  question: string
  description?: string
  options: PollOption[]
  totalVotes: number
  isVoted?: boolean
  onVote?: (optionId: string) => void
}

export default function PollCard({ 
  id, 
  question, 
  description, 
  options, 
  totalVotes, 
  isVoted = false,
  onVote 
}: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleVote = () => {
    if (selectedOption && onVote) {
      onVote(selectedOption)
    }
  }

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
        {options.map((option) => (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center space-x-2">
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
              <label htmlFor={option.id} className="flex-1 text-sm font-medium">
                {option.text}
              </label>
              {isVoted && (
                <span className="text-sm text-muted-foreground">
                  {getVotePercentage(option.votes)}%
                </span>
              )}
            </div>
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
        <span className="text-sm text-muted-foreground">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </span>
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
