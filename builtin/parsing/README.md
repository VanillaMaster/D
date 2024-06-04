# @builtin/parsing

## @builtin/parsing/xml

### `class` XMLNode
> Represent an XML element

#### Constructors
<pre><code><i>new</i> <b>XMLNode</b>(name: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>, attributes: <a href="https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type">Record</a>&lt;<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>&gt;, parent: <a href="#class-xmlnode">XMLNode</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a>)</code></pre>

#### Properties
<pre><code><b>children</b>: { [<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol">Symbol</a>("length")]: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>; } & { [i: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>]: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | <a href="#class-xmlnode">XMLNode</a>; } & { [k: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>]: <a href="#class-xmlnode">XMLNode</a>; }</code></pre>

<pre><code><i>readonly</i> <b>text</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a></code></pre>

> text content of the node

#### Methods
<pre><code><b>addChildren</b>(...childrens: (<a href="#class-xmlnode">XMLNode</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>)[]): void</code></pre>

> Inserts nodes after the last child of node

### `class` XMLSaxStream
> extends
> <pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/API/TransformStream">TransformStream</a>&lt;<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>, <a href="#class-xmlnode">XMLNode</a>&gt;</code></pre>