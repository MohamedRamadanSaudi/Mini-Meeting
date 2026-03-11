import React, { useState } from "react";
import {
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";
import {
  removeParticipant,
  muteParticipant,
  endMeeting,
} from "../../../services/api/livekit";
import type { AdminControlsProps } from "./types";
import { EndMeetingButton } from "./EndMeetingButton";
import { ParticipantItem } from "./ParticipantItem";
import { RequestItem } from "../LobbyRequests/RequestItem";

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    style={{ color: "var(--lk-fg2)" }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const AdminControls: React.FC<AdminControlsProps> = ({
  meetingCode,
  isAdmin,
  onEndMeeting,
  lobbyRequests = [],
  lobbyRespondingTo = new Set(),
  onLobbyRespond,
  onLobbyAdmitAll,
}) => {
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [lobbyOpen, setLobbyOpen] = useState(true);
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  if (!isAdmin) return null;

  const handleKickParticipant = async (identity: string) => {
    try {
      await removeParticipant(meetingCode, identity);
    } catch (error) {
      console.error("Failed to kick participant:", error);
      alert("Failed to kick participant");
    }
  };

  const handleMuteTrack = async (
    identity: string,
    trackSid: string,
    muted: boolean,
  ) => {
    try {
      await muteParticipant(meetingCode, identity, trackSid, muted);
    } catch (error) {
      console.error("Failed to mute participant:", error);
      alert("Failed to mute participant");
    }
  };

  const handleEndMeeting = async () => {
    setIsEndingMeeting(true);
    try {
      await endMeeting(meetingCode);
      onEndMeeting();
    } catch (error) {
      console.error("Failed to end meeting:", error);
      alert("Failed to end meeting");
      setIsEndingMeeting(false);
    }
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{ background: "var(--lk-bg2)" }}
    >
      {/* Unified scrollable people list */}
      <div className="participants-list flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-3">
        {/* ── Waiting to join ── */}
        {lobbyRequests.length > 0 && (
          <div>
            <button
              className="flex items-center justify-between w-full py-2 px-1 cursor-pointer"
              onClick={() => setLobbyOpen((v) => !v)}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--lk-fg2)" }}
              >
                Waiting to join ({lobbyRequests.length})
              </span>
              <div className="flex items-center gap-2">
                {lobbyRequests.length > 1 && lobbyOpen && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLobbyAdmitAll?.();
                    }}
                    className="text-[11px] px-2.5 py-0.5 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-colors cursor-pointer"
                  >
                    Admit all
                  </button>
                )}
                <ChevronIcon open={lobbyOpen} />
              </div>
            </button>
            {lobbyOpen && (
              <div className="flex flex-col gap-1.5 mt-1">
                {lobbyRequests.map((req) => (
                  <RequestItem
                    key={req.request_id}
                    request={req}
                    isLoading={lobbyRespondingTo.has(req.request_id)}
                    onRespond={(id, action) => onLobbyRespond?.(id, action)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── In the meeting ── */}
        <div>
          <button
            className="flex items-center justify-between w-full py-2 px-1 cursor-pointer"
            onClick={() => setParticipantsOpen((v) => !v)}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--lk-fg2)" }}
            >
              In the meeting ({participants.length})
            </span>
            <ChevronIcon open={participantsOpen} />
          </button>
          {participantsOpen && (
            <div className="flex flex-col gap-2 mt-1">
              {participants.map((participant) => {
                const isLocal =
                  participant.identity === localParticipant.identity;
                const metadata = participant.metadata
                  ? JSON.parse(participant.metadata as string)
                  : {};
                const role = metadata.role || "guest";
                return (
                  <ParticipantItem
                    key={participant.identity}
                    participant={
                      participant as unknown as {
                        identity: string;
                        name?: string;
                        metadata?: string;
                        [key: string]: unknown;
                      }
                    }
                    isLocal={isLocal}
                    role={role}
                    onKick={() => handleKickParticipant(participant.identity)}
                    onMuteTrack={(trackSid, muted) =>
                      handleMuteTrack(participant.identity, trackSid, muted)
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* End meeting button pinned at bottom */}
      <div
        className="p-4 shrink-0"
        style={{ borderTop: "1px solid var(--lk-border-color)" }}
      >
        <EndMeetingButton
          onEndMeeting={handleEndMeeting}
          isEndingMeeting={isEndingMeeting}
          showConfirm={showEndConfirm}
          onShowConfirm={setShowEndConfirm}
        />
      </div>
    </div>
  );
};
