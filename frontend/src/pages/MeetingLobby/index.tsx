import React from "react";
import { useParams } from "react-router-dom";
import JoiningOverlay from "../../components/meeting/JoiningOverlay";
import { WaitingRoom } from "../../components/meeting/WaitingRoom";
import { PermissionPrompt } from "../../components/meeting/PermissionPrompt";
import { useAuth } from "../../hooks/useAuth";
import { useLobbyDevices } from "../../hooks/useLobbyDevices";
import { useMeetingData } from "./useMeetingData";
import { useLobbyLogic } from "./useLobbyLogic";
import { LoadingScreen } from "./LoadingScreen";
import { ErrorDisplay } from "./ErrorDisplay";
import { LobbyContent } from "./LobbyContent";
import type { MeetingLobbyProps } from "./types";

export type { DevicePreferences, TokenData } from "./types";

export const MeetingLobby: React.FC<MeetingLobbyProps> = ({
  onJoin,
  onCancel,
}) => {
  const { meetingCode } = useParams<{ meetingCode: string }>();
  const { isAuthenticated } = useAuth();

  const {
    meetingData,
    participantCount,
    error: meetingError,
    setError: setMeetingError,
    loading,
  } = useMeetingData(meetingCode);
  const devices = useLobbyDevices(!!meetingData);

  const {
    displayName,
    setDisplayName,
    isJoining,
    error: lobbyError,
    setError: setLobbyError,
    waitingRequestId,
    handleJoinClick,
    handleWaitingApproved,
    handleWaitingCancel,
  } = useLobbyLogic({ meetingCode, devices, onJoin, onCancel });

  const displayError = lobbyError || meetingError || devices.error;

  if (waitingRequestId && meetingCode) {
    return (
      <WaitingRoom
        requestId={waitingRequestId}
        meetingCode={meetingCode}
        displayName={displayName}
        onApproved={handleWaitingApproved}
        onCancel={handleWaitingCancel}
      />
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 relative">
      {isJoining && <JoiningOverlay />}

      {/* Fixed modal overlays - rendered outside content wrapper */}
      <ErrorDisplay
        deviceError={devices.deviceError}
        error={displayError}
        onClearDeviceError={devices.clearDeviceError}
        onEnableListenerMode={devices.enableListenerMode}
        onRetryDeviceAccess={async () => {
          // Browsers require getUserMedia to be called synchronously within the
          // user gesture (click). Calling it here directly — before any async
          // state update — guarantees the native permission dialog appears.
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: true,
            });
            // Stop tracks immediately — the full setup below will request again
            stream.getTracks().forEach((t) => t.stop());
          } catch {
            // Ignored — retryDeviceAccess below will handle and set the error
          }
          devices.retryDeviceAccess();
        }}
        onClearError={() => {
          setLobbyError("");
          setMeetingError("");
          devices.clearError();
        }}
      />

      {devices.showPermissionPrompt && (
        <PermissionPrompt
          onAllow={devices.handleAllowPermissions}
          onDismiss={devices.handleDismissPrompt}
        />
      )}

      <div className="w-full max-w-2xl">
        <LobbyContent
          devices={devices}
          displayName={displayName}
          setDisplayName={setDisplayName}
          isAuthenticated={isAuthenticated}
          isJoining={isJoining}
          meetingData={meetingData}
          participantCount={participantCount}
          onJoinClick={handleJoinClick}
        />
      </div>
    </div>
  );
};
