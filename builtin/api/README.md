# @builtin/api
This module defines next HTTP endpoints:

## List available packages
```GET /api/modules```

### Returns:
An object containing packages names as a keys,
and packages info objects as corresponding values

#### Example
```json
{
    "package-a": {
        "origins": [
            "."
        ],
        "exports": {
            ".": "./index.js"
        },
        "dependencies": [],
        "files": [
            "./index.js"
        ],
        "type": "commonjs"
    },
    "package-b": {
        "origins": [
            "."
        ],
        "exports": {
            ".": "./index.js"
        },
        "dependencies": [
            "package-a"
        ],
        "files": [
            "./index.js"
        ],
        "type": "module",
        "kind": [
            "backend"
        ]
    }
}
```

### Optional Query Parameters:
-   `name` - allow get package info object directly, by specifying its name  
    #### Example
    ```GET /api/modules?name=package-b```

    returns:
    ```json
    {
        "origins": [
            "."
        ],
        "exports": {
            ".": "./index.js"
        },
        "dependencies": [
            "package-a"
        ],
        "files": [
            "./index.js"
        ],
        "type": "module",
        "kind": [
            "backend"
        ]
    }
    ```

## List available servises
```GET /api/extensions```

### Returns:
An object containing packages names as a keys,
and arrays of their kinds as corresponding values

#### Example
```json
{
    "package-b": [
        "backend"
    ],
    "package-c": [
        "frontend"
    ],
    "package-d": [
        "backend",
        "frontend"
    ]
}
```

### Optional Query Parameters:
-   `kind` - allow to filter packages, containing only specified name
    #### Example
    ```GET /api/extensions?kind=frontend```

    returns:
    ```json
    {
        "package-c": [
            "frontend"
        ],
        "package-d": [
            "backend",
            "frontend"
        ]
    }
    ```

## Update file
```PUT /modules/<path>```

> **NOTE**: writing to file requres that file or parent folder to be specified as `editable`

### Body 
Binary data to write

## Type Definitions

### Package info
| key          | type             | Extra Information |
| ------------ | ---------------- | ----------------- |
| type         | string           |                   |
| exports      | object           | package.json [exports](https://nodejs.org/api/packages.html#exports) field |
| dependencies | array of string  |                   |
| files        | array of string  |                   |
| origins      | array of string  |                   |
| kind         | ?array of string |                   |
| prefetch     | ?array of string |                   |
| editable     | ?array of string |                   | 
| stylesheet   | ?array of string |                   |