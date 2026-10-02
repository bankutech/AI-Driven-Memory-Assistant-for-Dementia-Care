# AI-Driven Memory Assistant for Dementia Care

A supportive **memory-assistance and caregiver-support prototype**: a calm web app that helps a
person with memory difficulties remember the people, places, routines and daily events that matter,
and gives their caregiver a simple overview of the day.

It is a **fully working prototype** (real database, real CRUD, real API), not a UI mockup, and it
runs completely **offline and free** — no paid API keys required.

> **Safety notice:** This prototype is designed for memory assistance and caregiver support.
> It is not a medical diagnostic or treatment system. It does not diagnose dementia, predict its
> progression, or recommend any change in medication.

---

## 1. Project overview

The app is built around two users:

| User | What they get |
| --- | --- |
| **Patient (Arun Kumar)** | A large-text, low-clutter dashboard: today's schedule, medication reminder, routine progress, important people, recent memories and upcoming events. A Memory Vault, a "Who is this?" (simulated) face check, a chat assistant that answers from stored data, and one-tap calling. |
| **Caregiver (Meera Kumar)** | A care overview: routines completed / pending, reminders due, missed reminders, upcoming appointments, recent memory entries, and quick "Add Reminder / Memory / Person / Event" actions. |

The AI part is a **local rule-based assistant** (`backend/assistant/`). It reads the SQLite database
and answers questions such as *"Who is Riya?"*, *"What do I have today?"* or *"Where did I go with my
family?"* using only stored data — it never invents personal information. If an OpenAI-compatible key
is added later it can be used, but the prototype is complete without it (see §11).

## 2. Features

**Login / Welcome**
- Branded welcome screen, Patient login, Caregiver login, and a **Demo Mode** button that opens the
  dashboard instantly with no credentials.
- Demo credentials are validated against the `users` table in SQLite.
- Returning visitors get a **4-digit quick-PIN unlock** (default `1234`, editable under Profile).

**Patient dashboard**
- Greeting based on the time of day, live date/time, profile and notification icons.
- Cards: Today's Schedule, Medication Reminder, Today's Routine (with progress bar), Important
  People, Recent Memories, Upcoming Events.
- **"Summarize My Day"** button that builds a readable paragraph from today's events, reminders,
  routines and recent memories.

**Memory Vault** (full CRUD + SQLite persistence)
- Create / edit / delete memories with title, description, category, date, location, person, tags and
  an optional image (stored as a data URL, ~2 MB limit).
- Categories: Family, Friends, Places, Events, Personal, Important.
- Live search (title, description, location, person, tags), category filter chips, empty state.

**People / face memory**
- Person cards with name, relationship, avatar or initials, description and last interaction.
- Clicking a person opens a detailed profile with "Memories together" and a **Call** button.
- Full CRUD, plus a simulated **"Who is this?" Demo Recognition** flow: upload a photo *or* pick one
  of the built-in sample photos, the app "matches" a demo person and shows a confidence score. The
  same photo always returns the same person, and the feature is clearly labelled as a simulation
  (no real facial recognition, no paid service).

**Daily routine**
- Timeline grouped into Morning / Afternoon / Evening / Night, with time, activity, status and a
  "Remind me" nudge.
- Add / edit / delete routines and tick them complete (the period is derived automatically from the
  time).

**Reminders**
- Title, description, date, time, priority and status; Upcoming / Today / Done / All filters.
- **Browser notifications** when permission is granted, with in-app toasts as the fallback.

**Memory Companion (assistant)**
- Chat UI with suggested questions and source chips showing which records the answer came from.
- Questions about people, today's plan, past appointments, places visited, important memories,
  medication and who to call.

**Important contacts**
- Name, relationship, phone and type (Daughter, Doctor, Caregiver, Emergency Contact…), full CRUD and
  a large **Call** button that uses the browser `tel:` link.

**Global search**
- Header search (`Ctrl + K`) across memories, people, events, reminders and contacts, with results as
  cards that deep-link into the right page.

**Caregiver dashboard**
- Today's activity summary (✓ completed / ● pending / ✗ missed), counts, upcoming appointments,
  important people and recent memory entries, with working quick-add buttons.

