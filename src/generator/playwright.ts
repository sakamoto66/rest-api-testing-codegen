import { Response } from 'playwright';
import { CodeGenerator } from '../codegenerator';
import { JestExpectPattern } from '../jestexpectpattern';
import { Generator } from './generator';
import { RestApiTestingCodegenConfig } from '..';
const qs = require('qs');
export class PlaywrightApiTestGenerator implements Generator {
    #gen:CodeGenerator;
    expectPattern:JestExpectPattern;
    config:any;

    constructor() {
        this.expectPattern = new JestExpectPattern();
        this.#gen = new CodeGenerator();
    }

    start(config:RestApiTestingCodegenConfig) {
        this.config = config;
        const output = config.output ? config.output : 'sample.spec.ts';
        this.#gen.open(output, config.indent);
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

    definedHeader(hdrkey:string, hdrs:any) {
        const hdrval = JSON.stringify(hdrs, null, this.config.indent);
        this.#gen.push(`const hdr_${hdrkey} = ${hdrval};`);
        this.#gen.push("");
    }

    async accept(response: Response, hdrkey:string) {
        const config:RestApiTestingCodegenConfig = this.config;
        const method = response.request().method();
        const url = response.url();
        const path = url.replace(/^[a-z]+\:+\/+[^[/]+/,'');
        const requrl = config.baseURL ? url.replace(config.baseURL, '${baseURL}') : url;
        const title = `${method} ${path}`;

        console.log(title);
        this.#gen.up(`await test.step('${title}', async () => {`);
        this.#gen.up(`const res = await request.${method.toLowerCase()}(\`${requrl}\`, {`);        

        const postData = response.request().postData();
        if(postData) {
            const contenttype = await response.request().headerValue('content-type') || '';
            this.#gen.push(`headers:Object.assign(hdr_${hdrkey}, ${JSON.stringify({'content-type':contenttype})}),`);

            try {
                const json = -1 < contenttype.indexOf('application/x-www-form-urlencoded') ? qs.parse(postData) : JSON.parse(postData);
                this.#gen.push(`data:${JSON.stringify(json, null, config.indent)}`);
            } catch(e) {
                this.#gen.push(`// ${e}`);
            }
        } else {
            this.#gen.push(`headers:hdr_${hdrkey}`);
        }
        this.#gen.down('});');

        if(response.ok()) {
            this.#gen.push(`expect(res.ok()).toBeTruthy();`);
        } else {
            this.#gen.push(`expect(res.status()).toBe(${response.status()});`);
        }

        const contentType = await response.headerValue('content-type') || '';
        this.#gen.push(`expect(await res.headerValue('content-type')).toBe('${contentType}');`);

        if(-1 < contentType.indexOf('json')) {
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
            } catch(e) {
                this.#gen.push(`// ${e}`);
                this.#gen.push(`/* ${(await response.body()).toString('utf8')} */`);
            }
        }
        this.#gen.down("});");
        this.#gen.push("");
    }
}
