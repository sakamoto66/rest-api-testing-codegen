import { Response, Request, request } from 'playwright';
import { CodeGenerator } from '../codegenerator';
import { JestExpectPattern } from '../jestexpectpattern';
import { Generator } from './generator';
import * as crypto  from 'crypto';
import { RestApiTestingCodegenConfig } from '..';
export class PlaywrightApiTestGenerator implements Generator {
    #gen:CodeGenerator;
    expectPattern:JestExpectPattern;
    keepheaders:string[];
    headerStore:string[];
    config:any;

    constructor() {
        this.expectPattern = new JestExpectPattern();
        this.#gen = new CodeGenerator();
        this.keepheaders = [];
        this.headerStore = [];
    }

    start(config:RestApiTestingCodegenConfig) {
        this.config = config;
        const output = config.output ? config.output : 'sample.spec.ts';
        this.#gen.open(output, config.indent);
        if(config.headers) {
            this.keepheaders = config.headers;
        }
        if(config.expect) {
            for(const key in config.expect){
                this.expectPattern.add(key, config.expect[key]);
            }
        }

        this.#gen.push(`import { test, expect } from '@playwright/test';`);
        this.#gen.push(``);
        this.#gen.push(this.expectPattern.definelines().join('\n'));
        if(config.baseURL) {
            this.#gen.push(`const baseURL = ${JSON.stringify(config.baseURL)};`);
        }
        this.#gen.push(``);
        this.#gen.up(`test('api test', async ({ request }) => {`);
    }

    end() {
        this.#gen.down("});");
        this.#gen.close();
    }

    async accept(response: Response):Promise<void> {
        const config:RestApiTestingCodegenConfig = this.config;
        const hdrs:any = {};
        (await response.request().headersArray()).filter(e => this.keepheaders.includes(e.name)).forEach(e => hdrs[e.name] = e.value);
        const hdrs_str = JSON.stringify(hdrs, null, config.indent);
        if('{}' == hdrs_str) return;

        const hdrs_key = 'hdr_'+md5hex(hdrs_str);
        if(!this.headerStore.includes(hdrs_key)){
            this.#gen.push(`const ${hdrs_key} = ${hdrs_str};`);
            this.headerStore.push(hdrs_key);
        }
        const method = response.request().method();
        const url = response.url();
        const path = url.replace(/^[a-z]+\:+\/+[^[/]+/,'');
        const requrl = config.baseURL ? url.replace(config.baseURL, '${baseURL}') : url;
        const option = { headers:await response.request().allHeaders() };
        const postData = response.request().postData();
        const title = `${method} ${path}`;
        console.log(title);
        this.#gen.up(`await test.step('${title}', async () => {`);
        if(hdrs_key || postData) {
            this.#gen.up(`const res = await request.${method.toLowerCase()}(\`${requrl}\`, {`);
            if(hdrs_key) {
                this.#gen.push(`headers:${hdrs_key},`);
            }
            if(postData) {
                try {
                    const json = response.request().postDataJSON();
                    this.#gen.push(`data:${JSON.stringify(json, null, config.indent)}`);
                } catch(e) {
                    this.#gen.push(`data:${postData}`);
                }
            }
            this.#gen.down('});');
        } else {
            this.#gen.push(`const res = await request.${method.toLowerCase()}(\`${requrl}\`);`);
        }
        if(response.ok()) {
            this.#gen.push(`expect(res.ok()).toBeTruthy();`);
        } else {
            this.#gen.push(`expect(res.status()).toBe(${response.status()});`);
        }

        try {
            const json = await response.json();
            if(Array.isArray(json)) {
                const json_str = this.expectPattern.stringify(json[0], config.indent);
                this.#gen.push(`expect(await res.json()).toHaveLength(${json.length});`);
                this.#gen.push(`expect((await res.json())[0]).toEqual(${json_str});`)
            } else if(json != null && typeof json == 'object') {
                const json_str = this.expectPattern.stringify(json, config.indent);
                this.#gen.push(`expect(await res.json()).toEqual(${json_str});`)
            } else {
                const json_str = this.expectPattern.stringify(json, config.indent);
                this.#gen.push(`expect(await res.json()).toEqual(${json_str});`)
            }
        } catch(e) {}
        this.#gen.down("});");
    }
}

function md5hex(str:string /*: string */) {
    const md5 = crypto.createHash('md5')
    return md5.update(str, 'binary').digest('hex')
}