**Settings / About**
- Profile summary, notification status + test notification, **Reset demo data**, and the safety
  disclaimer.

**Throughout**
- Responsive layout: sidebar on desktop/laptop, hamburger drawer + bottom navigation on tablet/mobile.
- Loading spinners, empty states, error states with retry, toasts, form validation and delete
  confirmations.

## 3. Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 + Vite 5, React Router 6 |
| Styling | Tailwind CSS 3 |
| Icons | lucide-react |
| Backend | Node.js + Express 4 (ES modules) |
| Database | SQLite via `better-sqlite3` |
| Browser APIs | Notifications API, `tel:` links, FileReader (image upload), localStorage (session) |
| Language | JavaScript |

## 4. Folder structure

```
.
├── package.json                 # root scripts: setup / dev / build / seed
├── README.md
├── .gitignore
├── backend/                     # Express + SQLite API
│   ├── package.json
│   ├── server.js                # app, generic CRUD factory, login, search, assistant, summary
│   ├── memory_assistant.db      # created automatically on first run (git-ignored)
│   ├── assistant/
│   │   ├── engine.js            # rule-based assistant that reads the database
│   │   └── summary.js           # "Summarize My Day" builder
│   ├── middleware/
│   │   └── validate.js          # request-body validation (full + partial for PUT)
│   └── database/
│       ├── schema.sql           # table definitions (single source of truth)
│       ├── schema.js            # runs schema.sql
│       ├── db.js                # opens the SQLite connection (WAL mode)
│       ├── dbPath.js            # database file location
│       ├── demoData.js          # demo dataset + seeding + reset helpers
│       ├── seed.js              # `npm run seed` CLI (drops rows, re-seeds)
│       ├── seedIfEmpty.js       # auto-seed on first server start
│       └── helpers.js           # query helpers used by the assistant / summary / search
└── frontend/                    # React + Vite app
    ├── package.json
    ├── vite.config.js           # dev server on :5173, proxies /api → :4000
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx             # entry + BrowserRouter
        ├── App.jsx              # routes + auth guard
        ├── index.css            # Tailwind layers + component classes
        ├── components/          # Layout (nav), ui.jsx (Modal, Spinner, Empty, Error, Confirm), ToastHost, PeopleSection
        ├── context/AppContext.jsx  # session, toasts, reminder polling
        ├── lib/                 # api.js, format.js, session.js, notifications.js,
        │                        # useGlobalSearch.js, useDeepLinkOpen.js, demoFaces.js
        └── pages/               # Welcome, Dashboard, MemoryVault, People, Schedule,
                                 # Reminders, Companion, Contacts, Caregiver, Settings, Profile
```

## 5. Installation

Requires **Node.js 18+** (tested on Node 20/22). From the project root:

```bash
npm run setup      # installs backend + frontend dependencies
npm install        # installs the root helper (concurrently) for `npm run dev`
```

`npm run setup` is a shortcut for:

```bash
npm install --prefix backend
npm install --prefix frontend
```

## 6. How to run the app

**One command (recommended)** — starts the API on `:4000` and the UI on `:5173`:

```bash
npm run dev
```

Then open **http://localhost:5173**.

**Or in two terminals:**

```bash
# terminal 1 — backend
cd backend
npm run dev        # node --watch server.js  → http://localhost:4000

# terminal 2 — frontend
cd frontend
npm run dev        # vite → http://localhost:5173
```

A production build of the frontend is available with `npm run build` (`frontend/dist`).

## 7. Database setup

Nothing to install or configure — SQLite is embedded.

- The database file `backend/memory_assistant.db` is created automatically the first time the server
  starts.
- `backend/database/schema.js` executes `backend/database/schema.sql` to create the tables.
- `seedIfEmpty()` then inserts the demo dataset, so the app looks complete immediately after install.
- Re-seed at any time:

```bash
npm run seed                 # CLI: clears all rows and re-inserts the demo data
# or use Settings → Data → Reset demo data in the UI
```

**Tables:** `users`, `memories`, `people`, `reminders`, `routines`, `contacts`, `events`
(fields match the project specification; `routines.completed` / `reminders.completed` are stored as
`0`/`1`).

