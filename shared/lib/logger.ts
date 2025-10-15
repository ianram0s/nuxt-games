import pc from 'picocolors';

/**
 * Log levels in order of severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private static instance: Logger;

    /**
     * Log level hierarchy for filtering
     */
    private readonly LOG_LEVELS: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };

    /**
     * Color mapping for each log level
     */
    private readonly LOG_COLORS: Record<LogLevel, (text: string) => string> = {
        debug: pc.gray,
        info: pc.blue,
        warn: pc.yellow,
        error: pc.red,
    };

    /**
     * Environment detection
     */
    private readonly isDevelopment: boolean = import.meta.dev;

    /**
     * Current log level
     */
    private readonly currentLogLevel: LogLevel;

    /**
     * Private constructor
     */
    private constructor() {
        this.currentLogLevel = this.isDevelopment ? 'debug' : 'warn';
    }

    /**
     * Gets the singleton instance of the Logger
     * @returns The Logger instance
     */
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }

        return Logger.instance;
    }

    /**
     * Check if a log level should be output
     * @param level - The log level to check
     * @returns True if the level should be logged
     */
    private shouldLog(level: LogLevel): boolean {
        return this.LOG_LEVELS[level] >= this.LOG_LEVELS[this.currentLogLevel];
    }

    /**
     * Format a timestamp for logging
     * @returns Formatted timestamp string
     */
    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    /**
     * Format log message with timestamp and level badge
     * @param level - The log level
     * @param message - The message to format
     * @returns Formatted log string
     */
    private formatMessage(level: LogLevel, message: string): string {
        const timestamp = pc.dim(`[${this.formatTimestamp()}]`);
        const levelBadge = this.LOG_COLORS[level](`[${level.toUpperCase()}]`);

        return `${timestamp} ${levelBadge} ${message}`;
    }

    /**
     * Convert any value to a string representation
     * @param value - The value to convert
     * @returns String representation
     */
    private stringify(value: unknown): string {
        if (typeof value === 'string') {
            return value;
        }

        if (value instanceof Error) {
            return `${value.name}: ${value.message}${value.stack ? '\n' + value.stack : ''}`;
        }

        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    }

    /**
     * Core logging function
     * @param level - The log level
     * @param args - Arguments to log
     */
    private log(level: LogLevel, ...args: unknown[]): void {
        if (!this.shouldLog(level)) {
            return;
        }

        const message = args.map((arg) => this.stringify(arg)).join(' ');
        const formattedMessage = this.formatMessage(level, message);

        switch (level) {
            case 'debug':
            case 'info':
                console.log(formattedMessage);
                break;
            case 'warn':
                console.warn(formattedMessage);
                break;
            case 'error':
                console.error(formattedMessage);
                break;
        }
    }

    /**
     * Log a debug message
     * @param args - Arguments to log
     */
    public debug(...args: unknown[]): void {
        this.log('debug', ...args);
    }

    /**
     * Log an info message
     * @param args - Arguments to log
     */
    public info(...args: unknown[]): void {
        this.log('info', ...args);
    }

    /**
     * Log a warning message
     * @param args - Arguments to log
     */
    public warn(...args: unknown[]): void {
        this.log('warn', ...args);
    }

    /**
     * Log an error message
     * @param args - Arguments to log
     */
    public error(...args: unknown[]): void {
        this.log('error', ...args);
    }
}

export const logger = Logger.getInstance();
