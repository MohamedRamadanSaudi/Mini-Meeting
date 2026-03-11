import React, { useState, useCallback } from "react";
import {
  RoomAudioRenderer,
  useTracks,
  useParticipants,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { MeetingHeader } from "../MeetingHeader";
import { VideoSection } from "./VideoSection";
import { useMeetingChat } from "./useMeetingChat";
import { useLobbyWebSocket } from "../LobbyRequests/useLobbyWebSocket";
import { useNotificationSound } from "../LobbyRequests/useNotificationSound";
import type { MeetingContentProps } from "./types";

export const MeetingContent: React.FC<MeetingContentProps> = ({
  meetingCode,
  isAdmin,
  meetingId,
  onDisconnect,
  isAdminPanelOpen,
  setIsAdminPanelOpen,
}) => {
  const participants = useParticipants();
  const { isChatOpen, setIsChatOpen, unreadCount } = useMeetingChat();
  const [respondingTo, setRespondingTo] = useState<Set<string>>(new Set());
  const playNotificationSound = useNotificationSound();
  const handleNewRequest = useCallback(() => {
    playNotificationSound();
  }, [playNotificationSound]);
  const {
    requests: lobbyRequests,
    setRequests: setLobbyRequests,
    sendJsonMessage,
  } = useLobbyWebSocket(meetingCode, isAdmin, handleNewRequest);
  const pendingLobbyCount = lobbyRequests.length;

  const handleLobbyRespond = (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    setRespondingTo((prev) => new Set(prev).add(requestId));
    sendJsonMessage({ type: "respond", request_id: requestId, action });
    setLobbyRequests((prev) => prev.filter((r) => r.request_id !== requestId));
    setRespondingTo((prev) => {
      const next = new Set(prev);
      next.delete(requestId);
      return next;
    });
  };

  const handleLobbyAdmitAll = () => {
    for (const req of lobbyRequests) {
      handleLobbyRespond(req.request_id, "approve");
    }
  };

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const hasScreenShare = tracks.some(
    (track) => track.source === Track.Source.ScreenShare,
  );

  const toggleAdmin = () => {
    if (isAdminPanelOpen) {
      setIsAdminPanelOpen(false);
    } else {
      setIsChatOpen(false);
      setIsAdminPanelOpen(true);
    }
  };

  const toggleChat = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
    } else {
      setIsAdminPanelOpen(false);
      setIsChatOpen(true);
    }
  };

  return (
    <>
      <RoomAudioRenderer />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <MeetingHeader
          isAdmin={isAdmin}
          isAdminPanelOpen={isAdminPanelOpen}
          participants={participants}
          onAdminToggle={toggleAdmin}
          pendingLobbyCount={pendingLobbyCount}
        />
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <VideoSection
            tracks={tracks}
            hasScreenShare={hasScreenShare}
            meetingCode={meetingCode}
            isAdmin={isAdmin}
            meetingId={meetingId}
            isChatOpen={isChatOpen}
            isAdminPanelOpen={isAdminPanelOpen}
            unreadCount={unreadCount}
            onToggleChat={toggleChat}
            onToggleAdmin={toggleAdmin}
            onChatClose={() => setIsChatOpen(false)}
            onAdminClose={() => setIsAdminPanelOpen(false)}
            onEndMeeting={() => onDisconnect?.()}
            lobbyRequests={lobbyRequests}
            lobbyRespondingTo={respondingTo}
            onLobbyRespond={handleLobbyRespond}
            onLobbyAdmitAll={handleLobbyAdmitAll}
          />
        </div>
      </div>
    </>
  );
};
