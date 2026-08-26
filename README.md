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

## Seed data

The dashboard ships with **109 real, individually-sourced projects** across 20
states — government (NHAI, state PWD/road corporations), PSU (RVNL, NTPC/BHEL,
POWERGRID, metro rail corporations), private (real estate, steel/cement/
industrial capex, data centers, warehousing, healthcare) and PPP projects.
Each was compiled from public announcements (company disclosures, exchange
filings, NHAI/metro-rail-corporation press releases, trade press) as of
August 2026, and every record carries a `sourceUrl` — click **View source** on
a project's detail page to verify it before you pitch.

This is **not a live feed and not exhaustive** — it's a snapshot from one
research pass, not a comprehensive database of every Indian infrastructure
project (no free public source offers that; commercial services like
ProjectsToday or CMIE Capex exist precisely because compiling one is hard).
Fields the source article didn't state (often project value, exact dates) are
left `null` rather than guessed — the UI shows "Not disclosed" / "—" for
those, never a fabricated number. Extend or refresh the dataset via the
**Import Data** page using your own research from sources like:

- GeM (Government e-Marketplace) and state PWD/CPWD tender portals
- NIC's Project Monitoring Group (PMG) dashboard
- NHAI, state road development corporations, metro rail corporations
- RERA filings for private real estate projects
- Company investor presentations / annual reports / exchange filings for capex plans

## Data model

Each project record (`data/projects.json`) includes: name, description,
sector, owner type, state/city, contractor, client, project value (₹ Cr),
estimated steel & cement requirement (tonnes), start/end date, duration,
status, funding source, tender date, contact info, source URL, your pitch
status, and notes. See `lib/types.ts` for the full schema. `projectValueCr`,
`startDate`, `endDate`, and `durationMonths` are nullable — real source
articles don't always disclose every field.

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
