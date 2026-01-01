# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2026-01-01-database-integration-filtering/spec.md

> Created: 2026-01-01
> Version: 1.0.0

## Test Coverage

### Backend Unit Tests

#### Database Connection Module (`db/connection.js`)

- **Test:** Connection pool created successfully
  - Assert pool object exists
  - Assert pool has expected configuration

- **Test:** Database URL parsed correctly from environment variable
  - Mock process.env.WOTA_DATABASE_URL
  - Assert host, database, user, password extracted correctly

- **Test:** Connection pool can execute queries
  - Execute simple `SELECT 1` query
  - Assert query returns expected result

- **Test:** Connection pool handles errors gracefully
  - Mock database connection failure
  - Assert error is caught and logged

#### Database Queries Module (`db/queries.js`)

- **Test:** getAllSummits returns all summit records
  - Execute getAllSummits()
  - Assert result is array
  - Assert array length > 0
  - Assert records have expected fields (wotaid, name, last_act_by, etc.)

- **Test:** getActivatedSummits returns only activated summits
  - Execute getActivatedSummits()
  - Assert all records have non-null last_act_date

- **Test:** getUnactivatedSummits returns only unactivated summits
  - Execute getUnactivatedSummits()
  - Assert all records have null last_act_date

- **Test:** Query functions handle database errors
  - Mock database error
  - Assert error is properly thrown/rejected

### Backend Integration Tests

#### GET /api/summits Endpoint

- **Test:** Returns GeoJSON FeatureCollection for all summits
  - GET /api/summits
  - Assert status 200
  - Assert Content-Type: application/json
  - Assert response.type === "FeatureCollection"
  - Assert response.features is array with length > 0

- **Test:** Returns valid GeoJSON features with required properties
  - GET /api/summits
  - Assert each feature has type: "Feature"
  - Assert each feature has geometry.type: "Point"
  - Assert each feature has geometry.coordinates array[2]
  - Assert each feature.properties has wotaId, title, height, gridRef
  - Assert each feature.properties has last_act_by and last_act_date (or null)

- **Test:** Filter activated summits works
  - GET /api/summits?activated=true
  - Assert all returned features have non-null last_act_date

- **Test:** Filter unactivated summits works
  - GET /api/summits?activated=false
  - Assert all returned features have null last_act_date

- **Test:** Invalid activated parameter returns 400 error
  - GET /api/summits?activated=invalid
  - Assert status 400
  - Assert response contains error message

- **Test:** CORS headers present in development
  - GET /api/summits
  - Assert Access-Control-Allow-Origin header exists (if NODE_ENV=development)

#### GET /api/health Endpoint

- **Test:** Health check returns success when database connected
  - GET /api/health
  - Assert status 200
  - Assert response.status === "ok"
  - Assert response.database === "connected"

### Frontend Integration Tests

#### Data Loading

- **Test:** Map loads summit data from API on page load
  - Mock GET /api/summits to return test GeoJSON
  - Load page
  - Assert map vector source contains features
  - Assert feature count matches mock data

- **Test:** Loading indicator shown during API request
  - Mock slow API response (1 second delay)
  - Trigger data reload
  - Assert #loading-overlay is visible during request
  - Assert #loading-overlay is hidden after response

- **Test:** Error message displayed on API failure
  - Mock GET /api/summits to return 500 error
  - Trigger data reload
  - Assert error alert is displayed
  - Assert error message contains user-friendly text

#### Filter UI

- **Test:** Filter panel opens when filter button clicked
  - Click #filter button
  - Assert filter panel becomes visible
  - Assert panel has expected controls (radio buttons)

- **Test:** Filter panel closes when close button clicked
  - Open filter panel
  - Click close button
  - Assert filter panel is hidden

- **Test:** Selecting "Only activated" filter updates map
  - Mock GET /api/summits?activated=true
  - Open filter panel
  - Select "Only activated" radio button
  - Assert API called with activated=true
  - Assert map features updated with filtered data

- **Test:** Selecting "Only unactivated" filter updates map
  - Mock GET /api/summits?activated=false
  - Open filter panel
  - Select "Only unactivated" radio button
  - Assert API called with activated=false
  - Assert map features updated with filtered data

- **Test:** Selecting "All summits" resets filter
  - Apply activated filter first
  - Select "All summits" radio button
  - Assert API called without query parameters
  - Assert all summits visible on map

#### Summit Popup Enhancement

