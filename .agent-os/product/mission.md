# Product Mission

> Last Updated: 2026-01-01
> Version: 1.0.0

## Pitch

WOTA Mapping is an interactive visualization tool that helps Wainwrights on the Air (WOTA) participants discover summits, plan activations, and track community activity by providing a rich map interface with real-time activation data and comprehensive filtering capabilities.

## Users

### Primary Customers

- **WOTA Activators**: Ham radio operators who climb and activate Wainwright summits for the WOTA program
- **WOTA Chasers**: Operators who make contacts with activators from their home stations
- **Trip Planners**: Activators planning multi-summit expeditions in the Lake District

### User Personas

**Active Operator** (35-65 years old)
- **Role:** Amateur radio operator and hill walker
- **Context:** Plans regular WOTA activations in the Lake District
- **Pain Points:**
  - Difficult to visualize summit locations relative to each other
  - Hard to identify which summits have been activated recently
  - No easy way to cross-reference WOTA summits with SOTA and other programs
  - Planning multi-summit routes requires multiple tools
- **Goals:**
  - Efficiently plan activation trips
  - Identify unactivated or rarely-activated summits
  - Find summits that qualify for multiple programs (WOTA/SOTA/Hump)

**Chaser** (30-70 years old)
- **Role:** Amateur radio operator monitoring for WOTA contacts
- **Context:** Operates from home station, monitors for WOTA activations
- **Pain Points:**
  - Difficult to understand geographic distribution of summits
  - Hard to track which areas are active
  - Limited visibility of summit characteristics before making contact
- **Goals:**
  - Visualize where activations are happening
  - Understand summit details (height, grid reference, locator)
  - Plan chasing strategy based on activation patterns

## The Problem

### Scattered Summit Information

WOTA participants currently rely on text-based summit lists and separate mapping tools to understand the geographic layout of Wainwright summits. This makes trip planning time-consuming and inefficient.

**Our Solution:** Integrated interactive map with all 214+ Wainwright summits, color-coded by book, with instant access to summit details and cross-references.

### No Activation History Visibility

Without historical activation data integrated into mapping tools, operators cannot easily identify which summits need activating or which areas have recent activity.

**Our Solution:** Database-backed filtering system showing activation status, dates, and operator details directly on the map interface.

### Lack of Cross-Program Integration

Many summits qualify for multiple programs (WOTA, SOTA, Hump), but there's no single view showing these relationships.

**Our Solution:** Summit popups display all program qualifications with direct links to SOTA and Hump databases.

### Limited Route Planning Tools

Activators planning multi-summit trips need to visualize distances, elevations, and geographic relationships between summits.

**Our Solution:** Interactive map with zoom, pan, and export capabilities enabling visual route planning and PDF generation for offline use.

## Differentiators

### Community-Focused Enhancement

Unlike the official WOTA site, we provide an enhanced mapping experience hosted at m5tea.uk/wota-mapping specifically designed for advanced users who need filtering and visualization capabilities similar to the popular sotl.as platform used by SOTA participants.

### Cross-Program Integration

We uniquely integrate WOTA summit data with SOTA and Hump references, allowing operators participating in multiple programs to see all qualifications at a glance without switching between different databases.

### Offline Capability

Export features (PNG/PDF) enable operators to prepare offline maps for use in remote Lake District locations where internet access is unavailable, a critical need for hill-walking activators.

## Key Features

### Core Features

- **Interactive OpenLayers Map:** High-performance map rendering with 214+ Wainwright summits marked and color-coded by book (The Eastern Fells, The Far Eastern Fells, etc.)
- **Summit Detail Popups:** Click any summit to view WOTA ID, name, height, grid reference, QTH locator, and links to WOTA database
- **Cross-Program References:** Automatic display of SOTA and Hump IDs where applicable, with direct links to external databases
- **Visual Customization:** Toggle between marker sizes and text labels for optimal viewing at different zoom levels

### Collaboration Features

- **Activation Filtering:** Filter summits by activation status (activated/unactivated), date ranges, operator callsigns, and frequency/mode
- **Real-Time Spots Integration:** Display current and recent activation spots from the WOTA database
- **Alerts Visibility:** Show planned activations from operators who have posted alerts

### Export Features

- **PNG Export:** Save current map view as high-resolution PNG image
- **PDF Export:** Generate A4 landscape PDF maps for printing and offline use
- **Scale Control:** Toggle between metric and imperial scale displays

### Data Integration

- **Database-Backed:** Live connection to WOTA MySQL database for activation history and spot data
- **GeoJSON Summit Data:** Structured geographic data for all Wainwright summits with properties
- **API Layer:** Node.js/Express backend providing filtered summit data and activation queries
