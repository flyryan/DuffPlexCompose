# DuffPlex Personal Media Server Stack

A complete media server solution built on Docker technology. This stack provides everything you need to download, organize, and stream your media collection, all running in containers for easy setup and management.

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

## What's Included

This stack provides a complete media server solution with:

- **Plex**: Stream your media anywhere
- **Radarr**: Automated movie downloads
- **Sonarr**: Automated TV show downloads
- **Overseerr**: Request new movies and shows
- **Gluetun**: VPN tunnel for secure downloads
- **qBittorrent**: Download manager (through Gluetun)
- **SABnzbd**: Usenet downloader
- **Jackett**: Torrent tracker proxy
- **Tautulli**: Plex statistics and monitoring
- **Organizr**: Web-based dashboard
- **System Monitoring**: Track performance
- **Speed Testing**: Monitor network speeds

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
1. Visit `http://localhost:32400/web`
2. Sign in or create a Plex account
3. Add your media libraries:
   - Movies: `/media/movies`
   - TV Shows: `/media/tv`

### Radarr (Port 7878)
1. Visit `http://localhost:7878`
2. Add qBittorrent:
   - Go to Settings → Download Clients
   - Add qBittorrent
   - Host: `gluetun`
   - Port: `8080`
   - Username: `admin`
   - Password: (use the password you set in qBittorrent setup)

### Sonarr (Port 8989)
1. Visit `http://localhost:8989`
2. Configure similar to Radarr, using the same qBittorrent credentials
3. Add your TV Shows folder: `/tv`

### Overseerr (Port 5055)
1. Visit `http://localhost:5055`
2. Connect to Plex
3. Connect to Radarr/Sonarr

### Jackett (Port 9117)
1. Visit `http://localhost:9117`
2. Add indexers you want to use
3. Copy API key for Radarr/Sonarr

### SABnzbd (Port 8081)
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
