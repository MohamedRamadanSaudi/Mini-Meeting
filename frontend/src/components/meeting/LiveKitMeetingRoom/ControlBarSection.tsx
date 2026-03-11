import React from "react";
import { SummarizerControls } from "../SummarizerControls";
import { CustomControlBar } from "../CustomControlBar";
import { ChatButton } from "./ChatButton";
import type { ControlBarSectionProps } from "./types";

export const ControlBarSection: React.FC<ControlBarSectionProps> = ({
  meetingId,
  isAdmin,
  meetingCode,
  isChatOpen,
  unreadCount,
  onToggleChat,
}) => {
  return (
    <div className="lk-control-bar-wrapper flex items-center justify-between gap-2 p-2 sm:px-3 flex-wrap">
      {/* Summarizer Controls */}
      <div className="shrink-0 order-1">
        {meetingId && (
          <SummarizerControls
            meetingId={meetingId}
            isAdmin={isAdmin}
            inline={true}
          />
        )}
      </div>

      {/* Media Controls */}
      <div className="flex-1 flex justify-center order-2 min-w-0">
        <CustomControlBar isAdmin={isAdmin} meetingCode={meetingCode} />
      </div>

      {/* Chat Button */}
      <div className="shrink-0 order-3">
        <ChatButton
          isChatOpen={isChatOpen}
          unreadCount={unreadCount}
          onToggle={onToggleChat}
        />
      </div>
    </div>
  );
};
