import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createIssueId } from "@/lib/utils/gameId";
import type { IssueInsert } from "@/lib/supabase/types";

// Request body for POST
interface CreateIssueBody {
  gameId: string;
  title: string;
  description?: string | null;
}

// GET /api/issues?gameId=xxx - List issues for a game
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
        { error: "gameId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("game_id", gameId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to get issues: ${message}` },
      { status: 500 }
    );
  }
}

// POST /api/issues - Create a new issue
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as CreateIssueBody;

    // Validate required fields
    if (!body.gameId || !body.title?.trim()) {
      return NextResponse.json(
        { error: "gameId and title are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Get max sort_order for this game
    const { data: lastIssue } = await supabase
      .from("issues")
      .select("sort_order")
      .eq("game_id", body.gameId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    // Type assertion for sort_order access
    const lastSortOrder = (lastIssue as { sort_order?: number } | null)?.sort_order ?? 0;
    const nextSortOrder = lastSortOrder + 1;

    const issueData: IssueInsert = {
      id: createIssueId(),
      game_id: body.gameId,
      title: body.title.trim(),
      description: body.description ?? null,
      status: "pending",
      sort_order: nextSortOrder,
    };

    const { data, error } = await supabase
      .from("issues")
      .insert(issueData as never)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create issue: ${message}` },
      { status: 500 }
    );
  }
}
