import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createPlayerId } from "@/lib/utils/gameId";
import type { PlayerInsert } from "@/lib/supabase/types";

// Request body for POST
interface JoinGameBody {
  gameId: string;
  name: string;
  avatar?: string | null;
  isSpectator?: boolean;
}

// POST /api/players - Join a game
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as JoinGameBody;

    // Validate required fields
    if (!body.gameId || !body.name?.trim()) {
      return NextResponse.json(
        { error: "gameId and name are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const playerId = createPlayerId();

    // Check if game exists
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id")
      .eq("id", body.gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Create player
    const playerData: PlayerInsert = {
      id: playerId,
      game_id: body.gameId,
      name: body.name.trim(),
      avatar: body.avatar ?? null,
      is_spectator: body.isSpectator ?? false,
    };

    const { data, error } = await supabase
      .from("players")
      .insert(playerData as never)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to join game: ${message}` },
      { status: 500 }
    );
  }
}
