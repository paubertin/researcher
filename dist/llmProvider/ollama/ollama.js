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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const ollama_1 = require("@langchain/community/chat_models/ollama");
const config_1 = require("../../config");
const logger_1 = require("../../logger");
const provider_1 = require("../provider");
class OllamaProvider extends provider_1.LLMProvider {
    constructor(model, temperature, maxTokens, ...args) {
        super();
        this.model = model;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.llm = new ollama_1.ChatOllama({
            model: this.model,
            temperature: this.temperature,
            baseUrl: this.baseURL,
        });
    }
    get baseURL() {
        return config_1.Config.ollamaBaseURL;
    }
    getChatResponse(messages_1) {
        return __awaiter(this, arguments, void 0, function* (messages, stream = false) {
            if (stream) {
                return yield this.streamResponse(messages);
            }
            else {
                const output = yield this.llm.invoke(messages);
                return output.content;
            }
        });
    }
    streamResponse(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            let paragraph = '';
            let response = '';
            try {
                for (var _d = true, _e = __asyncValues(yield this.llm.stream(messages)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const chunk = _c;
                    const content = chunk.content;
                    if (content) {
                        response += content;
                        paragraph += content;
                        if (paragraph.includes('\n')) {
                            logger_1.Logger.type(paragraph, logger_1.Color.green);
                            paragraph = '';
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return response;
        });
    }
}
exports.OllamaProvider = OllamaProvider;
