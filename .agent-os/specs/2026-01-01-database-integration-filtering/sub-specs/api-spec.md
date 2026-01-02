# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2026-01-01-database-integration-filtering/spec.md

> Created: 2026-01-01
> Version: 1.0.0

## Base URL

- **Development:** `http://localhost:3003/api`
- **Production:** `https://m5tea.uk/mapping/api`

## Endpoints

### GET /api/summits

**Purpose:** Retrieve WOTA summit data as GeoJSON with optional activation filtering

**Parameters:**

| Parameter | Type | Required | Description | Valid Values |
|-----------|------|----------|-------------|--------------|
| activated | string | No | Filter by activation status | `"true"`, `"false"` |

**Request Examples:**

```
GET /api/summits
GET /api/summits?activated=true
GET /api/summits?activated=false
```

**Response Format:** GeoJSON FeatureCollection (RFC 7946)

**Response Schema:**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "wotaId": "LDO-001",
        "sotaId": "",
        "title": "Walna Scar",
        "height": 621,
        "gridRef": "SD257963",
        "humpId": "",
        "qthLocator": "IO84KI",
        "book": "The Outlying Fells",
        "bookId": "OF",
        "icon": "triangle",
        "marker-color": "#dab54f",
        "marker-size": "small",
        "last_act_by": "G3ABC",
        "last_act_date": "2025-12-15",
        "hillBaggingId": "12345"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-3.1437957286834717, 54.357294004998856]
      }
    }
  ]
}
```

**Property Descriptions:**

- **wotaId** (string): WOTA summit reference (e.g., "LDO-001")
- **sotaId** (string): SOTA reference if applicable, empty string if none
- **title** (string): Summit name
- **height** (number): Summit height in meters
- **gridRef** (string): UK Ordnance Survey grid reference
- **humpId** (string): Hump database ID, empty string if none
- **qthLocator** (string): Maidenhead locator
- **book** (string): Wainwright book title
- **bookId** (string): Book abbreviation (OF, EF, NW, etc.)
- **icon** (string): Marker icon type (always "triangle")
- **marker-color** (string): Hex color code for marker
- **marker-size** (string): Marker size (always "small")
- **last_act_by** (string): Callsign of last activator, null if never activated
- **last_act_date** (string): ISO date of last activation (YYYY-MM-DD), null if never activated
- **hillBaggingId** (string): HillBagging.co.uk database ID for Hump cross-reference

**Success Response:**

- **Status Code:** 200 OK
- **Content-Type:** application/json
- **Body:** GeoJSON FeatureCollection as shown above

**Error Responses:**

**400 Bad Request** - Invalid parameter value

```json
{
  "error": "Invalid 'activated' parameter. Must be 'true' or 'false'."
}
```

**500 Internal Server Error** - Database connection failure

```json
{
  "error": "Database connection failed. Please try again later."
}
```

**500 Internal Server Error** - Query execution failure

```json
{
  "error": "Failed to retrieve summit data. Please try again later."
}
```

## Controllers

### summits.js Route Handler

**File:** `/server/routes/summits.js`

**Responsibilities:**
- Parse and validate query parameters
- Call database query functions
- Load static GeoJSON for coordinates
- Merge database activation data with GeoJSON
- Format response as GeoJSON FeatureCollection
- Handle errors and return appropriate status codes

**Business Logic:**

1. **Parameter Validation:**
   - If `activated` parameter exists, validate it's "true" or "false"
   - Return 400 error for invalid values

2. **Database Query:**
   - If `activated=true`: Query summits where `last_act_date IS NOT NULL`
   - If `activated=false`: Query summits where `last_act_date IS NULL`
   - If no filter: Query all summits

3. **Data Merging:**
   - Read existing `/data/summits.json` file
   - Create lookup map of database results by wotaid
   - Iterate through GeoJSON features:
     - If summit found in database results, merge activation data
     - If not found (shouldn't happen), skip or use null values
   - Filter features based on activation status if needed

4. **Response:**
   - Return merged GeoJSON FeatureCollection
   - Set Content-Type: application/json
   - Include proper CORS headers (development)

**Error Handling:**
- Catch database connection errors → 500 response
- Catch query execution errors → 500 response
- Catch file read errors (summits.json) → 500 response
- Catch JSON parse errors → 500 response
- Log errors to console for debugging

## Database Queries

### Query: All Summits

```sql
SELECT
  wotaid,
  sotaid,
  book,
  name AS title,
  height,
  reference AS gridRef,
  humpid,
  gridid,
  last_act_by,
  last_act_date
