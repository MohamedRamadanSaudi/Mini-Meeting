import { useNavigate } from "react-router-dom";
import { SessionCard } from "../Sessions/SessionCard";
import { useSessions } from "../Sessions/useSessions";

/**
 * RecentSessions component for Dashboard
 * Shows the latest 3 summarizer sessions with a "See All" link to /sessions
 */
export function RecentSessions() {
  const navigate = useNavigate();
  // Fetch page 1 with 3 items max
  const { sessions, isLoading } = useSessions(1, 3);

  // Don't render section at all while loading or if no sessions
  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) return null;

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
        <button
          onClick={() => navigate("/sessions")}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors duration-150 flex items-center gap-1 group"
        >
          See all
          <svg
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Session cards (max 3) */}
      <div className="grid gap-3">
        {sessions.map((session, idx) => (
          <SessionCard
            key={session.id}
            session={session}
            index={idx}
            onClick={() => navigate(`/sessions/${session.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
