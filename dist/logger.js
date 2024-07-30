"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.Color = exports.LogLevel = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const utils_1 = require("./utils");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["HTTP"] = "http";
    LogLevel["VERBOSE"] = "verbose";
    LogLevel["DEBUG"] = "debug";
    LogLevel["SILLY"] = "silly";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var Color;
(function (Color) {
    Color["black"] = "\u001B[30m";
    Color["red"] = "\u001B[31m";
    Color["green"] = "\u001B[32m";
    Color["yellow"] = "\u001B[33m";
    Color["blue"] = "\u001B[34m";
    Color["magenta"] = "\u001B[35m";
    Color["cyan"] = "\u001B[36m";
    Color["white"] = "\u001B[37m";
    Color["reset"] = "\u001B[0m";
})(Color || (exports.Color = Color = {}));
class Logger {
    static getLogDirectory() {
        return this.logDir;
    }
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._initialized) {
                return;
            }
            this.logDir = path_1.default.resolve(path_1.default.join(process.cwd(), 'logs'));
            if (!(0, utils_1.exists)(this.logDir)) {
                yield fs_1.default.promises.mkdir(this.logDir, { recursive: true });
            }
            this._instance = new Logger(this.logDir);
            this._instance._init();
            this._initialized = true;
            return this._instance;
        });
    }
    _init() {
    }
    static shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all([
                this.instance.loggerFinished,
                this.instance.typingLoggerFinished,
                this.instance.jsonLoggerFinished,
            ]);
        });
    }
    static get instance() {
        if (!this._instance) {
            throw new Error('Logger not initialized');
        }
        return this._instance;
    }
    constructor(logDir) {
        this.typingLogger = winston_1.default.createLogger({
            level: LogLevel.DEBUG,
            transports: [
                new winston_1.default.transports.Console({ level: LogLevel.INFO, format: winston_1.default.format.printf(({ title, titleColor, level, message }) => {
                        const titleString = title
                            ? titleColor
                                ? `${titleColor}${title}${Color.reset}`
                                : title
                            : '';
                        let minSpeed = 50;
                        let maxSpeed = 10;
                        if (titleString) {
                            process.stdout.write(titleString + ' ');
                        }
                        while (message.length > 0) {
                            process.stdout.write(message[0]);
                            message = message.slice(1);
                            const delay = maxSpeed + (1 - Math.random()) * minSpeed;
                            const until = (new Date(new Date().getTime() + delay)).getTime();
                            while (Date.now() < until) { }
                            minSpeed *= 0.95;
                            maxSpeed *= 0.95;
                        }
                        return '';
                    }) }),
                new winston_1.default.transports.File({ filename: path_1.default.join(logDir, Logger.logFileName), level: LogLevel.DEBUG, format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp, title }) => {
                        return `${timestamp} [${level.toUpperCase()}] ${title} ${message}`;
                    })) }),
                new winston_1.default.transports.File({ filename: path_1.default.join(logDir, Logger.errorFileName), level: LogLevel.ERROR, format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp, title }) => {
                        return `${timestamp} [${level.toUpperCase()}] ${title} ${message}`;
                    })) }),
            ],
        });
        this.logger = winston_1.default.createLogger({
            level: LogLevel.DEBUG,
            transports: [
                new winston_1.default.transports.Console(),
                new winston_1.default.transports.File({ filename: path_1.default.join(logDir, Logger.logFileName), level: LogLevel.DEBUG, format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp, title }) => {
                        return `${timestamp} [${level.toUpperCase()}] ${title ? `${title} ${message}` : `${message}`}`;
                    })) }),
                new winston_1.default.transports.File({ filename: path_1.default.join(logDir, Logger.errorFileName), level: LogLevel.ERROR, format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp, title }) => {
                        return `${timestamp} [${level.toUpperCase()}] ${title ? `${title} ${message}` : `${message}`}`;
                    })) }),
            ],
            format: winston_1.default.format.combine(winston_1.default.format.splat(), winston_1.default.format.printf(({ title, titleColor, level, message }) => {
                const titleString = title
                    ? titleColor
                        ? `${titleColor}${title}${Color.reset}`
                        : title
                    : '';
                return titleString ? `${titleString} ${message}` : message;
            })),
        });
        this.jsonLogger = winston_1.default.createLogger({
            level: LogLevel.DEBUG,
            transports: [
                new winston_1.default.transports.File({ filename: path_1.default.join(logDir, Logger.logFileName), level: LogLevel.DEBUG, format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp, title }) => {
                        return `${timestamp} [${level.toUpperCase()}] ${title} ${message}`;
                    })) }),
                new winston_1.default.transports.File({ filename: path_1.default.join(logDir, Logger.errorFileName), level: LogLevel.ERROR, format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp, title }) => {
                        return `${timestamp} [${level.toUpperCase()}] ${title} ${message}`;
                    })) }),
            ],
        });
        this.typingLoggerFinished = new Promise((resolve) => this.typingLoggerFinishedResolved = resolve);
        this.loggerFinished = new Promise((resolve) => this.loggerFinishedResolved = resolve);
        this.jsonLoggerFinished = new Promise((resolve) => this.jsonLoggerFinishedResolved = resolve);
        this.typingLogger.on('finish', () => {
            var _a;
            (_a = this.typingLoggerFinishedResolved) === null || _a === void 0 ? void 0 : _a.call(this);
        });
        this.logger.on('finish', () => {
            var _a;
            (_a = this.loggerFinishedResolved) === null || _a === void 0 ? void 0 : _a.call(this);
        });
        this.jsonLogger.on('finish', () => {
            var _a;
            (_a = this.jsonLoggerFinishedResolved) === null || _a === void 0 ? void 0 : _a.call(this);
        });
    }
    static _log(message, title = '', titleColor, level = LogLevel.INFO) {
        if (Array.isArray(message)) {
            message = message.join(' ');
        }
        this.instance.logger.log(level, message, { title, titleColor });
    }
    static type(title, titleColor, content, level = LogLevel.INFO) {
        if (Array.isArray(content)) {
            content = content.join('\n');
        }
        this.instance.typingLogger.log(level, content !== undefined ? String(content) : '', { title, titleColor });
    }
    static debug(content, title, titleColor) {
        this._log(content, title, titleColor, LogLevel.DEBUG);
    }
    static info(content, title, titleColor) {
        this._log(content, title, titleColor, LogLevel.INFO);
    }
    static warn(content, title, titleColor) {
        this._log(content, title, titleColor, LogLevel.WARN);
    }
    static error(content, title) {
        this._log(content, title, Color.red, LogLevel.ERROR);
    }
    static print(messageOrColor, message) {
        console.log(message !== undefined ? `${messageOrColor}${message}${Color.reset}` : messageOrColor);
    }
    static logJson(data, fileName) {
        const jsonTransport = new winston_1.default.transports.File({ filename: fileName, format: winston_1.default.format.json() });
        this.instance.jsonLogger.add(jsonTransport);
        this.instance.jsonLogger.debug(data);
        this.instance.jsonLogger.remove(jsonTransport);
    }
    static set level(level) {
        this.instance.logger.level = level;
        this.instance.typingLogger.level = level;
    }
}
exports.Logger = Logger;
Logger.logFileName = 'activity.log';
Logger.errorFileName = 'error.log';
Logger._instance = undefined;
Logger._initialized = false;
