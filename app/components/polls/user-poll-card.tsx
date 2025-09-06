"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card"
import { Poll, deletePoll } from "../../../lib/actions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

/**
 * Props interface for UserPollCard component
 */
interface UserPollCardProps {
  /** Poll data to display */
  poll: Poll
  /** Optional callback function called after successful deletion */
  onDelete?: () => void
}

/**
 * User Poll Card Component
 * 
 * Displays a poll created by the authenticated user with management options.
 * Shows poll results with vote percentages and provides edit/delete functionality.
 * Includes a confirmation dialog for poll deletion to prevent accidental deletions.
 * 
 * @param props - UserPollCard component props
 * @returns JSX element containing the user poll card
 */
export default function UserPollCard({ poll, onDelete }: UserPollCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  /**
   * Calculate vote percentage for an option
   * 
   * @param votes - Number of votes for the option
   * @returns Percentage of total votes (rounded to nearest integer)
   */
  const getVotePercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0
    return Math.round((votes / poll.totalVotes) * 100)
  }

  /**
   * Handle poll deletion
   * 
   * Calls the deletePoll server action and handles the response.
   * Shows error messages if deletion fails, or calls onDelete callback on success.
   */
  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    
    try {
      const result = await deletePoll(poll.id)
      
      if (result.success) {
        setShowDeleteDialog(false)
        if (onDelete) onDelete()
      } else {
        setDeleteError(result.error || "Failed to delete poll")
      }
    } catch (error) {
      setDeleteError("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{poll.question}</CardTitle>
            {poll.description && (
              <CardDescription>{poll.description}</CardDescription>
            )}
          </div>
          {/* Action buttons for poll management */}
          <div className="flex space-x-2">
            {/* Edit poll button */}
            <Link href={`/edit/${poll.id}`}>
              <Button size="sm" variant="outline">
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            </Link>
            {/* Delete poll button with confirmation dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Poll</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this poll? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                {/* Error message display in dialog */}
                {deleteError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                    {deleteError}
                  </div>
                )}
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display poll results with vote percentages */}
        {poll.options.map((option) => (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{option.text}</span>
              <span className="text-sm text-muted-foreground">
                {getVotePercentage(option.votes)}% ({option.votes} votes)
              </span>
            </div>
            {/* Vote percentage bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getVotePercentage(option.votes)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {/* Total vote count */}
        <span className="text-sm text-muted-foreground">
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
        </span>
        {/* Creation date */}
        <span className="text-sm text-muted-foreground">
          Created: {new Date(poll.created_at).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  )
}