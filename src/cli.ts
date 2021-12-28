#! /usr/bin/env node

import { chromium } from 'playwright';
import { PlaywrightApiTestGenerator } from './generator/playwright';
const commandLineArgs = require('command-line-args');

(async () => {
    const optionDefinitions = [
        {
            name: 'output',
            alias: 'o',
            type: String,
            defaultValue: `sample.spec.js`
        },
        {
            name: 'target',
            alias: 't',
            type: String,
            defaultValue: `playwright-test`
        },
    ];
    const cmdopts = commandLineArgs(optionDefinitions);
    const browser = await chromium.launch({headless: false});
    const context = await browser.newContext();
    const page = await context.newPage();
    PlaywrightApiTestGenerator.run(browser, context, page, cmdopts);

    const config:any = {};
    if(!!config.baseURL) {
        await page.goto(config.baseURL);
    }
})();
