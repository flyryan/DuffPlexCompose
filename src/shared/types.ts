export interface ServiceSelection {
  required: {
    mediaServer: 'plex';
    vpn: 'gluetun';
    downloadClient: 'qbittorrent' | 'transmission';
  };
  optional: {
    movieManager?: 'radarr';
    tvManager?: 'sonarr';
    requestSystem?: 'overseerr' | 'ombi';
  };
  features?: {
    qbtRarSupport?: boolean;
  };
}

export interface DirectoryConfig {
  media: {
    movies?: string;
    tv?: string;
    music?: string;
  };
  downloads: {
    incomplete?: string;
    complete?: string;
  };
  backup: string;
  config: string;
}

export interface DockerService {
  image: string;
  container_name?: string;
  restart?: string;
  environment?: Record<string, string>;
  volumes?: string[];
  ports?: string[];
  depends_on?: string[];
  networks?: string[];
  cap_add?: string[];
  network_mode?: string;
}

export interface DockerCompose {
  version: string;
  services: Record<string, DockerService>;
  networks?: Record<string, any>;
  volumes?: Record<string, any>;
}
