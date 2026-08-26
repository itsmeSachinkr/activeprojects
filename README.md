# InfraPulse — Project Intelligence Dashboard

A multi-page dashboard for tracking government, PSU and private construction
projects across India — who's building what, project size, timeline, and
estimated steel/cement demand — so a TMT, MS or Cement supplier can find and
pitch the right contractors, developers and EPC firms.

## Pages

- **Dashboard (`/`)** — KPI cards (project count, total value, estimated steel
  & cement demand, contractor count), charts (top states, sector mix, owner
  type split, top contractors by value, projects-by-year timeline), and a
  "largest opportunities" list. All driven by the same filter bar as `/projects`.
- **Projects (`/projects`)** — Full sortable, filterable table of every
  project: state, sector, owner type (Government / PSU / Private / PPP),
  status, value, duration, contractor. Filter by state, sector, owner type,
  status, start-year range, duration range, minimum project value, or free-text
  search. Export the filtered list to CSV.
- **Project detail (`/projects/[id]`)** — Full project record: description,
  contractor/client, timeline, funding source, estimated steel & cement
  tonnage, plus your own pitch tracker (status: Not Contacted → Contacted →
  In Discussion → Quoted → Order Won / Not Interested, with notes).
- **Contractors (`/contractors`)** — Every contractor/EPC/developer, ranked by
  total project value, with project count, active project count, states
  covered, and combined material demand. Click through to see their projects.
- **Import Data (`/import`)** — Download a CSV template, fill it with your own
  verified project data, and upload it. Matching IDs update existing projects;
  new rows are appended.

## Sample data

The dashboard ships with **42 illustrative sample projects** across ~18
states, covering government (NHAI/state PWD/municipal), PSU (RVNL, IRCON,
Cochin Shipyard), private (real estate, industrial, data centers, warehousing,
healthcare) and PPP projects. These are demo data to show the workflow — not
scraped or verified real-time tender data. Replace/extend them via the
**Import Data** page with your own research from sources like:

- GeM (Government e-Marketplace) and state PWD/CPWD tender portals
- NIC's Project Monitoring Group (PMG) dashboard
- NHAI, state road development corporations, metro rail corporations
- RERA filings for private real estate projects
- Company investor presentations / annual reports for private capex plans

## Data model

Each project record (`data/projects.json`) includes: name, description,
sector, owner type, state/city, contractor, client, project value (₹ Cr),
estimated steel & cement requirement (tonnes), start/end date, duration,
status, funding source, tender date, contact info, source URL, your pitch
status, and notes. See `lib/types.ts` for the full schema.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Tech stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS + Recharts. Data persists
to `data/projects.json` on the server via API routes (`/api/projects`,
`/api/projects/[id]`) — no external database required. Good for a single-user
or small internal sales team; if you need multiple concurrent users with
accounts, swap the JSON file for a real database.
