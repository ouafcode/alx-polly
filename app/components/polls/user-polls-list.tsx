"use client"

import { useState } from "react"
import { Poll } from "../../../lib/actions"
import UserPollCard from "./user-poll-card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

interface UserPollsListProps {
  initialPolls: Poll[]
}

export default function UserPollsList({ initialPolls }: UserPollsListProps) {
  const [polls, setPolls] = useState<Poll[]>(initialPolls)
  const [searchTerm, setSearchTerm] = useState("")

  const handlePollDelete = (deletedPollId: string) => {
    setPolls(prev => prev.filter(poll => poll.id !== deletedPollId))
  }

  const filteredPolls = polls.filter(poll => 
    poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (poll.description && poll.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
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

      {filteredPolls.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <p className="text-muted-foreground">No polls found matching your search.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">You haven't created any polls yet.</p>
              <Link href="/create">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" /> Create Your First Poll
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
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