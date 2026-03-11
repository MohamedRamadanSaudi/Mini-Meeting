import React from "react";
import { RequestItem } from "./RequestItem";
import type { LobbyPanelProps } from "./types";

export const LobbyPanel: React.FC<LobbyPanelProps> = ({
  requests,
  respondingTo,
  onRespond,
  onAdmitAll,
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600/20 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {requests.length}
            </span>
          </div>
          <h3 className="text-white text-sm font-semibold">Waiting to join</h3>
        </div>

        {requests.length > 1 && (
          <button
            onClick={onAdmitAll}
            className="text-xs px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
          >
            Admit all
          </button>
        )}
      </div>

      {/* Request list */}
      <div className="max-h-60 overflow-y-auto">
        {requests.map((req) => (
          <RequestItem
            key={req.request_id}
            request={req}
            isLoading={respondingTo.has(req.request_id)}
            onRespond={onRespond}
          />
        ))}
      </div>
    </div>
  );
};
