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

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
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
