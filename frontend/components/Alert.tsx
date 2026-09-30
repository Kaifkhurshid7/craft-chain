"use client";

import { useState } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const alertStyles = {
  success: {
    container: "bg-green-50 border border-green-200",
    title: "text-green-900",
    message: "text-green-800",
    icon: "✓",
  },
  error: {
    container: "bg-red-50 border border-red-200",
    title: "text-red-900",
    message: "text-red-800",
    icon: "✕",
  },
  warning: {
    container: "bg-yellow-50 border border-yellow-200",
    title: "text-yellow-900",
    message: "text-yellow-800",
    icon: "⚠",
  },
  info: {
    container: "bg-blue-50 border border-blue-200",
    title: "text-blue-900",
    message: "text-blue-800",
    icon: "ℹ",
  },
};

export function Alert({
  type,
  title,
  message,
  dismissible = true,
  onDismiss,
  className = "",
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  const styles = alertStyles[type];

  return (
    <div
      className={`${styles.container} rounded-lg p-4 flex items-start gap-4 ${className}`}
      role="alert"
    >
      {/* Icon */}
      <div className={`text-xl flex-shrink-0 ${styles.title}`}>{styles.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && <h4 className={`font-semibold ${styles.title}`}>{title}</h4>}
        <p className={`text-sm ${styles.message}`}>{message}</p>
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 ${styles.title} hover:opacity-70 transition`}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
