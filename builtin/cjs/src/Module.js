export class Module {
    /**
     * @param { string } id
     * @param { string } filename
     * @param { any } exports
     */
    constructor(id, filename, exports) {
        this.id = id;
        this.filename = filename;
        this.exports = exports;
        ({ pathname: this.dirname } = new URL(".", new URL(filename, document.location.origin)));
    }
    /**
     * @type { any }
     */
    exports;
    /**
     * @readonly
     * @type { string }
     */
    filename;
    /**
     * @readonly
     * @type { string }
     */
    dirname;
    /**
     * @readonly
     * @type { string }
     */
    id;
}
