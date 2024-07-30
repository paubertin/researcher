import { CallbackManagerForRetrieverRun } from '@langchain/core/dist/callbacks/manager';
import { DocumentInterface } from '@langchain/core/dist/documents/document';
import { BaseRetriever } from '@langchain/core/retrievers';

export class SearchAPIRetriever extends BaseRetriever {
  public lc_namespace: string[] = [ 'langchain', 'retrievers' ];

  public constructor (public pages: Record<string, any>[]) {
    super();
  }

  public async _getRelevantDocuments(_query: string, _callbacks?: CallbackManagerForRetrieverRun): Promise<DocumentInterface<Record<string, any>>[]> {
    return this.pages.map((page) => {
      return {
        pageContent: page.rawContent ?? '',
        metadata: {
          title: page.title ?? '',
          source: page.url ?? '',
        },
      };
    });
  }
}