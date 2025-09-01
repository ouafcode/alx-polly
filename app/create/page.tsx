import CreatePollForm from "../components/polls/create-poll-form"
import ProtectedRoute from "../components/auth/protected-route"

export default function CreatePollPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Poll</h1>
          <p className="text-lg text-gray-600 mt-2">
            Share your question with the community and gather opinions
          </p>
        </div>
        <CreatePollForm />
      </div>
    </ProtectedRoute>
  )
}
