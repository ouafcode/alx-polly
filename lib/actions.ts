"use server"

import { createServerClient } from "./supabase"
import { revalidatePath } from "next/cache"

/**
 * Server Actions for Poll Management and Voting System
 * 
 * This module contains all server-side actions for the polling application,
 * including poll creation, retrieval, updates, deletion, and voting functionality.
 * All actions are protected by authentication and include proper error handling.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Error result type for failed actions
 */
type ActionError = { success: false; error: string }

/**
 * Success result type for successful actions
 * @template T - Additional data to include in success response
 */
type ActionSuccess<T extends object = {}> = { success: true } & T

/**
 * Generic action result type that can be either success or error
 * @template T - Additional data type for success responses
 */
export type ActionResult<T extends object = {}> = ActionSuccess<T> | ActionError

/**
 * Data structure for creating a new poll
 */
export interface CreatePollData {
  /** The poll question text */
  question: string
  /** Optional description providing additional context */
  description?: string
  /** Array of poll options with text content */
  options: { text: string }[]
}

/**
 * Complete poll data structure including all related information
 */
export interface Poll {
  /** Unique identifier for the poll */
  id: string
  /** The poll question text */
  question: string
  /** Optional description providing additional context */
  description?: string
  /** ID of the user who created the poll */
  user_id: string
  /** ISO timestamp when the poll was created */
  created_at: string
  /** Array of poll options with vote counts */
  options: {
    id: string
    text: string
    votes: number
  }[]
  /** Total number of votes across all options */
  totalVotes: number
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get Supabase client instance for server-side operations
 * 
 * @returns Promise resolving to configured Supabase client
 */
async function getSupabase() {
  return createServerClient()
}

/**
 * Get the authenticated user's ID from the current session
 * 
 * Validates the user's authentication status and returns their user ID.
 * This function is used by all protected actions to ensure only authenticated
 * users can perform operations.
 * 
 * @returns Promise resolving to action result with user ID or error
 */
async function getAuthenticatedUserId(): Promise<ActionResult<{ userId: string }>> {
  const supabase = await getSupabase()
  
  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return { success: false, error: "User not authenticated" }
  }

  // Get user details from session
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: "User not authenticated" }
  }

  return { success: true, userId: user.id }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate poll creation data
 * 
 * Ensures all required fields are present and valid for creating a new poll.
 * Validates question text, option count, and option uniqueness.
 * 
 * @param data - Poll creation data to validate
 * @returns Error message string if validation fails, null if valid
 */
function validateCreatePollInput(data: CreatePollData): string | null {
  // Validate question field
  if (!data || typeof data.question !== "string" || data.question.trim().length === 0) {
    return "Question is required"
  }
  
  // Validate options array
  if (!Array.isArray(data.options) || data.options.length < 2) {
    return "At least two options are required"
  }
  
  // Validate option text content
  const texts = data.options.map(o => (o.text || "").trim())
  if (texts.some(t => t.length === 0)) {
    return "Option text cannot be empty"
  }
  
  // Validate option uniqueness
  const unique = new Set(texts)
  if (unique.size !== texts.length) {
    return "Option texts must be unique"
  }
  
  return null
}

/**
 * Validate poll update data
 * 
 * Ensures all required fields are present and valid for updating an existing poll.
 * Similar to create validation but allows for existing option IDs.
 * 
 * @param data - Poll update data to validate
 * @returns Error message string if validation fails, null if valid
 */
function validateUpdatePollInput(data: { question: string; description?: string; options: { id?: string; text: string }[] }): string | null {
  // Validate question field
  if (!data || typeof data.question !== "string" || data.question.trim().length === 0) {
    return "Question is required"
  }
  
  // Validate options array (at least one option required for updates)
  if (!Array.isArray(data.options) || data.options.length === 0) {
    return "At least one option is required"
  }
  
  // Validate option text content
  const texts = data.options.map(o => (o.text || "").trim())
  if (texts.some(t => t.length === 0)) {
    return "Option text cannot be empty"
  }
  
  return null
}

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Database row structure for polls with related options
 */
type PollRow = {
  id: string
  question: string
  description?: string | null
  user_id: string
  created_at: string
  poll_options?: { id: string; text: string; votes: number }[]
}

/**
 * Transform database poll row to application Poll interface
 * 
 * Converts the raw database structure to the standardized Poll interface
 * used throughout the application, including vote count calculations.
 * 
 * @param row - Raw poll data from database
 * @returns Transformed Poll object
 */
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

// ============================================================================
// POLL MANAGEMENT ACTIONS
// ============================================================================

/**
 * Create a new poll with options
 * 
 * Creates a new poll in the database with the provided question, description,
 * and options. Validates input data and ensures user authentication.
 * Uses database transactions to ensure data consistency.
 * 
 * @param data - Poll creation data including question, description, and options
 * @returns Promise resolving to action result with poll ID or error
 */
