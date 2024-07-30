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
exports.ContextCompressor = void 0;
const retriever_1 = require("./retriever");
const contextual_compression_1 = require("langchain/retrievers/contextual_compression");
const document_compressors_1 = require("langchain/retrievers/document_compressors");
const embeddings_filter_1 = require("langchain/retrievers/document_compressors/embeddings_filter");
const text_splitter_1 = require("langchain/text_splitter");
const config_1 = require("../config");
class ContextCompressor {
    constructor(documents, embeddings, maxResults = 5) {
        this.documents = documents;
        this.embeddings = embeddings;
        this.maxResults = maxResults;
        this.similarityThreshold = config_1.Config.similarityThreshold;
    }
    getContext(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, maxResults = 5) {
            const compressedDocs = this._getContextualRetriever();
            const relevantDocs = yield compressedDocs.invoke(query);
            return this._prettyPrintDocs(relevantDocs, maxResults);
        });
    }
    _getContextualRetriever() {
        const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 100,
        });
        const relevanceFilter = new embeddings_filter_1.EmbeddingsFilter({
            embeddings: this.embeddings,
            similarityThreshold: this.similarityThreshold,
        });
        const pipelineCompressor = new document_compressors_1.DocumentCompressorPipeline({
            transformers: [splitter, relevanceFilter],
        });
        const baseRetriever = new retriever_1.SearchAPIRetriever(this.documents);
        const contextualRetriever = new contextual_compression_1.ContextualCompressionRetriever({
            baseCompressor: pipelineCompressor,
            baseRetriever: baseRetriever,
        });
        return contextualRetriever;
    }
    _prettyPrintDocs(docs, max) {
        return docs.slice(0, max).map((d) => `Source: ${d.metadata.source}\n` +
            `Title: ${d.metadata.title}\n` +
            `Content: ${d.pageContent}\n`).join('\n');
    }
}
exports.ContextCompressor = ContextCompressor;
