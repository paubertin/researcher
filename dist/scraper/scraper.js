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
exports.Scraper = void 0;
const utils_1 = require("../utils");
const bs_1 = require("./bs");
const playwright_1 = require("./playwright");
class Scraper {
    constructor(urls, userAgent, scraper) {
        this.urls = urls;
        this.scraper = scraper;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all(this.urls.map(url => this.extractDataFromLink(url)));
            return results.filter(content => content.rawContent !== null);
        });
    }
    extractDataFromLink(link) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ScraperClass = this.getScraper(link);
                const scraperInstance = new ScraperClass(link);
                const content = yield scraperInstance.scrape();
                if (content.length < 100) {
                    return { url: link, rawContent: null };
                }
                return { url: link, rawContent: content };
            }
            catch (error) {
                console.error(error);
                return { url: link, rawContent: null };
            }
        });
    }
    getScraper(link) {
        const SCRAPER_CLASSES = {
            "playwright": playwright_1.PlayWrightScraper,
            "bs": bs_1.BeautifulSoupScraper,
        };
        let scraperKey = null;
        if (link.endsWith(".pdf")) {
            throw new utils_1.CustomError('PDF scraper not implemented');
        }
        else if (link.includes("arxiv.org")) {
            throw new utils_1.CustomError('Arxiv scraper not implemented');
        }
        else {
            scraperKey = this.scraper;
        }
        const scraperClass = SCRAPER_CLASSES[scraperKey];
        if (!scraperClass) {
            throw new utils_1.CustomError("Scraper not found.");
        }
        return scraperClass;
    }
}
exports.Scraper = Scraper;
