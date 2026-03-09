import { useEffect, useState } from "react";
import { isMobileDevice } from "../../utils/browser";

interface UseDeviceLifecycleProps {
  meetingReady: boolean;
  permissionsGranted: boolean;
  setupDevicesAndEnumerate: () => void;
  enumerateDevices: () => Promise<unknown>;
  stopStream: () => void;
  cleanupAnalyzer: () => void;
}

export interface DeviceLifecycleReturn {
  showPermissionPrompt: boolean;
  listenerMode: boolean;
  handleAllowPermissions: () => void;
  handleDismissPrompt: () => void;
  enableListenerMode: () => void;
}

/**
 * Hook for device lifecycle management
 * Handles permission prompt and auto-request on desktop
 */
export function useDeviceLifecycle({
  meetingReady,
  permissionsGranted,
  setupDevicesAndEnumerate,
  enumerateDevices,
  stopStream,
  cleanupAnalyzer,
}: UseDeviceLifecycleProps): DeviceLifecycleReturn {
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [listenerMode, setListenerMode] = useState(false);

  useEffect(() => {
    if (
      meetingReady &&
      !permissionsGranted &&
      !isMobileDevice() &&
      !promptDismissed &&
      !permissionRequested
    ) {
      // Always show site prompt first - never auto-request browser permissions
      setShowPermissionPrompt(true);
    }
  }, [meetingReady, permissionsGranted, promptDismissed, permissionRequested]);

  const handleAllowPermissions = () => {
    setShowPermissionPrompt(false);
    setPermissionRequested(true);
    setupDevicesAndEnumerate();
  };

  const handleDismissPrompt = () => {
    setShowPermissionPrompt(false);
    setPromptDismissed(true);
    setListenerMode(true);
    // Enumerate devices without a stream so audioOutputDevices is populated
    // (audiooutput enumeration doesn't require mic/camera permission)
    enumerateDevices().catch(() => {});
  };

  useEffect(() => {
    return () => {
      stopStream();
      cleanupAnalyzer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingReady]);

  const enableListenerMode = () => {
    setListenerMode(true);
    enumerateDevices().catch(() => {});
  };

  return {
    showPermissionPrompt,
    listenerMode,
    handleAllowPermissions,
    handleDismissPrompt,
    enableListenerMode,
  };
}
