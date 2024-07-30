import { ChatOllama } from '@langchain/community/chat_models/ollama'; 
import { BaseMessageLike, MessageContent } from '@langchain/core/messages';
import { Config } from '../../config';
import { Color, Logger } from '../../logger';
import { LLMProvider } from '../provider';

export class OllamaProvider extends LLMProvider {

  public llm: ChatOllama;

  public constructor (public model: string, public temperature: number, public maxTokens: number, ...args: any[]) {
    super();
    this.llm = new ChatOllama({
      model: this.model,
      temperature: this.temperature,
      baseUrl: this.baseURL,
    });
  }

  public get baseURL () {
    return Config.ollamaBaseURL;
  }

  public async getChatResponse (messages: BaseMessageLike[], stream: boolean = false): Promise<MessageContent> {
    if (stream) {
      return await this.streamResponse(messages);
    }
    else {
      const output = await this.llm.invoke(messages);
      return output.content;
    }
  }

  public async streamResponse (messages: BaseMessageLike[]) {
    let paragraph = '';
    let response = '';
    for await (const chunk of await this.llm.stream(messages)) {
      const content = chunk.content;
      if (content) {
        response += content;
        paragraph += content;
        if (paragraph.includes('\n')) {
          Logger.type(paragraph, Color.green);
          paragraph = '';
        }
      }
    }
    return response;
  }
}