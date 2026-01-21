import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

class Logger {
    private level: LogLevel = LogLevel.INFO;
    private logFile: string | null = null;

    constructor() {
        const envLevel = process.env.LOG_LEVEL?.toUpperCase();
        if (envLevel && envLevel in LogLevel) {
            this.level = LogLevel[envLevel as keyof typeof LogLevel];
        }

        const envFile = process.env.LOG_FILE;
        if (envFile) {
            this.logFile = path.resolve(process.cwd(), envFile);
            // Ensure directory exists
            const dir = path.dirname(this.logFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }

    private formatMessage(level: string, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        let formattedArgs = args.map(arg =>
            arg instanceof Error ? (arg.stack || arg.message) : JSON.stringify(arg)
        ).join(' ');

        return `[${timestamp}] [${level}] ${message} ${formattedArgs}`.trim();
    }

    private log(targetLevel: LogLevel, levelName: string, message: string, ...args: any[]) {
        if (targetLevel >= this.level) {
            const formattedMessage = this.formatMessage(levelName, message, ...args);

            // Log to console
            if (targetLevel === LogLevel.ERROR) {
                console.error(formattedMessage);
            } else if (targetLevel === LogLevel.WARN) {
                console.warn(formattedMessage);
            } else {
                console.log(formattedMessage);
            }

            // Log to file
            if (this.logFile) {
                try {
                    fs.appendFileSync(this.logFile, formattedMessage + '\n');
                } catch (err) {
                    console.error('Failed to write to log file:', err);
                }
            }
        }
    }

    debug(message: string, ...args: any[]) {
        this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
    }

    info(message: string, ...args: any[]) {
        this.log(LogLevel.INFO, 'INFO', message, ...args);
    }

    warn(message: string, ...args: any[]) {
        this.log(LogLevel.WARN, 'WARN', message, ...args);
    }

    error(message: string, ...args: any[]) {
        this.log(LogLevel.ERROR, 'ERROR', message, ...args);
    }
}

export const logger = new Logger();
