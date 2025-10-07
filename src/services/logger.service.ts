enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private enabledLevels: Set<LogLevel> = new Set([
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR,
  ]);

  constructor() {
    if (this.isDevelopment) {
      this.enabledLevels.add(LogLevel.DEBUG);
    }
  }

  private createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      // Ignore error
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    try {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = this.generateSessionId();
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch (error) {
      return undefined;
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.enabledLevels.has(level)) return;

    const logEntry = this.createLogEntry(level, message, data);

    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = 
        level === LogLevel.ERROR ? 'error' : 
        level === LogLevel.WARN ? 'warn' : 
        level === LogLevel.DEBUG ? 'debug' : 
        'log';
      
      console[consoleMethod](`[${logEntry.timestamp}] [${level}] ${message}`, data || '');
    }

    // Send to logging service in production for errors and warnings
    if (!this.isDevelopment && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
      this.sendToLoggingService(logEntry);
    }

    // Store logs in memory for debugging (development only)
    if (this.isDevelopment) {
      this.storeLogInMemory(logEntry);
    }
  }

  private sendToLoggingService(logEntry: LogEntry): void {
    // Implementation for sending logs to external service
    // Examples: Sentry, LogRocket, DataDog, etc.
    try {
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        navigator.sendBeacon('/api/logs', JSON.stringify(logEntry));
      } else {
        // Fallback for older browsers
        fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logEntry),
        }).catch(() => {
          // Ignore errors when sending logs
        });
      }
    } catch (error) {
      // Silently fail - we don't want logging errors to break the app
    }
  }

  private storeLogInMemory(logEntry: LogEntry): void {
    try {
      const logs = this.getStoredLogs();
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Ignore storage errors
    }
  }

  private getStoredLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem('app_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      return [];
    }
  }

  // Public methods
  public debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  public warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  public error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, message, data);
  }

  // Specialized logging methods
  public apiRequest(method: string, url: string, data?: unknown): void {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  public apiResponse(method: string, url: string, status: number, data?: unknown): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    this.log(level, `API Response: ${method} ${url} - ${status}`, data);
  }

  public userAction(action: string, data?: unknown): void {
    this.info(`User Action: ${action}`, data);
  }

  public performance(operation: string, duration: number, data?: unknown): void {
    this.info(`Performance: ${operation} took ${duration}ms`, data);
  }

  // Utility methods
  public getLogs(): LogEntry[] {
    return this.getStoredLogs();
  }

  public clearLogs(): void {
    try {
      localStorage.removeItem('app_logs');
    } catch (error) {
      // Ignore storage errors
    }
  }

  public setLogLevel(level: LogLevel): void {
    this.enabledLevels.clear();
    switch (level) {
      case LogLevel.DEBUG:
        this.enabledLevels.add(LogLevel.DEBUG);
        this.enabledLevels.add(LogLevel.INFO);
        this.enabledLevels.add(LogLevel.WARN);
        this.enabledLevels.add(LogLevel.ERROR);
        break;
      case LogLevel.INFO:
        this.enabledLevels.add(LogLevel.INFO);
        this.enabledLevels.add(LogLevel.WARN);
        this.enabledLevels.add(LogLevel.ERROR);
        break;
      case LogLevel.WARN:
        this.enabledLevels.add(LogLevel.WARN);
        this.enabledLevels.add(LogLevel.ERROR);
        break;
      case LogLevel.ERROR:
        this.enabledLevels.add(LogLevel.ERROR);
        break;
    }
  }
}

// Create and export singleton instance
export const logger = new Logger();

// Export LogLevel for external use
export { LogLevel };