FROM summits
ORDER BY wotaid
```

### Query: Only Activated Summits

```sql
SELECT
  wotaid,
  sotaid,
  book,
  name AS title,
  height,
  reference AS gridRef,
  humpid,
  gridid,
  last_act_by,
  last_act_date
FROM summits
WHERE last_act_date IS NOT NULL
ORDER BY wotaid
```

### Query: Only Unactivated Summits

```sql
SELECT
  wotaid,
  sotaid,
  book,
  name AS title,
  height,
  reference AS gridRef,
  humpid,
  gridid,
  last_act_by,
  last_act_date
FROM summits
WHERE last_act_date IS NULL
ORDER BY wotaid
```

## Data Transformation

### Database Row to GeoJSON Feature

**Input (database row):**
```javascript
{
  wotaid: 1,
  sotaid: null,
  book: 'OF',
  title: 'Walna Scar',
  height: 621,
  gridRef: 'SD257963',
  humpid: null,
  gridid: 'SD2596',
  last_act_by: 'G3ABC',
  last_act_date: '2025-12-15'
}
```

**Lookup from static GeoJSON:**
```javascript
{
  wotaId: "LDO-001",
  coordinates: [-3.1437957286834717, 54.357294004998856],
  qthLocator: "IO84KI",
  book: "The Outlying Fells",
  bookId: "OF",
  "marker-color": "#dab54f"
}
```

**Output (merged feature):**
```javascript
{
  type: "Feature",
  properties: {
    wotaId: "LDO-001",
    sotaId: "",
    title: "Walna Scar",
    height: 621,
    gridRef: "SD257963",
    humpId: "",
    qthLocator: "IO84KI",
    book: "The Outlying Fells",
    bookId: "OF",
    icon: "triangle",
    "marker-color": "#dab54f",
    "marker-size": "small",
    last_act_by: "G3ABC",
    last_act_date: "2025-12-15"
  },
  geometry: {
    type: "Point",
    coordinates: [-3.1437957286834717, 54.357294004998856]
  }
}
```

### WOTA ID Mapping

The database uses numeric `wotaid` but GeoJSON uses formatted strings like "LDO-001".

**Mapping Logic:**
- Database `wotaid=1, book='OF'` → GeoJSON `wotaId="LDO-001"`
- The static GeoJSON already has correct wotaId values
- Merge by parsing wotaId suffix to match database wotaid
- Alternative: Add wotaId column to database (future enhancement)

**For now:** Merge based on book + sequence number matching

## CORS Configuration

### Development

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'file://'],
  methods: ['GET'],
  credentials: false
}));
```

### Production

CORS handled by nginx, no CORS middleware needed in Express:

```nginx
add_header Access-Control-Allow-Origin https://m5tea.uk;
add_header Access-Control-Allow-Methods GET;
```

## Caching Strategy

### Initial Version (No Caching)

- Every request queries database
- Simple, always up-to-date
- Acceptable performance for <1000 summits

### Future Enhancement

**Cache-Control Headers:**
```javascript
res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
```

Only cache unfiltered responses, always fetch fresh for filters.

## Rate Limiting

**Not implemented initially.** If needed later, use nginx rate limiting:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

## Health Check Endpoint

### GET /api/health

**Purpose:** Verify API server and database connectivity

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

**Use Case:** nginx health checks, monitoring, deployment verification
