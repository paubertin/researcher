import { CustomError } from '../utils';
import parse, { HTMLElement, Node } from 'node-html-parser';

export class BeautifulSoupScraper {
  public constructor(public link: string) { }

  public async scrape() {
    try {
      const { response, error } = await getResponse(this.link);
      if (error) {
        console.log('error in response', error);
        throw error;
      }
      if (!response) {
        console.log('Could not get response');
        return 'Could not get response';
      }

      const parsed = parse(await response.text());
      const scripts = parsed.querySelectorAll('script');
      scripts.forEach((script) => script.parentNode.removeChild(script));
      const styles = parsed.querySelectorAll('style');
      styles.forEach((style) => style.parentNode.removeChild(style));

      const tags = ["p", "h1", "h2", "h3", "h4", "h5"];
      let text = '';
      text = this._extractText(parsed, tags, text);

      return text;
    }
    catch (err: any) {
      throw new CustomError(err);
    }
  }

  private _extractText(node: Node, tags: string[], text: string) {
    if (node instanceof HTMLElement && tags.includes(node.tagName?.toLowerCase())) {
      if (node.textContent) {
        text += node.textContent.trim() + "\n";
      }
    }
    node.childNodes.forEach((child) => {
      text = this._extractText(child, tags, text);
    });
    return text;
  }

}

const invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
const htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g;
const htmlCtrlEntityRegex = /&(newline|tab);/gi;
const ctrlCharactersRegex =
  /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
const urlSchemeRegex = /^.+(:|&colon;)/gim;
const relativeFirstCharacters = [".", "/"];

function isRelativeUrlWithoutProtocol(url: string): boolean {
  return relativeFirstCharacters.indexOf(url[0]) > -1;
}

// adapted from https://stackoverflow.com/a/29824550/2601552
function decodeHtmlCharacters(str: string) {
  return str.replace(htmlEntitiesRegex, (match, dec) => {
    return String.fromCharCode(dec);
  });
}

function sanitizeUrl(url: string) {
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

async function fetchWithTimeout(resource: RequestInfo | URL, options?: RequestInit & { timeout?: number }) {
  const timeout = options?.timeout ?? 10000;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);

  return response;
}

async function getResponse(url: string, timeout: number = 10000) {
  try {

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('Invalid URL format');
    }

    const sanitizedUrl = sanitizeUrl(url);

    const response = await fetchWithTimeout(sanitizedUrl, { timeout });

    if (response.status >= 400) {
      return {
        response: undefined,
        error: `Error: HTTP ${response.status} error`,
      }
    }

    return {
      response,
      error: undefined,
    }
  }
  catch (err: any) {
    return {
      response: undefined,
      error: `Error: ${err.toString()}`,
    }
  }
}