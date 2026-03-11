import type { SummarizerSession } from "../../types/user.types";

export interface SessionDetailProps {
  id: string;
}

export interface StatusBadgeProps {
  status: SummarizerSession["status"];
  hasError: boolean;
}

export interface ProgressBarProps {
  status: SummarizerSession["status"];
  hasError: boolean;
  errorMessage?: string | null;
}

export interface CopyButtonProps {
  text: string;
  label: string;
}

export interface ContentSectionProps {
  title: string;
  content: string | null;
  copyLabel: string;
  icon: React.ReactNode;
  variant?: "summary" | "transcript";
}

export interface SessionHeaderProps {
  session: SummarizerSession;
  onDelete: () => void;
}

export interface ProgressBarProps {
  status: SummarizerSession["status"];
  hasError: boolean;
  errorMessage?: string | null;
}

export interface ErrorNoticeProps {
  error: string;
  onDelete: () => void;
}

export interface DeleteModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}
