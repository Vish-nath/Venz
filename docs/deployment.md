# Render deployment

This repository supports a single Render Node Web Service. The root package defines a `start` script and Express serves both `/api/*` and the compiled React application.

## Existing dashboard service

For the service shown in the deployment logs, open **Settings → Build & Deploy** and set:

- Root Directory: repository root (blank/default; do not set it to `src`, `apps/web`, or `apps/api`)
- Build Command: `npm install --include=dev --no-audit --no-fund && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Save changes and trigger a new deploy. The root `start` script also makes Render's detected `yarn start` command work when it runs from the repository root. Both the web page and API will be at the service's `onrender.com` URL. The client uses same-origin API requests, so no `VITE_API_URL` is required.

Alternatively, create the service from `infra/render/render.yaml` (Blueprint). The current single-origin setup does not require a CORS environment variable.

## Google sign-in setup

Create a Google OAuth **Web application** client in Google Cloud Console. Add the Render site origin (for example `https://venz-1y7c.onrender.com`) to **Authorized JavaScript origins**. Configure both Render environment variables to the same client ID:

- `VITE_GOOGLE_CLIENT_ID`: available at web build time; save it and redeploy so the sign-in button is rendered.
- `GOOGLE_CLIENT_ID`: used by the API to verify the Google ID token audience.

The API verifies tokens with Google's token verification endpoint. The signed-in credential is held in the browser session and rechecked on reload; profile and recent activity are currently stored only in local browser storage. This is not yet a server-side account/session or synced profile system.

## Environment

Do not put secrets in frontend variables. This prototype does not have accounts or durable storage. Uploaded image data is processed in memory for the request and is not written to disk.
