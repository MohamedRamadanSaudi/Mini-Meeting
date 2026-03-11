import { SidebarPanel } from "../SidebarPanel";
import { AdminControls } from "../AdminControls";
import { LobbyPanel } from "../LobbyRequests/LobbyPanel";
import type { LobbyPendingEntry } from "../../../services/api/lobby.service";

interface AdminPanelProps {
  meetingCode: string;
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  onEndMeeting: () => void;
  lobbyRequests: LobbyPendingEntry[];
  lobbyRespondingTo: Set<string>;
  onLobbyRespond: (requestId: string, action: "approve" | "reject") => void;
  onLobbyAdmitAll: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  meetingCode,
  isAdmin,
  isOpen,
  onClose,
  onEndMeeting,
  lobbyRequests,
  lobbyRespondingTo,
  onLobbyRespond,
  onLobbyAdmitAll,
}) => {
  if (!isOpen) return null;

  return (
    <SidebarPanel title="Admin Controls" onClose={onClose}>
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {lobbyRequests.length > 0 && (
          <LobbyPanel
            requests={lobbyRequests}
            respondingTo={lobbyRespondingTo}
            onRespond={onLobbyRespond}
            onAdmitAll={onLobbyAdmitAll}
          />
        )}
        <AdminControls
          meetingCode={meetingCode}
          isAdmin={isAdmin}
          onEndMeeting={onEndMeeting}
        />
      </div>
    </SidebarPanel>
  );
};
