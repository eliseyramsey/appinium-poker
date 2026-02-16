"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { TEAM_AVATARS } from "@/lib/constants";

interface ProfileModalsProps {
  currentPlayer: { id: string; name: string; avatar: string | null };
  takenAvatars: (string | null)[];

  // Name modal
  showNameModal: boolean;
  newName: string;
  onNameChange: (name: string) => void;
  onSaveName: () => void;
  onCloseNameModal: () => void;

  // Avatar modal
  showAvatarModal: boolean;
  onSelectAvatar: (src: string) => void;
  onCloseAvatarModal: () => void;

  isUpdating: boolean;
}

export function ProfileModals({
  currentPlayer,
  takenAvatars,
  showNameModal,
  newName,
  onNameChange,
  onSaveName,
  onCloseNameModal,
  showAvatarModal,
  onSelectAvatar,
  onCloseAvatarModal,
  isUpdating,
}: ProfileModalsProps) {
  return (
    <>
      {/* Change Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Change Name
            </h2>
            <Input
              value={newName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter new name"
              className="mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveName();
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={onSaveName}
                disabled={!newName.trim() || newName.trim() === currentPlayer.name}
                isLoading={isUpdating}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                variant="secondary"
                onClick={onCloseNameModal}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Change Avatar
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Select a new avatar ({TEAM_AVATARS.length - takenAvatars.length} available)
            </p>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {TEAM_AVATARS.map((avatar) => {
                const isTaken = takenAvatars.includes(avatar.src);
                const isSelected = currentPlayer.avatar === avatar.src;
                if (isTaken) return null;
                return (
                  <button
                    key={avatar.src}
                    onClick={() => !isSelected && onSelectAvatar(avatar.src)}
                    disabled={isUpdating}
                    className={`
                      relative w-[72px] h-[72px] rounded-full overflow-hidden
                      transition-all duration-200
                      ${isSelected
                        ? "ring-3 ring-[var(--primary)] ring-offset-2"
                        : "hover:ring-2 hover:ring-[var(--primary)] hover:ring-offset-2"
                      }
                      disabled:opacity-50
                    `}
                  >
                    <Avatar src={avatar.src} size={72} />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[var(--primary)]/20 flex items-center justify-center">
                        <Check size={24} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={onCloseAvatarModal}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
