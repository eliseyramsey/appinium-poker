"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GameNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-surface)] flex items-center justify-center">
          <FileQuestion size={48} className="text-[var(--text-secondary)]" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Game Not Found
        </h1>

        {/* Description */}
        <p className="text-[var(--text-secondary)] mb-8">
          This game doesn&apos;t exist or has been deleted.
        </p>

        {/* Back button */}
        <Link href="/">
          <Button size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
