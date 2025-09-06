import ProtectedRoute from "../components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Link from "next/link"
import { getUserPolls } from "../../lib/actions"
import UserPollsList from "../components/polls/user-polls-list"

/**
 * Dashboard Page Component
 * 
 * The main dashboard page for authenticated users showing their poll statistics
 * and management interface. Displays quick stats (total polls, total votes),
 * quick action buttons, and a list of all polls created by the user.
 * 
 * This is a Server Component that fetches user polls data on the server
 * and renders the dashboard with real-time statistics.
 * 
 * @returns JSX element containing the user dashboard
 */
export default async function DashboardPage() {
  // Fetch user's polls from the server
  const userPolls = await getUserPolls()

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">
            Welcome to your personal dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Quick statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Quick action buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with polls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/create">
                  <Button className="w-full">Create New Poll</Button>
                </Link>
                <Link href="/polls">
                  <Button variant="outline" className="w-full">Browse Polls</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* User's polls management section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Polls</h2>
            </div>
            <UserPollsList initialPolls={userPolls} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
