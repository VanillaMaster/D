# @builtin/module-walker
Package with module utilities

## @builtin/module-walker/esm
Package with functions related to esm resolution

### `function` patternKeyCompare
<pre><code><b>patternKeyCompare</b>(a: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>, b: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a></code></pre>

> Compares two strings that may contain a wildcard character ('*')
> and returns a value indicating their order

#### Examples
<details open>
<summary>Example 1</summary>

```js
const unorderedKyes = ["./*.js", "./esm/*.js"];
const orderedKeys = unorderedKyes.sort(patternKeyCompare);
const mostSpecificKey = orderedKeys[0]
```
</details>

#### Parameters
<pre><code><b>a</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a></pre></code>

> The first string to compare

<pre><code><b>b</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a></pre></code>

> The second string to compare

#### Return Type
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">number</a></pre></code>

> A negative number if `a` should come before `b`,
> a positive number if `a` should come after `b`,
> or 0 if they are equal.

### `function` packageTargetResolve
<pre><code><b>packageTargetResolve</b>(target: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="#interface-arrayexports">ArrayExports</a> | <a href="#interface-conditionalexports">ConditionalExports</a>, patternMatch: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a>, conditions: <i>readonly</i> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>[]): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined">undefined</a></code></pre>

> Resolves the target of a package based on the provided conditions

#### Examples
<details open>
<summary>Example 1</summary>

```js
const target = packageTargetResolve({ default: "./*.js"}, "index", ["node", "import", "default"])
```
</details>

#### Parameters
<pre><code><b>target</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="#interface-arrayexports">ArrayExports</a> | <a href="#interface-conditionalexports">ConditionalExports</a></code></pre>

> The target to resolve

<pre><code><b>patternMatch</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a></code></pre>

> Substitution for pattern, or null if pattern wasnt used

<pre><code><b>conditions</b>: <i>readonly</i> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>[]</code></pre>

> The conditions to match

#### Return Type
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined">undefined</a></code></pre>

> The resolved target, or null if not found, or undefined if not resolvable

### `function` exportsResolve
<pre><code><b>exportsResolve</b>(subpath: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>, exports: <a href="#interface-subpathexports">SubpathExports</a>, conditions: <i>readonly</i> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>[]): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined">undefined</a></code></pre>

> Resolves exports of a package based on the provided conditions

#### Examples
<details open>
<summary>Example 1</summary>

```js
const target = exportsResolve(pjson.exports, ".", ["node", "import", "default"])
```
</details>

#### Parameters
<pre><code><b>subpath</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a></pre></code>

> Subpath to resolve

<pre><code><b>exports</b>: <a href="#interface-subpathexports">SubpathExports</a></pre></code>

> Subpath exports object

<pre><code><b>conditions</b>: <i>readonly</i> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>[]</pre></code>

> The conditions to match

#### Return Type
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined">undefined</a></code></pre>

> The resolved target, or null if not found, or undefined if not resolvable

### `function` exportsResolvePackage
<pre><code><b>exportsResolvePackage</b>(pkg: <a href="#interface-modulerecord">ModuleRecord</a>, conditions: <i>readonly</i> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>[]): <a href="https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type">Record</a>&lt;<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>&gt;</code></pre>

> Resolves all exports of module, available for provided conditions

#### Examples
<details open>
<summary>Example 1</summary>

```js
const origins = exportsResolvePackage(moduleRecord, ["node", "import", "default"]);
```
</details>

#### Parameters
<pre><code><b>pkg</b>: <a href="#interface-modulerecord">ModuleRecord</a></code></pre>

> Record of module for which exports to resolve

<pre><code><b>conditions</b>: <i>readonly</i> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>[]</code></pre>

> The conditions to match

#### Return Type
<pre><code><a href="https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type">Record</a>&lt;<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>&gt;</code></pre>

> Object with subpath as key and corresponding resolution as value

### `function` getExportsType
<pre><code><b>getExportsType</b>(exports: <a href="#type-alias-exports">Exports</a>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a></code></pre>

> Determine exports object type

#### Examples
<details open>
<summary>Example 1</summary>

```js
const type = getExportsType(pjson.exports);
```
</details>

#### Parameters
<pre><code><b>exports</b>: <a href="#type-alias-exports">Exports</a></code></pre>

> Exports record value

#### Return Type
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a></code></pre>

> `0` for subpath exports, `1` for shorthand exports,
> `2` for invalid exports object

### `function` getExports
<pre><code><b>getExports</b>(exports: <a href="#type-alias-exports">Exports</a>, type: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a>): <a href="#interface-subpathexports">SubpathExports</a></code></pre>

> Convert valid exports record value to subpath exports object

#### Examples
<details open>
<summary>Example 1</summary>

```js
const type = getExportsType(pjson.exports);
const exports = getExports(pjson.exports, type)
```
</details>

#### Parameters
<pre><code><b>exports</b>: <a href="#type-alias-exports">Exports</a></code></pre>

> Valid exports record value
<pre><code><b>type</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">number</a></code></pre>

> Exports object type

#### Return Type
<pre><code><a href="#interface-subpathexports">SubpathExports</a></code></pre>

> Subpath exports object

### `interface` ModuleRecord
#### Properties

<pre><code><b>type</b>: "commonjs" | "module"</code></pre>

<pre><code><b>exports</b>: <a href="#interface-subpathexports">SubpathExports</a></code></pre>

<pre><code><b>dependencies</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>[]</code></pre>

<pre><code><b>files</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>[]</code></pre>

<pre><code><b>origins</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>[]</code></pre>

<pre><code><i>optional</i> <b>kind</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>[]</code></pre>

<pre><code><i>optional</i> <b>prefetch</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>[]</code></pre>

<pre><code><i>editable</i> <b>prefetch</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>[]</code></pre>

<pre><code><i>editable</i> <b>stylesheet</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>[]</code></pre>

### `interface` SubpathExports
#### Properties

<pre><code>[<b>subpath</b>: `.${<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>}`]: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="#interface-arrayexports">ArrayExports</a> | <a href="#interface-conditionalexports">ConditionalExports</a></code></pre>

### `interface` ConditionalExports
#### Properties
<pre><code><i>optional</i> <b>import</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="#interface-arrayexports">ArrayExports</a> | <a href="#interface-conditionalexports">ConditionalExports</a></code></pre>

<pre><code><i>optional</i> <b>require</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="#interface-arrayexports">ArrayExports</a> | <a href="#interface-conditionalexports">ConditionalExports</a></code></pre>

<pre><code><i>optional</i> <b>default</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="#interface-arrayexports">ArrayExports</a> | <a href="#interface-conditionalexports">ConditionalExports</a></code></pre>

### `interface` ArrayExports
> extends
> <pre><code>Array&lt;<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="#interface-arrayexports">ArrayExports</a> | <a href="#interface-conditionalexports">ConditionalExports</a>&gt;</code></pre>

## `type alias` Exports
### Definition
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null">null</a> | <a href="#interface-arrayexports">ArrayExports</a> | <a href="#interface-conditionalexports">ConditionalExports</a> | <a href="#interface-subpathexports">SubpathExports</a></code></pre>



## @builtin/module-walker/backend
Package containing module traverse tools

### `function` listModules
<pre><code><b>listModules</b>(path: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a>): <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a>&lt;<a href="#interface-modulesstate">ModulesState</a>&gt;</code></pre>

> Traverse and collect information about all modules

#### Examples
<details open>
<summary>Example 1</summary>

```js
const info = await listModulesV2("../node_modules");
```
</details>

#### Parameters
<pre><code><b>path</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">string</a></code></pre>

> Path to modules folder 

#### Return Type
<pre><code><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Promise</a>&lt;<a href="#interface-modulesstate">ModulesState</a>&gt;</code></pre>

> Collected information

### `interface` ModulesState
#### Properties
<pre><code><b>registry</b>: <a href="#interface-registry">Registry</a></code></pre>

<pre><code><b>extensions</b>: <a href="#interface-extensions">Extensions</a></code></pre>

### `interface` Registry
#### Properties
<pre><code>[<b>name</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>]: <a href="#interface-modulerecord">ModuleRecord</a></code></pre>

### `interface` Extensions
#### Properties
<pre><code>[<b>name</b>: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">string</a>]: ("server" | "client")[]</code></pre>

