interface JSON {
    parse(buffer: Buffer, reviver?: (this: any, key: string, value: any) => any): any;
}