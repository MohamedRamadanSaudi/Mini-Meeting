import React from "react";
import type { RequestItemProps } from "./types";

export const RequestItem: React.FC<RequestItemProps> = ({
  request,
  isLoading,
  onRespond,
}) => {
  return (
    <div
      className="rounded-md p-3 flex items-center justify-between gap-2"
      style={{
        background: "var(--lk-bg)",
        border: "1px solid var(--lk-border-color)",
      }}
    >
      {" "}
      <div className="flex items-center gap-3 min-w-0">
        {request.avatar_url ? (
          <img
            src={request.avatar_url}
            alt={request.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {request.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {request.name}
          </p>
          <p className="text-gray-400 text-xs capitalize">{request.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <button
          onClick={() => onRespond(request.request_id, "approve")}
          disabled={isLoading}
          className="p-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          title="Admit"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
        <button
          onClick={() => onRespond(request.request_id, "reject")}
          disabled={isLoading}
          className="p-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors"
          title="Deny"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
