import React, { useState } from "react";
import {
  GridLayout,
  FocusLayout,
  FocusLayoutContainer,
  CarouselLayout,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { CustomParticipantTile } from "../CustomParticipantTile";

interface VideoLayoutProps {
  tracks: TrackReferenceOrPlaceholder[];
  hasScreenShare: boolean;
}

export const VideoLayout: React.FC<VideoLayoutProps> = ({
  tracks,
  hasScreenShare,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (hasScreenShare) {
    const screenTrack = tracks.find(
      (t) => t.source === Track.Source.ScreenShare,
    );

    if (isFullscreen) {
      return (
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
      );
    }

    return (
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
    );
  }

  return (
    <GridLayout tracks={tracks}>
      <CustomParticipantTile />
    </GridLayout>
  );
};
