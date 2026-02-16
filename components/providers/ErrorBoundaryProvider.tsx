"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import type { ReactNode } from "react";

export function ErrorBoundaryProvider({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
