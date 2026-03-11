import React, { type ReactNode } from "react";

interface SidebarPanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Reusable Sidebar Panel Component
 * Used for Chat and Admin panels
 */
export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  title,
  onClose,
  children,
}) => {
  return (
    <div className="relative w-90 max-w-90 h-full flex flex-col border-l border-(--lk-border-color) bg-(--lk-bg2) shadow-[-4px_0_16px_rgba(0,0,0,0.3)] animate-slide-in-right shrink-0 md:w-80 md:max-w-80 max-md:w-80 max-md:max-w-80 max-sm:w-screen! max-sm:max-w-screen! max-sm:fixed! max-sm:inset-0! max-sm:z-1000! max-sm:border-l-0! motion-reduce:animate-none">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-(--lk-border-color) bg-(--lk-bg2) shrink-0 md:px-4 md:py-3 max-sm:px-3 max-sm:py-2.5 max-sm:border-b-2">
        <h3 className="text-(--lk-fg) font-semibold m-0 text-[15px] md:text-sm max-sm:text-[13px]">
          {title}
        </h3>
        <button
          className="bg-transparent border-none text-(--lk-fg2) cursor-pointer p-1.5 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-(--lk-bg) hover:text-(--lk-fg) md:p-1.25 max-sm:p-1"
          onClick={onClose}
          title="Close"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
            className="md:w-4.5 md:h-4.5 max-sm:w-4 max-sm:h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  );
};
