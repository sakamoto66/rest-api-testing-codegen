import { Browser, BrowserContext, Page, Response, Request, request } from 'playwright';
import { CodeGenerator } from '../codegenerator';
import { JestExpectPattern } from '../jestexpectpattern';

export class PlaywrightApiTestGenerator {
    #gen:CodeGenerator;
    #started:boolean = false;
    expectPattern:JestExpectPattern;

    constructor(path:string) {
        this.expectPattern = new JestExpectPattern();
        this.#started = false;
        this.#gen = new CodeGenerator(path, '  ');
        this.#gen.push(`import { test, expect } from '@playwright/test';`);
        this.#gen.push(``);
    }

    static run(browser:Browser, context:BrowserContext, page:Page, cmdopts:any) {
        const codegen = new PlaywrightApiTestGenerator(cmdopts.output);

        context.on('response', async (response) => {
            await codegen.onResponse(response);
        });

        page.on('close', async () => {
            codegen.end();
            await context.close();
            await browser.close();
            process.exit();
        });
    }

    #start(headers:any) {
        const config:any = {};
        this.#gen.push(this.expectPattern.definelines().join('\n'));
        if(config.baseURL) {
            this.#gen.push(`const baseURL = ${JSON.stringify(config.baseURL)};`);
        }
        this.#gen.push(``);
        this.#gen.up(`test('api test', async ({ request }) => {`);
        for(const hdr in headers) {
            if(hdr.startsWith(':')) {
                delete headers[hdr];
            }
        }
        this.#gen.push(`const headers = ${JSON.stringify(headers, null, '  ')};`);
    }

    end() {
        if(!this.#started) return;
        this.#gen.down("});");
        this.#gen.close();
    }

    async onResponse(response:Response) {
        if(response.request().isNavigationRequest()) return;
        if(!await response.request().headerValue('authorization')) return;
        if(!this.#started) {
            this.#started = true;
            const headers = await response.request().allHeaders();
            this.#start(headers);
        }
        await this.outputRequestTestCode(response);
    }

    async outputRequestTestCode(responce:Response) {
        const config:any = {};
        const method = responce.request().method();
        const url = responce.url();
        const path = url.replace(/^[a-z]+\:+\/+[^[/]+/,'');
        const requrl = config.baseURL ? url.replace(config.baseURL, '${baseURL}') : url;
        const option = { headers:await responce.request().allHeaders() };
        const postData = responce.request().postData();
        const title = `${method} ${path}`;
        console.log(title);
        this.#gen.up(`await test.step('${title}', async () => {`);
        this.#gen.up(`const res = await request.${method.toLowerCase()}(\`${requrl}\`, {`);
        this.#gen.push('headers:headers,');
        if(postData) {
            try {
                const json = responce.request().postDataJSON();
                this.#gen.push(`data:${JSON.stringify(json, null, '  ')}`);
            } catch(e) {
                this.#gen.push(`data:${postData}`);
            }
        }
        this.#gen.down('});');
        if(responce.ok()) {
            this.#gen.push(`expect(res.ok()).toBeTruthy();`);
        } else {
            this.#gen.push(`expect(res.status()).toBe(${responce.status()});`);
        }

        try {
            const json = await responce.json();
            if(Array.isArray(json)) {
                const json_str = this.expectPattern.stringify(json[0], '  ');
                this.#gen.push(`expect(await res.json()).toHaveLenght(${json.length});`);
                this.#gen.push(`expect((await res.json())[0]).toEqual(${json_str});`)
            } else if(json != null && typeof json == 'object') {
                const json_str = this.expectPattern.stringify(json, '  ');
                this.#gen.push(`expect(await res.json()).toEqual(${json_str});`)
            } else {
                const json_str = this.expectPattern.stringify(json, '  ');
                this.#gen.push(`expect(await res.json()).toEqual(${json_str});`)
            }
        } catch(e) {}
        this.#gen.down("});");
    }
}