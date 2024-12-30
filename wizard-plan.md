# Media Server Deployment Wizard Plan

## Overview
Transform the current static docker-compose setup into an interactive wizard that guides users through deploying a customized media server stack. The wizard will prioritize ease of use while maintaining flexibility in service selection and configuration.

## Core Features

### 1. Directory Configuration
- **Universal Directory Setup**
  - Media directory (movies, TV shows, music)
  - Downloads directory (temporary, completed)
  - Backup directory (configurations)
  - Transcoding directory (optional, for Plex)
- **Permission Management**
  - Automatic PUID/PGID detection
  - Directory permission validation
  - Ownership verification

### 2. Service Selection
- **Core Services (Required)**
  - Media Server: Plex
  - VPN Gateway: Gluetun
  - Download Client: Choice of qBittorrent/Transmission
  
- **Media Management (Choose One Each)**
  - Movie Management: Radarr/Alternatives
  - TV Management: Sonarr/Alternatives
  - Request System: Overseerr/Ombi
  
- **Optional Services**
  - Analytics: Tautulli/Varken
  - Indexers: Jackett/Prowlarr
  - Usenet: SABnzbd/NZBGet
  - Dashboard: Organizr/Heimdall
  - Monitoring: Monitorr/Grafana
  - Network Tools: OpenSpeedTest/SpeedTest-Tracker

### 3. Configuration Steps

1. **System Requirements Check**
   - Docker installation
   - Docker Compose version
   - Available disk space
   - Required ports availability
   - ARM/x86 architecture detection

2. **Directory Setup**
   ```bash
   # Example structure
   media/
     ├── movies/
     ├── tv/
     └── music/
   downloads/
     ├── incomplete/
     └── complete/
   backup/
   config/
     └── [service-specific-dirs]/
   ```

3. **Service Configuration**
   - VPN setup (if selected)
     - Provider selection
     - Credentials input
     - Server location choice
   - Media server setup
     - Transcoding options
     - Hardware acceleration
   - Download client configuration
     - Port selection
     - Connection limits
   - Media management setup
     - Quality profiles
     - Language preferences
   - Integration configuration
     - Inter-service communication
     - API keys management

4. **Validation & Testing**
   - Directory permissions
   - Port availability
   - Network connectivity
   - Service accessibility
   - Integration verification

### 4. Technical Implementation

1. **Wizard Core**
   - Primary: Electron-based GUI application
     - Cross-platform desktop interface
     - Directory browsing with file picker dialogs
     - Visual service selection with checkboxes
     - Real-time validation feedback
   - Fallback: Python-based CLI application
     - Interactive prompts using `questionary`
     - Support for non-GUI environments
   - Shared backend logic for both interfaces
   - YAML/JSON configuration generation
   - Service template management

2. **Configuration Templates**
   ```yaml
   # Example service template
   service_name:
     image: {image}
     container_name: {container_name}
     environment:
       - PUID={puid}
       - PGID={pgid}
       - TZ={timezone}
     volumes:
       - {config_path}:/config
       - {media_path}:/media
     ports:
       - {host_port}:{container_port}
   ```

3. **Validation Functions**
   ```python
   def validate_directories(paths: List[str]) -> bool:
       # Check existence and permissions
       
   def validate_ports(ports: List[int]) -> bool:
       # Check port availability
       
   def validate_services(services: Dict) -> bool:
       # Verify service compatibility
   ```

4. **Docker Compose Generation**
   - Dynamic service inclusion
   - Environment variable management
   - Volume mapping
   - Network configuration
   - Service dependencies

### 5. User Interface Flow

1. **Welcome & System Check**
   - System compatibility check screen
   - Docker installation verification
   - Architecture detection
   - Disk space analysis
   - Required ports check

2. **Directory Configuration**
   - Visual directory structure view
   - Browse button for each path selection
   - Directory creation option if not exists
   - Permission status indicators
   - Real-time path validation
   - Suggested default locations
   - "Save for later" option to skip immediate path selection

3. **Service Selection**
   - Visual grid/card layout of available services
   - Grouped by category with clear descriptions
   - Checkbox selection for optional services
   - Radio buttons for alternative choices
   - Service dependency visualization
   - Resource requirement indicators
   - Hover tooltips with service details

4. **Configuration**
   - Tab-based configuration interface
   - Visual form elements for settings
   - Port selection with conflict detection
   - VPN provider selection dropdown
   - Hardware acceleration options
   - Integration setup wizards
   - Configuration templates
   - Advanced settings toggle

5. **Deployment**
   - Visual deployment progress
   - Service startup status indicators
   - Real-time log viewer
   - Error notifications with solutions
   - Success confirmations
   - Quick access links to services

