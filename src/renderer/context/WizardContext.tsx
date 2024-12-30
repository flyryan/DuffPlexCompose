import React, { createContext, useContext, useState } from 'react';

interface DirectoryConfig {
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

interface ServiceConfig {
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

interface WizardContextType {
  directories: DirectoryConfig | null;
  setDirectories: (config: DirectoryConfig) => void;
  services: ServiceConfig | null;
  setServices: (config: ServiceConfig) => void;
  isDirectoryConfigValid: boolean;
  isServiceConfigValid: boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [directories, setDirectories] = useState<DirectoryConfig | null>(null);
  const [services, setServices] = useState<ServiceConfig | null>(null);

  const isDirectoryConfigValid = Boolean(
    directories?.media.movies &&
    directories?.media.tv &&
    directories?.downloads.complete &&
    directories?.config
  );

  const isServiceConfigValid = Boolean(
    services?.required.mediaServer &&
    services?.required.vpn &&
    services?.required.downloadClient
  );

  return (
    <WizardContext.Provider
      value={{
        directories,
        setDirectories,
        services,
        setServices,
        isDirectoryConfigValid,
        isServiceConfigValid,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
