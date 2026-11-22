# Render deployment

This repository supports a single Render Node Web Service. The root package defines a `start` script and Express serves both `/api/*` and the compiled React application.

## Existing dashboard service

For the service shown in the deployment logs, open **Settings → Build & Deploy** and set:

- Root Directory: repository root (blank/default; do not set it to `src`, `apps/web`, or `apps/api`)
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Save changes and trigger a new deploy. The root `start` script also makes Render's detected `yarn start` command work when it runs from the repository root. Both the web page and API will be at the service's `onrender.com` URL. The client uses same-origin API requests, so no `VITE_API_URL` is required.

Alternatively, create the service from `infra/render/render.yaml` (Blueprint). Set `FRONTEND_URL` to the deployed origin if cross-origin requests will be made; same-origin use does not require a special CORS origin.

## Environment

Do not put secrets in frontend variables. This prototype does not have accounts or durable storage. Uploaded image data is processed in memory for the request and is not written to disk.
