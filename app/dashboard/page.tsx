import ProtectedRoute from "../components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Link from "next/link"
import { getUserPolls } from "../../lib/actions"

export default async function DashboardPage() {
  const userPolls = await getUserPolls()

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">
            Welcome to your personal dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with creating and managing polls
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

          {/* My Polls */}
          <Card>
            <CardHeader>
              <CardTitle>My Polls</CardTitle>
              <CardDescription>
                Manage your created polls
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userPolls.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven't created any polls yet.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You have created {userPolls.length} poll{userPolls.length !== 1 ? 's' : ''}.
                  </p>
                  <div className="space-y-2">
                    {userPolls.slice(0, 3).map(poll => (
                      <div key={poll.id} className="text-sm">
                        <p className="font-medium">{poll.question}</p>
                        <p className="text-muted-foreground">
                          {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ))}
                    {userPolls.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        And {userPolls.length - 3} more...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Votes */}
          <Card>
            <CardHeader>
              <CardTitle>My Votes</CardTitle>
              <CardDescription>
                Track your voting activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You haven't voted on any polls yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
