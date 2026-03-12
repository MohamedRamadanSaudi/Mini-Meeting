import React from "react";
import {
  useEnsureTrackRef,
  ParticipantTile,
  useIsSpeaking,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Pin } from "lucide-react";
import { useParticipantData } from "./useParticipantData";
import { AvatarDisplay } from "./AvatarDisplay";
import { ParticipantInfo } from "./ParticipantInfo";
import { usePinContext } from "../LiveKitMeetingRoom/PinContext";

export const CustomParticipantTile: React.FC = () => {
  const trackRef = useEnsureTrackRef();
  const { participant, avatarUrl } = useParticipantData();
  const isSpeaking = useIsSpeaking(participant);
  const { pinnedIdentity, setPinnedIdentity } = usePinContext();

  const isCameraTrack = trackRef?.source === Track.Source.Camera;
  const isScreenShare = trackRef?.source === Track.Source.ScreenShare;
  const hasVideo =
    isCameraTrack &&
    trackRef?.publication?.isSubscribed &&
    !trackRef?.publication?.isMuted;
  const showAvatar = isCameraTrack && !hasVideo;

  const isPinned = participant?.identity === pinnedIdentity;

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!participant) return;
    setPinnedIdentity(isPinned ? null : participant.identity);
  };

  return (
    <div
      className="group"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        border: isSpeaking ? "3px solid #3b82f6" : "3px solid transparent",
        boxShadow: isSpeaking
          ? "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)"
          : "none",
        transition: "all 0.05s ease-out",
      }}
    >
      <ParticipantTile />
      {/* Pin button — visible on hover, always visible (blue) when pinned, hidden for screen share */}
      {participant && !isScreenShare && (
        <button
          onClick={handlePinToggle}
          title={isPinned ? "Unpin" : "Pin"}
          className={`absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 rounded-lg transition-opacity cursor-pointer backdrop-blur-sm border ${
            isPinned
              ? "opacity-100 bg-blue-500/80 border-blue-400/60 text-white"
              : "opacity-0 group-hover:opacity-100 bg-black/60 hover:bg-black/80 border-white/20 text-white"
          }`}
        >
          <Pin className={`w-4 h-4 ${isPinned ? "fill-current" : ""}`} />
        </button>
      )}
      {showAvatar && participant && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--lk-bg2)",
            zIndex: 1,
            borderRadius: "12px",
          }}
        >
          <AvatarDisplay
            avatarUrl={avatarUrl}
            participantName={participant.name || ""}
          />
          <ParticipantInfo participant={participant} />
        </div>
      )}
    </div>
  );
};
