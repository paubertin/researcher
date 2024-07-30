
// Whitespace
const WHITESPACE_LITERAL = `(?:[ \\t]|(?:\\r\\n|(?!\\r\\n)[\\n\\f\\r]))`;
const HEX_DIGIT_LITERAL = `[A-Fa-f0-9]`;
const WHITESPACE = new RegExp(WHITESPACE_LITERAL);
// CSS escapes
const CSS_ESCAPES_LITERAL = `(?:\\\\(?:${HEX_DIGIT_LITERAL}{1,6}${WHITESPACE_LITERAL}?|[^\\r\\n\\f]|$))`;
// const CSS_ESCAPES = /(?:\\(?:[A-Fa-f0-9]{1,6}(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))?|[^\r\n\f]|$))/
const IDENTIFIER_LITERAL = `(?:(?:-?(?:[^\\x00-\\x2f\\x30-\\x40\\x5B-\\x5E\\x60\\x7B-\\x9f]|${CSS_ESCAPES_LITERAL})+|--)(?:[^\\x00-\\x2c\\x2e\\x2f\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x9f]|${CSS_ESCAPES_LITERAL})*)`;
const IDENTIFIER = new RegExp(IDENTIFIER_LITERAL);
// const IDENTIFIER = /(?:(?:-?(?:[^\x00-\x2f\x30-\x40\x5B-\x5E\x60\x7B-\x9f]|(?:\\(?:[A-Fa-f0-9]{1,6}(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))?|[^\r\n\f]|$)))+|--)(?:[^\x00-\x2c\x2e\x2f\x3A-\x40\x5B-\x5E\x60\x7B-\x9f]|(?:\\(?:[A-Fa-f0-9]{1,6}(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))?|[^\r\n\f]|$)))*)/
// const IDENTIFIER = `(?:(?:-?(?:[^\\x00-\\x2f\\x30-\\x40\\x5B-\\x5E\\x60\\x7B-\\x9f]|(?:\\\\(?:[A-Fa-f0-9]{1,6}(?:[ \\t]|(?:\\r\\n|(?!\\r\\n)[\\n\\f\\r]))?|[^\\r\n\\f]|$)))+|--)(?:[^\\x00-\\x2c\\x2e\\x2f\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x9f]|(?:\\\\(?:[A-Fa-f0-9]{1,6}(?:[ \\t]|(?:\\r\\n|(?!\\r\\n)[\\n\\f\\r]))?|[^\\r\\n\\f]|$)))*)`
const ID_SELECTOR = new RegExp("#" + IDENTIFIER_LITERAL);
const CLASS_SELECTOR = new RegExp("\\." + IDENTIFIER_LITERAL);

export enum TokenType {
  GLOBAL = "*",
  ID ="id",
  CLASS = "class",
  WHITESPACE = "whitespace",
  IDENTIFIER = "identifier",
  COMMA = "comma",
  LARGER_THAN = "larger_than",
  PLUS = "plus",
  WAVY_LINE = "wavy_line",
}

export type Token = { type: TokenType; value: string };

export class Tokenizer {
  public getTokens(exp: string) {
    let idx = 0;
    const tokens: Token[] = [];
    while (idx < exp.length) {
      let changed = false;
      tokenizers.forEach((t) => {
        const ret = t.test(exp, idx);
        if (ret[0]) { // match()
          tokens.push(ret[1] as Token);
          idx += ret[0];
          changed = true;
        }
      })
      if (!changed && idx < exp.length) {
        throw "Incorrect format";
      }
    }
    return tokens;
  }
}

const NOT_FOUND: [ number, null ] = [0, null];

class CharTokenizer {
  public constructor(public type: TokenType, public value: string) { }

  public test(input: string, idx: number): [ number, Token | null ] {
    return (input[idx] == this.value) ? [1, { type: this.type, value: this.value }] : NOT_FOUND;
  }
}

class IDTokenizer {
  public type: TokenType;

  public constructor() {
    this.type = TokenType.ID;
  }

  public test(input: string, idx: number): [ number, Token | null ] {
    const sub = input.slice(idx);
    const match = sub.match(ID_SELECTOR);
    if (match && match.index == 0) {
      return [match[0].length, { type: this.type, value: match[0] }];
    }
    else {
      return NOT_FOUND;
    }
  }
}

class ClassTokenizer {
  public type: TokenType;

  public constructor() {
    this.type = TokenType.CLASS;
  }

  public test(input: string, idx: number): [ number, Token | null ] {
    const sub = input.slice(idx);
    const match = sub.match(CLASS_SELECTOR);
    if (match && match.index == 0) {
      return [match[0].length, { type: this.type, value: match[0] }];
    } else {
      return NOT_FOUND;
    }
  }
}

class WhitespaceTokenizer {
  public type: TokenType;

  public constructor() {
    this.type = TokenType.WHITESPACE;
  }

  public test(input: string, idx: number): [ number, Token | null ] {
    const sub = input.slice(idx);
    const match = sub.match(WHITESPACE);
    if (match && match.index == 0) {
      return [match[0].length, { type: this.type, value: match[0] }];
    } else {
      return NOT_FOUND;
    }
  }
}

class IdentifierTokenizer {
  public type: TokenType;

  public constructor() {
    this.type = TokenType.IDENTIFIER;
  }

  public test(input: string, idx: number): [ number, Token | null ] {
    const sub = input.slice(idx);
    const match = sub.match(IDENTIFIER);
    if (match && match.index == 0) {
      return [match[0].length, { type: this.type, value: match[0] }];
    } else {
      return NOT_FOUND;
    }
  }
}

const tokenizers = [
  new IDTokenizer(),
  new IdentifierTokenizer(),
  new WhitespaceTokenizer(),
  new CharTokenizer(TokenType.GLOBAL, "*"),
  new CharTokenizer(TokenType.COMMA, ","),
  new CharTokenizer(TokenType.PLUS, "+"),
  new CharTokenizer(TokenType.WAVY_LINE, "~"),
  new CharTokenizer(TokenType.LARGER_THAN, ">"),
  new ClassTokenizer(),
];