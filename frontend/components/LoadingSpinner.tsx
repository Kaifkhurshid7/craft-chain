"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  // Spinner only, in the current text colour; for use inside buttons and inline text
  inline?: boolean;
}

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-12 w-12 border-4",
  lg: "h-16 w-16 border-4",
};

export function LoadingSpinner({
  size = "md",
  message = "Loading...",
  inline = false,
}: LoadingSpinnerProps): JSX.Element {
  if (inline) {
    return (
      <span
        role="status"
        aria-label="Loading"
        className={`inline-block animate-spin rounded-full border-current border-t-transparent ${SIZE_CLASSES[size]}`}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-b-2 border-primary ${SIZE_CLASSES[size]}`}
      />
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
