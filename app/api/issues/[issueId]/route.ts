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
  title?: string;
  description?: string | null;
  status?: IssueStatus;
  finalScore?: number | null;
  sortOrder?: number;
}

// PATCH /api/issues/[issueId] - Update issue
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
      .update(updateData as never)
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

// DELETE /api/issues/[issueId] - Delete issue
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { issueId } = await params;
    const supabase = getSupabase();

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
