import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { IssueStatus, IssueUpdate } from "@/lib/supabase/types";

interface RouteParams {
  params: Promise<{ issueId: string }>;
}

// GET /api/issues/[issueId] - Get issue details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { issueId } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("id", issueId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Issue not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to get issue: ${message}` },
      { status: 500 }
    );
  }
}

// Request body for PATCH
interface UpdateIssueBody {
  gameId: string;
  playerId: string;
  title?: string;
  description?: string | null;
  status?: IssueStatus;
  finalScore?: number | null;
  sortOrder?: number;
}

// PATCH /api/issues/[issueId] - Update issue (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { issueId } = await params;
    const body = (await request.json()) as UpdateIssueBody;
    const supabase = getSupabase();

    // Validate required auth fields
    if (!body.gameId || !body.playerId) {
      return NextResponse.json(
        { error: "gameId and playerId are required" },
        { status: 400 }
      );
    }

    // Get issue to verify it belongs to the game
    const { data: issue } = await supabase
      .from("issues")
      .select("game_id")
      .eq("id", issueId)
      .single();

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const issueData = issue as { game_id: string };
    if (issueData.game_id !== body.gameId) {
      return NextResponse.json(
        { error: "Issue does not belong to this game" },
        { status: 403 }
      );
    }

    // Verify admin
    const { data: game } = await supabase
      .from("games")
      .select("creator_id")
      .eq("id", body.gameId)
      .single();

    const gameData = game as { creator_id: string } | null;
    if (!gameData || gameData.creator_id !== body.playerId) {
      return NextResponse.json(
        { error: "Only admin can update issues" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: IssueUpdate = {};

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.finalScore !== undefined) {
      updateData.final_score = body.finalScore;
    }
    if (body.sortOrder !== undefined) {
      updateData.sort_order = body.sortOrder;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("issues")
      .update(updateData)
      .eq("id", issueId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Issue not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update issue: ${message}` },
      { status: 500 }
    );
  }
}

// DELETE /api/issues/[issueId]?gameId=xxx&playerId=yyy - Delete issue (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { issueId } = await params;
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const playerId = searchParams.get("playerId");

    if (!gameId || !playerId) {
      return NextResponse.json(
        { error: "gameId and playerId are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Get issue to verify it belongs to the game
    const { data: issue } = await supabase
      .from("issues")
      .select("game_id")
      .eq("id", issueId)
      .single();

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const issueData = issue as { game_id: string };
    if (issueData.game_id !== gameId) {
      return NextResponse.json(
        { error: "Issue does not belong to this game" },
        { status: 403 }
      );
    }

    // Verify admin
    const { data: game } = await supabase
      .from("games")
      .select("creator_id")
      .eq("id", gameId)
      .single();

    const gameData = game as { creator_id: string } | null;
    if (!gameData || gameData.creator_id !== playerId) {
      return NextResponse.json(
        { error: "Only admin can delete issues" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("issues")
      .delete()
      .eq("id", issueId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete issue: ${message}` },
      { status: 500 }
    );
  }
}
