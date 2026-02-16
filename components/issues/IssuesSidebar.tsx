"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, ListTodo, Hand } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useGameStore } from "@/lib/store/gameStore";
import { usePlayerStore } from "@/lib/store/playerStore";
import type { Issue } from "@/lib/supabase/types";

interface IssuesSidebarProps {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfidenceVote?: () => void;
}

export function IssuesSidebar({ gameId, isOpen, onClose, onConfidenceVote }: IssuesSidebarProps) {
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [isAddingIssue, setIsAddingIssue] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deletingIssueId, setDeletingIssueId] = useState<string | null>(null);

  const issues = useGameStore((state) => state.issues);
  const game = useGameStore((state) => state.game);
  const allIssuesEstimated = useGameStore((state) => state.allIssuesEstimated);
  const averageConfidence = useGameStore((state) => state.averageConfidence);
  const isAdmin = useGameStore((state) => state.isAdmin);
  const currentPlayer = usePlayerStore((state) => state.currentPlayer);

  const currentIssueId = game?.current_issue_id;
  const canStartConfidenceVote = allIssuesEstimated() && issues.length > 0;
  const isPlayerAdmin = isAdmin(currentPlayer?.id ?? null);
  const confidenceAvg = averageConfidence();

  const totalPoints = issues.reduce((sum, issue) => sum + (issue.final_score || 0), 0);
  const votedCount = issues.filter((i) => i.status === "voted").length;

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim() || !currentPlayer?.id) return;

    setIsAddingIssue(true);
    try {
      await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          playerId: currentPlayer.id,
          title: newIssueTitle.trim(),
        }),
      });
      setNewIssueTitle("");
    } catch {
      // Realtime will sync
    } finally {
      setIsAddingIssue(false);
    }
  };

  const handleSelectIssue = async (issueId: string) => {
    if (issueId === currentIssueId || !isPlayerAdmin) return;
    try {
      await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentIssueId: issueId,
          status: "voting",
          playerId: currentPlayer?.id
        }),
      });
    } catch {
      // Silent
    }
  };

  const handleStartEdit = (issue: Issue) => {
    setEditingIssueId(issue.id);
    setEditingTitle(issue.title);
  };

  const handleSaveEdit = async () => {
    if (!editingIssueId || !editingTitle.trim() || !currentPlayer?.id) return;
    try {
      const res = await fetch(`/api/issues/${editingIssueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          playerId: currentPlayer.id,
          title: editingTitle.trim(),
        }),
      });
      if (res.ok) {
        // Update store directly for immediate feedback
        useGameStore.getState().updateIssue(editingIssueId, { title: editingTitle.trim() });
      }
    } catch {
      // Silent
    } finally {
      setEditingIssueId(null);
      setEditingTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingIssueId(null);
    setEditingTitle("");
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!currentPlayer?.id) return;
    try {
      const res = await fetch(
        `/api/issues/${issueId}?gameId=${gameId}&playerId=${currentPlayer.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        // Update store directly (Realtime DELETE may not include old.id)
        useGameStore.getState().removeIssue(issueId);
      }
    } catch {
      // Silent
    } finally {
      setDeletingIssueId(null);
    }
  };

  return (
    <div
      className={`
        bg-white border-l border-[var(--border)] flex-shrink-0 h-full
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? "w-80" : "w-0 border-l-0"}
      `}
    >
      {/* Inner wrapper with fixed width to prevent content collapse */}
      <div className="w-80 h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ListTodo size={20} />
              Issues
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">
                {votedCount}/{issues.length}
              </span>
              <button
                onClick={onClose}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            Total: <span className="font-mono font-bold text-[var(--primary)]">{totalPoints}</span> points
          </div>
        </div>

        {/* Add issue form (admin only) */}
        {isPlayerAdmin && (
          <form onSubmit={handleAddIssue} className="p-4 border-b border-[var(--border)]">
            <div className="flex gap-2">
              <Input
                placeholder="Add an issue..."
                value={newIssueTitle}
                onChange={(e) => setNewIssueTitle(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newIssueTitle.trim()}
                isLoading={isAddingIssue}
              >
                <Plus size={16} />
              </Button>
            </div>
          </form>
        )}

        {/* Issues list */}
        <div className="flex-1 overflow-y-auto p-2 bg-white">
          {issues.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              No issues yet. Add one above!
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  index={index + 1}
                  isCurrent={issue.id === currentIssueId}
                  isEditing={editingIssueId === issue.id}
                  editingTitle={editingTitle}
                  isDeleting={deletingIssueId === issue.id}
                  isAdmin={isPlayerAdmin}
                  onSelect={() => handleSelectIssue(issue.id)}
                  onStartEdit={() => handleStartEdit(issue)}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onEditTitleChange={setEditingTitle}
                  onDeleteClick={() => setDeletingIssueId(issue.id)}
                  onDeleteConfirm={() => handleDeleteIssue(issue.id)}
                  onDeleteCancel={() => setDeletingIssueId(null)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Confidence Vote Section */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-surface)]">
          {/* Average Confidence Display - only show after reveal */}
          {confidenceAvg !== null && game?.confidence_status === "revealed" && (
            <div className="mb-3 text-center">
              <span className="text-sm text-[var(--text-secondary)]">Team Confidence: </span>
              <span className="font-mono font-bold text-lg text-[var(--primary)]">
                {confidenceAvg.toFixed(1)}
              </span>
              <span className="text-sm text-[var(--text-secondary)]"> / 5</span>
            </div>
          )}

          {/* Confidence Vote Button */}
          <Button
            onClick={onConfidenceVote}
            disabled={!canStartConfidenceVote || !isPlayerAdmin}
            className={`w-full ${!canStartConfidenceVote || !isPlayerAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
            variant="secondary"
            title={
              !canStartConfidenceVote
                ? "Estimate all issues first"
                : !isPlayerAdmin
                ? "Only admin can start confidence vote"
                : "Start Confidence Vote"
            }
          >
            <Hand size={18} className="mr-2" />
            Confidence Vote
          </Button>

          {!canStartConfidenceVote && issues.length > 0 && (
            <p className="text-xs text-[var(--text-secondary)] text-center mt-2">
              Estimate all issues to unlock
            </p>
          )}
          {canStartConfidenceVote && !isPlayerAdmin && (
            <p className="text-xs text-[var(--text-secondary)] text-center mt-2">
              Only admin can start
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Issue card component
interface IssueCardProps {
  issue: Issue;
  index: number;
  isCurrent: boolean;
  isEditing: boolean;
  editingTitle: string;
  isDeleting: boolean;
  isAdmin: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTitleChange: (value: string) => void;
  onDeleteClick: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

function IssueCard({
  issue,
  index,
  isCurrent,
  isEditing,
  editingTitle,
  isDeleting,
  isAdmin,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTitleChange,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: IssueCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSaveEdit();
    else if (e.key === "Escape") onCancelEdit();
  };

  const statusBadge = () => {
    switch (issue.status) {
      case "voted":
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-[var(--success)]/10 text-[var(--success)] rounded">
            Voted
          </span>
        );
      case "voting":
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent)]/20 text-[var(--accent-hover)] rounded">
            Voting
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded">
            Pending
          </span>
        );
    }
  };

  if (isDeleting) {
    return (
      <div className="p-3 bg-[var(--danger)]/5 border border-[var(--danger)]/20 rounded-lg">
        <p className="text-sm text-[var(--text-primary)] mb-2">Delete "{issue.title}"?</p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onDeleteCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onDeleteConfirm}
            className="flex-1 bg-[var(--danger)] hover:bg-[var(--danger)]/90"
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`
        p-3 rounded-lg border cursor-pointer transition-all
        ${isCurrent
          ? "bg-[var(--primary-light)] border-[var(--primary)] shadow-sm"
          : "bg-white border-[var(--border)] hover:border-[var(--primary)]/50"
        }
      `}
    >
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 w-6 h-6 rounded bg-[var(--bg-surface)] text-xs font-mono font-bold flex items-center justify-center text-[var(--text-secondary)]">
          {index}
        </span>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                type="text"
                value={editingTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-2 py-1 text-sm border border-[var(--border)] rounded focus:outline-none focus:border-[var(--primary)]"
              />
              <button onClick={onSaveEdit} className="p-1 text-[var(--success)] hover:bg-[var(--success)]/10 rounded">
                <Check size={14} />
              </button>
              <button onClick={onCancelEdit} className="p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] rounded">
                <X size={14} />
              </button>
            </div>
          ) : (
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{issue.title}</p>
          )}
        </div>

        {issue.final_score !== null && (
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--primary)] text-white text-sm font-mono font-bold flex items-center justify-center">
            {issue.final_score}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        {statusBadge()}
        {!isEditing && isAdmin && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onStartEdit}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded transition-colors"
              title="Edit issue"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onDeleteClick}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded transition-colors"
              title="Delete issue"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
