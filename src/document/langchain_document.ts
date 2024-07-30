import { Document } from '@langchain/core/documents';

export class LangChainDocumentLoader {
  public constructor (public documents: Document[]) {}

  public async load () {
    return this.documents.map((document) => {
      return {
        rawContent: document.pageContent,
        url: document.metadata.metadataSourceIndex ?? '',
      }
    });
  }
}