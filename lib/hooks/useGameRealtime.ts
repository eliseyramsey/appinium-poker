"use client";

import { useEffect, useRef } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useGameStore } from "@/lib/store/gameStore";
import type { Game, Player, Vote, Issue } from "@/lib/supabase/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useGameRealtime(gameId: string | null) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const store = useGameStore();

  useEffect(() => {
    if (!gameId || !isSupabaseConfigured()) return;

    let isMounted = true;
    const supabase = getSupabase();

    // Fetch initial data
    const fetchData = async () => {
      if (!isMounted) return;
      // Fetch game
      const { data: game } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (game) {
        store.setGame(game as Game);
        store.setRevealed((game as Game).status === "revealed");
      }

      // Fetch players
      const { data: players } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", gameId);

      if (players) {
        store.setPlayers(players as Player[]);
      }

      // Fetch issues
      const { data: issues } = await supabase
        .from("issues")
        .select("*")
        .eq("game_id", gameId)
        .order("sort_order", { ascending: true });

      if (issues) {
        store.setIssues(issues as Issue[]);
      }

      // Fetch votes for current issue
      const gameData = game as Game | null;
      if (gameData?.current_issue_id) {
        const { data: votes } = await supabase
          .from("votes")
          .select("*")
          .eq("issue_id", gameData.current_issue_id);

        if (votes) {
          store.setVotes(votes as Vote[]);
        }
      }
    };

    fetchData();

    // Delay subscription to avoid StrictMode race condition
    const timeoutId = setTimeout(() => {
      if (!isMounted) return;

      // Subscribe to realtime changes
      const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const game = payload.new as Game;
            const currentState = useGameStore.getState();
            const wasRevealed = currentState.isRevealed;

            currentState.setGame(game);
            currentState.setRevealed(game.status === "revealed");

            // Clear votes when switching from revealed to voting
            if (wasRevealed && game.status === "voting") {
              currentState.clearVotes();
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `game_id=eq.${gameId}` },
        (payload) => {
          const state = useGameStore.getState();
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            state.addPlayer(payload.new as Player);
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string };
            if (old?.id) state.removePlayer(old.id);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload) => {
          const state = useGameStore.getState();
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            state.addVote(payload.new as Vote);
          }
          // DELETE handled via game status change to "voting"
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issues", filter: `game_id=eq.${gameId}` },
        (payload) => {
          const state = useGameStore.getState();
          if (payload.eventType === "INSERT") {
            state.addIssue(payload.new as Issue);
          } else if (payload.eventType === "UPDATE") {
            const issue = payload.new as Issue;
            state.updateIssue(issue.id, issue);
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as { id?: string };
            if (old?.id) state.removeIssue(old.id);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Connected successfully
        }
      });

      channelRef.current = channel;
    }, 100); // Delay to avoid StrictMode unmount

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [gameId]); // Only re-run when gameId changes
}
