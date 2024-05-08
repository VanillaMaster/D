interface JSON {
    parse(buffer: Buffer, reviver?: (this: any, key: string, value: any) => any): any;
}

interface Config {
    assets: {
        path: string;
    }
    modules: {
        path: string;
        ignore: string[];
    }
    worker: {
        path: string;
    }
    cache: {
        path: string;
    }
    rootpage: {
        path: string;
    }
    port: number;
}