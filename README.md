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
  project: state, segment/sector/sub-sector, owner type (Government / PSU /
  Private / PPP), status, completion %, value, duration, contractor. Filter by
  state, **segment** (see below), sector, sub-sector, owner type, status,
  start-year range, duration range, min/max project value (so you can slice
  anywhere from sub-crore local works up to mega-projects), or free-text
  search. Export the filtered list to CSV.
- **Project detail (`/projects/[id]`)** — Full project record: description,
  segment/sector/sub-sector, contractor/client (plus contact phone/email
  where publicly available), timeline, completion % (with a note on whether
  it's disclosed, calculated from dates, or a status-based estimate), funding
  source, estimated steel & cement tonnage, plus your own pitch tracker
  (status: Not Contacted → Contacted → In Discussion → Quoted → Order Won /
  Not Interested, with notes).
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

The dashboard ships with **3,480 real, individually-sourced projects** across
**39 states/UTs** and **1,276 unique contractors**, with disclosed values
spanning **₹0.03 Cr (₹3 lakh) to ₹1,30,000 Cr** — from a single village link
road or panchayat bhawan up to a mega industrial complex — ranging from large
national EPC firms to small/regional and hyperlocal builders (e.g. K.C.V.R
Infra Projects, Ramraja Construction, Brahmaputra Infrastructure, EMS
Limited, Dineshchandra R Agrawal Infracon, Hardayal Constructions, plus
dozens of local contractors on sub-₹20-Cr rural road, health-centre, and
panchayat-building works) that are often better sales leads than the big
names since they have less negotiating leverage with material suppliers.
Coverage spans government (NHAI, state PWD/road corporations, NHIDCL,
PIB-announced projects across the Northeast and J&K/Ladakh, district-level
tenders), PSU (RVNL, NTPC/BHEL, POWERGRID, SAIL, metro rail corporations,
NHSRCL, state industrial corporations like MIDC/GIDC/TSIIC/RIICO/KIADB),
private (real estate — including tier-2/3/4 city developers, RERA-filed
projects and shopping malls — steel/cement/pharma/chemicals/auto/HVAC
industrial capex, standalone steel-processing plants (pipe mills, wire
mills, galvanizing lines), SME-listed company capex disclosed on stock
exchange filings, renewable energy EPC, data centers, warehousing/MMLPs,
healthcare, education) and PPP projects, including national flagship
programs (Mumbai-Ahmedabad bullet train, Char Dham Pariyojana,
Sagarmala/Vadhavan Port) and major dam/irrigation projects. Each was
compiled from public announcements (company disclosures, exchange filings,
NHAI/metro-rail-corporation press releases, PIB releases, local news, trade
press) as of August 2026, and every publicly-sourced record carries a
`sourceUrl` — click **View source** on a project's detail page to verify it
before you pitch.

**~3,020 of these projects** come from a real internal GTM (go-to-market)
project-accounts export (a CSV tracker of project leads, not a public
website), rather than a public article — those records have no `sourceUrl`
(there's no public page to link to) and instead say so plainly in the
description ("Source: internal GTM project account data (not a public URL).")
so it's never mistaken for a verifiable public source. This is also where
most of the dataset's office/site addresses, contact names, and disclosed
completion percentages come from (see below) — the export includes
promoter/developer registered-office details and a project completion-stage
field for a large share of its rows.

Every project also carries:
- A **segment** (`segmentC`) aligned to the sales team's CRM segment
  picklist — Retail, Processors, Infra - Water, Infra - Transport,
  Infra - Public, Industrial and Machinery, Buildings - Residential,
  Buildings - Industrial, Buildings - HVAC, Buildings - Commercial — plus the
  original **sector/sub-segment** (`sector`/`subSector`, e.g. Industrial &
  Economic Corridors → Steel, Cement, Auto & EV, Chemicals & Petrochemicals).
  Both are auto-classified from each project's real description (never
  fabricated); where no real project existed yet for a segment (Retail,
  Processors and Buildings - HVAC initially had zero), that was reported
  honestly and closed by sourcing real ones rather than force-fitting
  unrelated projects into the bucket.
- A **completion %**, with a disclosed value where the source states one
  (the GTM export's own project completion-stage field, ~2,800 records),
  otherwise computed from disclosed start/end dates, and failing that a
  rough estimate from status (Tendering = 0%, Awarded = 5%, Under
  Construction ≈ 45%, Nearing Completion ≈ 85%, Completed = 100%) — the UI
  always shows which basis applies (disclosed / calculated / status-estimate)
  so an estimate is never mistaken for a measured fact.
- **Contact person/phone/email** — populated for **2,050 project records**:
  ~2,000 from the internal GTM export's own promoter/contractor contact
  fields, plus a smaller set matched against ~20 major national contractors'
  publicly-listed contacts (official website / investor-relations page).
  Never a scraped personal number, and never fabricated when nothing is
  disclosed.
- **Contractor office address and project site address** — populated for
  **3,063 / 3,070 project records** respectively, mostly from the internal
  GTM export's own promoter registered-office and project-location fields,
  supplemented by a smaller RERA (Real Estate Regulatory Authority)-sourced
  batch for public real-estate projects. Caveat on the RERA-sourced subset:
  this environment's network egress proxy blocked direct fetching of RERA
  government portals themselves, so those specific addresses were
  reconstructed from web-search result snippets rather than a
  directly-opened source page — treat that subset as needing a quick
  independent check before relying on it for outreach.

This is **not a live feed and not exhaustive** — it's a snapshot from
several research passes, not a comprehensive database of every Indian
infrastructure project (no free public source offers that; commercial
services like ProjectsToday or CMIE Capex exist precisely because compiling
one is hard — see note below on how those services actually work).
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
- State industrial development corporations (MIDC, GIDC, TSIIC, RIICO, KIADB, UPSIDC, HSIIDC) for industrial park/MMLP contracts
- PIB (Press Information Bureau) releases for cabinet-approved and ministry-announced projects
- RERA filings for private real estate projects
- Company investor presentations / annual reports / exchange filings for capex plans

**About ProjectsToday and similar paid data providers**: ProjectsToday is a
commercial, subscription-only project-intelligence database (live since
~2000), separate from and not scraped by this tool. It's not a public API or
open dataset — it's built by a dedicated in-house research team that
monitors tenders, filings, and press, and by their own public materials
tracks roughly 45,000+ projects across 400+ industry groups. That's real
scale, built over two decades — but it's a paid product behind a login, not
something this dashboard can pull from automatically. If you have a
subscription, use the **Import Data** page to bring your export in (column
mapping is automatic for common layouts).

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
