import { notFound } from "next/navigation"
import ProtectedRoute from "../../components/auth/protected-route"
import EditPollForm from "../../components/polls/edit-poll-form"
import { getUserPolls } from "../../../lib/actions"

interface EditPollPageProps {
  params: {
    id: string
  }
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const { id } = params
  const userPolls = await getUserPolls()
  const poll = userPolls.find(p => p.id === id)
  
  if (!poll) {
    notFound()
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Poll</h1>
          <p className="text-lg text-gray-600 mt-2">
            Update your poll details and options
          </p>
        </div>
        <EditPollForm poll={poll} />
      </div>
    </ProtectedRoute>
  )
}