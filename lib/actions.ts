"use server"

import { createServerClient } from "./supabase"
import { revalidatePath } from "next/cache"

// Shared result types
type ActionError = { success: false; error: string }
type ActionSuccess<T extends object = {}> = { success: true } & T
export type ActionResult<T extends object = {}> = ActionSuccess<T> | ActionError

export interface CreatePollData {
  question: string
  description?: string
  options: { text: string }[]
}

export interface Poll {
  id: string
  question: string
  description?: string
  user_id: string
  created_at: string
  options: {
    id: string
    text: string
    votes: number
  }[]
  totalVotes: number
}

// Centralized client creation
async function getSupabase() {
  return createServerClient()
}

// Abstracted auth
async function getAuthenticatedUserId(): Promise<ActionResult<{ userId: string }>> {
  const supabase = await getSupabase()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return { success: false, error: "User not authenticated" }
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: "User not authenticated" }
  }

  return { success: true, userId: user.id }
}

// Validation
function validateCreatePollInput(data: CreatePollData): string | null {
  if (!data || typeof data.question !== "string" || data.question.trim().length === 0) {
    return "Question is required"
  }
  if (!Array.isArray(data.options) || data.options.length < 2) {
    return "At least two options are required"
  }
  const texts = data.options.map(o => (o.text || "").trim())
  if (texts.some(t => t.length === 0)) {
    return "Option text cannot be empty"
  }
  const unique = new Set(texts)
  if (unique.size !== texts.length) {
    return "Option texts must be unique"
  }
  return null
}

function validateUpdatePollInput(data: { question: string; description?: string; options: { id?: string; text: string }[] }): string | null {
  if (!data || typeof data.question !== "string" || data.question.trim().length === 0) {
    return "Question is required"
  }
  if (!Array.isArray(data.options) || data.options.length === 0) {
    return "At least one option is required"
  }
  const texts = data.options.map(o => (o.text || "").trim())
  if (texts.some(t => t.length === 0)) {
    return "Option text cannot be empty"
  }
  return null
}

// Modularized DB helpers
type PollRow = {
  id: string
  question: string
  description?: string | null
  user_id: string
  created_at: string
  poll_options?: { id: string; text: string; votes: number }[]
}

function mapPollRowToPoll(row: PollRow): Poll {
  const options = row.poll_options || []
  const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)
  return {
    id: row.id,
    question: row.question,
    description: row.description ?? undefined,
    user_id: row.user_id,
    created_at: row.created_at,
    options: options.map(o => ({ id: o.id, text: o.text, votes: o.votes })),
    totalVotes,
  }
}

export async function createPoll(data: CreatePollData) {
  try {
    const supabase = await getSupabase()
    const auth = await getAuthenticatedUserId()
    if (!auth.success) {
      return auth
    }
    const userId = auth.userId

    const validationError = validateCreatePollInput(data)
    if (validationError) {
      return { success: false, error: validationError }
    }

    // Create the poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        question: data.question,
        description: data.description || null,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (pollError) {
      console.error("Error creating poll:", pollError)
      throw new Error("Failed to create poll")
    }

    // Create the poll options
    const optionsData = data.options.map(option => ({
      poll_id: poll.id,
      text: option.text,
      votes: 0
    }))

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(optionsData)

    if (optionsError) {
      console.error("Error creating poll options:", optionsError)
      // Clean up the poll if options creation fails
      await supabase.from("polls").delete().eq("id", poll.id)
      throw new Error("Failed to create poll options")
    }

    // Revalidate the polls page to show the new poll
    revalidatePath("/polls")
    revalidatePath("/dashboard")

    return { success: true, pollId: poll.id }
  } catch (error) {
    console.error("Error in createPoll:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

export async function getPolls(): Promise<Poll[]> {
  try {
    const supabase = await getSupabase()
    
    // Fetch polls with their options
    const { data: polls, error: pollsError } = await supabase
      .from("polls")
      .select(`
        id,
        question,
        description,
        user_id,
        created_at,
        poll_options (
          id,
          text,
          votes
        )
      `)
      .order("created_at", { ascending: false })

    if (pollsError) {
      console.error("Error fetching polls:", pollsError)
      return []
    }

    // Transform the data to match the expected format
    const transformedPolls: Poll[] = polls.map((p: PollRow) => mapPollRowToPoll(p))

    return transformedPolls
  } catch (error) {
    console.error("Error in getPolls:", error)
    return []
  }
}

export async function getUserPolls(): Promise<Poll[]> {
  try {
    const supabase = await getSupabase()
    const auth = await getAuthenticatedUserId()
    if (!auth.success) {
      return []
    }

    // Fetch polls created by the current user
    const { data: polls, error: pollsError } = await supabase
      .from("polls")
      .select(`
        id,
        question,
        description,
        user_id,
        created_at,
        poll_options (
          id,
          text,
          votes
        )
      `)
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })

    if (pollsError) {
      console.error("Error fetching user polls:", pollsError)
      return []
    }

    // Transform the data to match the expected format
    const transformedPolls: Poll[] = polls.map((p: PollRow) => mapPollRowToPoll(p))

    return transformedPolls
  } catch (error) {
    console.error("Error in getUserPolls:", error)
    return []
  }
}

export async function deletePoll(pollId: string) {
  try {
    const supabase = await getSupabase()
    const auth = await getAuthenticatedUserId()
    if (!auth.success) {
      throw new Error(auth.error)
    }

    // Verify the poll belongs to the current user
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("user_id")
      .eq("id", pollId)
      .single()

    if (pollError || !poll) {
      throw new Error("Poll not found")
    }

    if (poll.user_id !== auth.userId) {
      throw new Error("Not authorized to delete this poll")
    }

    // Delete poll options first (due to foreign key constraint)
    const { error: optionsError } = await supabase
      .from("poll_options")
      .delete()
      .eq("poll_id", pollId)

    if (optionsError) {
      throw new Error("Failed to delete poll options")
    }

    // Delete the poll
    const { error: deleteError } = await supabase
      .from("polls")
      .delete()
      .eq("id", pollId)

    if (deleteError) {
      throw new Error("Failed to delete poll")
    }

    // Revalidate paths
    revalidatePath("/polls")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in deletePoll:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }
  }
}

