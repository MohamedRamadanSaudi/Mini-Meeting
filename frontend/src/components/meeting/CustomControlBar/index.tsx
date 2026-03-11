import React, { useState } from "react";
import { TrackToggle, useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { MicrophoneControl } from "./MicrophoneControl";
import { CameraControl } from "./CameraControl";
import { ScreenShareButton } from "./ScreenShareButton";
import { LeaveButton } from "./LeaveButton";
import { useMeetingPreferences } from "../LiveKitMeetingRoom/useMeetingPreferences";

interface CustomControlBarProps {
  isAdmin: boolean;
  meetingCode: string;
}

const TOGGLE_STYLE: React.CSSProperties = {
  minWidth: "48px",
  minHeight: "48px",
};

/**
 * Custom Control Bar Component
 * In listener mode: renders plain TrackToggles (no useMediaDeviceSelect) at
 * first so the browser permission dialog only appears on user click.
 * Once the user grants mic/camera permission (track turns on), we swap to the
 * full MicrophoneControl/CameraControl which includes the device-selector
 * dropdown — this is safe because permission is already granted at that point.
 */
export const CustomControlBar: React.FC<CustomControlBarProps> = ({
  isAdmin,
  meetingCode,
}) => {
  const prefs = useMeetingPreferences();
  const isListener = prefs?.listenerMode === true;

  const { localParticipant } = useLocalParticipant();
  const [micPermGranted, setMicPermGranted] = useState(
    () => localParticipant.isMicrophoneEnabled,
  );
  const [camPermGranted, setCamPermGranted] = useState(
    () => localParticipant.isCameraEnabled,
  );

  // Latch: once permission is granted it stays granted even if the track is
  // later disabled. setState during render is the React-approved pattern for
  // deriving state from incoming values (avoids the setState-in-effect issue).
  if (localParticipant.isMicrophoneEnabled && !micPermGranted)
    setMicPermGranted(true);
  if (localParticipant.isCameraEnabled && !camPermGranted)
    setCamPermGranted(true);

  return (
    <div className="lk-control-bar responsive-control-bar justify-center">
      <div className="lk-button-group gap-2 flex-nowrap">
        {/* Mic: plain toggle (no device dropdown) in listener mode until permission granted */}
        {isListener && !micPermGranted ? (
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon={true}
            style={TOGGLE_STYLE}
          />
        ) : (
          <MicrophoneControl />
        )}

        {/* Camera */}
        {isListener && !camPermGranted ? (
          <TrackToggle
            source={Track.Source.Camera}
            showIcon={true}
            style={TOGGLE_STYLE}
          />
        ) : (
          <CameraControl />
        )}

        <ScreenShareButton />
        <LeaveButton isAdmin={isAdmin} meetingCode={meetingCode} />
      </div>
    </div>
  );
};
