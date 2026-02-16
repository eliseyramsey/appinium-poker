"use client";

import { useEffect } from "react";
import { TEAM_AVATARS } from "@/lib/constants";

// Floating cards with Fibonacci numbers for landing page decoration
const FLOATING_CARDS = [
  { value: "5", top: "18%", left: "8%", delay: 0, color: "primary" },
  { value: "8", top: "22%", right: "12%", delay: 2, color: "accent" },
  { value: "13", bottom: "25%", left: "12%", delay: 4, color: "primary" },
  { value: "21", bottom: "28%", right: "8%", delay: 6, color: "success" },
] as const;

// Floating team avatars for fun
const FLOATING_AVATARS = [
  { avatarIndex: 0, top: "35%", left: "5%", delay: 1 },
  { avatarIndex: 5, top: "12%", right: "25%", delay: 3 },
  { avatarIndex: 10, bottom: "15%", right: "18%", delay: 5 },
] as const;

type CardColor = "primary" | "accent" | "success";

const colorStyles: Record<CardColor, { borderColor: string; color: string }> = {
  primary: { borderColor: "#5533ff", color: "#5533ff" },
  accent: { borderColor: "#ffc107", color: "#ffc107" },
  success: { borderColor: "#28a745", color: "#28a745" },
};

export function FloatingCards() {
  // Inject keyframes animation into head
  useEffect(() => {
    const styleId = "float-card-animation";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes floatCard {
        0%, 100% {
          transform: translateY(0) rotate(-3deg);
        }
        50% {
          transform: translateY(-15px) rotate(3deg);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {/* Floating Cards */}
      {FLOATING_CARDS.map((card, index) => (
        <div
          key={`card-${index}`}
          style={{
            position: "absolute",
            top: card.top,
            bottom: card.bottom,
            left: card.left,
            right: card.right,
            width: 52,
            height: 72,
            backgroundColor: "white",
            border: `2px solid ${colorStyles[card.color].borderColor}`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: colorStyles[card.color].color,
            boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 0 40px rgba(85, 51, 255, 0.15)",
            animation: `floatCard 8s ease-in-out infinite`,
            animationDelay: `${card.delay}s`,
          }}
        >
          {card.value}
        </div>
      ))}

      {/* Floating Avatars */}
      {FLOATING_AVATARS.map((item, index) => {
        const avatar = TEAM_AVATARS[item.avatarIndex];
        return (
          <div
            key={`avatar-${index}`}
            style={{
              position: "absolute",
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "2px solid white",
              backgroundImage: `url(${avatar.src})`,
              backgroundSize: `${avatar.zoom}%`,
              backgroundPosition: `${avatar.x}% ${avatar.y}%`,
              backgroundRepeat: "no-repeat",
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              opacity: 0.85,
              animation: `floatCard 8s ease-in-out infinite`,
              animationDelay: `${item.delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
