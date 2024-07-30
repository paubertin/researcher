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
exports.SearchAPIRetriever = void 0;
const retrievers_1 = require("@langchain/core/retrievers");
class SearchAPIRetriever extends retrievers_1.BaseRetriever {
    constructor(pages) {
        super();
        this.pages = pages;
        this.lc_namespace = ['langchain', 'retrievers'];
    }
    _getRelevantDocuments(_query, _callbacks) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pages.map((page) => {
                var _a, _b, _c;
                return {
                    pageContent: (_a = page.rawContent) !== null && _a !== void 0 ? _a : '',
                    metadata: {
                        title: (_b = page.title) !== null && _b !== void 0 ? _b : '',
                        source: (_c = page.url) !== null && _c !== void 0 ? _c : '',
                    },
                };
            });
        });
    }
}
exports.SearchAPIRetriever = SearchAPIRetriever;
