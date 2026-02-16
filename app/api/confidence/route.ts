import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { nanoid } from "nanoid";
import type { ConfidenceVoteInsert } from "@/lib/supabase/types";

// Request body for POST
interface SubmitConfidenceBody {
  gameId: string;
  playerId: string;
  value: number; // 1-5
}

// POST /api/confidence - Submit confidence vote
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as SubmitConfidenceBody;

    // Validate required fields
    if (!body.gameId || !body.playerId || !body.value) {
      return NextResponse.json(
        { error: "gameId, playerId, and value are required" },
        { status: 400 }
      );
    }

    // Validate value range
    if (body.value < 1 || body.value > 5) {
      return NextResponse.json(
        { error: "Value must be between 1 and 5" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Upsert vote (insert or update if exists)
    const voteData: ConfidenceVoteInsert = {
      id: nanoid(10),
      game_id: body.gameId,
      player_id: body.playerId,
      value: body.value,
    };

    const { data, error } = await supabase
      .from("confidence_votes")
      .upsert(voteData as never, {
        onConflict: "game_id,player_id",
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to submit confidence vote: ${message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/confidence?gameId=xxx&playerId=yyy - Clear all confidence votes (admin only)
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const playerId = searchParams.get("playerId");

    if (!gameId || !playerId) {
      return NextResponse.json(
        { error: "gameId and playerId query params are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Check if player is admin
    const { data: game } = await supabase
      .from("games")
      .select("creator_id")
      .eq("id", gameId)
      .single();

    const gameData = game as { creator_id: string | null } | null;

    if (gameData?.creator_id && playerId !== gameData.creator_id) {
      return NextResponse.json(
        { error: "Only the game creator can reset confidence votes" },
        { status: 403 }
      );
    }

    // Delete all confidence votes for this game
    const { error } = await supabase
      .from("confidence_votes")
      .delete()
      .eq("game_id", gameId);

    if (error) {
      throw error;
    }

    // Reset confidence status to voting
    await supabase
      .from("games")
      .update({ confidence_status: "voting" } as never)
      .eq("id", gameId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to clear confidence votes: ${message}` },
      { status: 500 }
    );
  }
}

// GET /api/confidence?gameId=xxx - Get all confidence votes for a game
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("confidence_votes")
      .select("*")
      .eq("game_id", gameId);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to get confidence votes: ${message}` },
      { status: 500 }
    );
  }
}
