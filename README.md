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

1. Install Docker and Docker Compose
2. Clone this repository:
   ```bash
   git clone https://github.com/flyryan/MediaServerCompose.git
   cd MediaServerCompose
   ```
3. Set up Mullvad VPN (see [VPN Setup](#vpn-setup))
4. Update paths in `docker-compose.yml` (see [Configuration](#configuration))
5. Create the required directories:
   ```bash
   mkdir -p {plex,radarr,sonarr,overseerr,tautulli,jackett,sabnzbd,organizr,monitorr,netdata,speedtest-tracker,qbt}/config
   ```
6. Start everything:
   ```bash
   docker-compose up -d
   ```

That's it! Your media server is now running. Continue reading for detailed setup and configuration instructions.

[🔝 Back to top](#table-of-contents)

---

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

2. **Install Docker Compose**
   - Usually included with Docker Desktop (Windows/macOS)
   - [Linux installation](https://docs.docker.com/compose/install/)

### VPN Setup

This stack uses Mullvad VPN to protect your privacy. Here's how to set it up:

1. Sign up at [Mullvad VPN](https://mullvad.net)

2. Generate a WireGuard configuration:
   - Go to [Mullvad Account](https://mullvad.net/en/account/#/wireguard-config)
   - Select "Linux" as your platform
   - Generate a new key
   - Download the configuration file

3. From the configuration file, you'll need:
   - `PrivateKey` from the [Interface] section
   - `Address` from the [Interface] section (e.g., 10.x.x.x/32)

### Configuration

1. **Find your user/group IDs**:
   ```bash
   # Run these commands:
   echo "Your PUID is: $(id -u)"
   echo "Your PGID is: $(id -g)"
   ```

2. **Set your timezone**:
   - Find your timezone from the [TZ database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
   - Example: `America/New_York`, `Europe/London`

3. **Update docker-compose.yml**:
   - Replace all `PUID` and `PGID` values with yours
   - Replace all `TZ` values with your timezone
   - Set your media paths in docker-compose.yml:
     ```yaml
     # Replace these example paths with your actual media directories:
     /path/to/movies     # Where you want to store movies
     /path/to/tv        # Where you want to store TV shows
     /path/to/downloads # Where temporary downloads are stored
     ```
   - Add your Mullvad configuration:
     ```yaml
     WIREGUARD_PRIVATE_KEY: your_private_key_here
     WIREGUARD_ADDRESSES: your_wireguard_address_here
     SERVER_CITIES: your_chosen_city
     ```

## Service Configuration Guide

After starting the stack, configure each service in this order:

### qBittorrent (Port 8080)
---
1. Get your temporary password:
   ```bash
   docker logs qbittorrent
   ```
2. Visit `http://localhost:8080`
3. Login with:
   - Username: `admin`
   - Password: (use the temporary password from the logs)
4. Change the temporary password to something secure
   - Remember this password for configuring other services

### Plex (Port 32400)
---
1. Visit `http://localhost:32400/web`
2. Sign in or create a Plex account
3. Add your media libraries:
   - Movies: `/media/movies`
   - TV Shows: `/media/tv`

### Radarr (Port 7878)
---
1. Visit `http://localhost:7878`
2. Add qBittorrent:
   - Go to Settings → Download Clients
   - Add qBittorrent
   - Host: `gluetun`
   - Port: `8080`
   - Username: `admin`
   - Password: (use the password you set in qBittorrent setup)

### Sonarr (Port 8989)
---
1. Visit `http://localhost:8989`
2. Configure similar to Radarr, using the same qBittorrent credentials
3. Add your TV Shows folder: `/tv`

### Overseerr (Port 5055)
---
1. Visit `http://localhost:5055`
2. Connect to Plex
3. Connect to Radarr/Sonarr

### Jackett (Port 9117)
---
1. Visit `http://localhost:9117`
2. Add indexers you want to use
3. Copy API key for Radarr/Sonarr

### SABnzbd (Port 8081)
---
1. Visit `http://localhost:8081`
2. Follow setup wizard
3. Add your Usenet provider details

## How Everything Works Together

1. **Media Request Flow**:
   - Users request media through Overseerr
   - Requests are sent to Radarr (movies) or Sonarr (TV shows)
   - Radarr/Sonarr search for content using Jackett
   - Downloads handled by qBittorrent (torrents) or SABnzbd (usenet)
   - Media automatically organized into your libraries
   - Plex detects and makes content available for streaming

2. **Download Security**:
   - All torrent traffic routed through Mullvad VPN
   - Downloads automatically extract when completed
   - Failed downloads are retried automatically

3. **Monitoring**:
   - Tautulli tracks Plex usage
   - Organizr provides a unified dashboard
   - System monitoring tracks performance
   - Speed tests monitor network health

## Port Reference

| Service          | Port  | Purpose                            |
|-----------------|-------|-----------------------------------|
| Plex            | 32400 | Media streaming                    |
| Radarr          | 7878  | Movie management                  |
| Sonarr          | 8989  | TV Show management               |
| Overseerr       | 5055  | Media requests                    |
| qBittorrent     | 8080  | Download management              |
| SABnzbd         | 8081  | Usenet downloads                 |
| Jackett         | 9117  | Torrent indexer                  |
| Tautulli        | 8181  | Plex analytics                   |
| Organizr        | 8096  | Service dashboard                |
| Monitorr        | 8097  | Service monitoring              |
| OpenSpeedTest   | 3000  | Network testing (HTTP)           |
| SpeedTest Track | 8765  | Speed monitoring                 |

## Updating

To update all services to their latest versions:

```bash
# Pull the latest images
docker-compose pull

# Restart all services with the new images
docker-compose up -d
```

Your configuration and data will be preserved during updates.

[🔝 Back to top](#table-of-contents)

---

## Notes

- GPU transcoding is enabled by default for Plex. Remove GPU-related settings if not using.
- All services auto-start when Docker starts
- Service configurations persist in their respective config directories
- Regular backups of config directories recommended

## Troubleshooting

1. **VPN Issues**:
   - Check Mullvad status at `http://localhost:8888`
   - Verify WireGuard configuration
   - Try different server cities

2. **Download Problems**:
   - Verify VPN is working
   - Check qBittorrent/SABnzbd settings
   - Ensure proper permissions on download directories

3. **Plex Issues**:
   - Verify media permissions
   - Check Plex logs in config directory
   - Ensure proper file naming conventions

4. **Permission Errors**:
   - Verify PUID/PGID settings
   - Check directory permissions
   - Ensure consistent ownership across volumes

[🔝 Back to top](#table-of-contents)
