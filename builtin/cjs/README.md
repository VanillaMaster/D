# @builtin/cjs
Tools used in cjs compatibility layer

## <span style="color: royalblue">function</span> preloadCjsPackage
```ts
preloadCjsPackage(pkg: string): Promise<void>
```
Asynchronously preload cjs pacjage by specified package name.<br>
Used in pair with `require` function to avoid synchronous loading

### Examples
<details open>
<summary>Example 1</summary>

```js
await preloadCjsPackage("some-package");
const packageExports = globalRequire("some-package");
```
</details>

### Parameters
```ts
pkg: string
```
String that specifies package name

### Return Type
```ts
Promise<void>
```
A Promise for the completion of preloading

## <span style="color: royalblue">function</span> globalRequire
```ts
globalRequire(specifier: string): any
```
Function implementing cjs `require`
with ability to resolve only `bare` specifier.<br>
Does not cause synchronous loading,
becaus can access only modules from cache,
so must be used with `preloadCjsPackage`

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
```ts
specifier: string
```
Package name, or a specific feature module within a package
prefixed by the package name

### Return Type
```ts
any
```
Exported module content

## <span style="color: royalblue">function</span> absoluteRequire
```ts
absoluteRequire(specifier: string): any
```
Function implementing cjs `require`
with ability to resolve only `absolute` specifier.<br>
Does not cause synchronous loading,
becaus can access only modules from cache,
so must be used with `preloadCjsPackage`

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
```ts
specifier: string
```
Absolute path to required module 

### Return Type
```ts
any
```
Exported module content

## <span style="color: royalblue">function</span> relativeRequire
```ts
relativeRequire(specifier: string, parent: string): any
```
Function implementing cjs `require`
with ability to resolve only `relative` specifier.<br>
Does not cause synchronous loading,
becaus can access only modules from cache,
so must be used with `preloadCjsPackage`

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
```ts
specifier: string
```
Relative path to required module 

```ts
parent: string
```
Path, that `specifier` will be resolved against

### Return Type
```ts
any
```
Exported module content

## <span style="color: royalblue">function</span> createRequire
```ts
createRequire(parent: string): CJSRequire
```
Factory for creating cjs `require` functions

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
```ts
parent: string
```
A path to be used to construct the `require` function.

### Return Type
```ts
CJSRequire
```
Require function

## <span style="color: royalblue">function</span> prepareModuleWrapper
```ts
prepareModuleWrapper(pkg: string, entry?: string | undefined): Promise<string>
```
Prefetching cjs module, executes it, and then return esm weapper

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
```ts
pkg: string
```
String that specifies package name

```ts
entry?: string
```
Subpath to specific feature module within a package

### Return Type
```ts
Promise<string>
```
Text of ESM wrapper

## <span style="color: darkmagenta">type alias</span> CJSRequire
CJS `require` function

### Definition
```ts
(specifier: string) => any
```