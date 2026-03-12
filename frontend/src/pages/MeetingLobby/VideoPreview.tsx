import React, { useEffect, useRef } from "react";
import MediaControls from "../../components/meeting/MediaControls";
import type { VideoPreviewProps } from "./types";

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  cameraEnabled,
  stream,
  displayName,
  micEnabled,
  onToggleMic,
  onToggleCamera,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
    }
  }, [stream]);

  return (
    <div
      className="relative aspect-video bg-black"
      role="region"
      aria-label="Video preview"
    >
      {cameraEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-900 to-gray-800">
          <div className="text-center px-4">
            <p className="text-white text-lg md:text-base font-semibold mb-4">
              Camera is off
            </p>
            <div
              className="w-24 h-24 md:w-20 md:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto"
              aria-hidden="true"
            >
              <svg
                className="w-12 h-12 md:w-10 md:h-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Display name overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
        <span className="text-sm font-medium">{displayName || "You"}</span>
      </div>

      {/* Media control buttons */}
      <MediaControls
        micEnabled={micEnabled}
        cameraEnabled={cameraEnabled}
        onToggleMic={onToggleMic}
        onToggleCamera={onToggleCamera}
      />
    </div>
  );
};
