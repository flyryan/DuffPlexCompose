import * as yup from 'yup';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const directoryConfigSchema = yup.object({
  media: yup.object({
    movies: yup.string().optional(),
    tv: yup.string().optional(),
    music: yup.string().optional()
  }),
  downloads: yup.object({
    incomplete: yup.string().optional(),
    complete: yup.string().optional()
  }),
  backup: yup.string().required('Backup directory is required'),
  config: yup.string().required('Config directory is required')
});

export const serviceSelectionSchema = yup.object({
  required: yup.object({
    mediaServer: yup.string().oneOf(['plex']).required(),
    vpn: yup.string().oneOf(['gluetun']).required(),
    downloadClient: yup.string().oneOf(['qbittorrent', 'transmission']).required()
  }),
  optional: yup.object({
    movieManager: yup.string().oneOf(['radarr']).optional(),
    tvManager: yup.string().oneOf(['sonarr']).optional(),
    requestSystem: yup.string().oneOf(['overseerr', 'ombi']).optional()
  })
});

export async function validateDirectories(config: any): Promise<ValidationResult> {
  const errors: string[] = [];
  
  try {
    await directoryConfigSchema.validate(config, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      errors.push(...error.errors);
    }
  }

  // Check directory permissions and existence
  const directories = [
    ...(config.media?.movies ? [config.media.movies] : []),
    ...(config.media?.tv ? [config.media.tv] : []),
    ...(config.media?.music ? [config.media.music] : []),
    ...(config.downloads?.incomplete ? [config.downloads.incomplete] : []),
    ...(config.downloads?.complete ? [config.downloads.complete] : []),
    config.backup,
    config.config
  ].filter(Boolean);

  for (const dir of directories) {
    try {
      // Check if directory exists
      if (!await fs.pathExists(dir)) {
        errors.push(`Directory does not exist: ${dir}`);
        continue;
      }

      // Check if we have read/write permissions
      try {
        await fs.access(dir, fs.constants.R_OK | fs.constants.W_OK);
      } catch {
        errors.push(`Insufficient permissions for directory: ${dir}`);
      }

      // Check if path is absolute
      if (!path.isAbsolute(dir)) {
        errors.push(`Directory path must be absolute: ${dir}`);
      }
    } catch (error) {
      errors.push(`Error checking directory ${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function validateServices(config: any): Promise<ValidationResult> {
  const errors: string[] = [];

  try {
    await serviceSelectionSchema.validate(config, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      errors.push(...error.errors);
    }
  }

  // Additional service-specific validation
  if (config.optional?.movieManager === 'radarr' && !config.media?.movies) {
    errors.push('Movies directory is required when Radarr is enabled');
  }

  if (config.optional?.tvManager === 'sonarr' && !config.media?.tv) {
    errors.push('TV directory is required when Sonarr is enabled');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function validateConfiguration(config: any): Promise<ValidationResult> {
  const [dirResult, servicesResult] = await Promise.all([
    validateDirectories(config.directories),
    validateServices(config.services)
  ]);

  return {
    isValid: dirResult.isValid && servicesResult.isValid,
    errors: [...dirResult.errors, ...servicesResult.errors]
  };
}
