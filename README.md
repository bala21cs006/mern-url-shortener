# Snip — MERN URL Shortener

A full-stack URL shortening app built with **MongoDB, Express, React, and Node.js**.

Paste a long URL, get a short one back, and every `/{code}` short link redirects
to the original address. All shortened URLs are listed on the page, with click
counts and duplicate/invalid-URL protection.

## Features

- Submit a long URL and get a unique short code back
- `GET /:code` redirects to the original URL and records a click
- View every shortened URL in a table (short link, original URL, clicks, created date)
- Duplicate URLs return the **existing** short link instead of creating a new one
- Invalid URLs (bad format, non-http(s), local/internal hosts) are rejected with a clear message
- Delete a short link
- Data persisted in MongoDB via Mongoose

## Tech stack

| Layer     | Tech                                   |
|-----------|-----------------------------------------|
| Frontend  | React 19 (Vite), plain CSS              |
| Backend   | Node.js, Express                        |
| Database  | MongoDB, Mongoose                       |
| Short IDs | `nanoid` (base62, 6 chars, collision-checked against the DB) |

## Project structure

```
mern-url-shortener/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/urlController.js
│   ├── models/Url.js           # Mongoose schema
│   ├── routes/api.js           # /api/urls routes
│   ├── utils/validateUrl.js    # URL validation
│   ├── utils/generateCode.js   # unique short code generator
│   ├── server.js               # Express app + redirect route
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ShortenForm.jsx
│   │   ├── components/UrlList.jsx
│   │   ├── components/UrlRow.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── App.css / index.css
│   └── .env.example
└── package.json                 # convenience scripts to run both at once
```

## Prerequisites

- Node.js 18+
- A MongoDB instance — either:
  - **Local**: install MongoDB Community Server and run `mongod`, or
  - **Atlas**: create a free cluster at https://www.mongodb.com/cloud/atlas and copy its connection string

## Setup

1. **Install dependencies** (from the project root):

   ```bash
   npm run install:all
   ```

   (or manually: `cd backend && npm install`, then `cd ../frontend && npm install`)

2. **Configure the backend**:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `.env` and set `MONGO_URI` to your MongoDB connection string. Defaults
   assume a local MongoDB at `mongodb://127.0.0.1:27017/url-shortener`.

3. **Configure the frontend** (optional — defaults work for local dev):

   ```bash
   cd frontend
   cp .env.example .env
   ```

## Running in development

From the project root, run both servers together:

```bash
npm run dev
```

This starts:
- the API on **http://localhost:5000**
- the React dev server on **http://localhost:5173**

Open **http://localhost:5173** in your browser to use the app. The React app
calls the API at the URL set in `frontend/.env` (`VITE_API_BASE`).

To run them separately instead:

```bash
npm run dev:backend    # API only, http://localhost:5000
npm run dev:frontend   # React dev server only, http://localhost:5173
```

## Running in production

Build the React app and serve everything from the single Express server:

```bash
npm run start
```

This builds `frontend/dist` and starts the backend on `PORT` (default 5000),
which serves the built frontend **and** handles `/api/*` and `/:code`
redirects from the same origin — so short links like
`http://localhost:5000/aB3xY9` work directly.

## API reference

| Method | Endpoint            | Description                                   |
|--------|----------------------|------------------------------------------------|
| POST   | `/api/urls`          | Body `{ "url": "https://..." }` → creates (or returns existing) short URL |
| GET    | `/api/urls`          | List all shortened URLs, most recent first     |
| DELETE | `/api/urls/:code`    | Delete a short URL                             |
| GET    | `/:code`             | Redirect to the original URL, increments clicks|

### Example

```bash
curl -X POST http://localhost:5000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.anthropic.com/some/very/long/path"}'
```

```json
{
  "id": "66b1...",
  "code": "aB3xY9",
  "longUrl": "https://www.anthropic.com/some/very/long/path",
  "shortUrl": "http://localhost:5000/aB3xY9",
  "clicks": 0,
  "createdAt": "2026-07-25T06:10:00.000Z"
}
```

Visiting `http://localhost:5000/aB3xY9` redirects to the original URL.

## Validation & duplicate handling

- URLs must be well-formed and use `http://` or `https://`.
- URLs must have a valid domain (e.g. rejects `http://localhost`).
- Submitting the same URL twice does **not** create a second short link — the
  existing short link is returned (with `"duplicate": true` in the response).
- Short codes are generated randomly and checked against the database for
  uniqueness before being saved.

## Notes on this build

This code was written and syntax-checked, and the validation/short-code-generation
logic was unit tested directly in this environment. End-to-end testing against a
live MongoDB instance was not possible here because this sandbox has no network
access to MongoDB's download servers or a hosted Atlas cluster — you'll want to
do a first run against your own MongoDB and confirm the flow end-to-end.
