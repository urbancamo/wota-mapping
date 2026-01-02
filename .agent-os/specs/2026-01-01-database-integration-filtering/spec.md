# Spec Requirements Document

> Spec: Database Integration & Activation Filtering
> Created: 2026-01-01
> Status: Planning

## Overview

Implement backend API with MySQL database integration to enable filtering of WOTA summits by activation status, replacing the static GeoJSON data source with dynamic database-backed queries.

## User Stories

### Summit Activation Discovery

As a WOTA activator planning a trip, I want to filter the map to show only summits that have never been activated or haven't been activated recently, so that I can prioritize summits that need activating and maximize the value of my activation trip.

When I click the filter button, a collapsible panel appears with filter options. I can check "Show only unactivated summits" and the map dynamically updates to show only summits with no activation history. I can see the count of matching summits and easily toggle filters on/off to plan my route.

### Activation History Visibility

As a WOTA chaser monitoring for contacts, I want to see which summits have recent activation activity and who activated them, so that I can understand activation patterns and identify summits that are popular or rarely activated.

When I click on any summit marker, the popup now shows "Last activated by G3ABC on 2025-12-15" (or "Never activated" if no history exists). This helps me understand the activation history at a glance without leaving the map interface.

### Dynamic Data Updates

As any WOTA participant using the mapping tool, I want the map data to refresh from the live database when I apply filters, so that I always see current activation information without manually reloading the page.

When I toggle any filter option, the map smoothly updates with a loading indicator, fetches fresh data from the API, and re-renders the summit markers. The map view stays centered on my current area of interest.

## Spec Scope

1. **Node.js/Express API Server** - Create backend server on port 3003 with Express framework and mysql2 database driver
2. **Database Connection Pooling** - Implement connection pool to wotaorgu_wotadb MySQL database using credentials from environment variables
3. **GET /api/summits Endpoint** - API endpoint returning GeoJSON FeatureCollection with all summit data enhanced with activation status from database
4. **Activation Status Filter** - Query parameter support for filtering by activation status (activated=true/false)
5. **Last Activation Data** - Include last_act_by and last_act_date fields in summit properties from database
6. **Collapsible Filter UI Panel** - Bootstrap collapsible panel triggered by existing filter button with activation status checkbox
7. **Dynamic Map Data Reload** - Frontend code to fetch filtered data from API and update OpenLayers vector source without page reload
8. **Loading Indicators** - Visual feedback during API requests (loading spinner or progress indicator)
9. **Error Handling** - User-friendly error messages if API requests fail or database is unavailable

## Out of Scope

- Date range filtering (Phase 2)
- Operator/callsign filtering (Phase 2)
- Frequency/mode filtering (Phase 2)
- Spots and alerts integration (Phase 3)
- Filter presets or saved filters (Phase 2)
- URL state persistence (Phase 2)
- Authentication or rate limiting
- Database schema modifications (using existing schema)

## Expected Deliverable

1. **Backend API running on localhost:3003** with /api/summits endpoint returning valid GeoJSON with activation data from MySQL database
2. **Filter panel visible on map** that opens/closes smoothly when clicking the existing filter button
3. **Activation filter functional** - checking "Show only activated" or "Show only unactivated" updates the map dynamically
4. **Summit popups enhanced** - showing "Last activated by CALLSIGN on DATE" or "Never activated"
5. **Loading states working** - visual indicator appears during data fetches
6. **Error handling tested** - graceful error messages if API is down or returns errors
7. **All existing features intact** - PNG/PDF export, marker toggle, label toggle, scale control all still work

## Spec Documentation

- **Tasks:** @.agent-os/specs/2026-01-01-database-integration-filtering/tasks.md
- **Technical Specification:** @.agent-os/specs/2026-01-01-database-integration-filtering/sub-specs/technical-spec.md
- **API Specification:** @.agent-os/specs/2026-01-01-database-integration-filtering/sub-specs/api-spec.md
- **Tests Specification:** @.agent-os/specs/2026-01-01-database-integration-filtering/sub-specs/tests.md
