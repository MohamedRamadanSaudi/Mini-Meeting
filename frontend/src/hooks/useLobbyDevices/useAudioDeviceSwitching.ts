import { useEffect } from "react";
import { VIDEO_CONSTRAINTS } from "../../utils/constants";

interface UseAudioSwitchingProps {
  selectedCamera: string;
  selectedMic: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  permissionsGranted: boolean;
  stream: MediaStream | null;
  audioDevices: MediaDeviceInfo[];
  setStream: (stream: MediaStream) => void;
  setSelectedMic: (id: string) => void;
  setError: (msg: string) => void;
  setupAudioAnalyzer: (stream: MediaStream) => void;
}

/**
 * Hook for switching audio devices
 * Handles microphone selection and stream updates
 */
export function useAudioDeviceSwitching(props: UseAudioSwitchingProps) {
  const {
    selectedCamera,
    selectedMic,
    cameraEnabled,
    micEnabled,
    permissionsGranted,
    stream,
    audioDevices,
    setStream,
    setSelectedMic,
    setError,
    setupAudioAnalyzer,
  } = props;

  useEffect(() => {
    const updateAudioStream = async () => {
      if (!selectedMic || !micEnabled || !permissionsGranted) return;

      // If the current stream is already using the selected mic, skip restart
      const currentAudioTrack = stream?.getAudioTracks()[0];
      const currentMicId = currentAudioTrack?.getSettings()?.deviceId;
      if (currentMicId === selectedMic) return;

      try {
        const constraints: MediaStreamConstraints = {
          video:
            cameraEnabled && selectedCamera
              ? {
                  deviceId: { exact: selectedCamera },
                  ...VIDEO_CONSTRAINTS.lobby,
                }
              : false,
          audio: { deviceId: { exact: selectedMic } },
        };

        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setStream(newStream);

        const audioTracks = newStream.getAudioTracks();
        if (audioTracks.length > 0) {
          setupAudioAnalyzer(newStream);
        }
      } catch (err) {
        console.error("Failed to update audio stream:", err);
        const mediaError = err as { name?: string };

        if (
          mediaError.name === "NotFoundError" ||
          mediaError.name === "OverconstrainedError"
        ) {
          setError(
            "Selected microphone is not available. Please choose another microphone.",
          );
          if (audioDevices.length > 0) {
            setSelectedMic(audioDevices[0].deviceId);
          }
        } else {
          setError("Failed to switch microphone. Please try again.");
        }
      }
    };

    if (permissionsGranted && selectedMic) {
      updateAudioStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMic, permissionsGranted]);
}
