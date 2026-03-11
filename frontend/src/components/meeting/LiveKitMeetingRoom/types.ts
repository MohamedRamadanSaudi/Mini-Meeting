import type { DevicePreferences } from "../../../pages/MeetingLobby";

export interface LiveKitMeetingRoomProps {
  meetingCode: string;
  userName?: string;
  devicePreferences: DevicePreferences;
  token: string;
  livekitUrl: string;
  onDisconnect?: () => void;
  meetingId?: number;
}

export interface MeetingViewProps {
  meetingCode: string;
  isAdmin: boolean;
  meetingId?: number;
  onDisconnect?: () => void;
}

export interface MeetingContentProps extends MeetingViewProps {
  isAdminPanelOpen: boolean;
  setIsAdminPanelOpen: (open: boolean) => void;
}

export interface ChatButtonProps {
  isChatOpen: boolean;
  unreadCount: number;
  onToggle: () => void;
}

export interface ControlBarSectionProps {
  meetingId?: number;
  isAdmin: boolean;
  meetingCode: string;
  isChatOpen: boolean;
  unreadCount: number;
  onToggleChat: () => void;
}
