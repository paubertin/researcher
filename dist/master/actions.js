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
exports.getRetriever = getRetriever;
exports.getDefaultRetriever = getDefaultRetriever;
exports.getSubQueries = getSubQueries;
exports.scrapeUrls = scrapeUrls;
exports.chooseAgent = chooseAgent;
const config_1 = require("../config");
const llm_1 = require("../llm");
const logger_1 = require("../logger");
const duckduckgo_1 = require("../retrievers/duckduckgo");
const scraper_1 = require("../scraper/scraper");
const utils_1 = require("../utils");
const prompts_1 = require("./prompts");
function getRetriever(retrieverName) {
    let retriever;
    switch (retrieverName) {
        case 'duckduckgo':
            retriever = duckduckgo_1.Duckduckgo;
            break;
        default:
            return null;
    }
    return retriever;
}
function getDefaultRetriever() {
    return duckduckgo_1.Duckduckgo;
}
function getSubQueries(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const maxIterations = config_1.Config.maxIterations;
        const response = yield (0, llm_1.createChatCompletion)({
            model: config_1.Config.smartLLMModel,
            messages: [
                {
                    type: 'system',
                    content: options.agentRolePrompt,
                },
                {
                    type: 'user',
                    content: (0, prompts_1.generateSearchQueriesPrompt)(options.query, options.reportType, options.parentQuery, maxIterations),
                }
            ],
            temperature: 0,
            llmProvider: config_1.Config.llmProvider,
            llmKwargs: config_1.Config.llmKwargs,
        });
        return JSON.parse(response);
    });
}
function scrapeUrls(urls) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = [];
        try {
            content = yield new scraper_1.Scraper(urls, config_1.Config.userAgent, config_1.Config.scraper).run();
        }
        catch (err) {
            logger_1.Logger.type('ERROR in scrape urls...', logger_1.Color.red, err);
        }
        return content;
    });
}
function chooseAgent(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, parentQuery = null, headers = {}) {
        const finalQuery = parentQuery ? `${parentQuery} - ${query}` : query;
        let response = null;
        try {
            response = yield (0, llm_1.createChatCompletion)({
                model: config_1.Config.smartLLMModel,
                messages: [
                    { type: 'system', content: (0, prompts_1.autoAgentInstructions)() },
                    { type: 'user', content: `task: ${finalQuery}` },
                ],
                temperature: 0,
                llmProvider: config_1.Config.llmProvider,
                llmKwargs: config_1.Config.llmKwargs,
            });
            const agentData = JSON.parse(response);
            return [agentData.server, agentData.agentRolePrompt];
        }
        catch (error) {
            console.error("⚠️ Error in reading JSON, attempting to repair JSON");
            return handleJsonError(response);
        }
    });
}
function handleJsonError(response) {
    return __awaiter(this, void 0, void 0, function* () {
        throw new utils_1.CustomError('Not implemented yet');
        /*
          try {
              if (response) {
                  const agentData = jsonRepair.loads(response);
                  if (agentData.server && agentData.agentRolePrompt) {
                      return [agentData.server, agentData.agentRolePrompt];
                  }
              }
          } catch (error) {
              console.error(`Error using jsonRepair: ${error}`);
          }
        
          const jsonString = extractJsonWithRegex(response || '');
          if (jsonString) {
              try {
                  const jsonData = JSON.parse(jsonString);
                  if (jsonData.server && jsonData.agentRolePrompt) {
                      return [jsonData.server, jsonData.agentRolePrompt];
                  }
              } catch (error) {
                  console.error(`Error decoding JSON: ${error}`);
              }
          }
        
          console.log("No JSON found in the string. Falling back to Default Agent.");
          return ["Default Agent",
              "You are an AI critical thinker research assistant. Your sole purpose is to write well written, " +
              "critically acclaimed, objective and structured reports on given text."
          ];
          */
    });
}
