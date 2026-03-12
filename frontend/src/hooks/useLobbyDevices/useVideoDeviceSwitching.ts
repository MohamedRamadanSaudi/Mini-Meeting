import { useEffect } from "react";
import { VIDEO_CONSTRAINTS } from "../../utils/constants";

interface UseVideoSwitchingProps {
  selectedCamera: string;
  selectedMic: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  permissionsGranted: boolean;
  stream: MediaStream | null;
  videoDevices: MediaDeviceInfo[];
  setStream: (stream: MediaStream) => void;
  setSelectedCamera: (id: string) => void;
  setError: (msg: string) => void;
  setupAudioAnalyzer: (stream: MediaStream) => void;
}

/**
 * Hook for switching video devices
 * Handles camera selection and stream updates
 */
export function useVideoDeviceSwitching(props: UseVideoSwitchingProps) {
  const {
    selectedCamera,
    selectedMic,
    cameraEnabled,
    micEnabled,
    permissionsGranted,
    stream,
    videoDevices,
    setStream,
    setSelectedCamera,
    setError,
    setupAudioAnalyzer,
  } = props;

  useEffect(() => {
    const updateVideoStream = async () => {
      if (!selectedCamera || !cameraEnabled || !permissionsGranted) return;

      // If the current stream is already using the selected camera, skip restart
      const currentVideoTrack = stream?.getVideoTracks()[0];
      const currentDeviceId = currentVideoTrack?.getSettings()?.deviceId;
      if (currentDeviceId === selectedCamera) return;

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: selectedCamera },
            ...VIDEO_CONSTRAINTS.lobby,
          },
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        };

        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setStream(newStream);

        const audioTracks = newStream.getAudioTracks();
        if (audioTracks.length > 0 && micEnabled) {
          setupAudioAnalyzer(newStream);
        }
      } catch (err) {
        console.error("Failed to update video stream:", err);
        const mediaError = err as { name?: string };

        if (
          mediaError.name === "NotFoundError" ||
          mediaError.name === "OverconstrainedError"
        ) {
          setError(
            "Selected camera is not available. Please choose another camera.",
          );
          if (videoDevices.length > 0) {
            setSelectedCamera(videoDevices[0].deviceId);
          }
        } else {
          setError("Failed to switch camera. Please try again.");
        }
      }
    };

    if (permissionsGranted && selectedCamera) {
      updateVideoStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera, permissionsGranted]);
}
