import { Token, TokenType } from './tokenizer';

export type Selector = { type: string; params?: (Selector | null)[]; value?: string | (Selector | null)[]; token?: Token };

export class Parser {
  constructor() {}

  parseProgram(tokens: Token[]): { type: string; params: Selector[] } {
    const selectors: Selector[] = [];
    let cur = 0;
    while (cur < tokens.length) {
      const [newCur, selector] = this.parseSelector(tokens, cur);
      selectors.push(selector);
      cur = newCur;
    }
    return { type: 'merge', params: selectors };
  }

  parseSelector(tokens: Token[], cur: number): [number, Selector] {
    let selector: Selector | null = null;
    while (cur < tokens.length && tokens[cur].type !== TokenType.COMMA) {
      const token = tokens[cur];
      if (this.isAtomicSelectorToken(token)) {
        const [newCur, obj] = this.parseToken(tokens, cur);
        cur = newCur;
        if (!selector) {
          selector = { type: 'group', params: [obj] };
        }
        else if (selector.params && selector.params.length < 2) {
          selector.params.push(obj);
          selector = { type: 'group', params: [selector] };
        }
        else {
          selector = { type: 'group', params: [selector, obj] };
        }
      }
      else {
        if (token.type === TokenType.WHITESPACE && this.isWhitespaceCombinator(tokens, cur)) {
          selector = { type: 'descendant', params: [selector] };
        }
        else if (token.type === TokenType.LARGER_THAN) {
          selector = { type: 'child', params: [selector] };
        }
        else if (token.type === TokenType.PLUS) {
          selector = { type: 'nextSibling', params: [selector] };
        }
        else if (token.type === TokenType.WAVY_LINE) {
          selector = { type: 'subsequentSibling', params: [selector] };
        }
        cur++;
      }
    }

    if (cur < tokens.length) {
      cur++;
    }

    return [cur, selector!];
  }

  parseID(tokens: Token[], cur: number): [number, Selector] {
    const value = tokens[cur].value.split('#')[1];
    return [cur + 1, { type: 'id', value, token: tokens[cur] }];
  }

  parseClass(tokens: Token[], cur: number): [number, Selector] {
    const value = tokens[cur].value.split('.')[1];
    return [cur + 1, { type: 'class', value, token: tokens[cur] }];
  }

  parseWhitespace(tokens: Token[], cur: number, last: Selector): [number, Selector | null] {
    let left = cur;
    let right = cur;
    while (left >= 0 && tokens[left].type === TokenType.WHITESPACE) {
      left--;
    }
    while (right < tokens.length && tokens[right].type === TokenType.WHITESPACE) {
      right++;
    }

    if (left >= 0 && right < tokens.length && this.isAtomicSelectorToken(tokens[left]) && this.isAtomicSelectorToken(tokens[right])) {
      const [newRight, rightToken] = this.parseToken(tokens, right, last);
      return [newRight, { type: 'descendant', value: [last, rightToken], token: tokens[cur] }];
    }
    return [right, null];
  }

  parseLargerThan(tokens: Token[], cur: number, last: Selector): [number, Selector] {
    cur++;
    while (cur < tokens.length && tokens[cur].type === TokenType.WHITESPACE) {
      cur++;
    }

    if (cur >= tokens.length || !this.isAtomicSelectorToken(tokens[cur])) {
      throw new Error('Invalid parameter: >');
    }

    const [newCur, obj] = this.parseToken(tokens, cur, last);
    return [newCur, { type: 'child', value: [last, obj] }];
  }

  parseWavyLine(tokens: Token[], cur: number, last: Selector): [number, Selector] {
    cur++;
    while (cur < tokens.length && tokens[cur].type === TokenType.WHITESPACE) {
      cur++;
    }

    if (cur >= tokens.length || !this.isAtomicSelectorToken(tokens[cur])) {
      throw new Error('Invalid parameter ~');
    }

    const [newCur, obj] = this.parseToken(tokens, cur, last);
    return [newCur, { type: 'subsequentSibling', value: [last, obj] }];
  }

  parsePlus(tokens: Token[], cur: number, last: Selector): [number, Selector] {
    cur++;
    while (cur < tokens.length && tokens[cur].type === TokenType.WHITESPACE) {
      cur++;
    }

    if (cur >= tokens.length || !this.isAtomicSelectorToken(tokens[cur])) {
      throw new Error('Invalid parameter +');
    }

    const [newCur, obj] = this.parseToken(tokens, cur, last);
    return [newCur, { type: 'nextSibling', value: [last, obj] }];
  }

  parseToken(tokens: Token[], cur: number, last?: Selector): [number, Selector | null] {
    const token = tokens[cur];
    if (token.type === TokenType.GLOBAL) {
      return [cur + 1, { type: 'global', value: '*', token }];
    }
    else if (token.type === TokenType.IDENTIFIER) {
      return [cur + 1, { type: 'identifier', value: token.value, token }];
    }
    else if (token.type === TokenType.ID) {
      return this.parseID(tokens, cur);
    }
    else if (token.type === TokenType.CLASS) {
      return this.parseClass(tokens, cur);
    }
    else if (token.type === TokenType.WHITESPACE) {
      return this.parseWhitespace(tokens, cur, last!);
    }
    else if (token.type === TokenType.PLUS) {
      return this.parsePlus(tokens, cur, last!);
    }
    else if (token.type === TokenType.WAVY_LINE) {
      return this.parseWavyLine(tokens, cur, last!);
    }
    else if (token.type === TokenType.LARGER_THAN) {
      return this.parseLargerThan(tokens, cur, last!);
    }
    else {
      throw new Error('Unrecognized token');
    }
  }

  isAtomicSelectorToken(token: Token): boolean {
    return (
      token.type === TokenType.GLOBAL ||
      token.type === TokenType.IDENTIFIER ||
      token.type === TokenType.ID ||
      token.type === TokenType.CLASS
    );
  }

  isGroupType(obj: Selector): boolean {
    return (
      obj.type === 'group' ||
      obj.type === 'descendant' ||
      obj.type === 'child' ||
      obj.type === 'subsequentSibling' ||
      obj.type === 'nextSibling'
    );
  }

  isWhitespaceCombinator(tokens: Token[], cur: number): boolean {
    let left = cur;
    let right = cur;
    while (left >= 0 && tokens[left].type === TokenType.WHITESPACE) {
      left--;
    }
    while (right < tokens.length && tokens[right].type === TokenType.WHITESPACE) {
      right++;
    }

    return (
      left >= 0 &&
      right < tokens.length &&
      this.isAtomicSelectorToken(tokens[left]) &&
      this.isAtomicSelectorToken(tokens[right])
    );
  }
}
