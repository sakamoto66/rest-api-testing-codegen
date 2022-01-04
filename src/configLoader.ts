import * as fs from 'fs';
import * as path from 'path';
import { RestApiTestingCodegenConfig } from ".";

const tsConfig = 'restapitesingcodegen.config.ts';
const jsConfig = 'restapitesingcodegen.config.js';

export class ConfigLoader {
    defaultConfig:RestApiTestingCodegenConfig
    loadedConfig:any

    constructor(defaultConfig:RestApiTestingCodegenConfig) {
        this.defaultConfig = defaultConfig;
        this.loadedConfig = {};
    }

    get config():RestApiTestingCodegenConfig {
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
    
    loadConfigFile(file: string): RestApiTestingCodegenConfig {
        let config = require(file);
        if (config && typeof config === 'object' && ('default' in config))
            config = config['default'];
        const rawConfig = { ...config };
        return rawConfig;
    }
}
