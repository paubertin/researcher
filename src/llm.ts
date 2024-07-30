import { OllamaProvider } from "./llmProvider/ollama/ollama";
import { LLMProvider, LLMProviderConstructor } from "./llmProvider/provider";
import { CustomError } from "./utils";
import { BaseMessageLike, MessageContent } from '@langchain/core/messages';

interface CreateChatCompletionParams {
  messages: BaseMessageLike[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  llmProvider?: string;
  stream?: boolean;
  llmKwargs?: Record<string, any>;
  costCallback?: (cost: number) => void;
}

function getLLM<U extends LLMProvider, T extends LLMProviderConstructor<U>>(llmProvider: string | undefined, ...args: any[]) {
  let provider: T;
  switch (llmProvider) {
    case 'ollama': {
      provider = OllamaProvider as unknown as T;
      break;
    }
    default: {
      throw new Error();
    }
  }
  return new provider(...args);
}

export async function createChatCompletion({
  messages,
  model = 'default-model',
  temperature = 1.0,
  maxTokens,
  llmProvider,
  stream = false,
  llmKwargs,
}: CreateChatCompletionParams): Promise<MessageContent> {
  // Validate input
  if (!model) {
    throw new Error('Model cannot be None');
  }
  if (maxTokens && maxTokens > 8001) {
    throw new CustomError(`Max tokens cannot be more than 8001, but got ${maxTokens}`);
  }

  // Get the provider from supported providers
  const provider = getLLM(llmProvider, model, temperature, maxTokens, llmKwargs);

  let response: MessageContent = '';

  // Create response
  for (let attempt = 0; attempt < 10; attempt++) { // Maximum of 10 attempts
    try {
      response = await provider.getChatResponse(messages, stream);
      return response;
    }
    catch (error) {
      console.error(`Attempt ${attempt + 1} failed: ${error}`);
      if (attempt === 9) { // Last attempt
        console.error(`Failed to get response from ${llmProvider} API`);
        throw new CustomError(`Failed to get response from ${llmProvider} API`);
      }
    }
  }

  // Shouldn't reach here
  throw new CustomError('Unexpected error in createChatCompletion');
}