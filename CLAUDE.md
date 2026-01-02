# CLAUDE.md

> Project-specific instructions for Claude Code working on WOTA Mapping

## Agent OS Documentation

### Product Context
- **Mission & Vision:** @.agent-os/product/mission.md
- **Technical Architecture:** @.agent-os/product/tech-stack.md
- **Development Roadmap:** @.agent-os/product/roadmap.md
- **Decision History:** @.agent-os/product/decisions.md

### Development Standards
- **Code Style:** @~/.agent-os/standards/code-style.md
- **Best Practices:** @~/.agent-os/standards/best-practices.md

### Project Management
- **Active Specs:** @.agent-os/specs/
- **Spec Planning:** Use `@~/.agent-os/instructions/create-spec.md`
- **Task Execution:** Use `@~/.agent-os/instructions/execute-tasks.md`

## Workflow Instructions

When asked to work on this codebase:

1. **First**, check @.agent-os/product/roadmap.md for current priorities
2. **Then**, follow the appropriate instruction file:
   - For new features: @~/.agent-os/instructions/create-spec.md
   - For task execution: @~/.agent-os/instructions/execute-tasks.md
3. **Always**, adhere to the standards in the files listed above

## Important Notes

- Product-specific files in `.agent-os/product/` override any global standards
- User's specific instructions override (or amend) instructions found in `.agent-os/specs/...`
- Always adhere to established patterns, code style, and best practices documented above

## Project-Specific Conventions

### WOTA-Specific Terminology
- **WOTA:** Wainwrights on the Air (amateur radio program)
- **Summit:** A Wainwright peak eligible for activation
- **Activation:** Operating amateur radio from a summit
- **Spot:** Real-time report of an activation in progress
- **Alert:** Advance notice of a planned activation
- **Chaser:** Operator making contact with an activator
- **Book:** Reference to one of Wainwright's seven guidebooks

### Code Conventions
- Summit IDs use format: `BOOK-NNN` (e.g., `LDO-001`, `EF-042`)
- SOTA references use format: `G/LD-NNN` (e.g., `G/LD-030`)
- Grid references are 6-character UK Ordnance Survey format (e.g., `SD257963`)
- QTH locators use Maidenhead format (e.g., `IO84KI`)
- Callsigns follow UK amateur radio format (e.g., `M0ABC`, `G4XYZ`)

### Database Access
- Database credentials are stored in `/Users/msw/code/wota-data/.env`
- Never commit database credentials to git
- Use environment variables for database connection
- Database schema reference: `/Users/msw/code/wota-data/db/sql/`

### Related Projects
- **wota-data:** Database management and sync scripts at `/Users/msw/code/wota-data`
- **wota-php:** Legacy PHP implementation (reference only)
- **wota-spotter:** Separate spotting application

## Deployment

### Local Development
- Frontend: Open `index.html` in browser (file://) or use local server
- Backend: `./start-server.sh` (runs on port 3006)

### Production Deployment
- **URL:** https://m5tea.uk/wota-mapping/
- **Server:** nginx reverse proxy
- **Frontend:** Static files served from `/wota-mapping/`
- **Backend:** Proxied to `http://localhost:3006/api/`

### nginx Configuration Notes
- Frontend serves: HTML, CSS, JS, images, data files
- Backend API path: `/wota-mapping/api/*` → `http://localhost:3006/api/*`
- SSL via Let's Encrypt
