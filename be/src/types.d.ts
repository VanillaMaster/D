interface JSON {
    parse(buffer: Buffer, reviver?: (this: any, key: string, value: any) => any): any;
}

interface Config {
    assets: string;
    modules: string;
    worker: string;
    cache: string;
    rootpage: string;
    port: number;
}

type packageType = "commonjs" | "module";

interface pjson {
    name: string;
    dependencies?: Record<string, string>
    main?: string;
    type?: packageType
    exports?: Record<string, string | null | pjsonExportRecord>
}

interface pjsonExportRecord {
    import?: string;
    require?: string;
    default?: string;
}