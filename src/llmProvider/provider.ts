import { BaseMessageLike, MessageContent } from '@langchain/core/messages';

export abstract class LLMProvider {

  public abstract getChatResponse (messages: BaseMessageLike[], stream: boolean): Promise<MessageContent>;

}

export type LLMProviderConstructor<T extends LLMProvider> = new (...args: any[]) => T;
