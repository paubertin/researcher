import { JSSoupAdapter } from "./adapter";

export class Combinator {
  public constructor(public adapter: JSSoupAdapter) {}

  public descendant(elements: any[]) {
    const dict = new Set() 
    elements.forEach((e) => {
      this.adapter.descendants(e).forEach((d: any) => dict.add(d)) 
    })
    return Array.from(dict); 
  }

  public child(elements: any[]) {
    let children: any[] = []
    elements.forEach(e => {
      children = children.concat(this.adapter.children(e))
    })
    return children; 
  }

  public nextSibling(elements: any[]) {
    let siblings: any[] = []
    elements.forEach(e => {
      siblings.push(this.adapter.nextSibling(e))
    })
    return siblings; 
  }

  public subsequentSibling(elements: any[]) {
    let siblings: any[] = []
    elements.forEach(e => {
      siblings = siblings.concat(this.adapter.nextSiblings(e))
    })
    return siblings; 
  }
}