The seeded demo dataset contains 5 memories, 6 people, 5 reminders, 8 routines, 4 contacts and
4 events, all with fictional names, dated relative to today so the dashboard always looks current.

## 8. Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Patient — Arun Kumar | `arun@demo.com` | `demo123` |
| Caregiver — Meera Kumar | `meera@demo.com` | `demo123` |

- **Demo Mode** button on the welcome screen signs in instantly (no credentials).
- Quick-PIN unlock demo PIN: `1234` (change it under **Profile**).
- Authentication is intentionally simple (plain demo check + a fake token) — this is a college
  prototype, not a production auth system.

## 9. API endpoints

Base URL `http://localhost:4000`. The Vite dev server proxies `/api` to it, so the frontend uses
relative paths.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check → `{ "ok": true }` |
| GET | `/api/memories` | All memories (newest first) |
| POST | `/api/memories` | Create (requires `title`) |
| PUT | `/api/memories/:id` | Partial update |
| DELETE | `/api/memories/:id` | Delete → `204` |
| GET/POST/PUT/DELETE | `/api/people`, `/api/people/:id` | People CRUD |
| GET/POST/PUT/DELETE | `/api/reminders`, `/api/reminders/:id` | Reminders CRUD |
| GET/POST/PUT/DELETE | `/api/routines`, `/api/routines/:id` | Routines CRUD |
| GET/POST/PUT/DELETE | `/api/contacts`, `/api/contacts/:id` | Contacts CRUD |
| GET/POST/PUT/DELETE | `/api/events`, `/api/events/:id` | Events CRUD |
| POST | `/api/login` | `{ email, password }` → user (`401` when wrong) |
| GET | `/api/search?q=text` | Global search across memories, people, events, reminders, contacts |
| POST | `/api/assistant` | `{ message }` → `{ reply, sources[] }` from stored data |
| POST | `/api/summary` | → `{ summary }` for "Summarize My Day" |
| POST | `/api/reseed` | Clears and re-inserts the demo data |

Example:

```bash
curl -X POST http://localhost:4000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"message":"Who is Riya?"}'
```

Validation errors and unknown routes always return JSON (`{ "error": "…" }`), so the UI can show a
message instead of a blank page.

## 10. Suggested demo walkthrough

1. **Welcome** → *Try Demo Mode*.
2. **Dashboard** → point out the live date/time, then press **Summarize My Day**.
3. **Memory Vault** → add a memory, search "Marina", filter by category, edit and delete.
4. **People** → open Riya's profile, press **Call**, then try **Who is this? → sample photo → Match**.
5. **Schedule** → tick a routine complete, add an event, then delete it.
6. **Reminders** → enable browser notifications, add a reminder for today, tick it done.
7. **Memory Companion** → ask "Who is Riya?", "What do I have today?", "Where did I go with my family?".
8. **Ctrl + K** → search "medicine" and click a result.
9. **Caregiver View** → show the activity summary and the quick-add buttons.
10. **Settings** → show the disclaimer, then *Reset demo data* to restore the original state.

## 11. Optional API keys

**None are required.** Everything (assistant, summary, recognition) works locally.

- `OPENAI_API_KEY` *(optional, not needed)* — if you later want to swap the rule-based assistant for a
  hosted model, add the key as an environment variable and call it from
  `backend/assistant/engine.js`; the local engine remains the fallback so the prototype never breaks.
- `PORT` *(optional)* — backend port, defaults to `4000`.

No other credentials, paid services or external accounts are used.

## 12. Future improvements

- Real face embeddings (e.g. an on-device model) behind the Demo Recognition screen.
- Caregiver ↔ patient accounts linked by ID instead of a single shared dataset.
- Recurring routines/reminders, snooze, and a medication log with exportable history.
- Voice input/output for hands-free use, and larger "senior mode" typography.
- Push notifications via a service worker so reminders arrive when the app is closed.
- Optional LLM assistant with retrieval over the same SQLite data (rule engine as fallback).
- Photo timeline view for memories and printable "memory book" export.
- Automated tests (API integration tests for the CRUD factory and assistant rules).
