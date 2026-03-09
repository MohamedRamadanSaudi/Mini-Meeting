import { useState, useCallback } from "react";
import { useDeviceEnumeration } from "./useDeviceEnumeration";
import { useMediaStream } from "./useMediaStream";
import { useAudioAnalyzer } from "./useAudioAnalyzer";
import { useDeviceSwitching } from "./useDeviceSwitching";
import { useDeviceSetup } from "./useDeviceSetup";
import { useDeviceToggles } from "./useDeviceToggles";
import { useMobilePermissions } from "./useMobilePermissions";
import { useDeviceLifecycle } from "./useDeviceLifecycle";
import type { LobbyDeviceState } from "./types";

/**
 * Main hook for managing lobby devices
 * Orchestrates device enumeration, media streams, and user interactions
 */
export function useLobbyDevices(meetingReady: boolean): LobbyDeviceState {
  const [audioLevel, setAudioLevel] = useState(0);
  const deviceEnumeration = useDeviceEnumeration();
  const mediaStream = useMediaStream();
  const audioAnalyzer = useAudioAnalyzer(mediaStream.micEnabled);
  const setupAudioAnalyzer = useCallback(
    (stream: MediaStream) => {
      audioAnalyzer.setupAudioAnalyzer(stream, setAudioLevel);
    },
    [audioAnalyzer],
  );
  const { setupDevicesAndEnumerate } = useDeviceSetup({
    mediaStream,
    deviceEnumeration,
    setupAudioAnalyzer,
  });

  // Device toggles
  const { toggleCamera, toggleMic } = useDeviceToggles({
    mediaStream,
    audioAnalyzer,
    setAudioLevel,
  });

  // Mobile permissions
  const { showPermissionButton, requestPermissions } = useMobilePermissions({
    setupDevicesAndEnumerate,
  });

  // Device switching
  useDeviceSwitching({
    ...deviceEnumeration,
    ...mediaStream,
    setError: mediaStream.setErrorMessage,
    videoDevices: deviceEnumeration.videoDevices,
    audioDevices: deviceEnumeration.audioDevices,
    setupAudioAnalyzer,
  });

  // Auto-request and cleanup lifecycle
  const deviceLifecycle = useDeviceLifecycle({
    meetingReady,
    permissionsGranted: mediaStream.permissionsGranted,
    setupDevicesAndEnumerate,
    enumerateDevices: deviceEnumeration.enumerateDevices,
    stopStream: mediaStream.stopStream,
    cleanupAnalyzer: audioAnalyzer.cleanup,
  });

  return {
    videoDevices: deviceEnumeration.videoDevices,
    audioDevices: deviceEnumeration.audioDevices,
    audioOutputDevices: deviceEnumeration.audioOutputDevices,
    selectedCamera: deviceEnumeration.selectedCamera,
    selectedMic: deviceEnumeration.selectedMic,
    selectedSpeaker: deviceEnumeration.selectedSpeaker,
    setSelectedCamera: deviceEnumeration.setSelectedCamera,
    setSelectedMic: deviceEnumeration.setSelectedMic,
    setSelectedSpeaker: deviceEnumeration.setSelectedSpeaker,
    cameraEnabled: mediaStream.cameraEnabled,
    micEnabled: mediaStream.micEnabled,
    stream: mediaStream.stream,
    permissionsGranted: mediaStream.permissionsGranted,
    showPermissionButton,
    showPermissionPrompt: deviceLifecycle.showPermissionPrompt,
    listenerMode: deviceLifecycle.listenerMode,
    audioLevel,
    error: mediaStream.error,
    deviceError: mediaStream.deviceError,
    toggleCamera,
    toggleMic,
    requestPermissions,
    handleAllowPermissions: deviceLifecycle.handleAllowPermissions,
    handleDismissPrompt: deviceLifecycle.handleDismissPrompt,
    clearError: mediaStream.clearError,
    clearDeviceError: mediaStream.clearDeviceError,
    enableListenerMode: deviceLifecycle.enableListenerMode,
    retryDeviceAccess: setupDevicesAndEnumerate,
    cleanup: useCallback(() => {
      mediaStream.stopStream();
      audioAnalyzer.cleanup();
    }, [mediaStream, audioAnalyzer]),
  };
}
