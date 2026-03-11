import React from "react";
import type { ParticipantsListProps } from "./types";
import { ParticipantItem } from "./ParticipantItem";

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  localParticipantIdentity,
  onKick,
  onMuteTrack,
}) => {
  return (
    <div
      className="participants-list flex-1 overflow-y-auto p-4"
      style={{ background: "var(--lk-bg2)" }}
    >
      <h4
        className="text-xs mb-3 font-medium"
        style={{ color: "var(--lk-fg2)" }}
      >
        Participants ({participants.length})
      </h4>
      <div className="flex flex-col gap-2">
        {participants.map((participant) => {
          const isLocal = participant.identity === localParticipantIdentity;
          const metadata = participant.metadata
            ? JSON.parse(participant.metadata as string)
            : {};
          const role = metadata.role || "guest";

          return (
            <ParticipantItem
              key={participant.identity}
              participant={participant}
              isLocal={isLocal}
              role={role}
              onKick={() => onKick(participant.identity)}
              onMuteTrack={(trackSid, muted) =>
                onMuteTrack(participant.identity, trackSid, muted)
              }
            />
          );
        })}
      </div>
    </div>
  );
};
