import { CustomError } from "../utils";
import { BeautifulSoupScraper } from "./bs";
import { PlayWrightScraper } from "./playwright";

type ScraperClass = new (url: string) => { scrape: () => Promise<string> };
export type ScraperResult = { url: string, rawContent: string | null };

export class Scraper {
  private urls: string[];
  private scraper: string;

  constructor(urls: string[], userAgent: string, scraper: string) {
      this.urls = urls;
      this.scraper = scraper;
  }

  public async run(): Promise<ScraperResult[]> {
      const results: ScraperResult[] = await Promise.all(
          this.urls.map(url => this.extractDataFromLink(url))
      );
      return results.filter(content => content.rawContent !== null);
  }

  private async extractDataFromLink(link: string): Promise<ScraperResult> {
      try {
          const ScraperClass = this.getScraper(link);
          const scraperInstance = new ScraperClass(link);
          const content = await scraperInstance.scrape();

          if (content.length < 100) {
              return { url: link, rawContent: null };
          }
          return { url: link, rawContent: content };
      } catch (error) {
          console.error(error);
          return { url: link, rawContent: null };
      }
  }
  
  private getScraper(link: string): ScraperClass {
    const SCRAPER_CLASSES: { [key: string]: ScraperClass } = {
        "playwright": PlayWrightScraper,
        "bs": BeautifulSoupScraper,
    };

    let scraperKey: string | null = null;

    if (link.endsWith(".pdf")) {
      throw new CustomError('PDF scraper not implemented');
    }
    else if (link.includes("arxiv.org")) {
      throw new CustomError('Arxiv scraper not implemented');
    }
    else {
        scraperKey = this.scraper;
    }

    const scraperClass = SCRAPER_CLASSES[scraperKey];
    if (!scraperClass) {
        throw new CustomError("Scraper not found.");
    }

    return scraperClass;
}
}
