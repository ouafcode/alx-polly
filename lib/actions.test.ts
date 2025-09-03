import { createPoll, getPolls, getUserPolls, deletePoll, updatePoll } from "./actions";
import { createServerClient } from "./supabase";
import { revalidatePath } from "next/cache";

// Mock the supabase client
jest.mock("./supabase", () => ({
  createServerClient: jest.fn(),
}));

// Mock next/cache
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Stable, memoized table mocks so test-configured fns match runtime calls
const pollsTable = (() => {
  const selectEqOrder = { single: jest.fn(), order: jest.fn() };
  const selectObj = {
    eq: jest.fn(() => selectEqOrder),
    order: jest.fn(() => selectEqOrder),
  };
  const insertSelect = { single: jest.fn() };
  const deleteEq = { eq: jest.fn() };
  const updateEq = { eq: jest.fn() };
  return {
    select: jest.fn(() => selectObj),
    insert: jest.fn(() => ({ select: jest.fn(() => insertSelect) })),
    delete: jest.fn(() => deleteEq),
    update: jest.fn(() => updateEq),
  };
})();

const pollOptionsTable = (() => {
  const deleteEq = { eq: jest.fn() };
  const updateEq = { eq: jest.fn() };
  return {
    select: jest.fn(() => ({ eq: jest.fn(), order: jest.fn() })),
    insert: jest.fn(),
    delete: jest.fn(() => deleteEq),
    update: jest.fn(() => updateEq),
  };
})();

const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn((tableName: string) => {
    if (tableName === "polls") return pollsTable;
    if (tableName === "poll_options") return pollOptionsTable;
    return {
      select: jest.fn(() => ({ eq: jest.fn(), order: jest.fn() })),
      insert: jest.fn(() => ({})),
      delete: jest.fn(() => ({ eq: jest.fn() })),
      update: jest.fn(() => ({ eq: jest.fn() })),
    };
  }),
};