### 6. Error Handling & Recovery

1. **Pre-deployment Validation**
   - Directory permissions
   - Port conflicts
   - Disk space
   - Network connectivity

2. **Deployment Monitoring**
   - Service startup status
   - Log monitoring
   - Error detection
   - Automatic recovery attempts

3. **User Feedback**
   - Clear error messages
   - Suggested solutions
   - Progress indicators
   - Success confirmation

### 7. Documentation Generation

- **Configuration Guide**
  - Selected services
  - Port assignments
  - Access URLs
  - Initial credentials

- **Backup Instructions**
  - Configuration files
  - Important directories
  - Restore procedures

- **Troubleshooting Guide**
  - Common issues
  - Log locations
  - Support resources

## Implementation Phases

### Phase 1: Core Framework
1. Basic GUI application structure
2. Visual directory management
3. Service selection interface
4. Basic docker-compose generation
5. CLI fallback implementation

### Phase 2: Service Integration
1. Alternative service support
2. Advanced configuration options
3. Service interdependency management
4. Validation system

### Phase 3: User Experience
1. Improved error handling
2. Progress visualization
3. Documentation generation
4. Recovery procedures

### Phase 4: Testing & Refinement
1. Multi-platform testing
2. Error scenario validation
3. User feedback integration
4. Performance optimization

## Phase 1 Implementation Plan

### 1. Project Setup
```bash
# Project structure
media-server-wizard/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # Electron renderer process
│   ├── shared/         # Shared utilities
│   └── cli/            # CLI fallback
├── templates/          # Service templates
├── assets/            # Icons, images
└── tests/             # Test suites
```

### 2. Core Dependencies
- **Frontend**
  - Electron (desktop application framework)
  - React (UI components)
  - Chakra UI (component library)
  - React Router (navigation)
  - Formik (form handling)
  - Yup (validation)

- **Backend**
  - Node.js
  - yaml (YAML parsing/generation)
  - dockerode (Docker API)
  - fs-extra (enhanced file operations)

### 3. Development Milestones

#### Week 1: Application Foundation
1. Set up Electron + React boilerplate
2. Implement basic window management
3. Create main navigation structure
4. Design and implement base UI components
5. Set up development workflow (hot reload, debugging)

#### Week 2: Directory Management
1. Implement directory browser component
   - File system navigation
   - Path validation
   - Permission checking
   - Directory creation
2. Create directory structure visualization
3. Add path suggestion system
4. Implement path persistence

#### Week 3: Service Selection
1. Create service card components
2. Implement selection logic
   - Required services
   - Alternative options
   - Dependencies
3. Add service information tooltips
4. Create service configuration forms

#### Week 4: Configuration & Generation
1. Implement docker-compose.yml generation
2. Create basic validation system
3. Add configuration persistence
4. Implement deployment preparation
5. Basic error handling

### 4. Key Features for Phase 1

1. **Directory Management**
   ```typescript
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
   ```

2. **Service Selection**
   ```typescript
   interface ServiceSelection {
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
   }
   ```

3. **Configuration Generation**
   ```typescript
   interface ConfigGenerator {
     generateDockerCompose(): string;
     validateConfig(): ValidationResult;
     saveConfig(): Promise<void>;
   }
   ```

### 5. Testing Strategy

1. **Unit Tests**
   - Directory validation
   - Configuration generation
   - Service dependency checking

2. **Integration Tests**
   - Directory operations
   - Configuration persistence
   - Docker Compose generation

3. **UI Tests**
   - Navigation flow
   - Form validation
   - Error handling

### 6. Phase 1 Deliverables

1. **Core Application**
   - Functional GUI wizard
   - Basic directory management
   - Essential service selection
   - Simple configuration generation

2. **Documentation**
   - Setup instructions
   - Development guide
   - Basic user guide

3. **Testing**
   - Test suite for core features
   - Basic error handling
   - Validation coverage

### 7. Success Criteria

1. Users can:
   - Browse and select directories
   - Choose basic services
   - Generate valid docker-compose.yml
   - Save/load configurations

2. System can:
   - Validate directory permissions
   - Check service compatibility
   - Generate correct configurations
   - Handle basic errors

### 8. Next Phase Preparation

1. Identify improvements needed for:
   - User interface
   - Validation system
   - Error handling
   - Service configuration

2. Plan for:
   - Advanced features
   - Additional services
   - Enhanced validation
   - Improved error recovery

## Next Steps

1. Set up development environment
2. Create project structure
3. Implement core UI components
4. Build directory management
5. Add service selection
6. Create configuration generator
7. Implement basic validation
8. Add error handling
9. Write initial tests
10. Document Phase 1 features
