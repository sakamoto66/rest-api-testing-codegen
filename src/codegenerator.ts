import * as fs from 'fs';

export class CodeGenerator {
    #count:number = 0;
    #stream:number = 0;
    #indent:string = '';
    
    constructor() {
    }

    open(fpath:string, indent?:string) {
        this.#count = 0;
        this.#stream = fs.openSync(fpath, "w");
        this.#indent = indent ? indent : '';
    }

    up(text:string) {
        this.push(text);
        this.#count++;
    }

    down(text:string) {
        this.#count--;
        this.push(text);
    }

    push(text:string) {
        const head = 0<this.#count ? this.#indent.repeat(this.#count) : '';
        for(const l of text.split(/\r*\n/)) {
            fs.writeSync(this.#stream, `${head}${l}\n`);
        }
    }

    close() {
        fs.closeSync(this.#stream);
    }
}