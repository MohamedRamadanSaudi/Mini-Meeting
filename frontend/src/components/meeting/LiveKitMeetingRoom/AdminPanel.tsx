import { SidebarPanel } from "../SidebarPanel";
import { AdminControls } from "../AdminControls";
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
    <SidebarPanel title="People" onClose={onClose}>
      <AdminControls
        meetingCode={meetingCode}
        isAdmin={isAdmin}
        onEndMeeting={onEndMeeting}
        lobbyRequests={lobbyRequests}
        lobbyRespondingTo={lobbyRespondingTo}
        onLobbyRespond={onLobbyRespond}
        onLobbyAdmitAll={onLobbyAdmitAll}
      />
    </SidebarPanel>
  );
};
