import { SearchAPIRetriever } from './retriever';
import { Embeddings } from "@langchain/core/embeddings";

import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { DocumentCompressorPipeline } from 'langchain/retrievers/document_compressors';
import { EmbeddingsFilter } from 'langchain/retrievers/document_compressors/embeddings_filter';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Config } from '../config';
import { DocumentInterface } from '@langchain/core/documents';

export class ContextCompressor {
  public similarityThreshold: number;

  public constructor (
    public documents: Record<string, any>[],
    public embeddings: Embeddings,
    public maxResults: number = 5) {
    this.similarityThreshold = Config.similarityThreshold;
  }

  public async getContext (query: string, maxResults: number = 5) {
    const compressedDocs = this._getContextualRetriever();
    const relevantDocs = await compressedDocs.invoke(query);
    return this._prettyPrintDocs(relevantDocs, maxResults);
  }

  private _getContextualRetriever () {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });
    const relevanceFilter = new EmbeddingsFilter({
      embeddings: this.embeddings,
      similarityThreshold: this.similarityThreshold,
    });
    const pipelineCompressor = new DocumentCompressorPipeline({
      transformers: [ splitter, relevanceFilter ],
    });
    const baseRetriever = new SearchAPIRetriever(this.documents);
    const contextualRetriever = new ContextualCompressionRetriever({
      baseCompressor: pipelineCompressor,
      baseRetriever: baseRetriever,
    });
    return contextualRetriever;
  }

  private _prettyPrintDocs (docs: DocumentInterface<Record<string, any>>[], max: number) {
    return docs.slice(0, max).map((d) => 
      `Source: ${d.metadata.source}\n` +
      `Title: ${d.metadata.title}\n` +
      `Content: ${d.pageContent}\n`
    ).join('\n');
  }
}