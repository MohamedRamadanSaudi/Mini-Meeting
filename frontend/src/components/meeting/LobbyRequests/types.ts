import type { LobbyPendingEntry } from "../../../services/api/lobby.service";

export interface LobbyRequestsProps {
  meetingCode: string;
  isAdmin: boolean;
  onPendingCountChange?: (count: number) => void;
}

export interface RequestItemProps {
  request: LobbyPendingEntry;
  isLoading: boolean;
  onRespond: (requestId: string, action: "approve" | "reject") => void;
}

export interface LobbyPanelProps {
  requests: LobbyPendingEntry[];
  respondingTo: Set<string>;
  onRespond: (requestId: string, action: "approve" | "reject") => void;
  onAdmitAll: () => void;
}

export interface NotificationToastProps {
  show: boolean;
}
