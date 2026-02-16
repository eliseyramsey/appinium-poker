"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Check, PanelRightOpen, PanelRightClose, LogOut, User, ImageIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { DEFAULT_GAME_NAME } from "@/lib/constants";

interface GameHeaderProps {
  gameId: string;
  currentPlayer: { id: string; name: string; avatar: string | null };
  currentIssueTitle: string | null;
  isAdmin: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLeaveGame: () => void;
  onOpenNameModal: () => void;
  onOpenAvatarModal: () => void;
}

export function GameHeader({
  gameId,
  currentPlayer,
  currentIssueTitle,
  isAdmin,
  sidebarOpen,
  onToggleSidebar,
  onLeaveGame,
  onOpenNameModal,
  onOpenAvatarModal,
}: GameHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showProfileMenu]);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/game/${gameId}/join`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-white border-b border-[var(--border)] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Logo + Game Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white text-xl">
            {"\uD83C\uDCCF"}
          </div>
          <div className="px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg text-sm font-medium text-[var(--text-primary)]">
            {currentIssueTitle || DEFAULT_GAME_NAME}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Admin badge */}
          {isAdmin && (
            <span className="px-2 py-1 text-xs font-medium bg-[var(--accent)]/20 text-[var(--accent-hover)] rounded">
              {"\uD83D\uDC51"} Admin
            </span>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Invite"}
          </Button>

          {/* User pill with dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface)] rounded-full hover:bg-[var(--border)] transition-colors"
            >
              <Avatar src={currentPlayer.avatar} size={28} />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {currentPlayer.name}
              </span>
              <ChevronDown size={14} className={`text-[var(--text-secondary)] transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[var(--border)] py-1 z-50">
                <button
                  onClick={() => {
                    onOpenNameModal();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <User size={16} />
                  Change Name
                </button>
                <button
                  onClick={() => {
                    onOpenAvatarModal();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <ImageIcon size={16} />
                  Change Avatar
                </button>
              </div>
            )}
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
            title={sidebarOpen ? "Hide Issues" : "Show Issues"}
          >
            {sidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>

          {/* Leave game */}
          <button
            onClick={onLeaveGame}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors"
            title="Leave Game"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