describe("Poll Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createServerClient as jest.Mock).mockResolvedValue(mockSupabase);
    (revalidatePath as jest.Mock).mockClear();
  });

  // Mock user and session data
  const mockUser = { id: "user-123", email: "test@example.com" };
  const mockSession = { user: mockUser, expires_at: "some_date" };

  describe("createPoll", () => {
    const createPollData = {
      question: "Test Question",
      description: "Test Description",
      options: [{ text: "Option 1" }, { text: "Option 2" }],
    };

    it("should successfully create a poll with options", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").insert().select().single as jest.Mock).mockResolvedValue({
        data: { id: "poll-123", ...createPollData, user_id: mockUser.id },
        error: null,
      });
      (mockSupabase.from("poll_options").insert as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await createPoll(createPollData);

      expect(result.success).toBe(true);
      expect(result.pollId).toBe("poll-123");
      expect(mockSupabase.from).toHaveBeenCalledWith("polls");
      expect(mockSupabase.from("polls").insert).toHaveBeenCalledWith(
        expect.objectContaining({
          question: createPollData.question,
          description: createPollData.description,
          user_id: mockUser.id,
        })
      );
      expect(mockSupabase.from).toHaveBeenCalledWith("poll_options");
      expect(mockSupabase.from("poll_options").insert).toHaveBeenCalledWith([
        expect.objectContaining({ poll_id: "poll-123", text: "Option 1" }),
        expect.objectContaining({ poll_id: "poll-123", text: "Option 2" }),
      ]);
      expect(revalidatePath).toHaveBeenCalledWith("/polls");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should return an error if user is not authenticated (no session)", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: "No session" },
      });

      const result = await createPoll(createPollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not authenticated");
    });

    it("should return an error if user is not authenticated (no user)", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: "No user" },
      });

      const result = await createPoll(createPollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not authenticated");
    });

    it("should return an error if poll creation fails", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").insert().select().single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Poll creation failed" },
      });

      const result = await createPoll(createPollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create poll");
    });

    it("should return an error and clean up poll if option creation fails", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").insert().select().single as jest.Mock).mockResolvedValue({
        data: { id: "poll-123", ...createPollData, user_id: mockUser.id },
        error: null,
      });
      (mockSupabase.from("poll_options").insert as jest.Mock).mockResolvedValue({
        error: { message: "Option creation failed" },
      });
      (mockSupabase.from("polls").delete().eq as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await createPoll(createPollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create poll options");
      expect(mockSupabase.from("polls").delete).toHaveBeenCalled();
      expect(mockSupabase.from("polls").delete().eq).toHaveBeenCalledWith(
        "id",
        "poll-123"
      );
    });
  });

  describe("getPolls", () => {
    it("should successfully fetch and transform polls", async () => {
      const mockPollsData = [
        {
          id: "poll-1",
          question: "Q1",
          description: "D1",
          user_id: "user-1",
          created_at: "2023-01-01T00:00:00Z",
          poll_options: [
            { id: "opt-1", text: "Opt A", votes: 5 },
            { id: "opt-2", text: "Opt B", votes: 3 },
          ],
        },
      ];
      (mockSupabase.from("polls").select().order as jest.Mock).mockResolvedValue({
        data: mockPollsData,
        error: null,
      });

      const result = await getPolls();

      expect(result).toEqual([
        {
          id: "poll-1",
          question: "Q1",
          description: "D1",
          user_id: "user-1",
          created_at: "2023-01-01T00:00:00Z",
          options: [
            { id: "opt-1", text: "Opt A", votes: 5 },
            { id: "opt-2", text: "Opt B", votes: 3 },
          ],
          totalVotes: 8,
        },
      ]);
      expect(mockSupabase.from).toHaveBeenCalledWith("polls");
      expect(mockSupabase.from("polls").select).toHaveBeenCalledWith(
        expect.any(String)
      );
      expect(mockSupabase.from("polls").select().order).toHaveBeenCalledWith(
        "created_at",
        { ascending: false }
      );
    });

    it("should return an empty array if no polls are found", async () => {
      (mockSupabase.from("polls").select().order as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getPolls();

      expect(result).toEqual([]);
    });

    it("should return an empty array if fetching polls fails", async () => {
      (mockSupabase.from("polls").select().order as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Fetch error" },
      });

      const result = await getPolls();

      expect(result).toEqual([]);
    });
  });

  describe("getUserPolls", () => {
    it("should successfully fetch and transform user-specific polls", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      const mockUserPollsData = [
        {
          id: "poll-user-1",
          question: "User Q1",
          description: "User D1",
          user_id: mockUser.id,
          created_at: "2023-01-02T00:00:00Z",
          poll_options: [{ id: "opt-u1", text: "User Opt A", votes: 2 }],
        },
      ];
      (mockSupabase.from("polls").select().eq().order as jest.Mock).mockResolvedValue({
        data: mockUserPollsData,
        error: null,
      });

      const result = await getUserPolls();

      expect(result).toEqual([
        {
          id: "poll-user-1",
          question: "User Q1",
          description: "User D1",
          user_id: mockUser.id,
          created_at: "2023-01-02T00:00:00Z",
          options: [{ id: "opt-u1", text: "User Opt A", votes: 2 }],
          totalVotes: 2,
        },
      ]);
      expect(mockSupabase.from).toHaveBeenCalledWith("polls");
      expect(mockSupabase.from("polls").select).toHaveBeenCalledWith(
        expect.any(String)
      );
      expect(mockSupabase.from("polls").select().eq).toHaveBeenCalledWith(
        "user_id",
        mockUser.id
      );
      expect(mockSupabase.from("polls").select().eq().order).toHaveBeenCalledWith(
        "created_at",
        { ascending: false }
      );
    });

    it("should return an empty array if user is not authenticated (no session)", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: "No session" },
      });

      const result = await getUserPolls();

      expect(result).toEqual([]);
    });

    it("should return an empty array if user is not authenticated (no user)", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: "No user" },
      });

      const result = await getUserPolls();

      expect(result).toEqual([]);
    });

    it("should return an empty array if fetching user polls fails", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().order as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Fetch error" },
      });

      const result = await getUserPolls();

      expect(result).toEqual([]);
    });
  });

  describe("deletePoll", () => {
    it("should successfully delete a poll", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue({
        data: { user_id: mockUser.id },
        error: null,
      });
      (mockSupabase.from("poll_options").delete().eq as jest.Mock).mockResolvedValue({
        error: null,
      });
      (mockSupabase.from("polls").delete().eq as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await deletePoll("poll-123");

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("polls"); // For select
      expect(mockSupabase.from("polls").select).toHaveBeenCalledWith("user_id");
      expect(mockSupabase.from("polls").select().eq).toHaveBeenCalledWith(
        "id",
        "poll-123"
      );
      expect(mockSupabase.from).toHaveBeenCalledWith("poll_options"); // For delete options
      expect(mockSupabase.from("poll_options").delete).toHaveBeenCalled();
      expect(mockSupabase.from("poll_options").delete().eq).toHaveBeenCalledWith(
        "poll_id",
        "poll-123"
      );
      expect(mockSupabase.from).toHaveBeenCalledWith("polls"); // For delete poll
      expect(mockSupabase.from("polls").delete).toHaveBeenCalled();
      expect(mockSupabase.from("polls").delete().eq).toHaveBeenCalledWith(
        "id",
        "poll-123"
      );
      expect(revalidatePath).toHaveBeenCalledWith("/polls");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should return an error if user is not authenticated (no session)", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: "No session" },
      });

      const result = await deletePoll("poll-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not authenticated");
    });

    it("should return an error if user is not authenticated (no user)", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: "No user" },
      });

      const result = await deletePoll("poll-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not authenticated");
    });

    it("should return an error if poll is not found", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Poll not found" },
      });

      const result = await deletePoll("poll-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Poll not found");
    });

    it("should return an error if user is not authorized to delete the poll", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue({
        data: { user_id: "another-user-id" },
        error: null,
      });

      const result = await deletePoll("poll-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Not authorized to delete this poll");
    });

    it("should return an error if poll options deletion fails", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue({
        data: { user_id: mockUser.id },
        error: null,
      });
      (mockSupabase.from("poll_options").delete().eq as jest.Mock).mockResolvedValue({
        error: { message: "Option delete failed" },
      });

      const result = await deletePoll("poll-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete poll options");
    });

    it("should return an error if poll deletion fails", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue({
        data: { user_id: mockUser.id },
        error: null,
      });
      (mockSupabase.from("poll_options").delete().eq as jest.Mock).mockResolvedValue({
        error: null,
      });
      (mockSupabase.from("polls").delete().eq as jest.Mock).mockResolvedValue({
        error: { message: "Poll delete failed" },
      });

      const result = await deletePoll("poll-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete poll");
    });
  });

  describe("updatePoll", () => {
    const updatePollData = {
      question: "Updated Question",
      description: "Updated Description",
      options: [
        { id: "opt-1", text: "Updated Option 1" },
        { text: "New Option 3" },
      ],
    };

    it("should successfully update a poll and its options", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue(
        {
          data: { user_id: mockUser.id, poll_options: [{ id: "opt-1", text: "Old Option 1" }] },
          error: null,
        }
      );
      (mockSupabase.from("polls").update().eq as jest.Mock).mockResolvedValue({
        error: null,
      });
      (mockSupabase.from("poll_options").update().eq as jest.Mock).mockResolvedValue({
        error: null,
      });
      (mockSupabase.from("poll_options").insert as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await updatePoll("poll-123", updatePollData);

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("polls"); // For select
      expect(mockSupabase.from("polls").select).toHaveBeenCalledWith("user_id, poll_options(id)");
      expect(mockSupabase.from("polls").select().eq).toHaveBeenCalledWith(
        "id",
        "poll-123"
      );
      expect(mockSupabase.from).toHaveBeenCalledWith("polls"); // For update poll
      expect(mockSupabase.from("polls").update).toHaveBeenCalledWith(
        expect.objectContaining({
          question: updatePollData.question,
          description: updatePollData.description,
        })
      );
      expect(mockSupabase.from("polls").update().eq).toHaveBeenCalledWith(
        "id",
        "poll-123"
      );
      expect(mockSupabase.from).toHaveBeenCalledWith("poll_options"); // For update option
      expect(mockSupabase.from("poll_options").update).toHaveBeenCalledWith({
        text: "Updated Option 1",
      });
      expect(mockSupabase.from("poll_options").update().eq).toHaveBeenCalledWith(
        "id",
        "opt-1"
      );
      expect(mockSupabase.from).toHaveBeenCalledWith("poll_options"); // For insert new option
      expect(mockSupabase.from("poll_options").insert).toHaveBeenCalledWith({
        poll_id: "poll-123",
        text: "New Option 3",
        votes: 0,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/polls");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should return an error if user is not authenticated (no session)", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: "No session" },
      });

      const result = await updatePoll("poll-123", updatePollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not authenticated");
    });

    it("should return an error if user is not authenticated (no user)", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: "No user" },
      });

      const result = await updatePoll("poll-123", updatePollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not authenticated");
    });

    it("should return an error if poll is not found", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Poll not found" },
      });

      const result = await updatePoll("poll-123", updatePollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Poll not found");
    });

    it("should return an error if user is not authorized to update the poll", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue(
        {
          data: { user_id: "another-user-id", poll_options: [] },
          error: null,
        }
      );

      const result = await updatePoll("poll-123", updatePollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Not authorized to update this poll");
    });

    it("should return an error if poll update fails", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue(
        {
          data: { user_id: mockUser.id, poll_options: [] },
          error: null,
        }
      );
      (mockSupabase.from("polls").update().eq as jest.Mock).mockResolvedValue({
        error: { message: "Poll update failed" },
      });

      const result = await updatePoll("poll-123", updatePollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to update poll");
    });

    it("should return an error if poll option update fails", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue(
        {
          data: { user_id: mockUser.id, poll_options: [{ id: "opt-1", text: "Old Option 1" }] },
          error: null,
        }
      );
      (mockSupabase.from("polls").update().eq as jest.Mock).mockResolvedValue({
        error: null,
      });
      (mockSupabase.from("poll_options").update().eq as jest.Mock).mockResolvedValue({
        error: { message: "Option update failed" },
      });

      const result = await updatePoll("poll-123", updatePollData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to update poll option");
    });

    it("should return an error if new poll option insertion fails", async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      (mockSupabase.from("polls").select().eq().single as jest.Mock).mockResolvedValue(
        {
          data: { user_id: mockUser.id, poll_options: [] },
          error: null,
        }
      );
      (mockSupabase.from("polls").update().eq as jest.Mock).mockResolvedValue({
        error: null,
      });
      (mockSupabase.from("poll_options").insert as jest.Mock).mockResolvedValue({
        error: { message: "Option insert failed" },
      });

      const result = await updatePoll("poll-123", {
        question: "Q",
        options: [{ text: "New Option" }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to add poll option");
    });
  });
});