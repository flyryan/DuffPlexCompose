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
import yaml from 'yaml';

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
    if (services.required.downloadClient === 'qbittorrent') {
      config.services.qbittorrent = {
        image: 'lscr.io/linuxserver/qbittorrent:latest',
        container_name: 'qbittorrent',
        network_mode: 'service:gluetun',
        environment: [
          'PUID=1000',
          'PGID=1000',
          'TZ=America/New_York',
          'WEBUI_PORT=8080',
        ],
        volumes: [
          `${directories.config}/qbittorrent:/config`,
          `${directories.downloads.incomplete}:/downloads/incomplete`,
          `${directories.downloads.complete}:/downloads/complete`,
        ],
        restart: 'unless-stopped',
      };

      // Add RAR support if enabled
      if (services.features?.qbtRarSupport) {
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

    if (services.optional.requestSystem === 'overseerr') {
      config.services.overseerr = {
        image: 'linuxserver/overseerr',
        container_name: 'overseerr',
        environment: [
          'PUID=1000',
          'PGID=1000',
          'TZ=America/New_York',
        ],
        volumes: [
          `${directories.config}/overseerr:/config`,
        ],
        ports: ['5055:5055'],
        restart: 'unless-stopped',
      };
    }

    // Convert to YAML with proper spacing
    const doc = new yaml.Document();
    doc.contents = config;

    // Get the YAML string
    let yamlStr = doc.toString({
      lineWidth: 0,
      indent: 2,
      minContentWidth: 0,
    });

    // Add spacing between services but not within them
    const serviceNames = Object.keys(config.services);
    serviceNames.forEach((name, index) => {
      if (index > 0) {
        yamlStr = yamlStr.replace(
          new RegExp(`(\\n\\s{2}${name}:)`, 'g'),
          '\n$1'
        );
      }
    });

    return yamlStr;
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
    const issues = [];

    if (!directories?.media.movies) {
      issues.push('Movies directory is not configured');
    }
    if (!directories?.media.tv) {
      issues.push('TV Shows directory is not configured');
    }
    if (!directories?.downloads.complete) {
      issues.push('Downloads directory is not configured');
    }
    if (!directories?.config) {
      issues.push('Config directory is not configured');
    }
    if (!services?.required.mediaServer) {
      issues.push('Media server is not selected');
    }
    if (!services?.required.vpn) {
      issues.push('VPN gateway is not selected');
    }
    if (!services?.required.downloadClient) {
      issues.push('Download client is not selected');
    }

    return issues;
  };

  const validationIssues = validateConfig();

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
      </ButtonGroup>
    </VStack>
  );
};

export default ConfigurationGenerator;
