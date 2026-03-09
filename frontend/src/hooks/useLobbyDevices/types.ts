export interface LobbyDeviceState {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  selectedCamera: string;
  selectedMic: string;
  selectedSpeaker: string;
  setSelectedCamera: (id: string) => void;
  setSelectedMic: (id: string) => void;
  setSelectedSpeaker: (id: string) => void;
  cameraEnabled: boolean;
  micEnabled: boolean;
  stream: MediaStream | null;
  permissionsGranted: boolean;
  listenerMode: boolean;
  showPermissionButton: boolean;
  showPermissionPrompt: boolean;
  audioLevel: number;
  error: string;
  deviceError: "access-denied" | "not-found" | "generic" | null;
  toggleCamera: () => void;
  toggleMic: () => void;
  requestPermissions: () => Promise<void>;
  handleAllowPermissions: () => void;
  handleDismissPrompt: () => void;
  clearError: () => void;
  clearDeviceError: () => void;
  enableListenerMode: () => void;
  retryDeviceAccess: () => void;
  cleanup: () => void;
}

export interface DeviceErrorType {
  type: "access-denied" | "not-found" | "generic" | null;
  message: string;
}
