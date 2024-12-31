import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'yaml';
import { ServiceSelection, DirectoryConfig } from './types';
import { validateConfiguration } from './validation';

export interface WizardConfig {
  version: string;
  directories: DirectoryConfig;
  services: ServiceSelection;
}

export async function saveConfig(config: WizardConfig, filePath: string): Promise<void> {
  try {
    const validationResult = await validateConfiguration(config);
    if (!validationResult.isValid) {
      throw new Error(`Invalid configuration:\n${validationResult.errors.join('\n')}`);
    }

    const configDir = path.dirname(filePath);
    await fs.ensureDir(configDir);
    await fs.writeFile(filePath, yaml.stringify(config));
  } catch (error) {
    throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function loadConfig(filePath: string): Promise<WizardConfig> {
  try {
    const configContent = await fs.readFile(filePath, 'utf8');
    const config = yaml.parse(configContent) as WizardConfig;

    const validationResult = await validateConfiguration(config);
    if (!validationResult.isValid) {
      throw new Error(`Invalid configuration:\n${validationResult.errors.join('\n')}`);
    }

    return config;
  } catch (error) {
    throw new Error(`Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createDefaultConfig(): Promise<WizardConfig> {
  return {
    version: '1.0.0',
    directories: {
      media: {
        movies: '',
        tv: '',
        music: ''
      },
      downloads: {
        incomplete: '',
        complete: ''
      },
      backup: '',
      config: ''
    },
    services: {
      required: {
        mediaServer: 'plex',
        vpn: 'gluetun',
        downloadClient: 'qbittorrent'
      },
      optional: {}
    }
  };
}

export function getConfigPath(customPath?: string): string {
  if (customPath) {
    return path.resolve(customPath);
  }

  // Default config locations by platform
  const platform = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || '';

  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'media-server-wizard', 'config.yml');
  } else if (platform === 'linux') {
    return path.join(home, '.config', 'media-server-wizard', 'config.yml');
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'media-server-wizard', 'config.yml');
  }

  throw new Error('Unsupported platform');
}

export async function initializeConfig(customPath?: string): Promise<WizardConfig> {
  const configPath = getConfigPath(customPath);
  
  try {
    // Check if config already exists
    if (await fs.pathExists(configPath)) {
      return await loadConfig(configPath);
    }

    // Create new config
    const config = await createDefaultConfig();
    await saveConfig(config, configPath);
    return config;
  } catch (error) {
    throw new Error(`Failed to initialize configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
