interface JSON {
    parse(buffer: Buffer, reviver?: (this: any, key: string, value: any) => any): any;
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
    port: number;
}