# Technical Stack

> Last Updated: 2026-01-01
> Version: 1.0.0

## Core Technologies

### Application Framework
- **Frontend Framework:** Vanilla JavaScript (ES6)
- **Backend Framework:** Node.js with Express (to be added)
- **Version:** Node.js 22 LTS

### Database
- **Primary:** MySQL
- **Version:** 5.x
- **Host:** hosting09.layerip.com
- **Database Name:** wotaorgu_wotadb
- **ORM/Driver:** mysql2 (Node.js)

## Frontend Stack

### Mapping Library
- **Library:** OpenLayers
- **Version:** 5.3.0
- **Purpose:** Interactive map rendering and summit visualization

### JavaScript Dependencies
- **jQuery:** 2.2.3
- **Purpose:** DOM manipulation and AJAX requests
- **Source:** CDN (code.jquery.com)

### CSS Framework
- **Framework:** Bootstrap
- **Version:** 3.3.6
- **Components:** Grid system, buttons, tooltips, popovers
- **Source:** CDN (maxcdn.bootstrapcdn.com)

### UI Components
- **Font Awesome:** 4.4.0
- **Purpose:** Icon library for control buttons
- **Source:** CDN

### Utility Libraries
- **FileSaver.js:** 1.3.3 (PNG export)
- **jsPDF:** 1.2.61 (PDF export)
- **Source:** CDN (cdnjs.cloudflare.com)

## Backend Stack (To Be Implemented)

### API Server
- **Framework:** Express.js
- **Version:** Latest stable (5.x)
- **Port:** 3003 (development)
- **Purpose:** Provide filtered summit data and activation queries

### Database Access
- **Driver:** mysql2
- **Connection Pooling:** Yes
- **Environment Variables:** Stored in .env file

### API Endpoints (Planned)
- `GET /api/summits` - All summits with activation status
- `GET /api/summits?activated=true` - Filter by activation status
- `GET /api/summits?after=YYYY-MM-DD` - Filter by date range
- `GET /api/summits?callsign=M0XXX` - Filter by operator
- `GET /api/spots` - Recent activation spots
- `GET /api/alerts` - Upcoming activation alerts

## Assets & Media

### Fonts
- **Provider:** System fonts (Calibri, sans-serif)
- **Loading Strategy:** Native browser rendering

### Icons
- **Library:** Font Awesome 4.4.0
- **Implementation:** CSS classes

### Images
- **WOTA Logo:** data/wotalogo.png (local)
- **Summit Markers:** data/dot.png (local)
- **Format:** PNG

### Data Files
- **Summit Data:** data/summits.json (GeoJSON)
- **Format:** RFC 7946 GeoJSON FeatureCollection
- **Features:** 214+ summit points with properties

## Infrastructure

### Application Hosting
- **Platform:** Self-hosted server (m5tea.uk)
- **Server:** nginx
- **Configuration:** Reverse proxy
- **Frontend Path:** /wota-mapping/
- **Backend Path:** /wota-mapping/api/ (proxied to port 3006)

### Database Hosting
- **Provider:** LayerIP Hosting
- **Service:** Shared MySQL hosting
- **Host:** hosting09.layerip.com
- **Backups:** Provider-managed

### Asset Storage
- **Provider:** Self-hosted
- **Method:** Static file serving via nginx
- **Location:** Same server as application

## Deployment

### CI/CD Pipeline
- **Platform:** Manual deployment (Git pull + restart)
- **Trigger:** Manual
- **Process:**
  1. Git pull on server
  2. npm install (for backend)
  3. Restart Node.js service
  4. nginx config reload if needed

### Environments
- **Production:** https://m5tea.uk/wota-mapping/
- **Development:** localhost:8080 (frontend), localhost:3006 (backend)

### Reverse Proxy Configuration
- **Server:** nginx
- **Frontend:** Serve static files from /wota-mapping/
- **Backend:** Proxy /wota-mapping/api/ to http://localhost:3006/api/
- **SSL:** HTTPS via Let's Encrypt

## Database Schema

### Tables Used

**summits**
- `wotaid` (mediumint) - WOTA summit ID
- `sotaid` (mediumint) - SOTA summit ID (if applicable)
- `book` (char2) - Wainwright book code
- `name` (varchar64) - Summit name
- `height` (int) - Summit height in meters
- `reference` (char14) - Grid reference
- `last_act_by` (char11) - Last activating callsign
- `last_act_date` (date) - Date of last activation
- `humpid` (mediumint) - Hump ID (if applicable)
- `gridid` (char6) - Simplified grid reference

**spots**
- `id` (int) - Spot ID
- `datetime` (timestamp) - Spot time
- `call` (varchar12) - Activator callsign
- `wotaid` (mediumint) - WOTA summit ID
- `freqmode` (varchar20) - Frequency and mode
- `comment` (varchar80) - Spot comment
- `spotter` (char11) - Spotter callsign

**alerts**
- `id` (int) - Alert ID
- `wotaid` (mediumint) - WOTA summit ID
- `datetime` (datetime) - Planned activation time
- `call` (varchar12) - Activator callsign
- `freqmode` (varchar40) - Planned frequency and mode
- `comment` (varchar80) - Alert comment
- `postedby` (char11) - Alert poster callsign

## Code Repository

### Repository Location
- **Platform:** Git (local)
- **Remote:** TBD
- **Branch Strategy:** main (production)

### Related Repositories
- **wota-data:** Database synchronization and management scripts
- **Location:** /Users/msw/code/wota-data