export async function updatePoll(pollId: string, data: {
  question: string;
  description?: string;
  options: { id?: string; text: string }[];
}) {
  try {
    const supabase = await getSupabase()
    const auth = await getAuthenticatedUserId()
    if (!auth.success) {
      throw new Error(auth.error)
    }

    const validationError = validateUpdatePollInput(data)
    if (validationError) {
      throw new Error(validationError)
    }

    // Verify the poll belongs to the current user
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("user_id, poll_options(id)")
      .eq("id", pollId)
      .single()

    if (pollError || !poll) {
      throw new Error("Poll not found")
    }

    if (poll.user_id !== auth.userId) {
      throw new Error("Not authorized to update this poll")
    }

    // Update the poll
    const { error: updateError } = await supabase
      .from("polls")
      .update({
        question: data.question,
        description: data.description || null
      })
      .eq("id", pollId)

    if (updateError) {
      throw new Error("Failed to update poll")
    }

    // Get existing options
    const existingOptions = poll.poll_options || []
    const existingOptionIds = existingOptions.map((opt: any) => opt.id)
    
    // Handle options: update existing, add new ones
    for (const option of data.options) {
      if (option.id && existingOptionIds.includes(option.id)) {
        // Update existing option
        const { error } = await supabase
          .from("poll_options")
          .update({ text: option.text })
          .eq("id", option.id)
        
        if (error) {
          throw new Error("Failed to update poll option")
        }
      } else {
        // Add new option
        const { error } = await supabase
          .from("poll_options")
          .insert({
            poll_id: pollId,
            text: option.text,
            votes: 0
          })
        
        if (error) {
          throw new Error("Failed to add poll option")
        }
      }
    }

    // Revalidate paths
    revalidatePath("/polls")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updatePoll:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }
  }
}

// Vote handling
export async function submitVote(pollId: string, optionId: string): Promise<ActionResult> {
  try {
    const supabase = await getSupabase()
    const auth = await getAuthenticatedUserId()
    if (!auth.success) return auth

    if (!pollId || !optionId) return { success: false, error: "Poll and option are required" }

    type OptionRow = { id: string; poll_id: string }
    const { data: optionRow, error: optionError } = await supabase
      .from("poll_options")
      .select("id, poll_id")
      .eq("id", optionId)
      .single<OptionRow>()

    if (optionError || !optionRow) return { success: false, error: "Option not found" }
    if (optionRow.poll_id !== pollId) return { success: false, error: "Option does not belong to poll" }

    // Remove existing vote for this poll by the user (ignore result to preserve behavior)
    await supabase.from("votes").delete().eq("poll_id", pollId).eq("user_id", auth.userId)

    const nowIso = new Date().toISOString()
    const { error: insertError } = await supabase
      .from("votes")
      .insert({ poll_id: pollId, option_id: optionId, user_id: auth.userId, created_at: nowIso })

    if (insertError) return { success: false, error: "Failed to submit vote" }

    revalidatePath("/polls")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error in submitVote:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}
