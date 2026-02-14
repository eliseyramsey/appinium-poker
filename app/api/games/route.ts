import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createGameId } from "@/lib/utils/gameId";
import type { GameInsert, Permission } from "@/lib/supabase/types";

// Request body type
interface CreateGameBody {
  name: string;
  votingSystem?: string;
  whoCanReveal?: Permission;
  whoCanManage?: Permission;
  autoReveal?: boolean;
  funFeatures?: boolean;
  showAverage?: boolean;
  showCountdown?: boolean;
}

// POST /api/games - Create a new game
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured. Please set up Supabase credentials." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as CreateGameBody;

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Game name is required" },
        { status: 400 }
      );
    }

    const gameId = createGameId();

    // Prepare game data with defaults
    const gameData: GameInsert = {
      id: gameId,
      name: body.name.trim(),
      voting_system: body.votingSystem ?? "fibonacci",
      who_can_reveal: body.whoCanReveal ?? "all",
      who_can_manage: body.whoCanManage ?? "all",
      auto_reveal: body.autoReveal ?? false,
      fun_features: body.funFeatures ?? true,
      show_average: body.showAverage ?? true,
      show_countdown: body.showCountdown ?? true,
      host_player_id: null,
      current_issue_id: null,
      status: "voting",
    };

    const supabase = getSupabase();

    // Type assertion needed until Supabase types are auto-generated
    const { data, error } = await supabase
      .from("games")
      .insert(gameData as never)
      .select()
      .single();

    if (error) {
      // Check if Supabase is not configured
      if (error.message.includes("Invalid API key")) {
        return NextResponse.json(
          { error: "Database not configured. Please set up Supabase." },
          { status: 503 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create game: ${message}` },
      { status: 500 }
    );
  }
}
