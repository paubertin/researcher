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
exports.PlayWrightScraper = void 0;
const playwright_1 = require("@langchain/community/document_loaders/web/playwright");
class PlayWrightScraper {
    constructor(link) {
        this.link = link;
    }
    scrape() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loader = new playwright_1.PlaywrightWebBaseLoader(this.link, {
                    launchOptions: {
                        headless: true,
                    },
                    gotoOptions: {
                        waitUntil: 'domcontentloaded',
                    },
                });
                const docs = yield loader.load();
                let content = '';
                for (const doc of docs) {
                    content += doc.pageContent;
                }
                return content;
            }
            catch (e) {
                console.error('Error', e);
                return '';
            }
        });
    }
}
exports.PlayWrightScraper = PlayWrightScraper;
