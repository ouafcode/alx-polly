"use server"

import { createServerClient } from "./supabase"
import { revalidatePath } from "next/cache"

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

export async function createPoll(data: CreatePollData) {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error("Session error:", sessionError)
      throw new Error("User not authenticated")
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error("User error:", userError)
      throw new Error("User not authenticated")
    }

    // Create the poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        question: data.question,
        description: data.description || null,
        user_id: user.id,
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
    const supabase = await createServerClient()
    
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
    const transformedPolls: Poll[] = polls.map(poll => {
      const options = poll.poll_options || []
      const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)
      
      return {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        user_id: poll.user_id,
        created_at: poll.created_at,
        options: options.map(option => ({
          id: option.id,
          text: option.text,
          votes: option.votes
        })),
        totalVotes
      }
    })

    return transformedPolls
  } catch (error) {
    console.error("Error in getPolls:", error)
    return []
  }
}

export async function getUserPolls(): Promise<Poll[]> {
  try {
    const supabase = await createServerClient()
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error("Session error in getUserPolls:", sessionError)
      return []
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error("User error in getUserPolls:", userError)
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (pollsError) {
      console.error("Error fetching user polls:", pollsError)
      return []
    }

    // Transform the data to match the expected format
    const transformedPolls: Poll[] = polls.map(poll => {
      const options = poll.poll_options || []
      const totalVotes = options.reduce((sum, option) => sum + option.votes, 0)
      
      return {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        user_id: poll.user_id,
        created_at: poll.created_at,
        options: options.map(option => ({
          id: option.id,
          text: option.text,
          votes: option.votes
        })),
        totalVotes
      }
    })

    return transformedPolls
  } catch (error) {
    console.error("Error in getUserPolls:", error)
    return []
  }
}

export async function deletePoll(pollId: string) {
  try {
    const supabase = await createServerClient()
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error("Session error in deletePoll:", sessionError)
      throw new Error("User not authenticated")
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error("User error in deletePoll:", userError)
      throw new Error("User not authenticated")
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

    if (poll.user_id !== user.id) {
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
    const supabase = await createServerClient()
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error("Session error in updatePoll:", sessionError)
      throw new Error("User not authenticated")
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error("User error in updatePoll:", userError)
      throw new Error("User not authenticated")
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

    if (poll.user_id !== user.id) {
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
