import yaml from 'yaml';
import path from 'path';
import { ServiceSelection, DirectoryConfig, DockerCompose } from './types';

export function generateDockerCompose(
  services: ServiceSelection,
  directories: DirectoryConfig
): string {
  const config: DockerCompose = {
    version: '3.8',
    services: {},
    networks: {
      medianet: {
        driver: 'bridge'
      }
    }
  };

  // Add VPN service first as other services will depend on it
  config.services.vpn = {
    image: 'ghcr.io/qdm12/gluetun',
    container_name: 'vpn',
    cap_add: ['NET_ADMIN'],
    environment: {
      // VPN configuration will be added by user
      VPN_SERVICE_PROVIDER: 'custom',
      VPN_TYPE: 'openvpn'
    },
    ports: ['8080:8080'], // Management UI
    volumes: [
      `${path.join(directories.config, 'gluetun')}:/gluetun`,
    ],
    restart: 'unless-stopped',
    networks: ['medianet']
  };

  // Add download client
  const downloadClient = services.required.downloadClient;
  config.services[downloadClient] = {
    image: downloadClient === 'qbittorrent' ? 'linuxserver/qbittorrent' : 'linuxserver/transmission',
    container_name: downloadClient,
    environment: {
      PUID: '1000',
      PGID: '1000',
      TZ: 'Etc/UTC'
    },
    volumes: [
      `${path.join(directories.config, downloadClient)}:/config`,
      `${directories.downloads.complete}:/downloads/complete`,
      `${directories.downloads.incomplete}:/downloads/incomplete`
    ],
    ports: downloadClient === 'qbittorrent' ? ['8081:8081'] : ['9091:9091'],
    restart: 'unless-stopped',
    networks: ['medianet'],
    depends_on: ['vpn'],
    network_mode: 'service:vpn'
  };

  // Add Plex Media Server
  config.services.plex = {
    image: 'linuxserver/plex',
    container_name: 'plex',
    environment: {
      PUID: '1000',
      PGID: '1000',
      TZ: 'Etc/UTC',
      VERSION: 'docker'
    },
    volumes: [
      `${path.join(directories.config, 'plex')}:/config`,
      ...(directories.media.movies ? [`${directories.media.movies}:/movies`] : []),
      ...(directories.media.tv ? [`${directories.media.tv}:/tv`] : []),
      ...(directories.media.music ? [`${directories.media.music}:/music`] : [])
    ],
    ports: [
      '32400:32400',
      '1900:1900/udp',
      '3005:3005',
      '5353:5353/udp',
      '8324:8324',
      '32410:32410/udp',
      '32412:32412/udp',
      '32413:32413/udp',
      '32414:32414/udp',
      '32469:32469'
    ],
    restart: 'unless-stopped',
    networks: ['medianet']
  };

  // Add optional services
  if (services.optional.movieManager === 'radarr') {
    config.services.radarr = {
      image: 'linuxserver/radarr',
      container_name: 'radarr',
      environment: {
        PUID: '1000',
        PGID: '1000',
        TZ: 'Etc/UTC'
      },
      volumes: [
        `${path.join(directories.config, 'radarr')}:/config`,
        `${directories.media.movies}:/movies`,
        `${directories.downloads.complete}:/downloads`
      ],
      ports: ['7878:7878'],
      restart: 'unless-stopped',
      networks: ['medianet'],
      depends_on: [services.required.downloadClient]
    };
  }

  if (services.optional.tvManager === 'sonarr') {
    config.services.sonarr = {
      image: 'linuxserver/sonarr',
      container_name: 'sonarr',
      environment: {
        PUID: '1000',
        PGID: '1000',
        TZ: 'Etc/UTC'
      },
      volumes: [
        `${path.join(directories.config, 'sonarr')}:/config`,
        `${directories.media.tv}:/tv`,
        `${directories.downloads.complete}:/downloads`
      ],
      ports: ['8989:8989'],
      restart: 'unless-stopped',
      networks: ['medianet'],
      depends_on: [services.required.downloadClient]
    };
  }

  if (services.optional.requestSystem) {
    const requestSystem = services.optional.requestSystem;
    config.services[requestSystem] = {
      image: `linuxserver/${requestSystem}`,
      container_name: requestSystem,
      environment: {
        PUID: '1000',
        PGID: '1000',
        TZ: 'Etc/UTC'
      },
      volumes: [
        `${path.join(directories.config, requestSystem)}:/config`
      ],
      ports: [requestSystem === 'overseerr' ? '5055:5055' : '3579:3579'],
      restart: 'unless-stopped',
      networks: ['medianet'],
      depends_on: ['plex']
    };
  }

  return yaml.stringify(config);
}

export function validateDockerConfig(config: string): boolean {
  try {
    const parsed = yaml.parse(config);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}
