import React, { useState, useEffect } from "react";
import { useNotificationSound } from "./useNotificationSound";
import { useLobbyWebSocket } from "./useLobbyWebSocket";
import { NotificationToast } from "./NotificationToast";
import { LobbyPanel } from "./LobbyPanel";
import type { LobbyRequestsProps } from "./types";

export const LobbyRequests: React.FC<LobbyRequestsProps> = ({
  meetingCode,
  isAdmin,
  onPendingCountChange,
}) => {
  const [respondingTo, setRespondingTo] = useState<Set<string>>(new Set());
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const playNotificationSound = useNotificationSound();

  const handleNewRequest = () => {
    setHasNewRequests(true);
    playNotificationSound();
    setTimeout(() => setHasNewRequests(false), 3000);
  };

  const { requests, setRequests, sendJsonMessage } = useLobbyWebSocket(
    meetingCode,
    isAdmin,
    handleNewRequest,
  );

  useEffect(() => {
    onPendingCountChange?.(requests.length);
  }, [requests.length, onPendingCountChange]);

  const handleRespond = (requestId: string, action: "approve" | "reject") => {
    setRespondingTo((prev) => new Set(prev).add(requestId));

    sendJsonMessage({
      type: "respond",
      request_id: requestId,
      action,
    });

    setRequests((prev) => prev.filter((r) => r.request_id !== requestId));

    setRespondingTo((prev) => {
      const next = new Set(prev);
      next.delete(requestId);
      return next;
    });
  };

  const handleAdmitAll = () => {
    for (const req of requests) {
      handleRespond(req.request_id, "approve");
    }
  };

  if (!isAdmin || requests.length === 0) return null;

  return (
    <>
      <NotificationToast show={hasNewRequests} />
      <LobbyPanel
        requests={requests}
        respondingTo={respondingTo}
        onRespond={handleRespond}
        onAdmitAll={handleAdmitAll}
      />
    </>
  );
};
