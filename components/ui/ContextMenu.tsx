"use client";

import { useEffect, useRef } from "react";
import { UserMinus, Eye, Crown } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onKick: () => void;
  onMakeSpectator: () => void;
  onTransferAdmin: () => void;
  isSpectator: boolean;
  isLoading?: boolean;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onKick,
  onMakeSpectator,
  onTransferAdmin,
  isSpectator,
  isLoading = false,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 150);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-[var(--border)] py-1 min-w-[180px]"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <button
        onClick={onMakeSpectator}
        disabled={isLoading}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
      >
        <Eye size={16} />
        {isSpectator ? "Make Voter" : "Make Spectator"}
      </button>

      <button
        onClick={onTransferAdmin}
        disabled={isLoading}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50"
      >
        <Crown size={16} />
        Transfer Admin
      </button>

      <div className="h-px bg-[var(--border)] my-1" />

      <button
        onClick={onKick}
        disabled={isLoading}
        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors disabled:opacity-50"
      >
        <UserMinus size={16} />
        Kick Player
      </button>
    </div>
  );
}
