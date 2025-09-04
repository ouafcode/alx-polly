// Vote handling
export async function submitVote(pollId: string, optionId: string): Promise<ActionResult> {
    try {
      const supabase = await getSupabase()
      const auth = await getAuthenticatedUserId()
      if (!auth.success) {
        return auth
      }
  
      // Basic validation
      if (!pollId || !optionId) {
        return { success: false, error: "Poll and option are required" }
      }
  
      // Verify option belongs to poll
      const { data: option, error: optionError } = await supabase
        .from("poll_options")
        .select("id, poll_id")
        .eq("id", optionId)
        .single()
  
      if (optionError || !option) {
        return { success: false, error: "Option not found" }
      }
  
      if (option.poll_id !== pollId) {
        return { success: false, error: "Option does not belong to poll" }
      }
  
      // Remove existing vote for this poll by the user (if any)
      await supabase
        .from("votes")
        .delete()
        .eq("poll_id", pollId)
        .eq("user_id", auth.userId)
  
      // Insert new vote
      const { error: insertError } = await supabase
        .from("votes")
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: auth.userId,
          created_at: new Date().toISOString(),
        })
  
      if (insertError) {
        return { success: false, error: "Failed to submit vote" }
      }
  
      // Revalidate paths to reflect updated counts
      revalidatePath("/polls")
      revalidatePath("/dashboard")
  
      return { success: true }
    } catch (error) {
      console.error("Error in submitVote:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
    }
  }
  