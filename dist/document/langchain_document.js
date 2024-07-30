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
exports.LangChainDocumentLoader = void 0;
class LangChainDocumentLoader {
    constructor(documents) {
        this.documents = documents;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.documents.map((document) => {
                var _a;
                return {
                    rawContent: document.pageContent,
                    url: (_a = document.metadata.metadataSourceIndex) !== null && _a !== void 0 ? _a : '',
                };
            });
        });
    }
}
exports.LangChainDocumentLoader = LangChainDocumentLoader;
