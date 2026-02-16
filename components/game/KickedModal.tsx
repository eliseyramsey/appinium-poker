"use client";

import { UserX } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface KickedModalProps {
  isOpen: boolean;
  onRejoin: () => void;
}

export function KickedModal({ isOpen, onRejoin }: KickedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-[var(--danger)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserX size={32} className="text-[var(--danger)]" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          {"\u0412\u0430\u0441 \u0443\u0434\u0430\u043B\u0438\u043B\u0438 \u0438\u0437 \u0438\u0433\u0440\u044B"}
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          {"\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0443\u0434\u0430\u043B\u0438\u043B \u0432\u0430\u0441 \u0438\u0437 \u044D\u0442\u043E\u0439 \u0441\u0435\u0441\u0441\u0438\u0438"}
        </p>
        <Button onClick={onRejoin}>
          {"\u041F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C\u0441\u044F \u0441\u043D\u043E\u0432\u0430"}
        </Button>
      </div>
    </div>
  );
}
