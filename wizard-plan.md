# Media Server Deployment Wizard Plan

## Overview
Transform the current static docker-compose setup into an interactive wizard that guides users through deploying a customized media server stack. The wizard will prioritize ease of use while maintaining flexibility in service selection and configuration.

## Core Features

### 1. Directory Configuration
- **Universal Directory Setup** ✅
  - Media directory (movies, TV shows, music) ✅
  - Downloads directory (temporary, completed) ✅
  - Backup directory (configurations) ✅
  - Transcoding directory (optional, for Plex) ❌
- **Permission Management** ❌
  - Automatic PUID/PGID detection ❌
  - Directory permission validation ❌
  - Ownership verification ❌

### 2. Service Selection ✅
- **Core Services (Required)** ✅
  - Media Server: Plex ✅
  - VPN Gateway: Gluetun ✅
  - Download Client: Choice of qBittorrent/Transmission ✅
  
- **Media Management (Choose One Each)** ✅
  - Movie Management: Radarr/Alternatives ✅
  - TV Management: Sonarr/Alternatives ✅
  - Request System: Overseerr/Ombi ✅
  
- **Optional Services** ❌
  - Analytics: Tautulli/Varken ❌
  - Indexers: Jackett/Prowlarr ❌
  - Usenet: SABnzbd/NZBGet ❌
  - Dashboard: Organizr/Heimdall ❌
  - Monitoring: Monitorr/Grafana ❌
  - Network Tools: OpenSpeedTest/SpeedTest-Tracker ❌

### 3. Configuration Steps

1. **System Requirements Check** ❌
   - Docker installation ❌
   - Docker Compose version ❌
   - Available disk space ❌
   - Required ports availability ❌
   - ARM/x86 architecture detection ❌

2. **Directory Setup** ✅
   ```bash
   # Example structure
   media/
     ├── movies/ ✅
     ├── tv/ ✅
     └── music/ ✅
   downloads/
     ├── incomplete/ ✅
     └── complete/ ✅
   backup/ ✅
   config/
     └── [service-specific-dirs]/ ✅
   ```

3. **Service Configuration**
   - VPN setup (if selected) ✅
     - Provider selection ✅
     - Credentials input ❌
     - Server location choice ❌
   - Media server setup ✅
     - Transcoding options ❌
     - Hardware acceleration ❌
   - Download client configuration ✅
     - Port selection ✅
     - Connection limits ❌
   - Media management setup ✅
     - Quality profiles ❌
     - Language preferences ❌
   - Integration configuration ❌
     - Inter-service communication ❌
     - API keys management ❌

4. **Validation & Testing**
   - Directory permissions ❌
   - Port availability ❌
   - Network connectivity ❌
   - Service accessibility ❌
   - Integration verification ❌

### 4. Technical Implementation

1. **Wizard Core**
   - Primary: Electron-based GUI application ✅
     - Cross-platform desktop interface ✅
     - Directory browsing with file picker dialogs ✅
     - Visual service selection with checkboxes ✅
     - Real-time validation feedback ✅
   - Fallback: Python-based CLI application ❌
     - Interactive prompts using `questionary` ❌
     - Support for non-GUI environments ❌
   - Shared backend logic for both interfaces ❌
   - YAML/JSON configuration generation ✅
   - Service template management ✅

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

4. **Docker Compose Generation** ✅
   - Dynamic service inclusion ✅
   - Environment variable management ✅
   - Volume mapping ✅
   - Network configuration ✅
   - Service dependencies ✅

### 5. User Interface Flow

1. **Welcome & System Check** ❌
   - System compatibility check screen ❌
   - Docker installation verification ❌
   - Architecture detection ❌
   - Disk space analysis ❌
   - Required ports check ❌

2. **Directory Configuration** ✅
   - Visual directory structure view ✅
   - Browse button for each path selection ✅
   - Directory creation option if not exists ✅
   - Permission status indicators ❌
   - Real-time path validation ✅
   - Suggested default locations ❌
   - "Save for later" option to skip immediate path selection ❌

3. **Service Selection** ✅
   - Visual grid/card layout of available services ✅
   - Grouped by category with clear descriptions ✅
   - Checkbox selection for optional services ✅
   - Radio buttons for alternative choices ✅
   - Service dependency visualization ✅
   - Resource requirement indicators ❌
   - Hover tooltips with service details ❌

4. **Configuration** ✅
   - Tab-based configuration interface ✅
   - Visual form elements for settings ✅
   - Port selection with conflict detection ✅
   - VPN provider selection dropdown ✅
   - Hardware acceleration options ❌
   - Integration setup wizards ❌
   - Configuration templates ✅
   - Advanced settings toggle ❌

5. **Deployment** ❌
   - Visual deployment progress ❌
   - Service startup status indicators ❌
   - Real-time log viewer ❌
   - Error notifications with solutions ❌
   - Success confirmations ❌
   - Quick access links to services ❌

### 6. Error Handling & Recovery

1. **Pre-deployment Validation** ❌
   - Directory permissions ❌
   - Port conflicts ❌
   - Disk space ❌
   - Network connectivity ❌

2. **Deployment Monitoring** ❌
   - Service startup status ❌
   - Log monitoring ❌
   - Error detection ❌
   - Automatic recovery attempts ❌

3. **User Feedback** ✅
   - Clear error messages ✅
   - Suggested solutions ✅
   - Progress indicators ✅
   - Success confirmation ✅

### 7. Documentation Generation ❌

- **Configuration Guide** ❌
  - Selected services ❌
  - Port assignments ❌
  - Access URLs ❌
  - Initial credentials ❌

- **Backup Instructions** ❌
  - Configuration files ❌
  - Important directories ❌
  - Restore procedures ❌

- **Troubleshooting Guide** ❌
  - Common issues ❌
  - Log locations ❌
  - Support resources ❌

## Implementation Phases

### Phase 1: Core Framework
1. Basic GUI application structure ✅
2. Visual directory management ✅
3. Service selection interface ✅
4. Basic docker-compose generation ✅
5. CLI fallback implementation ❌

### Phase 2: Service Integration
1. Alternative service support ✅
2. Advanced configuration options ❌
3. Service interdependency management ✅
4. Validation system ✅

### Phase 3: User Experience
1. Improved error handling ✅
2. Progress visualization ✅
3. Documentation generation ❌
4. Recovery procedures ❌

### Phase 4: Testing & Refinement ❌
1. Multi-platform testing ❌
2. Error scenario validation ❌
3. User feedback integration ❌
4. Performance optimization ❌

## Next Steps

1. Review and refine overall architecture ✅
2. Begin Phase 1 implementation (see phase1-plan.md) ✅
3. Gather user feedback on wizard flow ❌
4. Iterate on design based on feedback ❌
