export abstract class Retriever {
  public constructor (public query: string) {}
  public abstract search (maxResults?: number): Promise<any>;
}

export type RetrieverConstructor<T extends Retriever> = new (query: string) => T;