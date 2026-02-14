import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-surface)]">
      <div className="text-center max-w-md mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary-light)] text-[var(--primary)] rounded-full text-sm font-medium mb-6">
          <span>🃏</span>
          <span>Planning Poker</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Appinium Poker
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-[var(--text-secondary)] mb-8">
          Estimate stories with your team in real-time
        </p>

        {/* CTA Button */}
        <Link
          href="/create"
          className="
            inline-flex items-center gap-2
            px-8 py-4
            bg-[var(--primary)] text-white
            text-lg font-semibold
            rounded-xl
            shadow-lg shadow-[var(--primary)]/25
            hover:bg-[var(--primary-hover)]
            hover:shadow-xl hover:shadow-[var(--primary)]/30
            hover:-translate-y-0.5
            transition-all duration-200
          "
        >
          <span>🎮</span>
          <span>Start New Game</span>
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary)] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[var(--accent)] opacity-5 rounded-full blur-3xl pointer-events-none" />
    </main>
  );
}
