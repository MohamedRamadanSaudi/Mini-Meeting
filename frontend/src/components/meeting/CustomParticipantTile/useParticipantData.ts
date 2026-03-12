import { useMemo } from "react";
import { useEnsureTrackRef } from "@livekit/components-react";

export const useParticipantData = () => {
  const trackRef = useEnsureTrackRef();
  const participant = trackRef?.participant ?? null;

  const metadata = useMemo(() => {
    try {
      if (participant?.metadata) {
        return JSON.parse(participant.metadata);
      }
    } catch (e) {
      console.warn("Failed to parse participant metadata:", e);
    }
    return null;
  }, [participant?.metadata]);

  const avatarUrl = metadata?.avatar || "";

  return { participant, avatarUrl };
};
