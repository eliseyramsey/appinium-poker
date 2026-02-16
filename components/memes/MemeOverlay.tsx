"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Meme } from "./memeData";

interface MemeOverlayProps {
  meme: Meme | null;
  onClose: () => void;
  autoCloseDelay?: number; // ms, 0 to disable
}

export function MemeOverlay({ meme, onClose, autoCloseDelay = 4000 }: MemeOverlayProps) {
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState(autoCloseDelay > 0 ? Math.ceil(autoCloseDelay / 1000) : 0);
  const [isExiting, setIsExiting] = useState(false);

  // Handle close with exit animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 200);
  };

  // Auto-close timer
  useEffect(() => {
    if (!meme || autoCloseDelay <= 0 || isExiting) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [meme, autoCloseDelay, isExiting]);

  // Reset state when meme changes
  useEffect(() => {
    setImageError(false);
    setIsExiting(false);
    setCountdown(autoCloseDelay > 0 ? Math.ceil(autoCloseDelay / 1000) : 0);
  }, [meme, autoCloseDelay]);

  if (!meme) return null;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 max-w-sm w-full
        transition-transform duration-200 ease-out
        ${isExiting ? "translate-x-[120%]" : "translate-x-0 animate-in slide-in-from-right duration-300"}
      `}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Countdown badge */}
        {countdown > 0 && (
          <div className="absolute top-2 left-2 w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
            {countdown}
          </div>
        )}

        {/* Meme image */}
        {imageError ? (
          <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-[var(--primary-light)] to-[var(--bg-surface)]">
            <div className="text-center px-4">
              <div className="text-5xl mb-3">{meme.caption?.split(" ")[0] || "🎲"}</div>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {meme.caption || meme.alt}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Добавь мемы в public/memes/
              </p>
            </div>
          </div>
        ) : (
          <img
            src={meme.src}
            alt={meme.alt}
            className="w-full h-auto max-h-64 object-contain"
            onError={() => setImageError(true)}
          />
        )}
      </div>
    </div>
  );
}
