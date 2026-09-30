/**
 * Error logging utility for monitoring and debugging
 * Supports optional external service integration
 */

import { formatErrorForLogging, getErrorType, getUserMessage } from "./errors";

/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

/**
 * Log entry interface
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Record<string, unknown>;
  userAgent?: string;
  url?: string;
}

/**
 * Error logger class
 */
class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private logs: LogEntry[] = [];
  private maxLogsInMemory = 100;
  private externalServiceUrl?: string;

  constructor() {
    // Initialize external service URL from environment if available
    this.externalServiceUrl = process.env.NEXT_PUBLIC_ERROR_LOG_SERVICE;
  }

  /**
   * Log a message at specified level
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: unknown
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    if (error) {
      entry.error = formatErrorForLogging(error);
    }

    // Store in memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift();
    }

    // Log to console in development
    if (this.isDevelopment) {
      this.logToConsole(entry);
    }

    // Send to external service if critical
    if (level === LogLevel.CRITICAL) {
      this.sendToExternalService(entry).catch(() => {
        // Silently fail external service uploads
      });
    }
  }

  /**
   * Log to browser console
   */
  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message, context, error } = entry;
    const prefix = `[${timestamp}] [${level}]`;

    const consoleMethod = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
      [LogLevel.CRITICAL]: console.error,
    }[level];

    if (error) {
      consoleMethod(`${prefix} ${message}`, { error, context });
    } else if (context) {
      consoleMethod(`${prefix} ${message}`, context);
    } else {
      consoleMethod(`${prefix} ${message}`);
    }
  }

  /**
   * Send log entry to external service
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    if (!this.externalServiceUrl) {
      return;
    }

    try {
      await fetch(this.externalServiceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      if (this.isDevelopment) {
        console.warn("Failed to send error to external service", error);
      }
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>, error?: unknown): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Log error
   */
  error(message: string, error: unknown, context?: Record<string, unknown>): void {
    const userMessage = getUserMessage(error);
    const errorType = getErrorType(error);

    this.log(LogLevel.ERROR, message, { userMessage, errorType, ...context }, error);
  }

  /**
   * Log critical error
   */
  critical(message: string, error: unknown, context?: Record<string, unknown>): void {
    const userMessage = getUserMessage(error);
    const errorType = getErrorType(error);

    this.log(
      LogLevel.CRITICAL,
      message,
      { userMessage, errorType, ...context },
      error
    );
  }

  /**
   * Get all logs (for debugging)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Download logs as file
   */
  downloadLogs(filename: string = "craft-chain-logs.json"): void {
    const logsData = this.exportLogs();
    const blob = new Blob([logsData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Convenience functions
 */

export function logDebug(message: string, context?: Record<string, unknown>): void {
  errorLogger.debug(message, context);
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  errorLogger.info(message, context);
}

export function logWarn(message: string, error?: unknown, context?: Record<string, unknown>): void {
  errorLogger.warn(message, context, error);
}

export function logError(message: string, error: unknown, context?: Record<string, unknown>): void {
  errorLogger.error(message, error, context);
}

export function logCritical(
  message: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  errorLogger.critical(message, error, context);
}

export function getLogs(): LogEntry[] {
  return errorLogger.getLogs();
}

export function downloadLogs(filename?: string): void {
  errorLogger.downloadLogs(filename);
}
