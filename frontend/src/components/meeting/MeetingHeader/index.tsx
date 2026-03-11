import React from "react";
import { Participant } from "livekit-client";
import { useParticipantAvatars } from "./useParticipantAvatars";
import { AdminButton } from "./AdminButton";

interface MeetingHeaderProps {
  isAdmin: boolean;
  isAdminPanelOpen: boolean;
  participants: Participant[];
  onAdminToggle: () => void;
  pendingLobbyCount?: number;
}

/**
 * Meeting Header Component
 * Clean component for top header bar with Admin controls
 */
export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  isAdmin,
  isAdminPanelOpen,
  participants,
  onAdminToggle,
  pendingLobbyCount = 0,
}) => {
  const participantAvatars = useParticipantAvatars(participants);
  const participantCount = participants.length;

  return (
    <div className="flex items-center justify-end px-2 py-1 bg-(--lk-bg2) border-b border-(--lk-border-color) gap-2 min-h-8 shrink-0 md:py-0.5 max-[480px]:px-1.5 max-[480px]:py-0.5 max-[480px]:min-h-7">
      {/* Bell icon — shown to admin when there are pending lobby requests */}
      {isAdmin && pendingLobbyCount > 0 && (
        <button
          className={`lk-button relative flex items-center justify-center w-8 h-8 min-h-8 rounded-2xl border border-(--lk-border-color) shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-(--lk-fg) md:w-7 md:h-7 md:min-h-7 md:rounded-[14px] max-[480px]:w-6 max-[480px]:h-6 max-[480px]:min-h-6 max-[480px]:rounded-xl ${isAdminPanelOpen ? "bg-(--lk-accent)" : "bg-(--lk-bg2)"}`}
          onClick={onAdminToggle}
          title={`${pendingLobbyCount} pending request${pendingLobbyCount > 1 ? "s" : ""}`}
          aria-label={`Open admin panel — ${pendingLobbyCount} pending request${pendingLobbyCount > 1 ? "s" : ""}`}
        >
          <svg
            className="w-4 h-4 md:w-3.5 md:h-3.5 max-[480px]:w-3 max-[480px]:h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {/* Badge */}
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {pendingLobbyCount > 9 ? "9+" : pendingLobbyCount}
          </span>
        </button>
      )}

      {/* Admin Button - Google Meet Style */}
      {isAdmin && (
        <AdminButton
          isOpen={isAdminPanelOpen}
          avatars={participantAvatars}
          participantCount={participantCount}
          onToggle={onAdminToggle}
        />
      )}
    </div>
  );
};
