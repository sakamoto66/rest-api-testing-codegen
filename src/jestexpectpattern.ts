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
            if(null != val && !isNaN(val) && typeof val == 'number') {
                return `expect.any(Number) /*${val}*/`;
            }
            for(const [key, ptn] of this.#patterns) {
                if(ptn.test && typeof val == 'string' && ptn.test(val)) {
                    return `expect_${key} /*${val}*/`;
                }
            }
            return JSON.stringify(val);
        });
    }
}