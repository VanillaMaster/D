# @builtin/cjs
Tools used in cjs compatibility layer

## `function` preloadCjsPackage

<pre><code><b>preloadCjsPackage</b>(pkg: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a>&lt;void&gt;</code></pre>

> Asynchronously preload cjs pacjage by specified package name.<br>
> Used in pair with `require` function to avoid synchronous loading

### Examples
<details open>
<summary>Example 1</summary>

```js
await preloadCjsPackage("some-package");
const packageExports = globalRequire("some-package");
```
</details>

### Parameters
<pre><code><b>pkg</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a></pre></code>
> String that specifies package name

### Return Type
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a>&lt;void&gt;</pre></code>
> A Promise for the completion of preloading



## `function` globalRequire
<pre><code><b>globalRequire</b>(specifier: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>): <a href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any">any</a></pre></code>

> Function implementing cjs `require`
> with ability to resolve only `bare` specifier.<br>
> Does not cause synchronous loading,
> becaus can access only modules from cache,
> so must be used with `preloadCjsPackage`

### Examples
<details open>
<summary>Example 1</summary>

```js
await preloadCjsPackage("package");
const somePackage = globalRequire("some-package");
const somePackageShuffle = globalRequire("some-package/shuffle");
```
</details>

### Parameters
<pre><code><b>specifier</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a></pre></code>

> Package name, or a specific feature module within a package
> prefixed by the package name

### Return Type
<pre><code><a href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any">any</a></pre></code>

> Exported module content

## `function` absoluteRequire
<pre><code><b>absoluteRequire</b>(specifier: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>): <a href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any">any</a></pre></code>

> Function implementing cjs `require`
> with ability to resolve only `absolute` specifier.<br>
> Does not cause synchronous loading,
> becaus can access only modules from cache,
> so must be used with `preloadCjsPackage`

### Examples
<details open>
<summary>Example 1</summary>

```js
//some-package located at /home/user/bin/
await preloadCjsPackage("some-package");
const packageExports = absoluteRequire("/home/user/bin/some-package/src/script.js");
```
</details>

### Parameters
<pre><code><b>specifier</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a></pre></code>

> Absolute path to required module 

### Return Type
<pre><code><a href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any">any</a></pre></code>

> Exported module content

## `function` relativeRequire
<pre><code><b>relativeRequire</b>(specifier: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>, parent: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>): <a href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any">any</a></pre></code>

> Function implementing cjs `require`
> with ability to resolve only `relative` specifier.<br>
> Does not cause synchronous loading,
> becaus can access only modules from cache,
> so must be used with `preloadCjsPackage`

### Examples
<details open>
<summary>Example 1</summary>

```js
//some-package located at /home/user/bin/
await preloadCjsPackage("some-package");
const packageExports = relativeRequire("./src/script.js", "/home/user/bin/some-package");
```
</details>

### Parameters
<pre><code><b>specifier</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a></pre></code>

> Relative path to required module 

<pre><code><b>parent</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a></pre></code>

> Path, that `specifier` will be resolved against

### Return Type
<pre><code><a href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any">any</a></pre></code>

> Exported module content

## `function` createRequire
<pre><code><b>createRequire</b>(parent: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>): <a href="#type-alias-cjsrequire">CJSRequire</a></pre></code>

> Factory for creating cjs `require` functions

### Examples
<details open>
<summary>Example 1</summary>

```js
const require = createRequire(import.meta.url);
// sibling-module.js is a CommonJS module.
const siblingModule = require('./sibling-module'); 
```
</details>

### Parameters
<pre><code><b>parent</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a></pre></code>

> A path to be used to construct the `require` function.

### Return Type
<pre><code><a href="#type-alias-cjsrequire">CJSRequire</a></pre></code>

> `require` function

## `function` prepareModuleWrapper
<pre><code><b>prepareModuleWrapper</b>(pkg: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>, entry?: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a>&lt;<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>&gt;</pre></code>

> Prefetching cjs module, executes it, and then return esm weapper

### Examples
<details open>
<summary>Example 1</summary>

```js
const ESMWrapper = await prepareModuleWrapper("some-package")
```

`some-package` source text:
```js
exports.answer = 42;
```

constructed wrapper:
```js
import { globalRequire } from "@builtin/cjs/frontend";
const module = globalRequire("some-package");
export default module;
export const {
    answer
} = module;
```

</details>
<details open>
<summary>Example 2</summary>

```js
const ESMWrapper = await prepareModuleWrapper("some-package", "./shuffle")
```
</details>

### Parameters
<pre><code><b>pkg</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a></pre></code>

> String that specifies package name

<pre><code><i>optional</i> <b>entry</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a></pre></code>

>Subpath to specific feature module within a package

### Return Type
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a>&lt;<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>&gt;</pre></code>

> Text of ESM wrapper

## `type alias` CJSRequire
CJS `require` function

### Definition
<pre><code>(specifier: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>) => <a href="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any">any</a></pre></code>