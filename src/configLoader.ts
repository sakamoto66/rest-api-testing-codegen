import * as fs from 'fs';
import * as path from 'path';
import { Config } from "./config";

const tsConfig = 'rest-api-testing-codegen.config.ts';
const jsConfig = 'rest-api-testing-codegen.config.js';

export class ConfigLoader {
    defaultConfig:Config
    loadedConfig:any

    constructor(defaultConfig:Config) {
        this.defaultConfig = defaultConfig;
        this.loadedConfig = {};
    }

    get config():Config {
        return Object.assign(this.defaultConfig, this.loadedConfig);
    }

    loadConfig(configFile: string) {
        if (fs.existsSync(configFile)) {
            if (process.stdout.isTTY)
            console.log(`Using config at ` + configFile);
            this.loadedConfig = this.loadConfigFile(configFile);
            return true;
        }
        return false;
    }
    
    loadConfigFromDirectory(directory: string) {
        const configNames = [tsConfig, jsConfig];
        for (const configName of configNames) {
            if (this.loadConfig(path.resolve(directory, configName)))
            return true;
        }
        return false;
    }
    
    loadConfigFile(file: string): Config {
        let config = require(file);
        if (config && typeof config === 'object' && ('default' in config))
            config = config['default'];
        const rawConfig = { ...config };
        return rawConfig;
    }
}
