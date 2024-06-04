/**@import { SAXParser, Tag } from "sax" */
import { parser as Parser } from "sax";

/**@typedef { { [SELF]: XMLSaxStreamTransformer; } } MetaSaxParser */
const LENGTH = Symbol("length");
const SELF = Symbol("self");
const CONTROLLER = Symbol("controller")

/**
 * Represent an XML element
 */
export class XMLNode {
    /**
     * @param { string } name 
     * @param { Record<string, string> } attributes 
     * @param { XMLNode | null } parent 
     */
    constructor(name, attributes, parent) {
        this.name = name;
        this.attributes = attributes;
        this.parent = parent;
    }
    /**@type { { [LENGTH]: number; } & { [i: number]: XMLNode | string; } & { [k: string]: XMLNode; } } */
    children = { [LENGTH]: 0 };

    /**
     * text content of the node
     * 
     * @readonly
     */
    get text() {
        /**@type { string[] } */
        const buffer = [];
        const { [LENGTH]: length } = this.children;
        for (let i = 0; i < length; i++) {
            const element = this.children[i];
            if (typeof element == "string") buffer.push(element);
        }
        return buffer.join("");
    }

    /**
     * Inserts nodes after the last child of node
     * 
     * @param  { ...XMLNode | string } childrens 
     */
    addChildren(...childrens) {
        for (const children of childrens) {
            this.children[this.children[LENGTH]++] = children;
            if (children instanceof XMLNode) this.children[children.name] ??= children;
        }
    }

}

export class XMLSaxStream extends /**@type { { new (transformer?: Transformer<string, XMLNode>, writableStrategy?: QueuingStrategy, readableStrategy?: QueuingStrategy): TransformStream<string, XMLNode>; prototype: TransformStream<string, XMLNode>; } } */ (TransformStream) {
    /**
     * @param { string[] } collect 
     */
    constructor(collect) {
        const transformer = new XMLSaxStreamTransformer(collect);
        super(transformer);
        this.transformer = transformer;
    }

    /**
     * @private
     * @readonly
     * @type { XMLSaxStreamTransformer }
     */
    transformer;
}

/**@implements { Transformer<string, XMLNode> } */
class XMLSaxStreamTransformer {
    /**
     * @param { string[] } collect 
     */
    constructor(collect) {
        /**
         * @readonly
         * @type { readonly string[] }
         */
        this.collect = collect;
        this.parser[SELF] = this;
        this.parser.onopentag = this.onopentag;
        this.parser.onclosetag = this.onclosetag;
        this.parser.oncdata = this.oncdata;
        this.parser.ontext = this.ontext;
    }
    /**
     * @readonly
     * @type { XMLNode[] }
     */
    stack = [];
    /**
     * @readonly
     * @type { SAXParser & Partial<MetaSaxParser> }
     */
    parser = Parser(true, { trim: true });
    /**
     * @type { TransformStreamDefaultController<XMLNode> | null } 
     */
    [CONTROLLER] = null;
    /**
     * @type { TransformStreamDefaultController<XMLNode> } 
     */
    get controller() {
        if (this[CONTROLLER] !== null) return this[CONTROLLER];
        throw new Error();
    }
    

    /**@type { TransformerStartCallback<XMLNode> } */
    start(controller) {
        this[CONTROLLER] = controller;
    }

    /**@type { TransformerTransformCallback<string, XMLNode> } */
    transform(chunk, controller) {
        this.parser.write(chunk);
    }

    /**
     * @this { SAXParser & MetaSaxParser }
     * @param { Tag } tag 
     */
    onopentag(tag) {
        const { [SELF]: self } = this;
        if (self.stack.length == 0 && self.collect.includes(tag.name)) {
            self.stack.push(new XMLNode(tag.name, /**@type { Record<string, string> }*/(tag.attributes), null))
        } else if (self.stack.length > 0) {
            const parent = self.stack[self.stack.length - 1];
            const children = new XMLNode(tag.name, /**@type { Record<string, string> }*/(tag.attributes), parent);
            parent.addChildren(children);
            self.stack.push(children);
        }
    }

    /**
     * @this { SAXParser & MetaSaxParser }
     * @param { string } tag 
     */
    onclosetag(tag) {
        const { [SELF]: self } = this;
        if (self.stack.length == 1) {
            const element = /**@type { XMLNode } */(self.stack.pop());
            self.controller.enqueue(element);
        } else if (self.stack.length > 0) {
            self.stack.pop();
        }
    }

    /**
     * @this { SAXParser & MetaSaxParser }
     * @param { string } text 
     */
    ontext(text) {
        const { [SELF]: self } = this;
        if (self.stack.length > 0) {
            const parent = self.stack[self.stack.length - 1];
            parent.addChildren(text);
        }
    }
    /**
     * @this { SAXParser & MetaSaxParser }
     * @param { string } text 
     */
    oncdata(text) {
        const { [SELF]: self } = this;
        if (self.stack.length > 0) {
            const parent = self.stack[self.stack.length - 1];
            parent.addChildren(text);
        }
    }
}