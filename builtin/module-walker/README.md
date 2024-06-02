# @builtin/module-walker
Package with module utilities

## @builtin/module-walker/esm
Package with functions related to esm resolution

### <span style="color: royalblue">function</span> patternKeyCompare
```
patternKeyCompare(a: string, b: string): number
```
Compares two strings that may contain a wildcard character ('*')
and returns a value indicating their order

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
```
a: string
```
The first string to compare

```
b: string
```
The second string to compare

#### Return Type
```
number
```
A negative number if `a` should come before `b`,
a positive number if `a` should come after `b`,
or 0 if they are equal.

### <span style="color: royalblue">function</span> packageTargetResolve
```
packageTargetResolve(target: string | null | ArrayExports | ConditionalExports, patternMatch: string | null, conditions: readonly string[]): string | null | undefined
```
Resolves the target of a package based on the provided conditions

#### Examples
<details open>
<summary>Example 1</summary>

```js
const target = packageTargetResolve({ default: "./*.js"}, "index", ["node", "import", "default"])
```
</details>

#### Parameters
```
target: string | null | ArrayExports | ConditionalExports
```
The target to resolve

```
patternMatch: string | null
```
Substitution for pattern, or null if pattern wasnt used

```
conditions: readonly string[]
```
The conditions to match

#### Return Type
```
string | null | undefined
```
The resolved target, or null if not found, or undefined if not resolvable

### <span style="color: royalblue">function</span> exportsResolve
```
exportsResolve(subpath: string, exports: SubpathExports, conditions: readonly string[]): string | null | undefined
```
Resolves exports of a package based on the provided conditions

#### Examples
<details open>
<summary>Example 1</summary>

```js
const target = exportsResolve(pjson.exports, ".", ["node", "import", "default"])
```
</details>

#### Parameters
```
subpath: string
```
Subpath to resolve

```
exports: SubpathExports
```
Subpath exports object

```
conditions: readonly string[]
```
The conditions to match

#### Return Type
```
string | null | undefined
```
The resolved target, or null if not found, or undefined if not resolvable

### <span style="color: royalblue">function</span> exportsResolvePackage
```
exportsResolvePackage(pkg: backend.ModuleRecord, conditions: readonly string[]): Record<string, string>
```
Resolves all exports of module, available for provided conditions

#### Examples
<details open>
<summary>Example 1</summary>

```js
const origins = exportsResolvePackage(moduleRecord, ["node", "import", "default"]);
```
</details>

#### Parameters
```
pkg: ModuleRecord
```
Record of module for which exports to resolve

```
conditions: readonly string[]
```
The conditions to match

#### Return Type
```
Record<string, string>
```
Object with subpath as key and corresponding resolution as value

### <span style="color: royalblue">function</span> getExportsType
```
getExportsType(exports: Exports): number
```
Determine exports object type

#### Examples
<details open>
<summary>Example 1</summary>

```js
const type = getExportsType(pjson.exports);
```
</details>

#### Parameters
```
exports: Exports
```
Exports record value

#### Return Type
```
number
```
`0` for subpath exports, `1` for shorthand exports,
`2` for invalid exports object 

### <span style="color: royalblue">function</span> getExports
```
getExports(exports: Exports, type: number): SubpathExports
```
Convert valid exports record value to subpath exports object

#### Examples
<details open>
<summary>Example 1</summary>

```js
const type = getExportsType(pjson.exports);
const exports = getExports(pjson.exports, type)
```
</details>

#### Parameters
```
exports: Exports
```
Valid exports record value

```
type: number
```
Exports object type

#### Return Type
```
SubpathExports
```
Subpath exports object

### <span style="color: burlywood">interface</span> ModuleRecord
#### Properties
```
type: "commonjs" | "module"
```
```
exports: SubpathExports
```
```
dependencies:  string[]
```
```
files: string[]
```
```
origins: string[]
```
```
kind?: string[]
```
```
prefetch?: string[]
```
```
editable?: string[]
```
```
stylesheet?: string[]
```

### <span style="color: burlywood">interface</span> SubpathExports
#### Properties
```
[subpath: `.${string}`]: string | null | ArrayExports | ConditionalExports;
```

### <span style="color: burlywood">interface</span> ConditionalExports
#### Properties
```
import?:  string | null | ArrayExports | ConditionalExports;
```
```
require?: string | null | ArrayExports | ConditionalExports;
```
```
default?: string | null | ArrayExports | ConditionalExports;
```

### <span style="color: burlywood">interface</span> ArrayExports
extends
```
Array<string | null | ArrayExports | ConditionalExports>
```

## <span style="color: darkmagenta">type alias</span> Exports
### Definition
```
string | null | ArrayExports | ConditionalExports | SubpathExports;
```

## @builtin/module-walker/backend
Package containing module traverse tools

### <span style="color: royalblue">function</span> listModules
```
listModules(path: string): Promise<ModulesState>
```
Traverse and collect information about all modules

#### Examples
<details open>
<summary>Example 1</summary>

```js
const info = await listModulesV2("../node_modules");
```
</details>

#### Parameters
```
path: string
```
Path to modules folder 

#### Return Type
```
Promise<ModulesState>
```
Collected information

### <span style="color: burlywood">interface</span> ModulesState
#### Properties
```
registry: Registry
```
```
extensions: Extensions
```

### <span style="color: burlywood">interface</span> Registry
#### Properties
```
[name: string]: ModuleRecord
```

### <span style="color: burlywood">interface</span> Extensions
#### Properties
```
[name: string]: ("server" | "client")[]
```
