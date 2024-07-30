"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.BeautifulSoupScraper = void 0;
const jssoup_1 = __importStar(require("jssoup"));
const utils_1 = require("../utils");
const soup_trainer_1 = require("./soup_trainer");
class BeautifulSoupScraper {
    constructor(link) {
        this.link = link;
    }
    scrape() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { response, error } = yield getResponse(this.link);
                if (error) {
                    console.log('error in response', error);
                    throw error;
                }
                if (!response) {
                    console.log('Could not get response');
                    return 'Could not get response';
                }
                const soup = new jssoup_1.default(yield response.text());
                soup.findAll('script').forEach((script) => script.extract());
                soup.findAll('style').forEach((style) => style.extract());
                const text = soup.getText();
                const tags = ["p", "h1", "h2", "h3", "h4", "h5"];
                const allTags = this.findAll(soup, tags);
                console.log('allTags', allTags);
                for (const element of allTags) {
                    console.log('element', element);
                }
                // console.log('text', text);
                return text;
            }
            catch (err) {
                throw new utils_1.CustomError(err);
            }
        });
    }
    children(soup) {
        return soup.contents[Symbol.iterator]();
    }
    descendants(soup) {
        return soup.descendants[Symbol.iterator]();
    }
    findAll(soup, name, attrs = {}, recursive = true, string, limit, ...kwargs) {
        let generator = this.descendants(soup);
        if (!recursive) {
            generator = this.children(soup);
        }
        let _stacklevel = kwargs.find(arg => arg._stacklevel) || 2;
        return this._find_all(name, attrs, string, limit, generator, _stacklevel + 1, ...kwargs);
    }
    _find_all(name, attrs = {}, string = null, limit = 0, generator, ...kwargs) {
        let _stacklevel = kwargs.find(arg => arg._stacklevel) || 3;
        if (string === null && kwargs.find(arg => arg.text)) {
            string = kwargs.find(arg => arg.text).text;
            console.warn("The 'text' argument to find()-type methods is deprecated. Use 'string' instead.");
        }
        let strainer;
        if (name instanceof soup_trainer_1.SoupStrainer) {
            strainer = name;
        }
        else {
            strainer = new soup_trainer_1.SoupStrainer(name, attrs, string, ...kwargs);
        }
        if (string === null && limit === 0 && Object.keys(attrs).length === 0 && kwargs.length === 0) {
            if (name === true || name === null) {
                // Optimization to find all tags.
                const result = (function* () {
                    for (let element of generator) {
                        if (element instanceof jssoup_1.SoupTag) {
                            yield element;
                        }
                    }
                })();
                return new ResultSet(strainer, result);
            }
            else if (typeof name === 'string') {
                // Optimization to find all tags with a given name.
                let prefix = null;
                let local_name = name;
                if (name.includes(':')) {
                    [prefix, local_name] = name.split(':', 2);
                }
                const result = (function* () {
                    for (let element of generator) {
                        if (element instanceof jssoup_1.SoupTag && (element.name === name ||
                            (element.name === local_name && (prefix === null)))) {
                            yield element;
                        }
                    }
                })();
                return new ResultSet(strainer, result);
            }
        }
        const results = new ResultSet(strainer);
        while (true) {
            let i;
            try {
                i = generator.next().value;
            }
            catch (e) {
                break;
            }
            if (i) {
                let found = strainer.search(i);
                if (found) {
                    results.append(found);
                    if (limit > 0 && results.length >= limit) {
                        break;
                    }
                }
            }
        }
        return results;
    }
}
exports.BeautifulSoupScraper = BeautifulSoupScraper;
class ResultSet extends Array {
    /**
     * A ResultSet is just a list that keeps track of the SoupStrainer
     * that created it.
     *
     * @param source - A SoupStrainer instance.
     * @param result - An iterable of PageElements.
     */
    constructor(source, result = []) {
        super(...result);
        this.source = source;
    }
    get(key) {
        if (this[key] === undefined) {
            throw new Error(`ResultSet object has no attribute '${key}'. You're probably treating a list of elements like a single element. Did you call find_all() when you meant to call find()?`);
        }
        return this[key];
    }
}
const invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
const htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g;
const htmlCtrlEntityRegex = /&(newline|tab);/gi;
const ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
const urlSchemeRegex = /^.+(:|&colon;)/gim;
const relativeFirstCharacters = [".", "/"];
function isRelativeUrlWithoutProtocol(url) {
    return relativeFirstCharacters.indexOf(url[0]) > -1;
}
// adapted from https://stackoverflow.com/a/29824550/2601552
function decodeHtmlCharacters(str) {
    return str.replace(htmlEntitiesRegex, (match, dec) => {
        return String.fromCharCode(dec);
    });
}
function sanitizeUrl(url) {
    const sanitizedUrl = decodeHtmlCharacters(url || "")
        .replace(htmlCtrlEntityRegex, "")
        .replace(ctrlCharactersRegex, "")
        .trim();
    if (!sanitizedUrl) {
        return "about:blank";
    }
    if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
        return sanitizedUrl;
    }
    const urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);
    if (!urlSchemeParseResults) {
        return sanitizedUrl;
    }
    const urlScheme = urlSchemeParseResults[0];
    if (invalidProtocolRegex.test(urlScheme)) {
        return "about:blank";
    }
    return sanitizedUrl;
}
function fetchWithTimeout(resource, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const timeout = (_a = options === null || options === void 0 ? void 0 : options.timeout) !== null && _a !== void 0 ? _a : 10000;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = yield fetch(resource, Object.assign(Object.assign({}, options), { signal: controller.signal }));
        clearTimeout(id);
        return response;
    });
}
function getResponse(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, timeout = 10000) {
        try {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                throw new Error('Invalid URL format');
            }
            const sanitizedUrl = sanitizeUrl(url);
            const response = yield fetchWithTimeout(sanitizedUrl, { timeout });
            if (response.status >= 400) {
                return {
                    response: undefined,
                    error: `Error: HTTP ${response.status} error`,
                };
            }
            return {
                response,
                error: undefined,
            };
        }
        catch (err) {
            return {
                response: undefined,
                error: `Error: ${err.toString()}`,
            };
        }
    });
}
