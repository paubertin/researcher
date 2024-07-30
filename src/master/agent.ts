import { Config } from "../config";
import { ContextCompressor } from "../context/compression";
import { DocumentLoader } from "../document/document";
import { LangChainDocumentLoader } from "../document/langchain_document";
import { ReportSource, ReportType, Tone } from "../enums";
import { createChatCompletion } from "../llm";
import { Color, Logger } from "../logger";
import { Memory } from "../memory/embeddings";
import { Retriever, RetrieverConstructor } from "../retrievers/base";
import { CustomError } from "../utils";
import { chooseAgent, getDefaultRetriever, getRetriever, getSubQueries, scrapeUrls } from "./actions";
import { getPromptByReportType } from "./prompts";

interface GPTResearcherOptions {
  query: string;
  reportType?: ReportType;
  reportSource?: ReportSource;
  tone?: Tone;
  sourceUrls?: string[];
  documents?: any;
  configPath?: any;
  websocket?: any;
  agent?: any;
  role?: any;
  parentQuery?: string;
  subtopics?: any[];
  visitedUrls?: Set<string>;
  verbose?: boolean;
  context?: string[];
  headers?: Record<string, any>;
}

export class GPTResearcher {
  private headers: Record<string, any>;
  private query: string;
  private agent: string | null;
  private role: string | null;
  private reportType: ReportType;
  private reportPrompt: ReturnType<typeof getPromptByReportType>;
  private reportSource: ReportSource;
  private retriever: RetrieverConstructor<Retriever>;
  private context: string[];
  private sourceUrls?: string[];
  private documents: any;
  private memory: any;
  private visitedUrls: Set<string>;
  private verbose: boolean;
  private websocket: any;
  private tone: Tone;
  private parentQuery?: string;
  private subtopics: any[];

  constructor(
    options: GPTResearcherOptions,
  ) {
    this.headers = options.headers ?? {};
    this.query = options.query;
    this.agent = options.agent ?? null;
    this.role = options.role ?? null;
    this.reportType = options.reportType ?? ReportType.ResearchReport;
    this.reportPrompt = getPromptByReportType(this.reportType); // assuming get_prompt_by_report_type is a defined function
    this.reportSource = options.reportSource ?? ReportSource.Web;
    this.retriever = getRetriever(this.headers["retriever"]) ?? getRetriever(Config.retriever) ?? getDefaultRetriever(); // assuming get_retriever and get_default_retriever are defined functions
    this.context = options.context ?? [];
    this.sourceUrls = options.sourceUrls;
    this.documents = options.documents;
    this.memory = new Memory(Config.embeddingProvider, this.headers); // assuming Memory is a defined class
    this.visitedUrls = options.visitedUrls = new Set<string>();
    this.verbose = options.verbose ?? true;
    this.websocket = options.websocket;
    this.tone = options.tone ?? Tone.Objective;

    // Only relevant for DETAILED REPORTS
    // --------------------------------------

    // Stores the main query of the detailed report
    this.parentQuery = options.parentQuery;

    // Stores all the user provided subtopics
    this.subtopics = options.subtopics ?? [];
  }

