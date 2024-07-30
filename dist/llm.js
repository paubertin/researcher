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
exports.createChatCompletion = createChatCompletion;
const ollama_1 = require("./llmProvider/ollama/ollama");
const utils_1 = require("./utils");
function getLLM(llmProvider, ...args) {
    let provider;
    switch (llmProvider) {
        case 'ollama': {
            provider = ollama_1.OllamaProvider;
            break;
        }
        default: {
            throw new Error();
        }
    }
    return new provider(...args);
}
function createChatCompletion(_a) {
    return __awaiter(this, arguments, void 0, function* ({ messages, model = 'default-model', temperature = 1.0, maxTokens, llmProvider, stream = false, llmKwargs, }) {
        // Validate input
        if (!model) {
            throw new Error('Model cannot be None');
        }
        if (maxTokens && maxTokens > 8001) {
            throw new utils_1.CustomError(`Max tokens cannot be more than 8001, but got ${maxTokens}`);
        }
        // Get the provider from supported providers
        const provider = getLLM(llmProvider, model, temperature, maxTokens, llmKwargs);
        let response = '';
        // Create response
        for (let attempt = 0; attempt < 10; attempt++) { // Maximum of 10 attempts
            try {
                response = yield provider.getChatResponse(messages, stream);
                return response;
            }
            catch (error) {
                console.error(`Attempt ${attempt + 1} failed: ${error}`);
                if (attempt === 9) { // Last attempt
                    console.error(`Failed to get response from ${llmProvider} API`);
                    throw new utils_1.CustomError(`Failed to get response from ${llmProvider} API`);
                }
            }
        }
        // Shouldn't reach here
        throw new utils_1.CustomError('Unexpected error in createChatCompletion');
    });
}
