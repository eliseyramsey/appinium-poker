"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Meme } from "./memeData";

interface MemeOverlayProps {
  meme: Meme | null;
  onClose: () => void;
  autoCloseDelay?: number; // ms, 0 to disable
}

export function MemeOverlay({ meme, onClose, autoCloseDelay = 5000 }: MemeOverlayProps) {
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState(autoCloseDelay > 0 ? Math.ceil(autoCloseDelay / 1000) : 0);

  // Auto-close timer
  useEffect(() => {
    if (!meme || autoCloseDelay <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [meme, autoCloseDelay, onClose]);

  // Reset error state when meme changes
  useEffect(() => {
    setImageError(false);
    setCountdown(autoCloseDelay > 0 ? Math.ceil(autoCloseDelay / 1000) : 0);
  }, [meme, autoCloseDelay]);

  if (!meme) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Countdown badge */}
        {countdown > 0 && (
          <div className="absolute -top-3 -left-3 w-10 h-10 bg-[var(--primary)] text-white rounded-full shadow-lg flex items-center justify-center font-bold z-10">
            {countdown}
          </div>
        )}

        {/* Meme image */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          {imageError ? (
            <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-[var(--primary-light)] to-[var(--bg-surface)]">
              <div className="text-center px-8">
                <div className="text-8xl mb-6">{meme.caption?.split(" ")[0] || "🎲"}</div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {meme.caption || meme.alt}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-4">
                  Добавь мемы в public/memes/
                </p>
              </div>
            </div>
          ) : (
            <img
              src={meme.src}
              alt={meme.alt}
              className="w-full h-auto max-h-[70vh] object-contain"
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Click hint */}
        <p className="text-center text-white/70 text-sm mt-4">
          Кликни чтобы закрыть
        </p>
      </div>
    </div>
  );
}
