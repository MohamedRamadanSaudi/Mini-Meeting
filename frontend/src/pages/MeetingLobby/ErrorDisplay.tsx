import { DeviceErrorMessage } from "../../components/common/DeviceErrorMessage";

interface ErrorDisplayProps {
  deviceError: "access-denied" | "not-found" | "generic" | null;
  error: string;
  onClearDeviceError: () => void;
  onRetryDeviceAccess: () => void;
  onClearError: () => void;
  onEnableListenerMode: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  deviceError,
  error,
  onClearDeviceError,
  onRetryDeviceAccess,
  onClearError,
  onEnableListenerMode,
}) => {
  if (deviceError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <DeviceErrorMessage
          type={deviceError}
          onRetry={() => {
            // Call retry directly without clearing the error first.
            // setupDevices clears the error internally on success,
            // or re-sets it on failure. The browser's native permission
            // dialog appears on top of the modal, so the user keeps context.
            onRetryDeviceAccess();
          }}
          onDismiss={() => {
            onClearDeviceError();
            onEnableListenerMode();
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <div
          className="w-full max-w-sm animate-scale-up rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "var(--lk-bg2)",
            border: "1px solid var(--lk-border-color)",
          }}
        >
          <div className="h-1 w-full bg-linear-to-r from-red-500 via-orange-500 to-amber-500" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--lk-fg)" }}
                >
                  Something went wrong
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--lk-fg2)" }}
                >
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={onClearError}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #ef4444, #f97316)",
              }}
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
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
