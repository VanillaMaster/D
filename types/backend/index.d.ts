declare namespace backend {

    type PackageType = "commonjs" | "module";
    type ExtensionsType = "server" | "client";
    
    interface ModuleRecord {
        type: PackageType;
        exports: Pjson.SubpathExports;
        dependencies: string[];
        files: string[];
        origins: string[];
        kind?: string[];
        prefetch?: string[];
        editable?: string[];
        stylesheet?: string[];
    }
    
    interface Registry {
        [name: string]: ModuleRecord;
    }

    interface Extensions {
        [name: string]: ExtensionsType[];
    }
    
    interface ModulesState {
        registry: Registry;
        extensions: Extensions;
    }
    
}


interface Pjson {
    name: string;
    dependencies: Record<string, string>;

    main?: string;
    type?: Pjson.type;

    exports?: Pjson.exports;

    kind?: Pjson.kind;
    prefetch?: Pjson.prefetch;
    editable?: Pjson.editable;
    stylesheet?: Pjson.stylesheet;
}

declare namespace Pjson {
    interface ArrayExports extends Array<string | null | ArrayExports | ConditionalExports> {}
    
    interface ConditionalExports {
        import?:  string | null | ArrayExports | ConditionalExports;
        require?: string | null | ArrayExports | ConditionalExports;
        default?: string | null | ArrayExports | ConditionalExports;
    }

    interface SubpathExports {
        [subpath: `.${string}`]: string | null | ArrayExports | ConditionalExports;
    }

    type exports = string | null | ArrayExports | ConditionalExports | SubpathExports;


    type type = "commonjs" | "module";
    type kind = ("server" | "client")[];
    type prefetch = string[];
    type editable = string[];
    type stylesheet = string[];
}