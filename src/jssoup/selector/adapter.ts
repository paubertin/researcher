type DOMElement = any;

export class JSSoupAdapter {

  descendants(domElement: DOMElement) {
    return domElement.descendants.filter(this.isTagElement)
  }
  
  children(domElement: DOMElement) {
    return domElement.contents.filter(this.isTagElement)
  }
  
  nextSibling(domElement: DOMElement) {
    var nextSiblings = this.nextSiblings(domElement);
    if (nextSiblings.length > 0) return nextSiblings[0];
    return null;
  }

  nextSiblings(domElement: DOMElement) {
    return domElement.nextSiblings.filter(this.isTagElement);
  }

  elementName(domElement: DOMElement) {
    return domElement.name;
  }

  attributes(domElement: DOMElement) {
    return domElement.attrs
  }
  
  name(domElement: DOMElement) {
    return domElement.name
  }
  
  isTagElement(domElement: DOMElement) {
    return domElement.constructor.name === "SoupTag"
  }
}