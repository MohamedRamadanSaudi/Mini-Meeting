import React, { useState, useCallback } from "react";
import { useRoomContext } from "@livekit/components-react";
import { LeaveIcon } from "./Icons";
import { useOutsideClick } from "./useOutsideClick";
import { endMeeting } from "../../../services/api/livekit";

interface LeaveButtonProps {
  isAdmin: boolean;
  meetingCode: string;
}

export const LeaveButton: React.FC<LeaveButtonProps> = ({
  isAdmin,
  meetingCode,
}) => {
  const room = useRoomContext();
  const [showMenu, setShowMenu] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const closeMenu = useCallback(() => {
    setShowMenu(false);
    setShowEndConfirm(false);
  }, []);

  const containerRef = useOutsideClick(closeMenu);

  const handleLeave = () => room?.disconnect();

  const handleEndForAll = async () => {
    if (!showEndConfirm) {
      setShowEndConfirm(true);
      return;
    }
    setIsEnding(true);
    try {
      await endMeeting(meetingCode);
      room?.disconnect();
    } catch {
      alert("Failed to end meeting");
      setIsEnding(false);
    }
  };

  if (!isAdmin) {
    return (
      <button
        className="lk-button lk-disconnect-button bg-(--lk-danger-color,#dc2626) text-white flex items-center justify-center min-w-12 min-h-12"
        onClick={handleLeave}
        title="Leave Meeting"
      >
        <LeaveIcon />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        className="lk-button lk-disconnect-button bg-(--lk-danger-color,#dc2626) text-white flex items-center justify-center min-w-12 min-h-12"
        onClick={() => setShowMenu((v) => !v)}
        title="Leave or End Meeting"
      >
        <LeaveIcon />
      </button>

      {showMenu && (
        <div
          className="absolute bottom-full mb-2 right-0 w-56 rounded-xl overflow-hidden shadow-2xl border border-(--lk-border-color) z-50"
          style={{ background: "var(--lk-bg2)" }}
        >
          {/* Leave just me */}
          <button
            onClick={handleLeave}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-(--lk-bg3) transition-colors text-left cursor-pointer"
          >
            <LeaveIcon />
            <span>Leave Meeting</span>
          </button>

          <div style={{ borderTop: "1px solid var(--lk-border-color)" }} />

          {/* End for all */}
          {showEndConfirm ? (
            <div className="p-3 flex flex-col gap-2">
              <p className="text-xs text-yellow-400 m-0">
                This will disconnect all participants.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleEndForAll}
                  disabled={isEnding}
                  className="flex-1 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isEnding ? "Ending..." : "Confirm"}
                </button>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  disabled={isEnding}
                  className="flex-1 py-1.5 text-xs rounded-md transition-colors disabled:opacity-60 cursor-pointer"
                  style={{
                    background: "var(--lk-bg3)",
                    color: "var(--lk-fg)",
                    border: "1px solid var(--lk-border-color)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleEndForAll}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-600/20 transition-colors text-left cursor-pointer"
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>End for All</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
