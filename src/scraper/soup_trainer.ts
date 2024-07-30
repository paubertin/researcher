export class SoupStrainer {
  name: any;
  attrs: { [key: string]: any };
  string: any;
  text: any;

  /**
   * Encapsulates a number of ways of matching a markup element (tag or
   * string).
   * This is primarily used to underpin the find_* methods, but you can
   * create one yourself and pass it in as `parse_only` to the
   * `BeautifulSoup` constructor, to parse a subset of a large
   * document.
   */
  constructor(name: any = null, attrs: { [key: string]: any } = {}, str: any = null, ...kwargs: any[]) {


      this.name = this._normalize_search_value(name);


      if (Object.keys(kwargs).length) {
          if (Object.keys(attrs).length) {
              attrs = { ...attrs, ...kwargs };
          } else {
              attrs = kwargs;
          }
      }

      let normalized_attrs: { [key: string]: any } = {};
      for (let [key, value] of Object.entries(attrs)) {
          normalized_attrs[key] = this._normalize_search_value(value);
      }

      this.attrs = normalized_attrs;
      this.string = this._normalize_search_value(str);

      // DEPRECATED but just in case someone is checking this.
      this.text = this.string;
  }

  _normalize_search_value(value: any): any {
      if (typeof value === 'string' || typeof value === 'function' || value instanceof RegExp || typeof value === 'boolean' || value === null) {
          return value;
      }

      if (value instanceof Buffer) {
          return value.toString('utf8');
      }

      if (value && typeof value[Symbol.iterator] === 'function') {
          let newValue: any[] = [];
          for (let v of value) {
              if (v && typeof v[Symbol.iterator] === 'function' && !(v instanceof Buffer) && typeof v !== 'string') {
                  newValue.push(v);
              } else {
                  newValue.push(this._normalize_search_value(v));
              }
          }
          return newValue;
      }

      return String(value);
  }

  toString(): string {
      if (this.string) {
          return this.string;
      } else {
          return `${this.name}|${JSON.stringify(this.attrs)}`;
      }
  }

  search_tag(markup_name: any = null, markup_attrs: { [key: string]: any } = {}): any {
      let found = null;
      let markup = null;
      if (markup_name instanceof Tag) {
          markup = markup_name;
          markup_attrs = markup;
      }

      if (typeof this.name === 'string') {
          if (markup && !markup.prefix && this.name !== markup.name) {
              return false;
          }
      }

      const call_function_with_tag_data = (
          typeof this.name === 'function' && !(markup_name instanceof Tag)
      );

      if ((!this.name) || call_function_with_tag_data || (markup && this._matches(markup, this.name)) || (!markup && this._matches(markup_name, this.name))) {
          let match = true;
          if (call_function_with_tag_data) {
              match = this.name(markup_name, markup_attrs);
          } else {
              let markup_attr_map: { [key: string]: any } = {};
              for (let [attr, match_against] of Object.entries(this.attrs)) {
                  if (!markup_attr_map) {
                      if ('get' in markup_attrs) {
                          markup_attr_map = markup_attrs;
                      } else {
                          markup_attr_map = {};
                          for (let [k, v] of Object.entries(markup_attrs)) {
                              markup_attr_map[k] = v;
                          }
                      }
                  }
                  const attr_value = markup_attr_map[attr];
                  if (!this._matches(attr_value, match_against)) {
                      match = false;
                      break;
                  }
              }
          }
          if (match) {
              if (markup) {
                  found = markup;
              } else {
                  found = markup_name;
              }
          }
      }
      if (found && this.string && !this._matches(found.string, this.string)) {
          found = null;
      }
      return found;
  }

  search(markup: any): any {
      let found = null;
      if (markup && typeof markup[Symbol.iterator] === 'function' && !(markup instanceof Tag) && typeof markup !== 'string') {
          for (let element of markup) {
              if (element instanceof NavigableString && this.search(element)) {
                  found = element;
                  break;
              }
          }
      } else if (markup instanceof Tag) {
          if (!this.string || this.name || this.attrs) {
              found = this.search_tag(markup);
          }
      } else if (markup instanceof NavigableString || typeof markup === 'string') {
          if (!this.name && !this.attrs && this._matches(markup, this.string)) {
              found = markup;
          }
      } else {
          throw new Error(`I don't know how to match against a ${markup.constructor.name}`);
      }
      return found;
  }

  _matches(markup: any, match_against: any, already_tried: Set<any> = new Set()): boolean {
      if (Array.isArray(markup)) {
          for (let item of markup) {
              if (this._matches(item, match_against)) {
                  return true;
              }
          }
          if (this._matches(markup.join(' '), match_against)) {
              return true;
          }
          return false;
      }

      if (match_against === true) {
          return markup !== null;
      }

      if (typeof match_against === 'function') {
          return match_against(markup);
      }

      let original_markup = markup;
      if (markup instanceof Tag) {
          markup = markup.name;
      }

      markup = this._normalize_search_value(markup);

      if (markup === null) {
          return !match_against;
      }

      if (typeof match_against[Symbol.iterator] === 'function' && typeof match_against !== 'string') {
          for (let item of match_against) {
              if (!already_tried.has(item)) {
                  already_tried.add(item);
                  if (this._matches(original_markup, item, already_tried)) {
                      return true;
                  }
              }
          }
          return false;
      }

      let match = false;

      if (typeof match_against === 'string') {
          match = markup === match_against;
      }

      if (!match && match_against instanceof RegExp) {
          return match_against.test(markup);
      }

      if (!match && original_markup instanceof Tag && original_markup.prefix) {
          return this._matches(original_markup.prefix + ':' + original_markup.name, match_against);
      }

      return match;
  }
}

class Tag {
  name: string;
  prefix: string | null;
  string: string | null;

  constructor(name: string, prefix: string | null = null, string: string | null = null) {
      this.name = name;
      this.prefix = prefix;
      this.string = string;
  }
}

class NavigableString extends String {
}
