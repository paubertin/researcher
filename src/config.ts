import * as dotenv from 'dotenv';
import { CustomError } from './utils';
import { Color, Logger } from './logger';

export interface ConfigOptions {
  debug?: boolean;
}

export class Config {

  public static init (options?: ConfigOptions) {
    if (this._initialized) {
      return;
    }
    dotenv.config();
    this._init(options);
    this._initialized = true;
  }

  private static _init (options?: ConfigOptions) {

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

    if (options?.debug) {
      Logger.type('Debug mode: ', Color.green, 'ENABLED');
      this._debugMode = true;
    }
  }

  private static checkInitialized () {
    if (!this._initialized) {
      throw new CustomError('Config not initialized', () => process.exit(1));
    }
  }

  public static get debugMode () { this.checkInitialized(); return this._debugMode; }
  public static get retriever () { this.checkInitialized(); return this._retriever; }
  public static get embeddingProvider () { this.checkInitialized(); return this._embeddingProvider; }
  public static get embeddingModel () { this.checkInitialized(); return this._embeddingModel; }
  public static get similarityThreshold () { this.checkInitialized(); return this._similarityThreshold; }
  public static get llmProvider () { this.checkInitialized(); return this._llmProvider; }
  public static get ollamaBaseURL () { this.checkInitialized(); return this._ollamaBaseURL; }
  public static get llmModel () { this.checkInitialized(); return this._llmModel; }
  public static get fastLLMModel () { this.checkInitialized(); return this._fastLLMModel; }
  public static get smartLLMModel () { this.checkInitialized(); return this._smartLLMModel; }
  public static get fastTokenLimit () { this.checkInitialized(); return this._fastTokenLimit; }
  public static get smartTokenLimit () { this.checkInitialized(); return this._smartTokenLimit; }
  public static get browseChunkMaxLength () { this.checkInitialized(); return this._browseChunkMaxLength; }
  public static get summaryTokenLimit () { this.checkInitialized(); return this._summaryTokenLimit; }
  public static get temperature () { this.checkInitialized(); return this._temperature; }
  public static get llmTemperature () { this.checkInitialized(); return this._llmTemperature; }
  public static get userAgent () { this.checkInitialized(); return this._userAgent; }
  public static get maxSearchResultsPerQuery () { this.checkInitialized(); return this._maxSearchResultsPerQuery; }
  public static get memoryBackend () { this.checkInitialized(); return this._memoryBackend; }
  public static get totalWords () { this.checkInitialized(); return this._totalWords; }
  public static get reportFormat () { this.checkInitialized(); return this._reportFormat; }
  public static get maxIterations () { this.checkInitialized(); return this._maxIterations; }
  public static get agentRole () { this.checkInitialized(); return this._agentRole; }
  public static get scraper () { this.checkInitialized(); return this._scraper; }
  public static get maxSubtopics () { this.checkInitialized(); return this._maxSubtopics; }
  public static get docPath () { this.checkInitialized(); return this._docPath; }
  public static get llmKwargs () { this.checkInitialized(); return this._llmKwargs; }

  private constructor () {}
  
  private static getEnv<T> (key: string): T | undefined
  private static getEnv<T> (key: string, def: T): T
  private static getEnv (key: string, def?: any): any {
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
        return envValue ?? def;
      }
    }
    else {
      return envValue ?? undefined;
    }
  }

  private static _initialized: boolean = false;

  private static _debugMode: boolean;
  private static _retriever: string;
  private static _embeddingProvider: string;
  private static _embeddingModel: string;
  private static _similarityThreshold: number;
  private static _llmProvider: string;
  private static _ollamaBaseURL: string | undefined;
  private static _llmModel: string;
  private static _fastLLMModel: string;
  private static _smartLLMModel: string;
  private static _fastTokenLimit: number;
  private static _smartTokenLimit: number;
  private static _browseChunkMaxLength: number;
  private static _summaryTokenLimit: number;
  private static _temperature: number;
  private static _llmTemperature: number;
  private static _userAgent: string;
  private static _maxSearchResultsPerQuery: number;
  private static _memoryBackend: string;
  private static _totalWords: number;
  private static _reportFormat: string;
  private static _maxIterations: number;
  private static _agentRole: string | undefined;
  private static _scraper: string;
  private static _maxSubtopics: number;
  private static _docPath: string;
  private static _llmKwargs: Record<string, any>;
}
