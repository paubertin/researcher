import { Config } from "../config";
import { ReportType } from "../enums";
import { createChatCompletion } from "../llm";
import { Color, Logger } from "../logger";
import { Retriever, RetrieverConstructor } from "../retrievers/base";
import { Duckduckgo } from "../retrievers/duckduckgo";
import { Scraper, ScraperResult } from "../scraper/scraper";
import { CustomError } from "../utils";
import { autoAgentInstructions, generateSearchQueriesPrompt } from "./prompts";

export function getRetriever<U extends Retriever, T extends RetrieverConstructor<U>>(retrieverName: string) {
  let retriever: T;
  switch (retrieverName) {
    case 'duckduckgo':
      retriever = Duckduckgo as T;
      break;
    default:
      return null;
  }
  return retriever;
}

export function getDefaultRetriever <U extends Retriever, T extends RetrieverConstructor<U>>(): T {
  return Duckduckgo as T;
}

export async function getSubQueries (options: {
  query: string,
  agentRolePrompt: string,
  parentQuery?: string,
  reportType: ReportType,
}): Promise<string[]> {
  const maxIterations = Config.maxIterations;

  const response: any = await createChatCompletion({
    model: Config.smartLLMModel,
    messages: [
      {
        type: 'system',
        content: options.agentRolePrompt,
      },
      {
        type: 'user',
        content: generateSearchQueriesPrompt(options.query, options.reportType, options.parentQuery, maxIterations),
      }
    ],
    temperature: 0,
    llmProvider: Config.llmProvider,
    llmKwargs: Config.llmKwargs,
  });

  return JSON.parse(response);
}

export async function scrapeUrls (urls: string[]) {
  let content: ScraperResult[] = [];
  try {
    content = await new Scraper(urls, Config.userAgent, Config.scraper).run();
  }
  catch (err: unknown) {
    Logger.type('ERROR in scrape urls...', Color.red, err as any);
  }
  return content;
}

export async function chooseAgent(
  query: string,
  parentQuery: string | null = null,
  headers: Record<string, string> = {}
): Promise<[string, string]> {
  const finalQuery = parentQuery ? `${parentQuery} - ${query}` : query;
  let response: any = null;

  try {
      response = await createChatCompletion({
          model: Config.smartLLMModel,
          messages: [
              { type: 'system', content: autoAgentInstructions() },
              { type: 'user', content: `task: ${finalQuery}` },
          ],
          temperature: 0,
          llmProvider: Config.llmProvider,
          llmKwargs: Config.llmKwargs,
      });

      const agentData = JSON.parse(response);
      return [agentData.server, agentData.agentRolePrompt];
  }
  catch (error) {
      console.error("⚠️ Error in reading JSON, attempting to repair JSON");
      return handleJsonError(response);
  }
}

async function handleJsonError(response: string | null): Promise<[string, string]> {
  throw new CustomError('Not implemented yet');
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
}
