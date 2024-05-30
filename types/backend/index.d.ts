declare namespace backend {

    type PackageType = "commonjs" | "module";
    type ExtensionsType = "server" | "client";
    
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
    
    interface Registry {
        [name: string]: ModuleRecord;
    }

    interface Extensions {
        [name: string]: ExtensionsType[];
    }
    
    interface ModulesState {
        registry: Registry;
        extensions:  Extensions;
    }

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
        kind?: ExtensionsType[];
        prefetch?: string[];
        editable?: string[];
        stylesheet?: string[];
    }
    
    interface Config {
        modules: {
            path: string;
            ignore?: string[];
        }
        extensions: {
            ignore?: string[];
        }
        cache: {
            path: string;
        }
        rootpage: {
            path: string;
        }
        port: number;
    }

}


interface Pjson {
    name: string;
    dependencies: Record<string, string>;

    main?: string;
    type?: Pjson.type;

    exports?: Pjson.exports;
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
}