"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const dotenv = __importStar(require("dotenv"));
const utils_1 = require("./utils");
const logger_1 = require("./logger");
class Config {
    static init(options) {
        if (this._initialized) {
            return;
        }
        dotenv.config();
        this._init(options);
        this._initialized = true;
    }
    static _init(options) {
        this._debugMode = false;
        this._retriever = this.getEnv('RETRIEVER', 'duckduckgo');
        this._embeddingProvider = this.getEnv('EMBEDDING_PROVIDER', 'ollama');
        this._embeddingModel = this.getEnv('EMBEDDING_MODEL', 'nomic-embed-text');
        this._similarityThreshold = this.getEnv('SIMILARITY_THRESHOLD', 0.38);
        this._llmProvider = this.getEnv('LLM_PROVIDER', 'ollama');
        this._ollamaBaseURL = this.getEnv('OLLAMA_BASE_URL', undefined);
        this._llmModel = this.getEnv('LLM_MODEL', 'llama3.1');
        this._fastLLMModel = this.getEnv('FAST_LLM_MODEL', 'llama3.1');
        this._smartLLMModel = this.getEnv('SMART_LLM_MODEL', 'llama3.1');
        this._fastTokenLimit = this.getEnv('FAST_TOKEN_LIMIT', 2000);
        this._smartTokenLimit = this.getEnv('SMART_TOKEN_LIMIT', 4000);
        this._browseChunkMaxLength = this.getEnv('BROWSE_CHUNK_MAX_LENGTH', 8192);
        this._summaryTokenLimit = this.getEnv('SUMMARY_TOKEN_LIMIT', 700);
        this._temperature = this.getEnv('TEMPERATURE', 0.55);
        this._llmTemperature = this.getEnv('LLM_TEMPERATURE', 0.55);
        this._userAgent = this.getEnv('USER_AGENT', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0');
        this._maxSearchResultsPerQuery = this.getEnv('MAX_SEARCH_RESULTS_PER_QUERY', 5);
        this._memoryBackend = this.getEnv('MEMORY_BACKEND', 'local');
        this._totalWords = this.getEnv('TOTAL_WORDS', 800);
        this._reportFormat = this.getEnv('REPORT_FORMAT', 'APA');
        this._maxIterations = this.getEnv('MAX_ITERATIONS', 3);
        this._agentRole = this.getEnv('AGENT_ROLE', undefined);
        this._scraper = this.getEnv('SCRAPER', 'bs');
        this._maxSubtopics = this.getEnv('MAX_SUBTOPICS', 3);
        this._docPath = this.getEnv('DOC_PATH', '');
        this._llmKwargs = {};
        if (options === null || options === void 0 ? void 0 : options.debug) {
            logger_1.Logger.type('Debug mode: ', logger_1.Color.green, 'ENABLED');
            this._debugMode = true;
        }
    }
    static checkInitialized() {
        if (!this._initialized) {
            throw new utils_1.CustomError('Config not initialized', () => process.exit(1));
        }
    }
    static get debugMode() { this.checkInitialized(); return this._debugMode; }
    static get retriever() { this.checkInitialized(); return this._retriever; }
    static get embeddingProvider() { this.checkInitialized(); return this._embeddingProvider; }
    static get embeddingModel() { this.checkInitialized(); return this._embeddingModel; }
    static get similarityThreshold() { this.checkInitialized(); return this._similarityThreshold; }
    static get llmProvider() { this.checkInitialized(); return this._llmProvider; }
    static get ollamaBaseURL() { this.checkInitialized(); return this._ollamaBaseURL; }
    static get llmModel() { this.checkInitialized(); return this._llmModel; }
    static get fastLLMModel() { this.checkInitialized(); return this._fastLLMModel; }
    static get smartLLMModel() { this.checkInitialized(); return this._smartLLMModel; }
    static get fastTokenLimit() { this.checkInitialized(); return this._fastTokenLimit; }
    static get smartTokenLimit() { this.checkInitialized(); return this._smartTokenLimit; }
    static get browseChunkMaxLength() { this.checkInitialized(); return this._browseChunkMaxLength; }
    static get summaryTokenLimit() { this.checkInitialized(); return this._summaryTokenLimit; }
    static get temperature() { this.checkInitialized(); return this._temperature; }
    static get llmTemperature() { this.checkInitialized(); return this._llmTemperature; }
    static get userAgent() { this.checkInitialized(); return this._userAgent; }
    static get maxSearchResultsPerQuery() { this.checkInitialized(); return this._maxSearchResultsPerQuery; }
    static get memoryBackend() { this.checkInitialized(); return this._memoryBackend; }
    static get totalWords() { this.checkInitialized(); return this._totalWords; }
    static get reportFormat() { this.checkInitialized(); return this._reportFormat; }
    static get maxIterations() { this.checkInitialized(); return this._maxIterations; }
    static get agentRole() { this.checkInitialized(); return this._agentRole; }
    static get scraper() { this.checkInitialized(); return this._scraper; }
    static get maxSubtopics() { this.checkInitialized(); return this._maxSubtopics; }
    static get docPath() { this.checkInitialized(); return this._docPath; }
    static get llmKwargs() { this.checkInitialized(); return this._llmKwargs; }
    constructor() { }
    static getEnv(key, def) {
        const envValue = process.env[key];
        if (def !== undefined) {
            if (typeof def === 'boolean') {
                if (envValue !== undefined) {
                    return envValue !== 'true' ? false : true;
                }
                else {
                    return def;
                }
            }
            else if (typeof def === 'number') {
                if (envValue !== undefined) {
                    return parseInt(envValue, 10);
                }
                else {
                    return def;
                }
            }
            else {
                return envValue !== null && envValue !== void 0 ? envValue : def;
            }
        }
        else {
            return envValue !== null && envValue !== void 0 ? envValue : undefined;
        }
    }
}
exports.Config = Config;
Config._initialized = false;
