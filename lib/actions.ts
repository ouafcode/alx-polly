"use server"

import { createServerClient } from "./supabase"
import { revalidatePath } from "next/cache"

export interface CreatePollData {
  question: string
  description?: string
  options: { text: string }[]
}

export async function createPoll(data: CreatePollData) {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
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
