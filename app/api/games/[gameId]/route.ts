import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { GameStatus, GameUpdate } from "@/lib/supabase/types";

interface RouteParams {
  params: Promise<{ gameId: string }>;
}

// GET /api/games/[gameId] - Get game details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { gameId } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Game not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to get game: ${message}` },
      { status: 500 }
    );
  }
}

// Request body for PATCH
interface UpdateGameBody {
  status?: GameStatus;
  currentIssueId?: string | null;
  hostPlayerId?: string | null;
  confidenceStatus?: "idle" | "voting" | "revealed";
  playerId?: string; // For admin check
}

// Helper to calculate average from votes
function calculateVoteAverage(votes: { value: string }[]): number | null {
  const numericVotes = votes
    .map((v) => parseFloat(v.value))
    .filter((v) => !isNaN(v));

  if (numericVotes.length === 0) return null;

  const sum = numericVotes.reduce((a, b) => a + b, 0);
  return Math.round((sum / numericVotes.length) * 10) / 10;
}

// PATCH /api/games/[gameId] - Update game (reveal, settings)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { gameId } = await params;
    const body = (await request.json()) as UpdateGameBody;
    const supabase = getSupabase();

    // Get game to check creator_id for admin operations
    const { data: existingGame } = await supabase
      .from("games")
      .select("creator_id, current_issue_id")
      .eq("id", gameId)
      .single();

    const gameInfo = existingGame as { creator_id: string | null; current_issue_id: string | null } | null;

    // Admin-only operations: reveal, new round, set current issue, confidence vote
    const isAdminAction = body.status !== undefined ||
                          body.currentIssueId !== undefined ||
                          body.confidenceStatus !== undefined;

    if (isAdminAction && gameInfo?.creator_id && body.playerId !== gameInfo.creator_id) {
      return NextResponse.json(
        { error: "Only the game creator can perform this action" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: GameUpdate = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.currentIssueId !== undefined) {
      updateData.current_issue_id = body.currentIssueId;
    }
    if (body.hostPlayerId !== undefined) {
      updateData.host_player_id = body.hostPlayerId;
    }
    if (body.confidenceStatus !== undefined) {
      (updateData as Record<string, unknown>).confidence_status = body.confidenceStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // If changing current issue, update issue statuses
    if (body.currentIssueId !== undefined) {
      // Set new issue to "voting"
      if (body.currentIssueId) {
        await supabase
          .from("issues")
          .update({ status: "voting" } as never)
          .eq("id", body.currentIssueId);
      }
    }

    // If revealing, calculate and save final score to current issue
    if (body.status === "revealed") {
      const currentIssueId = gameInfo?.current_issue_id;

      if (currentIssueId) {
        // Get all votes for this issue
        const { data: votes } = await supabase
          .from("votes")
          .select("value")
          .eq("issue_id", currentIssueId);

        if (votes && votes.length > 0) {
          const average = calculateVoteAverage(votes as { value: string }[]);

          // Update issue with final score and status
          await supabase
            .from("issues")
            .update({
              final_score: average,
              status: "voted",
            } as never)
            .eq("id", currentIssueId);
        }
      }
    }

    const { data, error } = await supabase
      .from("games")
      .update(updateData as never)
      .eq("id", gameId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Game not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update game: ${message}` },
      { status: 500 }
    );
  }
}
