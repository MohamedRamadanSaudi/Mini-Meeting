import React, { useState } from "react";
import { SessionHeader } from "./SessionHeader";
import { ErrorNotice } from "./ErrorNotice";
import { ContentSection } from "./ContentSection";
import type { SummarizerSession } from "../../types/user.types";

type Tab = "summary" | "transcript";

interface SessionContentProps {
  session: SummarizerSession;
  onDelete: () => void;
}

const SummaryIcon = (
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
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const TranscriptIcon = (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export const SessionContent: React.FC<SessionContentProps> = ({
  session,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  const tabs: { id: Tab; label: string; hasContent: boolean }[] = [
    { id: "summary", label: "Summary", hasContent: !!session.summary },
    { id: "transcript", label: "Transcript", hasContent: !!session.transcript },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <SessionHeader session={session} onDelete={onDelete} />

      {session.error && (
        <ErrorNotice error={session.error} onDelete={onDelete} />
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                tab.hasContent ? "bg-emerald-400" : "bg-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Active section — key forces fade-in on tab switch */}
      <div key={activeTab} className="animate-fade-in">
        {activeTab === "summary" ? (
          <ContentSection
            title="Summary"
            content={session.summary}
            copyLabel="Summary"
            variant="summary"
            icon={SummaryIcon}
          />
        ) : (
          <ContentSection
            title="Transcript"
            content={session.transcript}
            copyLabel="Transcript"
            variant="transcript"
            icon={TranscriptIcon}
          />
        )}
      </div>
    </div>
  );
};