export async function createPoll(data: CreatePollData) {
  try {
    const supabase = await getSupabase()
    
    // Verify user authentication
    const auth = await getAuthenticatedUserId()
    if (!auth.success) {
      return auth
    }
    const userId = auth.userId

    // Validate input data
    const validationError = validateCreatePollInput(data)
    if (validationError) {
      return { success: false, error: validationError }
    }

    // Create the poll record
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
      // Clean up the poll if options creation fails (rollback)
      await supabase.from("polls").delete().eq("id", poll.id)
      throw new Error("Failed to create poll options")
    }

    // Revalidate cached pages to show the new poll
    revalidatePath("/polls")
    revalidatePath("/dashboard")

    return { success: true, pollId: poll.id }
  } catch (error) {
    console.error("Error in createPoll:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

/**
 * Retrieve all polls from the database
 * 
 * Fetches all polls with their associated options and vote counts.
 * Results are ordered by creation date (newest first).
 * This is a public action that doesn't require authentication.
 * 
 * @returns Promise resolving to array of Poll objects
 */
export async function getPolls(): Promise<Poll[]> {
  try {
    const supabase = await getSupabase()
    
    // Fetch polls with their options using Supabase join
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

/**
 * Retrieve polls created by the authenticated user
 * 
 * Fetches all polls created by the currently authenticated user,
 * including their associated options and vote counts.
 * Results are ordered by creation date (newest first).
 * Requires user authentication.
 * 
 * @returns Promise resolving to array of Poll objects created by the user
 */
export async function getUserPolls(): Promise<Poll[]> {
  try {
    const supabase = await getSupabase()
    
    // Verify user authentication
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

/**
 * Delete a poll and all its associated data
 * 
 * Permanently deletes a poll and all its options and votes.
 * Only the poll creator can delete their own polls.
 * Uses cascading deletes to maintain referential integrity.
 * 
 * @param pollId - ID of the poll to delete
 * @returns Promise resolving to action result indicating success or failure
 */
export async function deletePoll(pollId: string) {
  try {
    const supabase = await getSupabase()
    
    // Verify user authentication
    const auth = await getAuthenticatedUserId()
    if (!auth.success) {
      throw new Error(auth.error)
    }

    // Verify the poll exists and belongs to the current user
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

    // Delete the poll (votes will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from("polls")
      .delete()
      .eq("id", pollId)

    if (deleteError) {
      throw new Error("Failed to delete poll")
    }

    // Revalidate cached pages to reflect the deletion
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

/**
 * Update an existing poll and its options
 * 
 * Updates a poll's question, description, and options.
 * Only the poll creator can update their own polls.
 * Handles both updating existing options and adding new ones.
 * 
 * @param pollId - ID of the poll to update
 * @param data - Updated poll data including question, description, and options
 * @returns Promise resolving to action result indicating success or failure
 */
export async function updatePoll(pollId: string, data: {
  question: string;
  description?: string;
  options: { id?: string; text: string }[];
}) {
  try {
    const supabase = await getSupabase()
    
    // Verify user authentication
    const auth = await getAuthenticatedUserId()
    if (!auth.success) {
      throw new Error(auth.error)
    }

    // Validate input data
    const validationError = validateUpdatePollInput(data)
    if (validationError) {
      throw new Error(validationError)
    }

    // Verify the poll exists and belongs to the current user
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

    // Update the poll's basic information
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

    // Handle poll options updates
    const existingOptions = poll.poll_options || []
    const existingOptionIds = existingOptions.map((opt: any) => opt.id)
    
    // Process each option: update existing or add new ones
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

    // Revalidate cached pages to reflect the updates
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

// ============================================================================
// VOTING SYSTEM ACTIONS
// ============================================================================

/**
 * Submit a vote for a poll option
 * 
 * Allows authenticated users to vote on poll options.
 * Users can change their vote by voting again (replaces previous vote).
 * Validates that the option belongs to the specified poll.
 * 
 * @param pollId - ID of the poll being voted on
 * @param optionId - ID of the option being voted for
 * @returns Promise resolving to action result indicating success or failure
 */
export async function submitVote(pollId: string, optionId: string): Promise<ActionResult> {
  try {
    const supabase = await getSupabase()
    
    // Verify user authentication
    const auth = await getAuthenticatedUserId()
    if (!auth.success) return auth

    // Validate required parameters
    if (!pollId || !optionId) return { success: false, error: "Poll and option are required" }

    // Verify the option exists and belongs to the specified poll
    type OptionRow = { id: string; poll_id: string }
    const { data: optionRow, error: optionError } = await supabase
      .from("poll_options")
      .select("id, poll_id")
      .eq("id", optionId)
      .single<OptionRow>()

    if (optionError || !optionRow) return { success: false, error: "Option not found" }
    if (optionRow.poll_id !== pollId) return { success: false, error: "Option does not belong to poll" }

    // Remove any existing vote for this poll by the user (allows vote changing)
    await supabase.from("votes").delete().eq("poll_id", pollId).eq("user_id", auth.userId)

    // Insert the new vote
    const nowIso = new Date().toISOString()
    const { error: insertError } = await supabase
      .from("votes")
      .insert({ poll_id: pollId, option_id: optionId, user_id: auth.userId, created_at: nowIso })

    if (insertError) return { success: false, error: "Failed to submit vote" }

    // Revalidate cached pages to show updated vote counts
    revalidatePath("/polls")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error in submitVote:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}