  public async conductResearch() {
    this.visitedUrls.clear();
    if (this.reportSource !== ReportSource.Sources) {
      this.sourceUrls = [];
    }

    if (this.verbose) {
      Logger.type('AI Researcher', Color.cyan, `Starting the research for ${this.query}...`);
    }

    if (!(this.agent && this.role)) {
      [this.agent, this.role] = await chooseAgent(this.query, this.parentQuery, this.headers);
    }

    if (this.verbose) {
      Logger.type('AI Researcher', Color.cyan, `Agent generated: ${this.agent}`);
    }

    if (this.sourceUrls?.length) {
      this.context = await this._getContextByUrls(this.sourceUrls);
    }
    else if (this.reportSource === ReportSource.Local) {
      const documentData = await (new DocumentLoader(Config.docPath)).load();
      this.context = await this._getContextBySearch(this.query, documentData);
    }
    else if (this.reportSource === ReportSource.LangChainDocuments) {
      const documentData = await (new LangChainDocumentLoader(this.documents)).load();
      this.context = await this._getContextBySearch(this.query, documentData);
    }
    else {
      this.context = await this._getContextBySearch(this.query);
    }

    console.log('context', this.context);

    const report = await createChatCompletion({
      messages: [
        { type: 'system', content: this.role },
        { type: 'user', content: getPromptByReportType(this.reportType)({
          question: this.query,
          context: this.context.join('\n\n'),
          reportFormat: Config.reportFormat,
          totalWords: Config.totalWords,
          tone: this.tone,
          reportSource: this.reportSource,
        }) },
      ],
      temperature: 0,
      llmProvider: Config.llmProvider,
      stream: true,
      maxTokens: Config.smartTokenLimit,
      llmKwargs: Config.llmKwargs,
      model: Config.smartLLMModel,
    });

    console.log('report', report);
  }

  private async _getContextBySearch(query: string, data: any[] = []) {
    let context: string[] = [];

    const subQueries = await getSubQueries({
      query,
      agentRolePrompt: this.role!,
      parentQuery: this.parentQuery,
      reportType: this.reportType,
    });

    if (this.reportType !== ReportType.SubtopicReport) {
      subQueries.push(query);
    }

    if (this.verbose) {
      Logger.type('AI Researcher', Color.cyan, `I will conduct my research based on the following queries: ${subQueries}`);
    }

    for (const subQuery of subQueries) {
      const result = await this._processSubquery(subQuery, data);
      context.push(result);
    }
    // context = await Promise.all(subQueries.map((s) => this._processSubquery(s, data)));

    return context;
  }

  private async _getContextByUrls(urls: string[]): Promise<any[]> {
    throw new CustomError('Not implemented');
  }

  private async _processSubquery(subQuery: string, data?: any[]) {
    if (this.verbose) {
      Logger.type('AI Researcher', Color.cyan, `🔍 Running research for: ${subQuery}...`);
    }

    if (!(data?.length)) {
      data = await this._scrapeDataByQuery(subQuery);
    }

    const content = await this._getSimilarContentByQuery(subQuery, data);

    if (content && this.verbose) {
      Logger.type('AI Researcher', Color.cyan, `📃 ${content}`);
    }
    else if (this.verbose) {
      Logger.type('AI Researcher', Color.cyan, `🤷 No content found for ${subQuery}...`);
    }

    return content;
  }

  private async _scrapeDataByQuery(subQuery: string) {
    const retriever = new this.retriever(subQuery);
    console.log('retriever', retriever);
    const searchResults = await retriever.search(Config.maxSearchResultsPerQuery);
    console.log('retrsearchResultsiever', searchResults);
    const newSearchUrls = await this._getNewUrls(searchResults.map((result: any) => result.url));
    console.log('newSearchUrls', newSearchUrls);

    if (this.verbose) {
      Logger.type('AI Researcher', Color.cyan, `🤔 Researching for relevant information...`);
    }

    const scrapedContentResults = await scrapeUrls(newSearchUrls);
    return scrapedContentResults;
  }

  private async _getSimilarContentByQuery (query: string, pages: any[]) {
    if (this.verbose) {
      Logger.type('AI Researcher', Color.cyan, `📚 Getting relevant content based on query: ${query}...`);
    }

    const compressor = new ContextCompressor(pages, this.memory.embeddings);

    return await compressor.getContext(query, 8);
  }

  private async _getNewUrls(urlSetInput: string[]): Promise<string[]> {

    const newUrls: string[] = [];

    for (const url of urlSetInput) {
      if (!this.visitedUrls.has(url)) {
        this.visitedUrls.add(url);
        newUrls.push(url);

        if (this.verbose) {
          Logger.type('AI Researcher', Color.cyan, `✅ Added source url to research: ${url}`);
        }
      }
    }

    return newUrls;
  }
}