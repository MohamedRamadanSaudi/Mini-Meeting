import type { LobbyPendingEntry } from "../../../services/api/lobby.service";

export interface AdminControlsProps {
  meetingCode: string;
  isAdmin: boolean;
  onEndMeeting: () => void;
  lobbyRequests?: LobbyPendingEntry[];
  lobbyRespondingTo?: Set<string>;
  onLobbyRespond?: (requestId: string, action: "approve" | "reject") => void;
  onLobbyAdmitAll?: () => void;
}

export interface ParticipantItemProps {
  participant: {
    identity: string;
    name?: string;
    [key: string]: unknown;
  };
  isLocal: boolean;
  role: string;
  onKick: () => void;
  onMuteTrack: (trackSid: string, muted: boolean) => void;
}

export interface EndMeetingButtonProps {
  onEndMeeting: () => Promise<void>;
  isEndingMeeting: boolean;
  showConfirm: boolean;
  onShowConfirm: (show: boolean) => void;
}

export interface TrackControlsProps {
  participant: {
    identity: string;
    [key: string]: unknown;
  };
  isLocal: boolean;
  onMuteTrack: (trackSid: string, muted: boolean) => void;
}

export interface ParticipantsListProps {
  participants: Array<{
    identity: string;
    name?: string;
    metadata?: string;
    [key: string]: unknown;
  }>;
  localParticipantIdentity: string;
  onKick: (identity: string) => void;
  onMuteTrack: (identity: string, trackSid: string, muted: boolean) => void;
}
