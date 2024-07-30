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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPTResearcher = void 0;
const config_1 = require("../config");
const compression_1 = require("../context/compression");
const document_1 = require("../document/document");
const langchain_document_1 = require("../document/langchain_document");
const enums_1 = require("../enums");
const logger_1 = require("../logger");
const embeddings_1 = require("../memory/embeddings");
const utils_1 = require("../utils");
const actions_1 = require("./actions");
const prompts_1 = require("./prompts");
class GPTResearcher {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        this.headers = (_a = options.headers) !== null && _a !== void 0 ? _a : {};
        this.query = options.query;
        this.agent = (_b = options.agent) !== null && _b !== void 0 ? _b : null;
        this.role = (_c = options.role) !== null && _c !== void 0 ? _c : null;
        this.reportType = (_d = options.reportType) !== null && _d !== void 0 ? _d : enums_1.ReportType.ResearchReport;
        this.reportPrompt = (0, prompts_1.getPromptByReportType)(this.reportType); // assuming get_prompt_by_report_type is a defined function
        this.reportSource = (_e = options.reportSource) !== null && _e !== void 0 ? _e : enums_1.ReportSource.Web;
        this.retriever = (_g = (_f = (0, actions_1.getRetriever)(this.headers["retriever"])) !== null && _f !== void 0 ? _f : (0, actions_1.getRetriever)(config_1.Config.retriever)) !== null && _g !== void 0 ? _g : (0, actions_1.getDefaultRetriever)(); // assuming get_retriever and get_default_retriever are defined functions
        this.context = (_h = options.context) !== null && _h !== void 0 ? _h : [];
        this.sourceUrls = options.sourceUrls;
        this.documents = options.documents;
        this.memory = new embeddings_1.Memory(config_1.Config.embeddingProvider, this.headers); // assuming Memory is a defined class
        this.visitedUrls = options.visitedUrls = new Set();
        this.verbose = (_j = options.verbose) !== null && _j !== void 0 ? _j : true;
        this.websocket = options.websocket;
        this.tone = (_k = options.tone) !== null && _k !== void 0 ? _k : enums_1.Tone.Objective;
        // Only relevant for DETAILED REPORTS
        // --------------------------------------
        // Stores the main query of the detailed report
        this.parentQuery = options.parentQuery;
        // Stores all the user provided subtopics
        this.subtopics = (_l = options.subtopics) !== null && _l !== void 0 ? _l : [];
    }
    conductResearch() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.visitedUrls.clear();
            if (this.reportSource !== enums_1.ReportSource.Sources) {
                this.sourceUrls = [];
            }
            if (this.verbose) {
                logger_1.Logger.type('AI Researcher', logger_1.Color.cyan, `Starting the research for ${this.query}...`);
            }
            if (!(this.agent && this.role)) {
                [this.agent, this.role] = yield (0, actions_1.chooseAgent)(this.query, this.parentQuery, this.headers);
            }
            if (this.verbose) {
                logger_1.Logger.type('AI Researcher', logger_1.Color.cyan, `Agent generated: ${this.agent}`);
            }
            if ((_a = this.sourceUrls) === null || _a === void 0 ? void 0 : _a.length) {
                this.context = yield this._getContextByUrls(this.sourceUrls);
            }
            else if (this.reportSource === enums_1.ReportSource.Local) {
                const documentData = yield (new document_1.DocumentLoader(config_1.Config.docPath)).load();
                this.context = yield this._getContextBySearch(this.query, documentData);
            }
            else if (this.reportSource === enums_1.ReportSource.LangChainDocuments) {
                const documentData = yield (new langchain_document_1.LangChainDocumentLoader(this.documents)).load();
                this.context = yield this._getContextBySearch(this.query, documentData);
            }
            else {
                this.context = yield this._getContextBySearch(this.query);
            }
            console.log('context', this.context);
        });
    }
    _getContextBySearch(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, data = []) {
            let context = [];
            const subQueries = yield (0, actions_1.getSubQueries)({
                query,
                agentRolePrompt: this.role,
                parentQuery: this.parentQuery,
                reportType: this.reportType,
            });
            if (this.reportType !== enums_1.ReportType.SubtopicReport) {
                subQueries.push(query);
            }
            if (this.verbose) {
                logger_1.Logger.type('AI Researcher', logger_1.Color.cyan, `I will conduct my research based on the following queries: ${subQueries}`);
            }
            for (const subQuery of subQueries) {
                const result = yield this._processSubquery(subQuery, data);
                context.push(result);
            }
            // context = await Promise.all(subQueries.map((s) => this._processSubquery(s, data)));
            return context;
        });
    }
    _getContextByUrls(urls) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new utils_1.CustomError('Not implemented');
        });
    }
    _processSubquery(subQuery, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.verbose) {
                logger_1.Logger.type('AI Researcher', logger_1.Color.cyan, `🔍 Running research for: ${subQuery}...`);
            }
            if (!(data === null || data === void 0 ? void 0 : data.length)) {
                data = yield this._scrapeDataByQuery(subQuery);
            }
            const content = yield this._getSimilarContentByQuery(subQuery, data);
            if (content && this.verbose) {
                logger_1.Logger.type('AI Researcher', logger_1.Color.cyan, `📃 ${content}`);
            }
            else if (this.verbose) {
                logger_1.Logger.type('AI Researcher', logger_1.Color.cyan, `🤷 No content found for ${subQuery}...`);
            }
            return content;
        });
    }
    _scrapeDataByQuery(subQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const retriever = new this.retriever(subQuery);
            console.log('retriever', retriever);
            const searchResults = yield retriever.search(config_1.Config.maxSearchResultsPerQuery);
            console.log('retrsearchResultsiever', searchResults);
            const newSearchUrls = yield this._getNewUrls(searchResults.map((result) => result.url));
            console.log('newSearchUrls', newSearchUrls);
            if (this.verbose) {
                logger_1.Logger.type('AI Researcher', logger_1.Color.cyan, `🤔 Researching for relevant information...`);
            }
            const scrapedContentResults = yield (0, actions_1.scrapeUrls)(newSearchUrls);
            return scrapedContentResults;
        });
    }
    _getSimilarContentByQuery(query, pages) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.verbose) {
                logger_1.Logger.type('AI Researcher', logger_1.Color.cyan, `📚 Getting relevant content based on query: ${query}...`);
            }
            const compressor = new compression_1.ContextCompressor(pages, this.memory.embeddings);
            return yield compressor.getContext(query, 8);
        });
    }
    _getNewUrls(urlSetInput) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUrls = [];
            for (const url of urlSetInput) {
                if (!this.visitedUrls.has(url)) {
                    this.visitedUrls.add(url);
                    newUrls.push(url);
                    if (this.verbose) {
                        logger_1.Logger.type('AI Researcher', logger_1.Color.cyan, `✅ Added source url to research: ${url}`);
                    }
                }
            }
            return newUrls;
        });
    }
}
exports.GPTResearcher = GPTResearcher;
