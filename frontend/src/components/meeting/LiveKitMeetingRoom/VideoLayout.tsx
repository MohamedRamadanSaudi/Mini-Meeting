import React, { useState } from "react";
import {
  GridLayout,
  FocusLayout,
  FocusLayoutContainer,
  CarouselLayout,
  TrackRefContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { Pin } from "lucide-react";
import { CustomParticipantTile } from "../CustomParticipantTile";
import { PinContext } from "./PinContext";

interface VideoLayoutProps {
  tracks: TrackReferenceOrPlaceholder[];
  hasScreenShare: boolean;
}

export const VideoLayout: React.FC<VideoLayoutProps> = ({
  tracks,
  hasScreenShare,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);

  const pinContextValue = { pinnedIdentity, setPinnedIdentity };

  // Find the pinned participant's camera track (fallback to any track)
  const pinnedTrack = pinnedIdentity
    ? (tracks.find(
        (t) =>
          t.participant?.identity === pinnedIdentity &&
          t.source === Track.Source.Camera,
      ) ?? tracks.find((t) => t.participant?.identity === pinnedIdentity))
    : null;

  if (hasScreenShare) {
    const screenTrack = tracks.find(
      (t) => t.source === Track.Source.ScreenShare,
    );

    if (isFullscreen) {
      return (
        <PinContext.Provider value={pinContextValue}>
          <div className="group relative w-full h-full bg-black">
            <FocusLayout trackRef={screenTrack} />
            <button
              onClick={() => setIsFullscreen(false)}
              title="Exit fullscreen"
              className="absolute top-3 right-3 z-50 flex items-center justify-center w-9 h-9 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-sm border border-white/20"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 9L4 4m0 0l5 0M4 4l0 5M15 9l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5M15 15l5 5m0 0l-5 0m5 0l0-5"
                />
              </svg>
            </button>
          </div>
        </PinContext.Provider>
      );
    }

    return (
      <PinContext.Provider value={pinContextValue}>
        <FocusLayoutContainer>
          <CarouselLayout tracks={tracks}>
            <CustomParticipantTile />
          </CarouselLayout>
          <div className="group relative flex-1 min-w-0 min-h-0">
            <FocusLayout trackRef={screenTrack} />
            <button
              onClick={() => setIsFullscreen(true)}
              title="Fullscreen"
              className="absolute top-3 right-3 z-50 flex items-center justify-center w-9 h-9 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-sm border border-white/20"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5M20 8V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5M20 16v4m0 0h-4m4 0l-5-5"
                />
              </svg>
            </button>
          </div>
        </FocusLayoutContainer>
      </PinContext.Provider>
    );
  }

  // Pinned participant layout (no screen share)
  if (pinnedIdentity && pinnedTrack) {
    const otherTracks = tracks.filter(
      (t) => t.participant?.identity !== pinnedIdentity,
    );
    return (
      <PinContext.Provider value={pinContextValue}>
        <FocusLayoutContainer>
          <CarouselLayout tracks={otherTracks}>
            <CustomParticipantTile />
          </CarouselLayout>
          <div className="relative" style={{ height: "100%" }}>
            <TrackRefContext.Provider value={pinnedTrack}>
              <CustomParticipantTile />
            </TrackRefContext.Provider>
          </div>
        </FocusLayoutContainer>
      </PinContext.Provider>
    );
  }

  return (
    <PinContext.Provider value={pinContextValue}>
      <GridLayout tracks={tracks}>
        <CustomParticipantTile />
      </GridLayout>
    </PinContext.Provider>
  );
};
