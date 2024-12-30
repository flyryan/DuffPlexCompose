# DuffPlex Personal Media Server Stack

A complete media server solution built on Docker technology. This stack provides everything you need to download, organize, and stream your media collection, all running in containers for easy setup and management.

## Quick Navigation
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Configuration](#configuration)
- [Service Setup](#service-configuration-guide)
- [Port Reference](#port-reference)
- [Troubleshooting](#troubleshooting)

## Table of Contents

- [What is Docker?](#what-is-docker)
- [Why Docker?](#why-docker)
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
  - [Core Components](#core-components)
    - [Media Management Layer](#media-management-layer)
    - [Request & Discovery System](#request--discovery-system)
    - [Automated Media Acquisition](#automated-media-acquisition)
    - [Download Management](#download-management)
    - [Search & Indexing](#search--indexing)
  - [Monitoring & Management](#monitoring--management)
  - [Data Flow](#data-flow)
  - [Security Considerations](#security-considerations)
  - [Integration Points](#integration-points)
- [Detailed Setup Guide](#detailed-setup-guide)
  - [Prerequisites](#prerequisites)
  - [VPN Setup](#vpn-setup)
  - [Configuration](#configuration)
- [Service Configuration Guide](#service-configuration-guide)
  - [qBittorrent](#qbittorrent-port-8080)
  - [Plex](#plex-port-32400)
  - [Radarr](#radarr-port-7878)
  - [Sonarr](#sonarr-port-8989)
  - [Overseerr](#overseerr-port-5055)
  - [Jackett](#jackett-port-9117)
  - [SABnzbd](#sabnzbd-port-8081)
- [How Everything Works Together](#how-everything-works-together)
- [Port Reference](#port-reference)
- [Updating](#updating)
- [Notes](#notes)
- [Troubleshooting](#troubleshooting)

## What is Docker?

Docker is a platform that makes it easy to run applications in isolated containers. Think of containers as lightweight, standalone packages that include everything needed to run a piece of software.

## Why Docker?

- **Easy Setup**: No need to manually install each application
- **No Conflicts**: Each service runs in its own container, preventing conflicts
- **Simple Updates**: Update any service with just two commands
- **Consistent Environment**: Works the same way on any computer or OS
- **Resource Efficient**: Uses fewer resources than running everything directly on your system
- **Easy Backup**: All configurations are in one place
- **Quick Recovery**: If something breaks, just restart the container

This stack uses Docker Compose, a tool that helps you run multiple Docker containers together. Instead of managing each service separately, you can start/stop/update everything with single commands.

---

## Quick Start

1. Install Docker and Docker Compose:
   - [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)
   - [Docker Desktop for macOS](https://docs.docker.com/desktop/mac/install/)
   - [Docker Engine for Linux](https://docs.docker.com/engine/install/)
   - Docker Compose is included in Docker Desktop, or for Linux see the [installation guide](https://docs.docker.com/compose/install/)

2. Clone this repository:
   ```bash
   git clone https://github.com/flyryan/MediaServerCompose.git
   cd MediaServerCompose
   ```
3. Set up Mullvad VPN (see [VPN Setup](#vpn-setup))
4. Update paths in `docker-compose.yml` (see [Configuration](#configuration))
5. Create the required directories:
   ```bash
   mkdir -p {plex,radarr,sonarr,overseerr,tautulli,jackett,sabnzbd,organizr,monitorr,netdata,speedtest-tracker,qbt}/config backup
   ```
6. Start everything:
   ```bash
   docker-compose up -d
   ```

That's it! Your media server is now running. Continue reading for detailed setup and configuration instructions.

## Architecture Overview

The media server stack is built with a microservices architecture where each component runs in its own Docker container, working together to provide a complete media management and streaming solution. Here's how everything fits together:

### Core Components

#### Media Management Layer
- **Plex Media Server**: The central media streaming service
  - Handles transcoding and streaming to various devices
  - Manages media libraries and metadata
  - Supports multiple users with different permissions
  - Can utilize GPU acceleration for faster transcoding

#### Request & Discovery System
- **Overseerr**: Front-end request management system
  - Provides user-friendly interface for media requests
  - Integrates with Plex for library awareness
  - Forwards requests to appropriate services (Radarr/Sonarr)
  - Manages user permissions and request quotas

#### Automated Media Acquisition
- **Radarr** (Movies) & **Sonarr** (TV Shows): Automated media managers
  - Monitor for wanted media
  - Handle quality profiles and upgrades
  - Manage media organization and naming
  - Integrate with download clients and indexers

#### Download Management
- **Gluetun**: VPN Gateway
  - Routes specified container traffic through VPN
  - Provides secure connection via WireGuard
  - Enables port forwarding for better connectivity
  - Protects privacy for downloading operations

- **qBittorrent**: Torrent download manager
  - Runs through VPN tunnel (Gluetun)
  - Handles torrent downloads with encryption
  - Includes automatic RAR extraction
  - Manages download queues and priorities

- **SABnzbd**: Usenet downloader
  - Handles Usenet binary downloads
  - Automated file repair and extraction
  - SSL encryption for secure downloads
  - Bandwidth scheduling and management

#### Search & Indexing
- **Jackett**: Torrent indexer proxy
  - Unifies multiple torrent sites
  - Provides standardized search API
  - Manages tracker credentials
  - Converts searches to site-specific formats

### Monitoring & Management

#### System Monitoring
- **Monitorr**: Service status dashboard
  - Monitors all services' health
  - Provides uptime tracking
  - Alerts on service failures
  - Shows quick status overview

- **Netdata**: System metrics collection
  - Real-time performance monitoring
  - Resource usage tracking
  - Network statistics
  - Historical data analysis

#### Media Analytics
- **Tautulli**: Plex usage statistics
  - Tracks media plays and user activity
  - Generates viewing statistics
  - Monitors transcoding sessions
  - Provides notification system

#### Network Performance
- **OpenSpeedTest**: Network speed testing
  - Local speed test server
  - Bandwidth measurement
  - Latency testing
  - Cross-platform compatibility

- **SpeedTest Tracker**: Speed monitoring
  - Automated speed tests
  - Historical speed data
  - Performance trending
  - Network reliability metrics

#### Service Organization
- **Organizr**: Unified web interface
  - Single sign-on capability
  - Customizable dashboard
  - Service iframe integration
  - Access management

### Data Flow

1. **Media Request Flow**:
   ```
   User → Overseerr → Radarr/Sonarr → Jackett → Download Clients → Media Library → Plex
   ```

2. **Download Security Flow**:
   ```
   Internet ↔ Gluetun (VPN) ↔ qBittorrent ↔ Local Storage
   ```

3. **Streaming Flow**:
   ```
   Media Files → Plex → Transcoding (if needed) → User Devices
   ```

### Security Considerations

- All torrent traffic is routed through VPN (Gluetun)
- Services can be exposed securely via Cloudflare Tunnels
- Internal services are not directly exposed to the internet
- Each service runs with specific user permissions
- Container isolation prevents service interference

### Integration Points
- All services share a common Docker network
- Consistent UID/GID across containers
- Shared storage volumes for media
- Standardized timezone settings
- Unified monitoring and logging

[🔝 Back to top](#table-of-contents)

---

## Detailed Setup Guide

### Prerequisites

1. **Install Docker**
   - [Windows](https://docs.docker.com/desktop/windows/install/)
   - [macOS](https://docs.docker.com/desktop/mac/install/)
   - [Linux](https://docs.docker.com/engine/install/)

   Note: For ARM64 systems (like Apple M1/M2 or Raspberry Pi):
   - Most images are compatible but some may require specific ARM64 versions
   - The Monitorr service currently uses an amd64 image which may have reduced performance on ARM systems
   - Check the docker-compose.yml for platform-specific image tags

2. **Install Docker Compose**
   - Usually included with Docker Desktop (Windows/macOS)
   - [Linux installation](https://docs.docker.com/compose/install/)

### VPN Setup (Optional but Highly Recommended)

This stack can optionally use Mullvad VPN to protect your privacy when downloading. While not strictly required for the stack to function, using a VPN is highly recommended for privacy and security when using torrents. Here's how to set it up:

1. Sign up at [Mullvad VPN](https://mullvad.net)

2. Generate a WireGuard configuration:
   - Go to [Mullvad Account](https://mullvad.net/en/account/#/wireguard-config)
   - Select "Linux" as your platform
   - Generate a new key
   - Download the configuration file

3. From the configuration file, you'll need:
   - `PrivateKey` from the [Interface] section
   - `Address` from the [Interface] section (e.g., 10.x.x.x/32)

If you choose not to use VPN:
1. In docker-compose.yml:
   - Remove or comment out the entire `gluetun` service block
   - In the qBittorrent service:
     - Remove the `network_mode: "service:gluetun"` line
     - Uncomment the `ports` section
2. Note: Running torrents without VPN may expose your IP address to other peers

### Configuration

1. **Find your user/group IDs**:
   ```bash
   # Run these commands to get your user and group IDs:
   echo "PUID=$(id -u)"
   echo "PGID=$(id -g)"
   ```
   Note: These IDs are critical for container permissions and must be set correctly for all services to:
   - Access and modify media files
   - Write to configuration directories
   - Ensure consistent file ownership across all services
   Common values are PUID=1000 and PGID=1000 for the first user created on Linux systems.

2. **Set your timezone**:
   - Find your timezone from the [TZ database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
   - Example: `America/New_York`, `Europe/London`
   Note: Some systems may require admin/sudo access to modify timezone settings. If you encounter permission errors, prefix commands with sudo.

3. **Update docker-compose.yml**:
   - Replace all `PUID` and `PGID` values with yours
   - Replace all `TZ` values with your timezone
   - Set your media paths in docker-compose.yml:
     ```yaml
     # Replace these example paths with your actual media directories:
     /path/to/movies     # Where you want to store movies
     /path/to/tv        # Where you want to store TV shows
     /path/to/downloads # Where temporary downloads are stored
     /path/to/backup    # Where configuration backups are stored
     ```
   - Add your Mullvad configuration:
     ```yaml
     WIREGUARD_PRIVATE_KEY: your_private_key_here
     WIREGUARD_ADDRESSES: your_wireguard_address_here
     SERVER_CITIES: los_angeles # Use lowercase with underscores, e.g., new_york, london, tokyo
     ```

### Launch and Initial Setup

1. **Start the Stack**:
   ```bash
   # Create required directories
   mkdir -p {plex,radarr,sonarr,overseerr,tautulli,jackett,sabnzbd,organizr,monitorr,netdata,speedtest-tracker,qbt}/config backup/config

   # Start all services
   docker-compose up -d
   ```

2. **Verify Services**:
   ```bash
   # Check if all containers are running
   docker-compose ps

   # View logs for any issues
   docker-compose logs
   ```

   Verify each service is accessible:
   - Plex: http://localhost:32400/web
   - Radarr: http://localhost:7878
   - Sonarr: http://localhost:8989
   - Overseerr: http://localhost:5055
   - Tautulli: http://localhost:8181
   - Jackett: http://localhost:9117
   - SABnzbd: http://localhost:8081
   - qBittorrent: http://localhost:8080 (or via VPN: http://localhost:8888/qbittorrent)
   - Organizr: http://localhost:8096
   - Monitorr: http://localhost:8097
   - OpenSpeedTest: http://localhost:3000
   - SpeedTest-Tracker: http://localhost:8765

   Note: If any service is not accessible, check its logs:
   ```bash
   docker-compose logs service_name
   ```

3. **Initial Security Setup**:
   - Get qBittorrent's temporary password:
     ```bash
     docker-compose logs qbittorrent
     ```
   - Set secure passwords for all services
   - Configure authentication for Radarr, Sonarr, and other services

4. **Post-Launch Configuration**:
   - Configure Plex libraries and media paths
   - Set up Radarr/Sonarr quality profiles
   - Configure Jackett indexers
   - Test VPN connectivity through Gluetun
   - Configure service interconnections:
     1. Add Plex to Overseerr (Settings → Plex → Add Server)
     2. Add Radarr/Sonarr to Overseerr (Settings → Radarr/Sonarr → Add Server)
     3. Add Jackett indexers to Radarr/Sonarr (Settings → Indexers → Add → Torznab → Custom)
     4. Add download clients to Radarr/Sonarr:
        - qBittorrent via Gluetun (host: gluetun, port: 8080)
        - SABnzbd (host: sabnzbd, port: 8080)

5. **Backup Configuration**:
   ```bash
   # Backup all config directories
   tar -czf backup/config_backup_$(date +%Y%m%d).tar.gz */config
   ```

[🔝 Back to top](#table-of-contents)

---

## Service Configuration Guide

### qBittorrent (Port 8080)

1. Access qBittorrent at `http://localhost:8080`
2. Get the temporary password:
   ```bash
   docker-compose logs qbittorrent
   ```
3. Login with:
   - Username: `admin`
   - Password: (use the temporary password from logs)
4. Set a new secure password immediately
5. Configure download paths:
   - Downloads: `/downloads`
   - Completed: `/downloads/complete`
6. Enable automatic torrent management

### Plex (Port 32400)

1. Access Plex at `http://localhost:32400/web`
2. Create or sign in to your Plex account
3. Add libraries:
   - Movies: `/movies`
   - TV Shows: `/tv`
4. Configure transcoding settings
5. Set up remote access (optional)

### Radarr (Port 7878)

1. Access Radarr at `http://localhost:7878`
2. Use the password you set (never use temporary passwords)
3. Add root folder: `/movies`
4. Configure quality profiles
5. Add indexers (via Jackett)
6. Connect download clients:
   - qBittorrent via Gluetun proxy (use the password you set in qBittorrent)
   - SABnzbd for Usenet

### Sonarr (Port 8989)

1. Access Sonarr at `http://localhost:8989`
2. Use the password you set (never use temporary passwords)
3. Add root folder: `/tv`
4. Configure quality profiles
5. Add indexers (via Jackett)
6. Connect download clients:
   - qBittorrent via Gluetun proxy (use the password you set in qBittorrent)
   - SABnzbd for Usenet

### Overseerr (Port 5055)

1. Access Overseerr at `http://localhost:5055`
2. Connect to Plex server
3. Link Radarr/Sonarr instances
4. Configure user access
5. Set up request limits

### Jackett (Port 9117)

1. Access Jackett at `http://localhost:9117`
2. Add indexers
3. Note the API key
4. Configure proxies if needed
5. Add to Radarr/Sonarr

### SABnzbd (Port 8081)

1. Access SABnzbd at `http://localhost:8081`
2. Complete initial setup
3. Configure download paths:
   - Temporary: `/downloads/incomplete`
   - Completed: `/downloads/complete`
4. Add news servers
5. Set up categories for Radarr/Sonarr

## Port Reference

| Service           | Port  | Notes                               |
|-------------------|-------|-------------------------------------|
| Plex              | 32400 | Media streaming                     |
| Radarr            | 7878  | Movie management                    |
| Sonarr            | 8989  | TV show management                  |
| Overseerr         | 5055  | Request management                  |
| Tautulli          | 8181  | Plex statistics                     |
| Jackett           | 9117  | Torrent indexer                     |
| SABnzbd           | 8081  | Usenet downloader                   |
| qBittorrent       | 8080  | Torrent client (via VPN)            |
| Organizr          | 8096  | Service dashboard                   |
| Monitorr          | 8097  | Service monitoring                  |
| Netdata           | 19999 | System metrics                      |
| OpenSpeedTest     | 3000  | Network speed testing               |
| SpeedTest-Tracker | 8765  | Speed test history                  |
| Gluetun           | 8888  | VPN gateway                         |

## Updating

To update all containers:

```bash
docker-compose pull
docker-compose up -d
```

To update a specific service:

```bash
docker-compose pull service_name
docker-compose up -d service_name
```

## Notes

- All services use the same PUID/PGID for consistent file permissions
- Media paths are consistent across all services
- VPN is optional but highly recommended for torrent traffic
- Backup your configurations regularly

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Verify PUID/PGID settings
   - Check directory permissions
   - Ensure consistent ownership

2. **Network Issues**
   - Confirm ports are not in use
   - Check VPN connectivity
   - Verify Docker network settings

3. **Container Startup Failures**
   - Check logs: `docker-compose logs service_name`
   - Verify configuration files
   - Ensure required volumes exist

4. **Media Not Showing**
   - Verify file permissions
   - Check path mappings
   - Scan libraries in Plex

### Getting Help

1. Check container logs:
   ```bash
   docker-compose logs -f service_name
   ```

2. View all container status:
   ```bash
   docker-compose ps
   ```

3. Restart a service:
   ```bash
   docker-compose restart service_name
   ```

4. Full stack restart:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

[🔝 Back to top](#table-of-contents)
