"use client"

import { useState } from "react"
import { Poll } from "../../../lib/actions"
import UserPollCard from "./user-poll-card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

/**
 * Props interface for UserPollsList component
 */
interface UserPollsListProps {
  /** Initial array of polls created by the user */
  initialPolls: Poll[]
}

/**
 * User Polls List Component
 * 
 * Displays a list of polls created by the authenticated user.
 * Provides search functionality to filter polls by question or description.
 * Includes a "Create New Poll" button and handles poll deletion updates.
 * Shows appropriate empty states when no polls exist or match the search.
 * 
 * @param props - UserPollsList component props
 * @returns JSX element containing the user polls list
 */
export default function UserPollsList({ initialPolls }: UserPollsListProps) {
  const [polls, setPolls] = useState<Poll[]>(initialPolls)
  const [searchTerm, setSearchTerm] = useState("")

  /**
   * Handle poll deletion from the list
   * 
   * Removes the deleted poll from the local state to update the UI
   * without requiring a page refresh.
   * 
   * @param deletedPollId - ID of the poll that was deleted
   */
  const handlePollDelete = (deletedPollId: string) => {
    setPolls(prev => prev.filter(poll => poll.id !== deletedPollId))
  }

  /**
   * Filter polls based on search term
   * 
   * Searches through poll questions and descriptions (case-insensitive)
   * to find polls matching the current search term.
   */
  const filteredPolls = polls.filter(poll => 
    poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (poll.description && poll.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Search and create poll section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search your polls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Link href="/create">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" /> Create New Poll
          </Button>
        </Link>
      </div>

      {/* Polls list or empty state */}
      {filteredPolls.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            // No search results found
            <p className="text-muted-foreground">No polls found matching your search.</p>
          ) : (
            // No polls created yet
            <div className="space-y-4">
              <p className="text-muted-foreground">You haven&apos;t created any polls yet.</p>
              <Link href="/create">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" /> Create Your First Poll
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        // Render list of user polls
        <div className="space-y-6">
          {filteredPolls.map(poll => (
            <UserPollCard 
              key={poll.id} 
              poll={poll} 
              onDelete={() => handlePollDelete(poll.id)} 
            />
          ))}
        </div>
      )}
    </div>
  )
}