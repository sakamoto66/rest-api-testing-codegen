#! /usr/bin/env node

import { Browser, BrowserContext, chromium, Page } from 'playwright';
import { Config } from './config';
import { ConfigLoader } from './configLoader';
import { Generator } from './generator/generator';
import { PlaywrightApiTestGenerator } from './generator/playwright';
const commandLineArgs = require('command-line-args');

const defaultConfig:any = {
    target:'playwright',
    space:'  ',
    output:'sample.spec.ts',
    headers:['authorization']
};

const optionDefinitions = [
    {
        name: 'baseURL',
        type: String,
    },
    {
        name: 'space',
        type: String
    },
    {
        name: 'headers',
        type: String
    },
    {
        name: 'output',
        alias: 'o',
        type: String
    },
    {
        name: 'target',
        alias: 't',
        type: String
    },
];

(async () => {
    const loader = new ConfigLoader(defaultConfig);
    loader.loadConfigFromDirectory(process.cwd());

    const cmdopts = commandLineArgs(optionDefinitions);
    if(cmdopts.headers) {
        cmdopts.headers = cmdopts.headers.split(',');
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

    context.on('response', async (response) => {
        if(response.request().isNavigationRequest()) return;
        if('xhr' != response.request().resourceType()) return;
        await codegen.accept(response);
    });

    page.on('close', async () => {
        codegen.end();
        await context.close();
        await browser.close();
        process.exit();
    });

    if(!!config.baseURL) {
        await page.goto(config.baseURL);
    }
}
