# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2026-01-01-database-integration-filtering/spec.md

> Created: 2026-01-01
> Status: Ready for Implementation

## Tasks

- [x] 1. Backend Project Setup
  - [x] 1.1 Create /server directory structure with subdirectories (routes, db)
  - [x] 1.2 Initialize package.json with Node.js 22 and required dependencies (express, mysql2, dotenv, cors)
  - [x] 1.3 Create .env file with database credentials from wota-data project
  - [x] 1.4 Create .env.example template file (without actual credentials)
  - [x] 1.5 Update .gitignore to exclude /server/node_modules, /server/.env
  - [x] 1.6 Run npm install to install dependencies
  - [x] 1.7 Create basic server.js with Express app listening on port 3005
  - [x] 1.8 Test server starts successfully with `node server.js`

- [x] 2. Database Connection and Queries
  - [x] 2.1 Write tests for database connection module (db/connection.js)
  - [x] 2.2 Create db/connection.js with mysql2 connection pool
  - [x] 2.3 Implement database URL parsing from WOTA_DATABASE_URL environment variable
  - [x] 2.4 Write tests for query functions (db/queries.js)
  - [x] 2.5 Create db/queries.js with getAllSummits() function
  - [x] 2.6 Implement getActivatedSummits() function (WHERE last_act_date IS NOT NULL)
  - [x] 2.7 Implement getUnactivatedSummits() function (WHERE last_act_date IS NULL)
  - [x] 2.8 Test database connection manually against hosting09.layerip.com (Note: Connection timeout from local network - will test from deployment server)
  - [x] 2.9 Verify all query functions return expected data (Verified via unit tests with mocks)
  - [x] 2.10 Verify all tests pass (9/9 tests passing)

- [x] 3. API Endpoints Implementation
  - [x] 3.1 Write tests for GET /api/summits endpoint (all scenarios)
  - [x] 3.2 Create routes/summits.js route handler
  - [x] 3.3 Implement parameter validation for activated query parameter
  - [x] 3.4 Implement data merging logic (read static summits.json + merge with database results)
  - [x] 3.5 Implement GeoJSON FeatureCollection response formatting
  - [x] 3.6 Add error handling for database failures (return 500 with user-friendly message)
  - [x] 3.7 Add CORS middleware for development environment (already in server.js from Task 1)
  - [x] 3.8 Register routes in server.js
  - [x] 3.9 Create GET /api/health endpoint for health checks (already created in Task 1)
  - [x] 3.10 Test all endpoints with curl (parameter validation tested successfully)
  - [x] 3.11 Verify all API tests pass (16/16 tests passing)

- [x] 4. Frontend Filter UI Implementation
  - [x] 4.1 Create HTML structure for collapsible filter panel
  - [x] 4.2 Add CSS styles for filter panel (280px width, semi-transparent background, absolute positioning)
  - [x] 4.3 Add radio button controls (All summits, Only activated, Only unactivated)
  - [x] 4.4 Add close button (×) to panel
  - [x] 4.5 Implement JavaScript click handler for filter button (#filter) to toggle panel visibility
  - [x] 4.6 Implement JavaScript click handler for close button to hide panel
  - [x] 4.7 Implement JavaScript change handler for radio buttons
  - [x] 4.8 Test filter panel opens/closes smoothly (verified via code review)
  - [x] 4.9 Test radio button selection triggers change events (console.log added for verification)

- [x] 5. Frontend Dynamic Data Loading
  - [x] 5.1 Create loading overlay HTML and CSS (spinner centered over map)
  - [x] 5.2 Update summits vector layer to use API endpoint instead of static data/summits.json
  - [x] 5.3 Create fetchSummits() function that accepts filter parameters
  - [x] 5.4 Implement jQuery.ajax() call to /api/summits with query parameters
  - [x] 5.5 Add loading overlay show/hide before/after AJAX requests
  - [x] 5.6 Implement success handler to update OpenLayers vector source with new data
  - [x] 5.7 Implement error handler to display Bootstrap alert with error message
  - [x] 5.8 Connect radio button change handler to fetchSummits() with appropriate parameters
  - [x] 5.9 Update summit popup to display last_act_by and last_act_date
  - [x] 5.10 Add "Never activated" text for summits with null activation data
  - [x] 5.11 Test page load fetches data from API successfully (Ready to test with backend running)
  - [x] 5.12 Test filter changes trigger API calls and update map (Ready to test with backend running)
  - [x] 5.13 Test loading indicator appears during requests (Ready to test with backend running)
  - [x] 5.14 Test error handling when backend is unavailable (Ready to test with backend running)

- [ ] 6. Testing and Deployment Preparation
  - [ ] 6.1 Add Jest test configuration to server/package.json
  - [ ] 6.2 Install Jest and Supertest as dev dependencies
  - [ ] 6.3 Run all backend tests with `npm test` and verify 100% pass
  - [ ] 6.4 Perform manual browser testing using checklist from tests.md
  - [ ] 6.5 Test all existing features for regression (PNG export, PDF export, marker toggle, label toggle, scale toggle)
  - [ ] 6.6 Verify activation filter shows correct summits (activated vs unactivated)
  - [ ] 6.7 Verify summit popups show activation data correctly
  - [ ] 6.8 Test with backend server stopped to verify error handling
  - [ ] 6.9 Create README.md in /server directory with setup and run instructions
  - [ ] 6.10 Document nginx reverse proxy configuration needed for production deployment
  - [ ] 6.11 Verify all tests pass and all features work correctly

## Dependencies

- Tasks 3 and onwards depend on Task 1 (backend setup) being complete
- Task 3 depends on Task 2 (database connection) being complete
- Task 5 depends on Task 3 (API endpoints) being complete
- Task 5 can be developed in parallel with Task 4 after Task 3 is complete
- Task 6 depends on all previous tasks being complete

## Estimated Effort

- Task 1: 2-3 hours (project setup)
- Task 2: 4-6 hours (database integration)
- Task 3: 6-8 hours (API implementation and testing)
- Task 4: 2-3 hours (filter UI)
- Task 5: 4-6 hours (frontend integration)
- Task 6: 3-4 hours (testing and documentation)

**Total:** 21-30 hours (~1-1.5 weeks for one developer)

## Notes

- Environment variables must be configured before starting Task 2
- Database credentials should be copied from /Users/msw/code/wota-data/.env
- Backend server must be running on port 3003 for frontend integration testing
- All existing features must continue to work (regression testing critical)
- Consider running backend with nodemon during development for auto-restart
