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

    // Check if game exists and get creator_id
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, creator_id")
      .eq("id", body.gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    const gameData = game as { id: string; creator_id: string | null };

    // Check if avatar is already taken
    if (body.avatar) {
      const { data: existingPlayers } = await supabase
        .from("players")
        .select("id")
        .eq("game_id", body.gameId)
        .eq("avatar", body.avatar);

      if (existingPlayers && existingPlayers.length > 0) {
        return NextResponse.json(
          { error: "Avatar already taken", code: "AVATAR_TAKEN" },
          { status: 409 }
        );
      }
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
      .insert(playerData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // If no creator yet, set this player as creator (first player = admin)
    if (!gameData.creator_id) {
      await supabase
        .from("games")
        .update({ creator_id: playerId })
        .eq("id", body.gameId);
    }

    // Return player with isCreator flag
    const isCreator = !gameData.creator_id;
    const responseData = { ...(data as Record<string, unknown>), isCreator };
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to join game: ${message}` },
      { status: 500 }
    );
  }
}
