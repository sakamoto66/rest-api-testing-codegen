#! /usr/bin/env node

import { Browser, BrowserContext, chromium, Page, Response } from 'playwright';
import * as crypto  from 'crypto';
import { Config } from './config';
import { ConfigLoader } from './configLoader';
import { Generator } from './generator/generator';
import { PlaywrightApiTestGenerator } from './generator/playwright';
const commandLineArgs = require('command-line-args');

const defaultConfig:any = {
    format:'playwright',
    indent:'  ',
    output:'sample.spec.ts',
    headers:[],
    skipheaders:false,
    ignoreheaders:['referer', 'content-type', 'content-length'],
    resourceType:['xhr']
};

const optionDefinitions = [
    {
        name: 'baseURL',
        alias: 'u',
        type: String,
    },
    {
        name: 'indent',
        alias: 'i',
        type: String
    },
    {
        name: 'headers',
        alias: 'h',
        type: String
    },
    {
        name: 'ignoreheaders',
        type: String
    },
    {
        name: 'skipheaders',
        type: String
    },
    {
        name: 'resourceType',
        type: String
    },    
    {
        name: 'output',
        alias: 'o',
        type: String
    },
    {
        name: 'format',
        alias: 'f',
        type: String
    },
    {
        name: 'config',
        alias: 'c',
        type: String
    },
];

(async () => {
    const cmdopts = commandLineArgs(optionDefinitions);
    if(cmdopts.headers) {
        cmdopts.headers = cmdopts.headers.split(',');
    }
    if(cmdopts.ignoreheaders) {
        cmdopts.ignoreheaders = cmdopts.ignoreheaders.split(',');
    }

    const loader = new ConfigLoader(defaultConfig);
    if(cmdopts.config) {
        loader.loadConfig(cmdopts.config);
    } else {
        loader.loadConfigFromDirectory(process.cwd());
    }

    const config = Object.assign(loader.config, cmdopts);

    const browser = await chromium.launch({headless: false});
    const context = await browser.newContext();
    const page = await context.newPage();
    const codegen = new PlaywrightApiTestGenerator();

    await run(config, browser, context, page, codegen);
})();

async function run(config:Config, browser:Browser, context:BrowserContext, page:Page, codegen:Generator) {
    codegen.start(config);
    const resourceType = config.resourceType && !config.resourceType.includes('all') ? config.resourceType : null;

    const reps:Response[] = [];
    const headerStore:string[] = [];
   
    const thead = async () => {
        while(0 < reps.length) {
            const r = reps.shift();
            if(r) {
                const hdrs = getHeaders(await r.request().headersArray(), config);
                const hdrs_str = JSON.stringify(hdrs);
                if('{}' == hdrs_str) continue;
        
                const hdrkey = md5hex(hdrs_str);
                if(!headerStore.includes(hdrkey)){
                    codegen.definedHeader(hdrkey, hdrs);
                    headerStore.push(hdrkey);
                }
                await codegen.accept(r, hdrkey);
            }
        }
        if(page.isClosed()) {
            codegen.end();
            await context.close();
            await browser.close();
            process.exit();
        }
        setTimeout(thead, 100);
    }
    thead();

    context.on('response', async (response:Response) => {
        if(resourceType && !resourceType.includes(response.request().resourceType())) {
            return;
        }
        if(`${response.status()}`.startsWith('3')) {//skip HTTPS status 3XX
            return;
        }
        reps.push(response);
    });

    if(!!config.baseURL) {
        await page.goto(config.baseURL);
    }
}

function getHeaders(headers:any[], config:Config) {
    let hdrs = headers.filter(e => !e.name.startsWith(':'));
    const filterHeaders = config.headers;
    const ignoreHeaders = config.ignoreheaders;
    if(filterHeaders && 0 < filterHeaders.length) {
        hdrs = hdrs.filter(e => filterHeaders.includes(e.name.toLowerCase()));
    }
    if(ignoreHeaders && 0 < ignoreHeaders.length) {
        hdrs = hdrs.filter(e => !ignoreHeaders.includes(e.name.toLowerCase()));
    }
    const ret:any = {};
    hdrs.forEach(e => ret[e.name.toLowerCase()] = e.value);
    return ret;
}

function md5hex(str:string /*: string */) {
    const md5 = crypto.createHash('md5')
    return md5.update(str, 'binary').digest('hex')
}