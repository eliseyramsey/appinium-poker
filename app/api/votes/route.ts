import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createVoteId } from "@/lib/utils/gameId";
import { VOTING_CARDS } from "@/lib/constants";
import type { VoteInsert } from "@/lib/supabase/types";

// Request body for POST
interface SubmitVoteBody {
  issueId: string;
  playerId: string;
  value: string;
}

// Valid vote values from constants
const VALID_VOTE_VALUES = VOTING_CARDS.map((c) => c.value) as string[];

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

    // Validate vote value against allowed values
    if (!VALID_VOTE_VALUES.includes(body.value)) {
      return NextResponse.json(
        { error: "Invalid vote value" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Atomic upsert (no race condition)
    // Database has UNIQUE constraint on (issue_id, player_id)
    const voteData: VoteInsert = {
      id: createVoteId(),
      issue_id: body.issueId,
      player_id: body.playerId,
      value: body.value,
    };

    const { data, error } = await supabase
      .from("votes")
      .upsert(voteData as never, {
        onConflict: "issue_id,player_id",
        ignoreDuplicates: false,
      })
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

// DELETE /api/votes?issueId=xxx&adminPlayerId=yyy - Clear all votes for an issue (admin only)
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
    const adminPlayerId = searchParams.get("adminPlayerId");

    if (!issueId || !adminPlayerId) {
      return NextResponse.json(
        { error: "issueId and adminPlayerId are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Get issue to find game_id
    const { data: issue } = await supabase
      .from("issues")
      .select("game_id")
      .eq("id", issueId)
      .single();

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Verify admin
    const { data: game } = await supabase
      .from("games")
      .select("creator_id")
      .eq("id", (issue as { game_id: string }).game_id)
      .single();

    const gameData = game as { creator_id: string } | null;
    if (!gameData || gameData.creator_id !== adminPlayerId) {
      return NextResponse.json(
        { error: "Only admin can clear votes" },
        { status: 403 }
      );
    }

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
