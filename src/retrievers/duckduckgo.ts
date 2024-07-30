import * as DDG from 'duck-duck-scrape';
import { Retriever } from './base';

export class Duckduckgo extends Retriever {
  public constructor (query: string) {
    super(query);
  }

  public async search (maxResults: number = 5) {
    const results =  await DDG.search(this.query);
    return results.results.slice(0, maxResults);
  }
}