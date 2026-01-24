import winston from 'winston';
import { join } from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston about our colors
winston.addColors(colors);

// Define format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console(),

    // Error log file
    new winston.transports.File({
        filename: join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
    }),

    // Combined log file
    new winston.transports.File({
        filename: join(process.cwd(), 'logs', 'combined.log'),
    }),
];

// Create logger
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels,
    format,
    transports,
});

// Helper functions for structured logging
export const logInfo = (message: string, meta?: Record<string, any>) => {
    logger.info(message, meta);
};

export const logError = (message: string, error?: Error, meta?: Record<string, any>) => {
    logger.error(message, {
        ...meta,
        error: error ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
        } : undefined,
    });
};

export const logWarn = (message: string, meta?: Record<string, any>) => {
    logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, any>) => {
    logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: Record<string, any>) => {
    logger.http(message, meta);
};

// Request ID middleware helper
export const withRequestId = (requestId: string) => {
    return {
        info: (message: string, meta?: Record<string, any>) =>
            logInfo(message, { ...meta, requestId }),
        error: (message: string, error?: Error, meta?: Record<string, any>) =>
            logError(message, error, { ...meta, requestId }),
        warn: (message: string, meta?: Record<string, any>) =>
            logWarn(message, { ...meta, requestId }),
        debug: (message: string, meta?: Record<string, any>) =>
            logDebug(message, { ...meta, requestId }),
    };
};
