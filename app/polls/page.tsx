import { getPolls } from "../../lib/actions"
import PollsList from "../components/polls/polls-list"

export default async function PollsPage() {
  const polls = await getPolls()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Polls</h1>
        <p className="text-lg text-gray-600 mt-2">
          Discover and vote on interesting polls from the community
        </p>
      </div>
      <PollsList initialPolls={polls} />
    </div>
  )
}
