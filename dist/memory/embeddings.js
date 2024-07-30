"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
const ollama_1 = require("@langchain/community/embeddings/ollama");
const config_1 = require("../config");
const utils_1 = require("../utils");
class Memory {
    constructor(embeddingProvider, headers) {
        this.headers = headers;
        switch (embeddingProvider) {
            case 'ollama': {
                this._embeddings = new ollama_1.OllamaEmbeddings({
                    model: config_1.Config.embeddingModel,
                    baseUrl: config_1.Config.ollamaBaseURL,
                });
                break;
            }
            default: {
                throw new utils_1.CustomError('Embedding provider not found.');
            }
        }
    }
    get embeddings() {
        return this._embeddings;
    }
}
exports.Memory = Memory;
