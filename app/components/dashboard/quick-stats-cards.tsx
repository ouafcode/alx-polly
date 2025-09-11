import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import Link from "next/link"
import { Poll } from "@/lib/actions" // Assuming Poll type is available or defined

interface QuickStatsCardsProps {
  userPolls: Poll[];
}

export function QuickStatsCards({ userPolls }: QuickStatsCardsProps) {
  return (
    <>
      {/* Total polls created */}
      <Card>
        <CardHeader>
          <CardTitle>Total Polls</CardTitle>
          <CardDescription>
            Your created polls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{userPolls.length}</p>
        </CardContent>
      </Card>

      {/* Total votes received */}
      <Card>
        <CardHeader>
          <CardTitle>Total Votes</CardTitle>
          <CardDescription>
            Votes on your polls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {userPolls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
          </p>
        </CardContent>
      </Card>
    </>
  )
}
