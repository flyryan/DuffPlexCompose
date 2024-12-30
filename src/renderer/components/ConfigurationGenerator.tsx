import React from 'react';
import {
  Box,
  Button,
  Code,
  Heading,
  Text,
  VStack,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  ButtonGroup,
} from '@chakra-ui/react';
import { useWizard } from '../context/WizardContext';
import yaml, { Document } from 'yaml';

type ServiceName = 'plex' | 'gluetun' | 'qbittorrent' | 'transmission' | 'radarr' | 'sonarr' | 'overseerr' | 'ombi';

interface ServiceConfig {
  image: string;
  container_name: string;
  network_mode?: string;
  environment?: string[];
  volumes?: string[];
  ports?: string[];
  cap_add?: string[];
  command?: string;
  restart?: string;
}

interface DockerConfig {
  version: string;
  services: {
    [key: string]: ServiceConfig;
  };
}

const ConfigurationGenerator: React.FC = () => {
  const toast = useToast();
  const { directories, services } = useWizard();

  const generateDockerCompose = () => {
    if (!directories || !services) {
      throw new Error('Missing configuration data');
    }

    const config: DockerConfig = {
      version: '3',
      services: {},
    };

    // Add Plex
    config.services.plex = {
      image: 'linuxserver/plex',
      container_name: 'plex',
      network_mode: 'host',
      environment: [
        'PUID=1000',
        'PGID=1000',
        'VERSION=docker',
        'TZ=America/New_York',
      ],
      volumes: [
        `${directories.config}/plex:/config`,
        `${directories.media.movies}:/movies`,
        `${directories.media.tv}:/tv`,
        ...(directories.media.music ? [`${directories.media.music}:/music`] : []),
      ],
      restart: 'unless-stopped',
    };

    // Add VPN service
    config.services.gluetun = {
      image: 'qmcgaw/gluetun',
      container_name: 'gluetun',
      cap_add: ['NET_ADMIN'],
      environment: [
        'VPN_SERVICE_PROVIDER=mullvad',
        'VPN_TYPE=wireguard',
      ],
      ports: ['8888:8888', '8388:8388'],
      volumes: ['./gluetun:/gluetun'],
      restart: 'unless-stopped',
    };

    // Add download client
    if (services.required.downloadClient === 'qbittorrent' || services.required.downloadClient === 'transmission') {
      const isQbittorrent = services.required.downloadClient === 'qbittorrent';
      const serviceName = services.required.downloadClient;
      
      config.services[serviceName] = {
        image: isQbittorrent ? 'lscr.io/linuxserver/qbittorrent:latest' : 'lscr.io/linuxserver/transmission:latest',
        container_name: serviceName,
        network_mode: 'service:gluetun',
        environment: [
          'PUID=1000',
          'PGID=1000',
          'TZ=America/New_York',
          isQbittorrent ? 'WEBUI_PORT=8080' : 'TRANSMISSION_WEB_PORT=9091',
        ],
        volumes: [
          `${directories.config}/${serviceName}:/config`,
          `${directories.downloads.incomplete}:/downloads/incomplete`,
          `${directories.downloads.complete}:/downloads/complete`,
        ],
        restart: 'unless-stopped',
      };

      // Add RAR support if enabled (qbittorrent only)
      if (isQbittorrent && services.features?.qbtRarSupport) {
        config.services.qbittorrent.command = '/bin/sh -c "apk add --no-cache gcompat curl && cd /tmp && LATEST_RAR_URL=$(curl -s https://www.rarlab.com/download.htm | grep -o \'https://www.rarlab.com/rar/rarlinux-x64-[0-9].*tar.gz\' | head -1) && echo \'Downloading latest RAR from:\' ${LATEST_RAR_URL} && curl -fsSL ${LATEST_RAR_URL} -o rar.tar.gz && tar xf rar.tar.gz && cp rar/rar rar/unrar /usr/local/bin/ && chmod +x /usr/local/bin/rar /usr/local/bin/unrar && rm -rf rar rar.tar.gz && mkdir -p /defaults/qBittorrent && echo -e \'[AutoRun]\\nenabled=true\\nprogram=unrar x -y -o+ \"%R\"/*.rar\' > /defaults/qBittorrent/qBittorrent.conf && /init"';
      }
    }

    // Add optional services
    if (services.optional.movieManager === 'radarr') {
      config.services.radarr = {
        image: 'linuxserver/radarr',
        container_name: 'radarr',
        environment: [
          'PUID=1000',
          'PGID=1000',
          'TZ=America/New_York',
        ],
        volumes: [
          `${directories.config}/radarr:/config`,
          `${directories.media.movies}:/movies`,
          `${directories.downloads.complete}:/downloads`,
        ],
        ports: ['7878:7878'],
        restart: 'unless-stopped',
      };
    }

    if (services.optional.tvManager === 'sonarr') {
      config.services.sonarr = {
        image: 'linuxserver/sonarr',
        container_name: 'sonarr',
        environment: [
          'PUID=1000',
          'PGID=1000',
          'TZ=America/New_York',
        ],
        volumes: [
          `${directories.config}/sonarr:/config`,
          `${directories.media.tv}:/tv`,
          `${directories.downloads.complete}:/downloads`,
        ],
        ports: ['8989:8989'],
        restart: 'unless-stopped',
      };
    }

    if (services.optional.requestSystem === 'overseerr' || services.optional.requestSystem === 'ombi') {
      const serviceName = services.optional.requestSystem;
      const isOverseerr = serviceName === 'overseerr';
      
      config.services[serviceName] = {
        image: isOverseerr ? 'linuxserver/overseerr' : 'linuxserver/ombi',
        container_name: serviceName,
        environment: [
          'PUID=1000',
          'PGID=1000',
          'TZ=America/New_York',
        ],
        volumes: [
          `${directories.config}/${serviceName}:/config`,
        ],
        ports: [isOverseerr ? '5055:5055' : '3579:3579'],
        restart: 'unless-stopped',
      };
    }

    // Add comments to the configuration
    const comments: Record<ServiceName, string> = {
      plex: '# Plex Media Server - Organizes and streams your media library',
      gluetun: '# Gluetun VPN Gateway - Provides VPN connectivity for containers',
      qbittorrent: '# qBittorrent - Download client with optional RAR support',
      transmission: '# Transmission - Lightweight download client',
      radarr: '# Radarr - Movie collection manager and automation',
      sonarr: '# Sonarr - TV series collection manager and automation',
      overseerr: '# Overseerr - Media request and management system',
      ombi: '# Ombi - Media request and user management system'
    };

    // Convert to YAML with proper spacing
    const yamlStr = yaml.stringify(config, {
      lineWidth: 0,
      indent: 2,
      minContentWidth: 0,
    });

    // Post-process the YAML string
    const lines = yamlStr.split('\n');
    const processedLines: string[] = [];
    let currentService: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a service definition
      const serviceMatch = line.match(/^  ([^:]+):$/);
      if (serviceMatch) {
        currentService = serviceMatch[1];
        // Add a blank line before service (except first service)
        if (processedLines.length > 0) {
          processedLines.push('');
        }
        // Add the comment for this service
        if (currentService && Object.prototype.hasOwnProperty.call(comments, currentService)) {
          processedLines.push(comments[currentService as ServiceName]);
        }
        processedLines.push(line);
        continue;
      }

      // Special handling for qbittorrent command to keep it on one line
      if (currentService === 'qbittorrent' && line.includes('command:')) {
        const commandLines = [];
        while (i < lines.length && (lines[i].startsWith('    ') || lines[i].includes('command:'))) {
          commandLines.push(lines[i].trim());
          i++;
        }
        i--;
        processedLines.push(`    command: ${commandLines.join(' ')}`);
        continue;
      }

      // Regular line processing
      processedLines.push(line);
    }

    return processedLines.join('\n');
  };

  const handleGenerate = async () => {
    try {
      const config = generateDockerCompose();
      const savedPath = await window.electronAPI.saveFile(config);
      
      if (savedPath) {
        toast({
          title: 'Configuration generated',
          description: `Docker Compose configuration has been saved to: ${savedPath}`,
          status: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error generating configuration',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const validateConfig = () => {
    if (!directories || !services) {
      return ['Missing configuration data'];
    }

    const issues = [];

    // Directory validation
    if (!directories.media.movies) {
      issues.push('Movies directory is not configured');
    }
    if (!directories.media.tv) {
      issues.push('TV Shows directory is not configured');
    }
    if (!directories.downloads.complete) {
      issues.push('Downloads directory is not configured');
    }
    if (!directories.config) {
      issues.push('Config directory is not configured');
    }

    // Service validation
    if (!services.required.mediaServer) {
      issues.push('Media server is not selected');
    }
    if (!services.required.downloadClient) {
      issues.push('Download client is not selected');
    }

    // VPN validation
    if (!services.required.vpn) {
      issues.push('VPN gateway is not selected');
    } else if (services.required.vpn !== 'gluetun') {
      issues.push('Only Gluetun VPN gateway is supported');
    }

    return issues;
  };

  const validationIssues = directories && services ? validateConfig() : ['Missing configuration data'];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4}>Configuration Generator</Heading>
        <Text>
          Generate your docker-compose.yml file based on your selected services and directories.
        </Text>
      </Box>

      {validationIssues.length > 0 && (
        <Alert status="error">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Configuration Issues:</Text>
            <VStack align="stretch" spacing={1} mt={2}>
              {validationIssues.map((issue, index) => (
                <Text key={index}>• {issue}</Text>
              ))}
            </VStack>
          </Box>
        </Alert>
      )}

      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Preview Configuration
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Code
              display="block"
              whiteSpace="pre"
              p={4}
              borderRadius="md"
              fontSize="sm"
              overflowX="auto"
            >
              {directories && services ? generateDockerCompose() : 'No configuration available'}
            </Code>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <ButtonGroup spacing={4}>
        <Button
          colorScheme="blue"
          onClick={handleGenerate}
          isDisabled={validationIssues.length > 0}
        >
          Save Docker Compose File
        </Button>
        <Button
          colorScheme="green"
          onClick={async () => {
            try {
              const config = generateDockerCompose();
              const savedPath = await window.electronAPI.saveFile(config);
              if (savedPath) {
                toast({
                  title: 'Backup created',
                  description: `Configuration has been backed up to: ${savedPath}`,
                  status: 'success',
                  duration: 5000,
                });
              }
            } catch (error) {
              toast({
                title: 'Error creating backup',
                description: error instanceof Error ? error.message : 'Unknown error occurred',
                status: 'error',
                duration: 5000,
              });
            }
          }}
          isDisabled={validationIssues.length > 0}
        >
          Save as Backup
        </Button>
      </ButtonGroup>
    </VStack>
  );
};

export default ConfigurationGenerator;