- **Test:** Popup shows last activation data for activated summit
  - Load summit data with last_act_by="G3ABC", last_act_date="2025-12-15"
  - Click summit marker
  - Assert popup contains "Last activated by G3ABC on 2025-12-15"

- **Test:** Popup shows "Never activated" for unactivated summit
  - Load summit data with last_act_by=null, last_act_date=null
  - Click summit marker
  - Assert popup contains "Never activated"

#### Existing Features Regression

- **Test:** PNG export still works after changes
  - Click export PNG button
  - Assert PNG file downloads successfully

- **Test:** PDF export still works after changes
  - Click export PDF button
  - Assert PDF file downloads successfully

- **Test:** Marker size toggle still works
  - Click marker size button
  - Assert marker scale changes

- **Test:** Text labels toggle still works
  - Click text labels button
  - Assert labels appear/disappear

- **Test:** Scale control toggle still works
  - Click scale control button
  - Assert scale units change

## Testing Framework

### Backend Testing

- **Framework:** Jest
- **Assertion Library:** Jest built-in assertions
- **HTTP Testing:** Supertest for API endpoint tests
- **Mocking:** Jest mocks for database and external dependencies

**Setup:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### Frontend Testing

- **Framework:** Manual browser testing for initial version
- **Future:** Jest with jsdom for DOM testing
- **Alternative:** Cypress or Playwright for E2E tests

**Manual Test Checklist:**
- [ ] Load page and verify API call to /api/summits
- [ ] Verify all summits appear on map
- [ ] Click filter button and verify panel opens
- [ ] Select each filter option and verify API calls
- [ ] Verify map updates with filtered data
- [ ] Click summit and verify popup shows activation data
- [ ] Test all existing features (export, toggles, etc.)
- [ ] Test error handling by stopping backend server
- [ ] Verify loading indicator appears during slow requests

## Mocking Requirements

### Backend Tests

**Mock Database Connection:**
```javascript
jest.mock('../db/connection', () => ({
  query: jest.fn()
}));
```

**Mock Environment Variables:**
```javascript
process.env.WOTA_DATABASE_URL = 'mysql://test:test@localhost/testdb';
process.env.PORT = '3003';
process.env.NODE_ENV = 'test';
```

**Mock File System (for loading summits.json):**
```javascript
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(JSON.stringify(mockGeoJSON))
}));
```

### Frontend Tests

**Mock jQuery.ajax:**
```javascript
const mockAjax = jest.spyOn($, 'ajax');
mockAjax.mockImplementation((options) => {
  const deferred = $.Deferred();
  // Return mock data
  deferred.resolve(mockGeoJSON);
  return deferred.promise();
});
```

**Mock OpenLayers Vector Source:**
```javascript
const mockSource = {
  clear: jest.fn(),
  addFeatures: jest.fn(),
  getFeatures: jest.fn().mockReturnValue([])
};
```

## Test Data

### Sample GeoJSON Response (2 summits)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "wotaId": "LDO-001",
        "title": "Walna Scar",
        "last_act_by": "G3ABC",
        "last_act_date": "2025-12-15"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-3.14, 54.36]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "wotaId": "LDO-002",
        "title": "Black Combe",
        "last_act_by": null,
        "last_act_date": null
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-3.33, 54.26]
      }
    }
  ]
}
```

## Coverage Goals

- **Backend Code Coverage:** Minimum 80%
- **API Endpoint Coverage:** 100% (all endpoints and error cases)
- **Frontend Manual Testing:** 100% (all user workflows tested)
- **Regression Testing:** All existing features verified working

## Continuous Integration

**Future Enhancement:** GitHub Actions workflow

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: cd server && npm install
      - run: cd server && npm test
```

## Database Testing Strategy

### Test Database

**Option A:** Use test database on hosting09.layerip.com (not recommended - uses production server)

**Option B:** Mock all database calls in tests (recommended for unit tests)

**Option C:** Use SQLite in-memory database for integration tests (requires schema migration)

**Selected Approach:** Option B for initial version - mock all database interactions, test queries manually against real database during development.

### Manual Database Verification

Before running tests, verify database state:

```sql
-- Check total summits
SELECT COUNT(*) FROM summits;

-- Check activated summits count
SELECT COUNT(*) FROM summits WHERE last_act_date IS NOT NULL;

-- Check unactivated summits count
SELECT COUNT(*) FROM summits WHERE last_act_date IS NULL;

-- Verify sample activation data
SELECT wotaid, name, last_act_by, last_act_date
FROM summits
WHERE last_act_date IS NOT NULL
LIMIT 5;
```
