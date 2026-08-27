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
- **Import Data (`/import`)** — Upload a CSV or Excel (.xlsx/.xls) export from
  any source in its own native column layout — e.g. a **ProjectsToday** export,
  a GeM/state e-procurement download, or your own tracker — and map its
  columns to InfraPulse's fields (auto-guessed, editable). Common variants
  ("L1 Declared" → Awarded, "In Progress" → Under Construction, "Govt" →
  Government) are normalized automatically; unrecognized values still import
  as plain text rather than being dropped. Rows matching an existing project
  id are updated instead of duplicated. A ready-made CSV template is also
  available for manual entry.

## Seed data

The dashboard ships with **248 real, individually-sourced projects** across 25
states and **186 unique contractors** — ranging from large national EPC firms
to small/regional builders (e.g. K.C.V.R Infra Projects, Ramraja Construction,
Brahmaputra Infrastructure, EMS Limited) that are often better sales leads
than the big names since they have less negotiating leverage with material
suppliers. Coverage spans government (NHAI, state PWD/road corporations,
NHIDCL), PSU (RVNL, NTPC/BHEL, POWERGRID, SAIL, metro rail corporations,
NHSRCL), private (real estate — including tier-2/3 city developers —
steel/cement/industrial capex, renewable energy EPC, data centers,
warehousing, healthcare, education) and PPP projects, including national
flagship programs (Mumbai-Ahmedabad bullet train, Char Dham Pariyojana,
Sagarmala/Vadhavan Port) and major dam/irrigation projects. Each was
compiled from public announcements (company disclosures, exchange filings,
NHAI/metro-rail-corporation press releases, trade press) as of August 2026,
and every record carries a `sourceUrl` — click **View source** on a
project's detail page to verify it before you pitch.

This is **not a live feed and not exhaustive** — it's a snapshot from two
research passes, not a comprehensive database of every Indian infrastructure
project (no free public source offers that; commercial services like
ProjectsToday or CMIE Capex exist precisely because compiling one is hard).
Some well-known named projects genuinely have no active new-construction
package to find (e.g. Sardar Sarovar Dam's main structure was completed in
2017) — those won't appear unless a specific ongoing package (canal network,
lift irrigation, etc.) turns up in search.
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
