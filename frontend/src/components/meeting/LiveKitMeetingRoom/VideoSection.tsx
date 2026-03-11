import { VideoLayout } from "./VideoLayout";
import { AdminPanel } from "./AdminPanel";
import { ChatPanel } from "./ChatPanel";
import { ControlBarSection } from "./ControlBarSection";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import type { LobbyPendingEntry } from "../../../services/api/lobby.service";

interface VideoSectionProps {
  tracks: TrackReferenceOrPlaceholder[];
  hasScreenShare: boolean;
  meetingCode: string;
  isAdmin: boolean;
  meetingId: number | undefined;
  isChatOpen: boolean;
  isAdminPanelOpen: boolean;
  unreadCount: number;
  onToggleChat: () => void;
  onToggleAdmin: () => void;
  onChatClose: () => void;
  onAdminClose: () => void;
  onEndMeeting: () => void;
  lobbyRequests: LobbyPendingEntry[];
  lobbyRespondingTo: Set<string>;
  onLobbyRespond: (requestId: string, action: "approve" | "reject") => void;
  onLobbyAdmitAll: () => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  tracks,
  hasScreenShare,
  meetingCode,
  isAdmin,
  meetingId,
  isChatOpen,
  isAdminPanelOpen,
  unreadCount,
  onToggleChat,
  onChatClose,
  onAdminClose,
  onEndMeeting,
  lobbyRequests,
  lobbyRespondingTo,
  onLobbyRespond,
  onLobbyAdmitAll,
}) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      overflow: "hidden",
    }}
  >
    <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div
        className="lk-video-conference-inner"
        style={{ flex: 1, minWidth: 0 }}
      >
        <div className="lk-grid-layout-wrapper" style={{ height: "100%" }}>
          <VideoLayout tracks={tracks} hasScreenShare={hasScreenShare} />
        </div>
      </div>

      <AdminPanel
        meetingCode={meetingCode}
        isAdmin={isAdmin}
        isOpen={isAdminPanelOpen}
        onClose={onAdminClose}
        onEndMeeting={onEndMeeting}
        lobbyRequests={lobbyRequests}
        lobbyRespondingTo={lobbyRespondingTo}
        onLobbyRespond={onLobbyRespond}
        onLobbyAdmitAll={onLobbyAdmitAll}
      />

      <ChatPanel isOpen={isChatOpen} onClose={onChatClose} />
    </div>

    <ControlBarSection
      meetingId={meetingId}
      isAdmin={isAdmin}
      isChatOpen={isChatOpen}
      unreadCount={unreadCount}
      onToggleChat={onToggleChat}
    />
  </div>
);
