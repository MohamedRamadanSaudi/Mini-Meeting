import React, { useState } from "react";
import {
  GridLayout,
  FocusLayout,
  FocusLayoutContainer,
  CarouselLayout,
  TrackRefContext,
  ParticipantContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
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

    // CarouselLayout uses useVisualStableUpdate internally and ignores order.
    // When pinned, render all tiles manually so the pinned one stays first.
    const pinnedCarouselTrack = pinnedIdentity
      ? (tracks.find(
          (t) =>
            t.participant?.identity === pinnedIdentity &&
            t.source === Track.Source.Camera,
        ) ?? tracks.find((t) => t.participant?.identity === pinnedIdentity))
      : null;

    const unpinnedTracks = pinnedIdentity
      ? tracks.filter(
          (t) =>
            t.participant?.identity !== pinnedIdentity &&
            t.source !== Track.Source.ScreenShare,
        )
      : tracks.filter((t) => t.source !== Track.Source.ScreenShare);

    const orderedTracks = pinnedCarouselTrack
      ? [pinnedCarouselTrack, ...unpinnedTracks]
      : null;

    // Non-pinned case: also filter screen share from carousel
    const carouselTracks = tracks.filter(
      (t) => t.source !== Track.Source.ScreenShare,
    );

    return (
      <PinContext.Provider value={pinContextValue}>
        <FocusLayoutContainer>
          {orderedTracks ? (
            <div className="lk-carousel lk-carousel-vertical">
              {orderedTracks.map((t) => (
                <ParticipantContext.Provider
                  key={`${t.participant?.identity ?? "placeholder"}-${t.source}`}
                  value={t.participant}
                >
                  <TrackRefContext.Provider value={t}>
                    <CustomParticipantTile />
                  </TrackRefContext.Provider>
                </ParticipantContext.Provider>
              ))}
            </div>
          ) : (
            <CarouselLayout tracks={carouselTracks}>
              <CustomParticipantTile />
            </CarouselLayout>
          )}
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

  // Pinned participant layout (no screen share) — custom flex layout
  if (pinnedIdentity && pinnedTrack) {
    const otherTracks = tracks.filter(
      (t) => t.participant?.identity !== pinnedIdentity,
    );
    return (
      <PinContext.Provider value={pinContextValue}>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            gap: "8px",
            padding: "8px",
            boxSizing: "border-box",
          }}
        >
          {/* Sidebar: other participants */}
          {otherTracks.length > 0 && (
            <div
              style={{
                width: "170px",
                minWidth: "170px",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                gap: "8px",
              }}
            >
              {otherTracks.map((t) => (
                <div
                  key={`${t.participant?.identity ?? "placeholder"}-${t.source}`}
                  style={{ width: "150px", height: "150px", flexShrink: 0 }}
                >
                  <ParticipantContext.Provider value={t.participant}>
                    <TrackRefContext.Provider value={t}>
                      <CustomParticipantTile />
                    </TrackRefContext.Provider>
                  </ParticipantContext.Provider>
                </div>
              ))}
            </div>
          )}
          {/* Main: pinned participant */}
          <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            <ParticipantContext.Provider value={pinnedTrack.participant}>
              <TrackRefContext.Provider value={pinnedTrack}>
                <CustomParticipantTile />
              </TrackRefContext.Provider>
            </ParticipantContext.Provider>
          </div>
        </div>
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
