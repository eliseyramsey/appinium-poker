import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ playerId: string }>;
}

interface UpdatePlayerBody {
  name?: string;
  avatar?: string | null;
}

// PATCH /api/players/[playerId] - Update player name or avatar
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { playerId } = await params;
    const body = (await request.json()) as UpdatePlayerBody;
    const supabase = getSupabase();

    // Get player to find game_id
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id, game_id")
      .eq("id", playerId)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    const playerData = player as { id: string; game_id: string };

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const trimmedName = body.name.trim();
      if (!trimmedName) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = trimmedName;
    }

    if (body.avatar !== undefined) {
      // Check if new avatar is already taken by another player
      if (body.avatar) {
        const { data: existingPlayers } = await supabase
          .from("players")
          .select("id")
          .eq("game_id", playerData.game_id)
          .eq("avatar", body.avatar)
          .neq("id", playerId);

        if (existingPlayers && existingPlayers.length > 0) {
          return NextResponse.json(
            { error: "Avatar already taken", code: "AVATAR_TAKEN" },
            { status: 409 }
          );
        }
      }
      updateData.avatar = body.avatar;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("players")
      .update(updateData as never)
      .eq("id", playerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update player: ${message}` },
      { status: 500 }
    );
  }
}
