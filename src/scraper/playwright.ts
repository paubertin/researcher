import { PlaywrightWebBaseLoader } from "@langchain/community/document_loaders/web/playwright";

export class PlayWrightScraper {
  public constructor (public link: string) {

  }

  public async scrape () {
    try {
      const loader = new PlaywrightWebBaseLoader(this.link, {
        launchOptions: {
          headless: true,
        },
        gotoOptions: {
          waitUntil: 'domcontentloaded',
        },
      });
      const docs = await loader.load();
      let content = '';
      for (const doc of docs) {
        content += doc.pageContent;
      }
      return content;
    }
    catch (e: unknown) {
      console.error('Error', e);
      return '';
    }
  }
}