# Product Roadmap

> Last Updated: 2026-01-01
> Version: 1.0.0
> Status: Active Development

## Phase 0: Already Completed

The following features have been implemented:

- [x] **Interactive OpenLayers Map** - Renders 214+ Wainwright summits with zoom, pan, and fullscreen controls `COMPLETED`
- [x] **Color-Coded Markers** - Summit markers color-coded by Wainwright book (Eastern Fells, Far Eastern Fells, etc.) `COMPLETED`
- [x] **Summit Detail Popups** - Click summits to view WOTA ID, name, height, grid reference, QTH locator `COMPLETED`
- [x] **Cross-Program References** - Automatic SOTA and Hump ID display with external links where applicable `COMPLETED`
- [x] **Marker Size Toggle** - Switch between small and large summit markers for different zoom levels `COMPLETED`
- [x] **Text Label Toggle** - Show/hide summit WOTA IDs as text labels on the map `COMPLETED`
- [x] **PNG Export** - Export current map view as high-resolution PNG image `COMPLETED`
- [x] **PDF Export** - Generate A4 landscape PDF maps for offline use `COMPLETED`
- [x] **Scale Control** - Toggle between metric and imperial scale display `COMPLETED`
- [x] **Responsive UI Controls** - Bootstrap-based control buttons with Font Awesome icons `COMPLETED`

## Phase 1: Database Integration & Basic Filtering

**Goal:** Connect the mapping application to the WOTA MySQL database and implement basic activation filtering

**Success Criteria:** Users can filter summits by activation status and see last activation details

### Must-Have Features

- [ ] **Node.js/Express API Server** - Create backend API with database connection to wotaorgu_wotadb `L`
- [ ] **Database Connection Pool** - Implement mysql2 connection pooling for efficient queries `S`
- [ ] **GET /api/summits Endpoint** - Return all summits with activation status from database `M`
- [ ] **Activation Status Filter** - Filter summits showing only activated or unactivated summits `M`
- [ ] **Last Activation Display** - Show last activating callsign and date in summit popups `S`
- [ ] **Filter UI Panel** - Create collapsible filter panel with activation status checkbox `M`
- [ ] **Dynamic Data Reload** - Update map markers when filters change without full page reload `M`

### Should-Have Features

- [ ] **Loading Indicators** - Show loading state when fetching filtered data from API `XS`
- [ ] **Error Handling** - Display user-friendly errors if API requests fail `S`
- [ ] **Environment Configuration** - Load database credentials from .env file `XS`

### Dependencies

- Node.js backend must be complete before frontend integration
- nginx reverse proxy configuration required for /mapping/api/ path
- Database connection credentials from wota-data project

## Phase 2: Advanced Filtering (Match sotl.as Capabilities)

**Goal:** Implement comprehensive filtering options matching the SOTA sotl.as platform

**Success Criteria:** Users can filter by date ranges, operators, frequency/mode, and multiple criteria simultaneously

### Must-Have Features

- [ ] **Date Range Filter** - Filter summits activated within a specific date range `M`
- [ ] **Operator/Callsign Filter** - Show summits activated by specific operator callsign `M`
- [ ] **Frequency/Mode Filter** - Filter by activation frequency band and mode (HF/VHF, SSB/CW/FM) `L`
- [ ] **Multi-Criteria Filtering** - Combine multiple filters simultaneously (AND logic) `M`
- [ ] **Filter Result Count** - Display count of matching summits `XS`
- [ ] **Clear Filters Button** - Reset all filters to default state `XS`

### Should-Have Features

- [ ] **Date Picker UI** - Calendar widget for date range selection `S`
- [ ] **Callsign Autocomplete** - Suggest callsigns as user types based on database `M`
- [ ] **Filter Presets** - Save and load common filter combinations `L`
- [ ] **URL State Persistence** - Save filter state in URL for sharing links `M`

### Dependencies

- Phase 1 API infrastructure must be complete
- Additional database queries for frequency/mode data

## Phase 3: Real-Time Activity Integration

**Goal:** Integrate live spot and alert data to show current and planned activations

**Success Criteria:** Users can see current activations and upcoming alerts on the map

### Must-Have Features

- [ ] **GET /api/spots Endpoint** - Fetch recent spots from database `M`
- [ ] **GET /api/alerts Endpoint** - Fetch upcoming alerts from database `M`
- [ ] **Active Summit Highlighting** - Visual indicator for summits with current spots `S`
- [ ] **Alert Summit Markers** - Different marker style for summits with posted alerts `S`
- [ ] **Spot Details in Popup** - Show recent spot information in summit popup `M`
- [ ] **Alert Details in Popup** - Display alert details (time, frequency, callsign) in popup `M`
- [ ] **Time-Based Filtering** - Show only spots/alerts within last X hours/days `M`

### Should-Have Features

- [ ] **Auto-Refresh** - Periodically refresh spot/alert data without user action `M`
- [ ] **Spot Notifications** - Browser notifications for new spots on favorite summits `L`
- [ ] **Live Spot Feed** - Sidebar showing recent spots in chronological order `M`

### Dependencies

- Requires spots and alerts table queries
- May need WebSocket for real-time updates

## Phase 4: Enhanced Visualization & Analytics

**Goal:** Provide advanced visualization features and activation statistics

**Success Criteria:** Users can analyze activation patterns and visualize routes

### Must-Have Features

- [ ] **Activation Heatmap** - Color-code summits by activation frequency (hot/cold) `L`
- [ ] **Route Planning Mode** - Draw lines between summits to plan routes `XL`
- [ ] **Elevation Profile** - Show elevation profile for selected route `L`
- [ ] **Activation Statistics** - Display total activations, unique operators, last 30 days activity `M`
- [ ] **Summit Comparison** - Compare activation history of multiple summits side-by-side `L`

### Should-Have Features

- [ ] **Distance Calculation** - Calculate walking distance between selected summits `M`
- [ ] **Activation Calendar** - Calendar view showing activation density over time `L`
- [ ] **Operator Leaderboard** - Show most active operators and chasers `M`

### Dependencies

- Requires complex database aggregations
- May need additional data processing on backend

## Phase 5: Mobile Optimization & Offline Features

**Goal:** Optimize for mobile devices and enhance offline capabilities

**Success Criteria:** Application works smoothly on mobile devices and provides offline functionality

### Must-Have Features

- [ ] **Responsive Mobile Layout** - Optimize UI for smartphone screens `L`
- [ ] **Touch Gesture Support** - Pinch-to-zoom, swipe navigation on touch devices `M`
- [ ] **Progressive Web App** - Convert to PWA with service worker for offline use `XL`
- [ ] **Offline Map Caching** - Cache map tiles for offline viewing `L`
- [ ] **Offline Summit Data** - Cache summit data locally for offline access `M`

### Should-Have Features

- [ ] **GPS Location** - Show user's current location on map (mobile) `M`
- [ ] **Nearby Summits** - List summits within X km of current location `S`
- [ ] **Mobile App** - Native iOS/Android app using React Native or similar `XL`

### Dependencies

- Service worker implementation
- Local storage management
- Geolocation API integration

## Effort Scale

- **XS:** 1 day
- **S:** 2-3 days
- **M:** 1 week
- **L:** 2 weeks
- **XL:** 3+ weeks

## Current Focus

**Active Phase:** Phase 1 - Database Integration & Basic Filtering

**Next Milestone:** Complete Node.js API server and implement activation status filtering
