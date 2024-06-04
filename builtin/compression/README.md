# @builtin/compression
Package with different compression/encoding utilities

## @builtin/compression/base64url
Package for working with url safe base64 encoding

## `function` encode
<pre><code><b>encode</b>(bytes: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array">Uint8Array</a>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a></code></pre>

> Creates a url safe base64-encoded ASCII string from a binary data

### Examples
<details open>
<summary>Example 1</summary>

```js
const text = "Hello, world";
const encoder = new TextEncoder();
const bytes = encoder.encode(text);
const encoded = encode(bytes);
```
</details>

### Parameters
<pre><code><b>bytes</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array">Uint8Array</a></pre></code>

> Data to encode

### Return Type
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a></pre></code>

> An ASCII string containing the url safe base64 representation of bytes

## `function` decode
<pre><code><b>decode</b>(data: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array">Uint8Array</a></code></pre>

> Creates a binary data from a url safe base64-encoded ASCII string

### Examples
<details open>
<summary>Example 1</summary>

```js
const encoded = "SGVsbG8sIHdvcmxk";
const bytes = decode(data);
const decoder = new TextDecoder();
const text = decoder.decode(bytes);
```
</details>

### Parameters
<pre><code><b>data</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a></pre></code>

> An ASCII string containing the url safe base64 representation of bytes

### Return Type
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array">Uint8Array</a></pre></code>

> Decoded bytes