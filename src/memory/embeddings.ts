import { Embeddings } from "@langchain/core/embeddings";
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { Config } from '../config';
import { CustomError } from "../utils";

export class Memory {

  public headers?: Record<string, any>;

  private _embeddings: Embeddings;

  public constructor (embeddingProvider: string, headers?: Record<string, any>) {
    this.headers = headers;

    switch (embeddingProvider) {
      case 'ollama': {
        this._embeddings = new OllamaEmbeddings({
          model: Config.embeddingModel,
          baseUrl: Config.ollamaBaseURL,
        });
        break;
      }
      default: {
        throw new CustomError('Embedding provider not found.');
      }
    }
  }

  public get embeddings () {
    return this._embeddings;
  }
}