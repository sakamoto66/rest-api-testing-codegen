import { json_stringify } from "./util";

export class JestExpectPattern {
    #patterns:any = [];

    constructor() {
    }

    add(key:string, ptn:any) {
        this.#patterns.push([key,ptn]);
    }

    definelines():string[] {
        const lines = [];
        for(const [key, ptn] of this.#patterns) {
            lines.push(`const expect_${key} = expect.stringMatching(${ptn});`);
        }
        return lines;
    }

    stringify(json:any, space?:string) {
        space = space ? space : '';
        return json_stringify(json, space, 1, (val:any) => {
            for(const [key, ptn] of this.#patterns) {
                if(ptn.test && typeof val == 'string' && ptn.test(val)) {
                    return `expect_${key} /*${val}*/`;
                }
            }
            let type:string = typeof val;
            switch(type){
                case 'number':
                case 'string':
                case 'boolean':
                    type = type[0].toUpperCase() + type.substring(1);
                    return `expect.any(${type}) /*${(val)}*/`;
            }
            return JSON.stringify(val);
        });
    }
}