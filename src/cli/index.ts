#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import Listr from 'listr';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { ServiceSelection, DirectoryConfig } from '@shared/types';
import { validateConfiguration } from '@shared/validation';
import { generateDockerCompose } from '@shared/docker';
import { 
  WizardConfig, 
  saveConfig, 
  loadConfig, 
  createDefaultConfig, 
  getConfigPath, 
  initializeConfig 
} from '@shared/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MediaServerCLI {
  private program: Command;

  constructor() {
    this.program = new Command();
    this.setupProgram();
  }

  private setupProgram() {
    this.program
      .name('media-server-wizard')
      .description('CLI for setting up a media server stack with Docker')
      .version('1.0.0');

    this.program
      .command('init')
      .description('Initialize a new media server configuration')
      .option('-c, --config <path>', 'Path to config file')
      .option('-o, --output <path>', 'Output path for generated files')
      .option('-i, --interactive', 'Run in interactive mode', true)
      .action(this.handleInit.bind(this));

    this.program
      .command('validate')
      .description('Validate an existing configuration')
      .requiredOption('-c, --config <path>', 'Path to config file')
      .action(this.handleValidate.bind(this));

    this.program
      .command('generate')
      .description('Generate docker-compose.yml from configuration')
      .requiredOption('-c, --config <path>', 'Path to config file')
      .option('-o, --output <path>', 'Output path for generated files')
      .action(this.handleGenerate.bind(this));

    this.program
      .command('configure')
      .description('Interactive configuration setup')
      .option('-c, --config <path>', 'Path to existing config file')
      .option('-o, --output <path>', 'Output path for generated files')
      .action(this.handleConfigure.bind(this));
  }

  private async promptForDirectories(): Promise<DirectoryConfig> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'moviesPath',
        message: 'Movies directory path:',
        validate: (input) => !!input || 'Movies directory is required'
      },
      {
        type: 'input',
        name: 'tvPath',
        message: 'TV Shows directory path:',
        validate: (input) => !!input || 'TV Shows directory is required'
      },
      {
        type: 'input',
        name: 'musicPath',
        message: 'Music directory path (optional):'
      },
      {
        type: 'input',
        name: 'incompletePath',
        message: 'Incomplete downloads directory path:',
        validate: (input) => !!input || 'Incomplete downloads directory is required'
      },
      {
        type: 'input',
        name: 'completePath',
        message: 'Complete downloads directory path:',
        validate: (input) => !!input || 'Complete downloads directory is required'
      },
      {
        type: 'input',
        name: 'backupPath',
        message: 'Backup directory path:',
        validate: (input) => !!input || 'Backup directory is required'
      },
      {
        type: 'input',
        name: 'configPath',
        message: 'Config directory path:',
        validate: (input) => !!input || 'Config directory is required'
      }
    ]);

    return {
      media: {
        movies: answers.moviesPath,
        tv: answers.tvPath,
        music: answers.musicPath || ''
      },
      downloads: {
        incomplete: answers.incompletePath,
        complete: answers.completePath
      },
      backup: answers.backupPath,
      config: answers.configPath
    };
  }

  private async promptForServices(): Promise<ServiceSelection> {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'downloadClient',
        message: 'Select download client:',
        choices: ['qbittorrent', 'transmission']
      },
      {
        type: 'confirm',
        name: 'useRadarr',
        message: 'Do you want to use Radarr for movie management?'
      },
      {
        type: 'confirm',
        name: 'useSonarr',
        message: 'Do you want to use Sonarr for TV show management?'
      },
      {
        type: 'list',
        name: 'requestSystem',
        message: 'Select request management system:',
        choices: ['none', 'overseerr', 'ombi']
      }
    ]);

    const services: ServiceSelection = {
      required: {
        mediaServer: 'plex',
        vpn: 'gluetun',
        downloadClient: answers.downloadClient as 'qbittorrent' | 'transmission'
      },
      optional: {}
    };

    if (answers.useRadarr) {
      services.optional.movieManager = 'radarr';
    }

    if (answers.useSonarr) {
      services.optional.tvManager = 'sonarr';
    }

    if (answers.requestSystem !== 'none') {
      services.optional.requestSystem = answers.requestSystem as 'overseerr' | 'ombi';
    }

    return services;
  }

  private async handleInit(options: { config?: string; output?: string; interactive: boolean }) {
    console.log(chalk.blue('Initializing new media server configuration...'));
    const spinner = ora('Setting up...').start();

    try {
      const configPath = getConfigPath(options.config);
      let config: WizardConfig;

      if (options.interactive) {
        spinner.stop();
        console.log(chalk.yellow('\nConfiguring directories...'));
        const directories = await this.promptForDirectories();
        
        console.log(chalk.yellow('\nConfiguring services...'));
        const services = await this.promptForServices();

        config = {
          version: '1.0.0',
          directories,
          services
        };
      } else {
        config = await createDefaultConfig();
      }

      await saveConfig(config, configPath);
      
      if (options.output) {
        const dockerCompose = generateDockerCompose(config.services, config.directories);
        await fs.writeFile(path.join(options.output, 'docker-compose.yml'), dockerCompose);
      }

      spinner.succeed('Configuration initialized successfully');
    } catch (error) {
      spinner.fail('Failed to initialize configuration');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  }

  private async handleValidate(options: { config: string }) {
    console.log(chalk.blue('Validating configuration...'));
    const spinner = ora('Checking configuration...').start();

    try {
      const config = await loadConfig(options.config);
      const validationResult = await validateConfiguration(config);

      if (validationResult.isValid) {
        spinner.succeed('Configuration is valid');
      } else {
        spinner.fail('Configuration validation failed');
        console.error(chalk.red('Validation errors:'));
        validationResult.errors.forEach((error: string) => {
          console.error(chalk.red(`- ${error}`));
        });
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Configuration validation failed');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  }

  private async handleGenerate(options: { config: string; output?: string }) {
    console.log(chalk.blue('Generating docker-compose.yml...'));
    const spinner = ora('Generating configuration...').start();

    try {
      const config = await loadConfig(options.config);
      const dockerCompose = generateDockerCompose(config.services, config.directories);
      
      const outputPath = options.output || process.cwd();
      await fs.writeFile(path.join(outputPath, 'docker-compose.yml'), dockerCompose);
      
      spinner.succeed('Generated docker-compose.yml successfully');
    } catch (error) {
      spinner.fail('Failed to generate docker-compose.yml');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  }

  private async handleConfigure(options: { config?: string; output?: string }) {
    console.log(chalk.blue('Starting interactive configuration...'));

    try {
      const tasks = new Listr([
        {
          title: 'Loading existing configuration',
          task: async (ctx) => {
            try {
              ctx.config = options.config ? 
                await loadConfig(options.config) : 
                await createDefaultConfig();
            } catch {
              ctx.config = await createDefaultConfig();
            }
          }
        },
        {
          title: 'Setting up directories',
          task: async (ctx) => {
            ctx.config.directories = await this.promptForDirectories();
          }
        },
        {
          title: 'Configuring services',
          task: async (ctx) => {
            ctx.config.services = await this.promptForServices();
          }
        },
        {
          title: 'Validating configuration',
          task: async (ctx) => {
            const result = await validateConfiguration(ctx.config);
            if (!result.isValid) {
              throw new Error(`Configuration validation failed:\n${result.errors.join('\n')}`);
            }
          }
        },
        {
          title: 'Saving configuration',
          task: async (ctx) => {
            const configPath = getConfigPath(options.config);
            await saveConfig(ctx.config, configPath);

            if (options.output) {
              const dockerCompose = generateDockerCompose(ctx.config.services, ctx.config.directories);
              await fs.writeFile(path.join(options.output, 'docker-compose.yml'), dockerCompose);
            }
          }
        }
      ]);

      await tasks.run();
      console.log(chalk.green('Configuration completed successfully'));
    } catch (error) {
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  }

  public async run() {
    try {
      await this.program.parseAsync();
    } catch (error) {
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  }
}

// Run the CLI
const cli = new MediaServerCLI();
cli.run().catch(console.error);
