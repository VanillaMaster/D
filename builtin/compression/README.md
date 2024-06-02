# @builtin/compression
Package with different compression/encoding utilities

## @builtin/compression/base64url
Package for working with url safe base64 encoding

## <span style="color: royalblue">function</span> encode
```ts
encode(bytes: Uint8Array): string
```
Creates a url safe base64-encoded ASCII string from a binary data

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
```ts
bytes: Uint8Array
```
Data to encode

### Return Type
```ts
string
```
An ASCII string containing the url safe base64 representation of bytes

## <span style="color: royalblue">function</span> decode
```ts
decode(data: string): Uint8Array
```

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
```ts
data: string
```
An ASCII string containing the url safe base64 representation of bytes

### Return Type
```ts
Uint8Array
```
Decoded bytes