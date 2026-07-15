# LOG Twin — Honda MC North Warehouse Digital Twin DSS

Enterprise decision-support web application for peak-season **North warehouse stacking**, **N→S transfer**, and **outsourcing** optimization (Honda Vietnam motorcycle logistics).

## Sources (knowledge base)

| Document | Role |
|----------|------|
| `Bài toán tối ưu log packing miền Bắc.docx` | Optimization logic, monthly tables, playbook |
| `MC DOM_BUDGET 103Ki 2QFC_update Jun.xlsx` | Volumes, capacity, rental, transport rates |
| `UNTITLED.pptx` | Executive process redesign & network capacity |

## Stack

- **Frontend:** Next.js 15 · React · TypeScript · Tailwind CSS · Recharts · Zustand  
- **Engine:** Client-side Digital Twin + optional **FastAPI** (`backend/`)  
- **Deploy:** Docker Compose  

## Run (development)

```bash
cd honda-log-digital-twin
npm install
npm run dev
```

Open http://localhost:3000

### FastAPI engine (optional)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Health: `GET http://localhost:8000/health`  
- Simulate: `POST http://localhost:8000/simulate`  

### Docker

```bash
docker compose up --build
```

- Web: :3000 · API: :8000  

## Modules

| Route | Purpose |
|-------|---------|
| `/` | Executive dashboard KPIs & charts |
| `/digital-twin` | **Live parameter simulation** (core DSS) |
| `/overview` | Problem statement & sources |
| `/warehouse` | Fact Cap vs TTL Cap, stock |
| `/vehicle` | Density & effective capacity |
| `/import` | Import stacking relief |
| `/domestic` | Transfer vs outsource break-even |
| `/container` | N→S / S→N containers & case pool |
| `/transport` | Freight & return simulation |
| `/financial` | Cost bridge, ROI, NPV, payback |
| `/scenarios` | Policy scenario comparison |
| `/sensitivity` | Tornado ±20% |
| `/monte-carlo` | Stochastic savings distribution |
| `/risk` | Risk matrix & controls |
| `/recommendations` | Live playbook |
| `/report` | Consulting narrative (print/PDF) |
| `/data` | Validation & inconsistencies |
| `/admin` | Parameter JSON + audit |

## Core formulas

```
Import relief = Import × (unpackM2 − stackM2) / unpackM2
N→S containers = Transfer / (casesPerCont × mcPerCase)
Return containers = Cases / 80
Case pool = Cases / 30 × (lead + free)
Transfer if Avoided North cost > Total transfer cost
```

## Author note

Built as a Senior Logistics DSS: every slider recomputes cost, utilization, outsourcing and containers — not a static slide deck.
