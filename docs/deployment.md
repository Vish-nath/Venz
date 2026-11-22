# Deployment

## Render

Create services from `infra/render/render.yaml`. After both services are created:

1. Set `FRONTEND_URL` on `venz-api` to the exact public static-site origin (for example `https://venz-web.onrender.com`). Multiple allowed origins can be comma-separated.
2. Set `VITE_API_URL` on `venz-web` to the API's public origin (for example `https://venz-api.onrender.com`), then trigger a static-site deploy. Vite embeds this value at build time.
3. Confirm `https://<api-host>/api/health` returns JSON and test the UI over HTTPS.

Do not add secrets to frontend environment variables: `VITE_*` values are public. Configure custom domains and origins explicitly. The current API does not persist submissions or retain uploaded images.

## Local configuration

The web client defaults to same-origin API calls. Set `VITE_API_URL=http://localhost:8000` in `apps/web/.env.local` during local development. Set `FRONTEND_URL=http://localhost:5173` for the API.
