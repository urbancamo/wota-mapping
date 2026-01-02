# WOTA Mapping API Server

Backend API server for the WOTA Mapping application. Provides database-backed summit data with activation filtering.

## Quick Start

### From Project Root

```bash
# Start the server
./start-server.sh

# Stop the server (in another terminal)
./stop-server.sh
```

### Manual Start

```bash
cd server
node server.js
```

The server will start on port 3006 (configured in `.env`).

## Development

### Install Dependencies

```bash
npm install
```

### Run Server

```bash
# Normal mode
npm start

# Development mode with auto-restart
npm run dev
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Configuration

Environment variables are stored in `.env` file:

- `WOTA_DATABASE_URL` - MySQL database connection string
- `PORT` - Server port (default: 3006)
- `NODE_ENV` - Environment (development/production)

**Note:** The `.env` file is gitignored. Use `.env.example` as a template.

## API Endpoints

### GET /api/summits

Retrieve all WOTA summits with activation data.

**Query Parameters:**
- `activated` (optional) - Filter by activation status
  - `true` - Only activated summits
  - `false` - Only unactivated summits
  - Omit for all summits
- `callsign` (optional) - Filter by activator callsign
  - Returns summits activated by the specified callsign (or not activated, if used with `notActivated=true`)
  - Case-insensitive (converted to uppercase)
  - When used with `year`, filters to specific year
- `year` (optional) - Filter activations by year
  - Must be a 4-digit year (e.g., 2026)
  - Only used in combination with `callsign`
- `notActivated` (optional) - Reverse callsign filter logic
  - `true` - Returns summits NOT activated by the specified callsign
  - Only used in combination with `callsign`

**Example:**
```
GET /api/summits
GET /api/summits?activated=true
GET /api/summits?activated=false
GET /api/summits?callsign=M0XYZ
GET /api/summits?callsign=M0XYZ&year=2026
GET /api/summits?callsign=M0XYZ&notActivated=true
GET /api/summits?callsign=M0XYZ&year=2026&notActivated=true
```

**Response:** GeoJSON FeatureCollection with summit data

### GET /api/health

Health check endpoint that verifies both server and database connectivity.

**Response (Healthy - 200):**
```json
{
  "status": "ok",
  "timestamp": "2026-01-01T12:00:00.000Z",
  "database": {
    "connected": true,
    "error": null
  }
}
```

**Response (Degraded - 503):**
```json
{
  "status": "degraded",
  "timestamp": "2026-01-01T12:00:00.000Z",
  "database": {
    "connected": false,
    "error": "Connection timeout"
  }
}
```

**Status Codes:**
- `200` - All systems operational (server and database connected)
- `503` - Service degraded (database connection failed)

## Database

The server connects to a MySQL database hosted at `hosting09.layerip.com`.

**Tables used:**
- `summits` - Summit information with activation data (last_act_by, last_act_date)

**Note:** Database connections from external networks may be restricted. The server needs to run on a host with network access to the database (e.g., the production server at m5tea.uk).

## Deployment

### Production Setup

1. Copy files to server
2. Create `.env` file with production values
3. Install dependencies: `npm install`
4. Start server: `npm start`
5. Configure nginx reverse proxy:

```nginx
location /mapping/api/ {
    proxy_pass http://localhost:3006/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Process Management

For production, use PM2 or systemd to keep the server running:

```bash
# Using PM2
pm2 start server.js --name wota-api
pm2 save
```

## Troubleshooting

### Port Already in Use

If you see "Port 3006 is already in use":

```bash
# Stop the running server
./stop-server.sh

# Or manually find and kill the process
lsof -ti:3006 | xargs kill
```

### Database Connection Timeout

If running locally, the database may not accept connections from external networks. This is expected. The server will work when deployed to the production server.

### CORS Issues

In development, CORS is enabled for localhost. In production, nginx handles CORS headers.

## Project Structure

```
server/
├── db/
│   ├── connection.js    # Database connection pool
│   └── queries.js       # SQL query functions
├── routes/
│   └── summits.js       # GET /api/summits route handler
├── __tests__/           # Jest tests
│   ├── db/
│   └── routes/
├── server.js            # Express app entry point
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables (gitignored)
└── .env.example         # Environment template
```
