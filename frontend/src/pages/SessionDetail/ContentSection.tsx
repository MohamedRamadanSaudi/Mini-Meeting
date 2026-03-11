import React from "react";
import type { ContentSectionProps } from "./types";
import { CopyButton } from "./CopyButton";

const wordCount = (text: string) =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  content,
  copyLabel,
  icon,
  variant = "summary",
}) => {
  const isEmpty = !content;
  const words = content ? wordCount(content) : 0;

  const isSummary = variant === "summary";

  const accentClass = isSummary
    ? "from-brand-400 to-purple-500"
    : "from-emerald-400 to-teal-500";

  const iconColorClass = isSummary ? "text-brand-500" : "text-emerald-600";

  const emptyIconBgClass = isSummary ? "bg-brand-50" : "bg-emerald-50";
  const emptyIconColorClass = isSummary ? "text-brand-300" : "text-emerald-300";

  const emptyHeading = isSummary
    ? "Summary not yet generated"
    : "No transcript available";
  const emptySub = isSummary
    ? "Will appear once the AI processes the transcript"
    : "Will appear once the audio is processed";

  const filename = isSummary ? "summary.txt" : "transcript.txt";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Accent top bar */}
      <div className={`h-0.5 bg-linear-to-r ${accentClass}`} />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className={iconColorClass}>{icon}</span>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {!isEmpty && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full border border-gray-100 font-medium">
              {words.toLocaleString()} {words === 1 ? "word" : "words"}
            </span>
          )}
        </div>
        {!isEmpty && <CopyButton text={content!} label={copyLabel} />}
      </div>

      {/* Body */}
      <div className="px-6 pb-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${emptyIconBgClass}`}
            >
              <span className={emptyIconColorClass}>{icon}</span>
            </div>
            <p className="text-sm font-medium text-gray-500">{emptyHeading}</p>
            <p className="text-xs text-gray-400 mt-1">{emptySub}</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-white">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
              <span className="ml-2 text-xs text-gray-400 font-mono">
                {filename}
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-7 p-5 max-h-130 overflow-y-auto">
              {content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
