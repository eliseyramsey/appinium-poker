import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createVoteId } from "@/lib/utils/gameId";
import type { VoteInsert } from "@/lib/supabase/types";

// Request body for POST
interface SubmitVoteBody {
  issueId: string;
  playerId: string;
  value: string;
}

// POST /api/votes - Submit a vote
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as SubmitVoteBody;

    // Validate required fields
    if (!body.issueId || !body.playerId || !body.value) {
      return NextResponse.json(
        { error: "issueId, playerId, and value are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Upsert vote (update if exists, insert if not)
    // First check if vote exists
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("issue_id", body.issueId)
      .eq("player_id", body.playerId)
      .single();

    const existingVoteData = existingVote as { id: string } | null;

    if (existingVoteData) {
      // Update existing vote
      const { data, error } = await supabase
        .from("votes")
        .update({ value: body.value } as never)
        .eq("id", existingVoteData.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Create new vote
    const voteData: VoteInsert = {
      id: createVoteId(),
      issue_id: body.issueId,
      player_id: body.playerId,
      value: body.value,
    };

    const { data, error } = await supabase
      .from("votes")
      .insert(voteData as never)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to submit vote: ${message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/votes?issueId=xxx - Clear all votes for an issue
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get("issueId");

    if (!issueId) {
      return NextResponse.json(
        { error: "issueId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("issue_id", issueId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to clear votes: ${message}` },
      { status: 500 }
    );
  }
}
