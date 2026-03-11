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
import { ParticipantsList } from "./ParticipantsList";

export const AdminControls: React.FC<AdminControlsProps> = ({
  meetingCode,
  isAdmin,
  onEndMeeting,
}) => {
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
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
      <div
        className="p-4 shrink-0"
        style={{ borderBottom: "1px solid var(--lk-border-color)" }}
      >
        <EndMeetingButton
          onEndMeeting={handleEndMeeting}
          isEndingMeeting={isEndingMeeting}
          showConfirm={showEndConfirm}
          onShowConfirm={setShowEndConfirm}
        />
      </div>

      <ParticipantsList
        participants={
          participants as Array<{
            identity: string;
            name?: string;
            metadata?: string;
          }>
        }
        localParticipantIdentity={localParticipant.identity}
        onKick={handleKickParticipant}
        onMuteTrack={handleMuteTrack}
      />
    </div>
  );
};
