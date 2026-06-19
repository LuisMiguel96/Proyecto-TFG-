# AGENTS.md

## Architecture

Three-tier monorepo: **Frontend** (React/Vite:5173) → **Backend** (Express:3000) → **ML API** (FastAPI:8000)

- `Backend/` — Express.js with Mongoose (MongoDB Atlas). Entry: `server.js` → `src/app.js`
- `Frontend/` — React 18 + Vite 7. Entry: `src/main.jsx` → `src/App.jsx`
- `ML/` — FastAPI. Entry: `ML/api/main.py`

## Startup order

```sh
# 1. ML API (port 8000)
cd ML/api; uvicorn main:app --reload

# 2. Backend (port 3000)
cd Backend; npm run dev

# 3. Frontend (port 5173)
cd Frontend; npm run dev
```

## Key wiring

- Frontend Vite proxies `/api/*` → `http://localhost:3000` (see `vite.config.js`)
- Backend proxies ML calls via `/api/ml/*` → `http://localhost:8000` (see `routes/ml.js`)
- ML API loads data eagerly at import from `ML/outputs/dataset_features.csv` (hardcoded relative path in `data/dataset.py`)
- ML API CORS allows `http://localhost:5177` and `http://localhost:3000` (note: 5177, not 5173 — potential frontend CORS issue)

## Backend environment (`Backend/.env`)

Required vars: `MONGODB_CLUSTER_URI`, `MONGODB_DATABASE_NAME`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI`

## Known quirks

- No Python dependency manager files exist (`requirements.txt`, `pyproject.toml`, etc. all absent)
- `ML/models/` and `ML/notebooks/` are empty directories
- `ML/api/src/models/schema.py` is empty
- React StrictMode is intentionally disabled (OAuth double-effect issue)
- The `conda` file at repo root is 0 bytes (placeholder only)
- No test, lint, or typecheck config exists anywhere in the repo

## Services & Models

### Backend models
- `User` — Strava OAuth athlete data, tokens
- `StravaActivity` — Raw activities synced from Strava API
- `AnalyzedActivity` — Tracks which activities user has sent to ML pipeline (composite unique index on `userId+activityId`)

### ML API endpoints
- `/actividades/` — list all activities with aggregate metrics
- `/actividades/{archivo}/resumen` — detailed summary of one activity
- `/actividades/{archivo}/serie` — time-series data (downsampled to ~500 points)
- `/estadisticas/globales` and `/estadisticas/zonas` — aggregate stats

## Review policy

**No change is pushed without explicit personal review.** Every modification must be logged in `CAMBIOS.md` with: affected files, line numbers, and a description of what was changed. OpenCode proposes the change, the user reviews and approves before any commit.

## Style conventions

- Backend uses `require` (CommonJS), no ES modules
- Frontend uses ES modules (`"type": "module"` in package.json)
- ML API uses FastAPI with plain functions (no async on data endpoints)
- Backend routes use `var` for requires (existing style — preserve)


##requeriments 
fastapi==0.104.1
uvicorn==0.24.0
tensorflow==2.13.0
keras==2.13.1
scikit-learn==1.3.0
numpy==1.24.3
pandas==1.5.3
pydantic==2.4.2
python-multipart==0.0.6
pickle5==0.0.12