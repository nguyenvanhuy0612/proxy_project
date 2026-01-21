import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
    port: number;
    log: {
        level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
        file?: string;
    };
}

const defaultConfig: AppConfig = {
    port: 8080,
    log: {
        level: 'INFO',
    }
};

const configPath = path.resolve(process.cwd(), 'config.json');
let userConfig: Partial<AppConfig> = {};

if (fs.existsSync(configPath)) {
    try {
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        userConfig = JSON.parse(fileContent);
    } catch (error) {
        console.error('Failed to parse config.json:', error);
    }
}

// Precedence: Environment Variable > Config File > Default
export const config: AppConfig = {
    port: parseInt(process.env.PORT || '') || userConfig.port || defaultConfig.port,
    log: {
        level: (process.env.LOG_LEVEL as any) || userConfig.log?.level || defaultConfig.log.level,
        file: process.env.LOG_FILE || userConfig.log?.file || defaultConfig.log.file
    }
};
