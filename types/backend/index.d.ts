type PackageType = "commonjs" | "module";

interface ModuleRecord {
    type: PackageType;
    exports: Record<string, string>;
    dependencies: string[];
    files: string[];
    kind?: string[];
    prefetch?: string[];
    editable?: string[];
    stylesheet?: string[];
}

type Registry = Record<string, ModuleRecord>;

interface PjsonExportRecord {
    import?: string;
    require?: string;
    default?: string;
}

interface PjsonExportMap {
    [K: string]: string | null | PjsonExportRecord
}

interface Pjson {
    name: string;
    dependencies: Record<string, string>;
    main?: string;
    type?: PackageType;
    exports?: string | object;
    kind?: string[];
    prefetch?: string[];
    editable?: string[];
    stylesheet?: string[];
}