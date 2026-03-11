import React from "react";
import type { ParticipantItemProps } from "./types";
import { TrackControls } from "./TrackControls";
import { KickIcon } from "./icons";

export const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isLocal,
  role,
  onKick,
  onMuteTrack,
}) => {
  let avatar = "";
  try {
    const meta = participant.metadata
      ? JSON.parse(participant.metadata as string)
      : null;
    avatar = meta?.avatar || "";
  } catch {
    /* ignore */
  }

  const initials =
    (participant.name || participant.identity)?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className="rounded-md p-3 flex flex-col gap-2"
      style={{
        background: "var(--lk-bg)",
        border: "1px solid var(--lk-border-color)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full border border-(--lk-border-color) bg-(--lk-bg3) overflow-hidden flex items-center justify-center text-xs font-semibold text-(--lk-fg) shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={participant.name || participant.identity}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-white text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap m-0">
                {participant.name || participant.identity}
              </p>
              {isLocal && (
                <span className="text-[10px] px-1.5 py-0.5 rounded text-green-400 bg-green-400/20 font-medium">
                  You
                </span>
              )}
              {role === "admin" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded text-blue-400 bg-blue-400/20 font-medium">
                  Admin
                </span>
              )}
            </div>
            <p className="text-[11px] m-0" style={{ color: "var(--lk-fg2)" }}>
              {role}
            </p>
          </div>
        </div>
        {!isLocal && (
          <button
            onClick={onKick}
            title="Kick participant"
            className="p-1.5 text-red-400 bg-transparent rounded transition-colors cursor-pointer flex items-center justify-center hover:bg-(--lk-bg3)"
          >
            <KickIcon />
          </button>
        )}
      </div>

      <TrackControls
        participant={participant}
        isLocal={isLocal}
        onMuteTrack={onMuteTrack}
      />
    </div>
  );
};
