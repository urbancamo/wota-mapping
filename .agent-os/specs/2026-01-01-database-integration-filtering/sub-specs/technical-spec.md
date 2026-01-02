# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2026-01-01-database-integration-filtering/spec.md

> Created: 2026-01-01
> Version: 1.0.0

## Technical Requirements

### Backend API Server

- **Framework:** Express.js 5.x
- **Runtime:** Node.js 22 LTS
- **Port:** 3003 (development), proxied via nginx in production
- **CORS:** Enabled for development (localhost origins), nginx handles in production
- **JSON Parsing:** Built-in Express JSON middleware
- **Environment Variables:** dotenv package for .env file loading

### Database Connection

- **Driver:** mysql2 with Promises API
- **Connection Pooling:** Required for efficiency
- **Pool Configuration:**
  - connectionLimit: 10
  - queueLimit: 0
  - waitForConnections: true
- **Database:** wotaorgu_wotadb on hosting09.layerip.com
- **Credentials:** Loaded from WOTA_DATABASE_URL environment variable
- **Schema:** Use existing summits table (no modifications)

### API Response Format

- **Content-Type:** application/json
- **Format:** RFC 7946 GeoJSON FeatureCollection
- **Error Responses:** JSON with { error: "message" } structure
- **HTTP Status Codes:**
  - 200: Success
  - 400: Bad request (invalid parameters)
  - 500: Server error (database failure)

### Frontend Integration

- **Data Source Change:** Replace static `data/summits.json` URL with `/api/summits` (or full path in production)
- **AJAX Library:** Use existing jQuery.ajax() for consistency
- **Loading State:** Disable map interactions during fetch, show spinner overlay
- **Error Display:** Bootstrap alert component for error messages
- **Map Update Strategy:** Replace vector source data, preserve map view (center/zoom)

### Filter UI Design

- **Component:** Bootstrap 3 Collapse component
- **Trigger:** Existing filter button (`#filter`)
- **Panel Placement:** Absolute positioned div, top-right below control buttons
- **Panel Width:** 280px
- **Panel Styling:** Consistent with header (semi-transparent background)
- **Controls:**
  - Radio buttons: "All summits" (default) | "Only activated" | "Only unactivated"
  - Close button (×) to collapse panel
- **Behavior:** Toggle visibility on filter button click, close on selection or close button

## Approach Options

### Option A: Separate Backend Repository

- **Pros:** Clean separation of concerns, independent deployment
- **Cons:** More complex setup, two repositories to manage, separate package.json

### Option B: Backend in Same Repository (Selected)

- **Pros:** Single repository, easier development workflow, shared .gitignore
- **Cons:** Mixed frontend/backend code in one repo

**Rationale:** Since this is a small API server (single endpoint initially) and the frontend is a simple static site, keeping them together simplifies development and deployment. The backend can live in a `/server` directory with its own package.json.

### Option C: Serverless Function (AWS Lambda, Vercel)

- **Pros:** Auto-scaling, no server management
- **Cons:** Cold start latency, vendor lock-in, requires migration from self-hosted

**Rationale:** Current self-hosted infrastructure at m5tea.uk with nginx already in place makes a traditional Node.js server the most straightforward option.

## Technical Approach

### Backend Structure

```
/server
  /node_modules (gitignored)
  server.js          # Express app entry point
  /routes
    summits.js       # GET /api/summits route handler
  /db
    connection.js    # MySQL connection pool setup
    queries.js       # SQL query functions
  package.json
  .env              # Database credentials (gitignored)
```

### Database Query Strategy

**Base Query:**
```sql
SELECT
  s.wotaid,
  s.sotaid,
  s.book,
  s.name,
  s.height,
  s.reference AS gridRef,
  s.last_act_by,
  s.last_act_date,
  s.humpid,
  s.gridid
FROM summits s
```

**With Activation Filter:**
```sql
-- activated=true
WHERE s.last_act_date IS NOT NULL

-- activated=false
WHERE s.last_act_date IS NULL
```

**Data Transformation:**
- Query returns rows from summits table
- Backend transforms to GeoJSON by:
  1. Loading existing data/summits.json for coordinates (or store in DB later)
  2. Merging activation data from database query
  3. Building GeoJSON FeatureCollection structure

**Alternative:** If coordinates are not in database, read static GeoJSON file server-side, merge with database query results based on wotaid matching.

### Frontend Data Flow

1. **Page Load:** Fetch /api/summits (no filters)
2. **User opens filter panel:** Panel slides down
3. **User selects filter:**
   - jQuery triggers change event
   - Build query string (?activated=true/false)
   - Show loading overlay
   - jQuery.ajax() to /api/summits?activated=X
4. **Response received:**
   - Hide loading overlay
   - Update vector source: `summits.getSource().clear()` + `addFeatures()`
   - Close filter panel (optional)
5. **Error:**
   - Hide loading overlay
   - Show Bootstrap alert with error message
   - Keep previous data visible

### Loading Indicator Design

**Overlay:** Semi-transparent div covering map with centered spinner

```html
<div id="loading-overlay" style="display: none;">
  <i class="fa fa-spinner fa-spin fa-3x"></i>
</div>
```

**CSS:** Absolute position, z-index above map, flex centering

**Show/Hide:** jQuery show()/hide() before/after AJAX

## External Dependencies

### Backend Dependencies

- **express:** ^5.0.0 - Web framework
- **mysql2:** ^3.6.0 - MySQL driver with promise support
- **dotenv:** ^16.3.0 - Environment variable management
- **cors:** ^2.8.5 - CORS middleware for development

**Justification:**
- Express is the standard Node.js web framework, minimal and well-documented
- mysql2 provides promise-based API and better performance than original mysql package
- dotenv is standard for environment configuration
- cors simplifies development CORS handling (nginx handles production)

### Frontend Dependencies

**None required** - Using existing jQuery, Bootstrap, OpenLayers

## Performance Considerations

- **Connection Pooling:** Reuse database connections across requests
- **Query Optimization:** Use indexes on wotaid, last_act_date columns (verify existing indexes)
- **Response Size:** GeoJSON with 214 summits is ~50-100KB, acceptable for map application
- **Caching:** Consider HTTP caching headers for unfiltered responses (Cache-Control: max-age=300)
- **CDN:** Not needed for initial version, database queries are fast (<100ms expected)

## Security Considerations

- **SQL Injection:** Use parameterized queries (mysql2 prepared statements)
- **Environment Variables:** Never commit .env file, use .env.example template
- **CORS:** Restrict to known origins in production (nginx configuration)
- **Input Validation:** Validate query parameters (activated must be "true" or "false")
- **Error Messages:** Don't expose database details in production errors
- **Rate Limiting:** Not implemented initially (nginx can add if needed)

## Deployment Configuration

### Development

- **Frontend:** Open index.html directly or use `python -m http.server 8080`
- **Backend:** `cd server && node server.js` (runs on :3003)
- **Database:** Connect to remote MySQL (hosting09.layerip.com)

### Production (m5tea.uk)

- **Frontend:** nginx serves static files from /var/www/mapping/
- **Backend:** PM2 or systemd service running Node.js on :3003
- **nginx config:**
  ```nginx
  location /mapping/ {
    root /var/www;
    try_files $uri $uri/ /mapping/index.html;
  }

  location /mapping/api/ {
    proxy_pass http://localhost:3003/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  ```

### Environment Variables

**.env file:**
```
WOTA_DATABASE_URL=mysql://user:pass@hosting09.layerip.com/wotaorgu_wotadb
PORT=3003
NODE_ENV=production
```

Copy from /Users/msw/code/wota-data/.env for database credentials.
