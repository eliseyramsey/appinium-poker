import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ playerId: string }>;
}

interface UpdatePlayerBody {
  name?: string;
  avatar?: string | null;
  is_spectator?: boolean;
  adminPlayerId?: string; // For admin permission check
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

    // If changing is_spectator, verify admin permission
    if (body.is_spectator !== undefined) {
      if (!body.adminPlayerId) {
        return NextResponse.json(
          { error: "Admin player ID required" },
          { status: 400 }
        );
      }

      // Check if requester is admin
      const { data: game } = await supabase
        .from("games")
        .select("creator_id")
        .eq("id", playerData.game_id)
        .single();

      if (!game || (game as { creator_id: string }).creator_id !== body.adminPlayerId) {
        return NextResponse.json(
          { error: "Only admin can change spectator status" },
          { status: 403 }
        );
      }
    }

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

    if (body.is_spectator !== undefined) {
      updateData.is_spectator = body.is_spectator;
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

// DELETE /api/players/[playerId] - Kick player (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { playerId } = await params;
    const { searchParams } = new URL(request.url);
    const adminPlayerId = searchParams.get("adminPlayerId");

    if (!adminPlayerId) {
      return NextResponse.json(
        { error: "Admin player ID required" },
        { status: 400 }
      );
    }

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

    // Check if requester is admin
    const { data: game } = await supabase
      .from("games")
      .select("creator_id")
      .eq("id", playerData.game_id)
      .single();

    if (!game || (game as { creator_id: string }).creator_id !== adminPlayerId) {
      return NextResponse.json(
        { error: "Only admin can kick players" },
        { status: 403 }
      );
    }

    // Cannot kick yourself (admin)
    if (playerId === adminPlayerId) {
      return NextResponse.json(
        { error: "Cannot kick yourself" },
        { status: 400 }
      );
    }

    // Delete the player
    const { error: deleteError } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to kick player: ${message}` },
      { status: 500 }
    );
  }
}
