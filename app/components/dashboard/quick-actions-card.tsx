import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import Link from "next/link"

export function QuickActionsCard() {
  return (
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
  )
}
