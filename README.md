# Venz Snake Safety

Responsive web application and API foundation for snake sightings and suspected bite reports. Species identification is not implemented yet; the API returns conservative safety guidance and does not provide diagnosis.

## Repository layout

```text
apps/
  api/              Express API
  mobile/            Android packaging notes and future native client
  web/               React, TypeScript, and Vite client
data/
  raw/                Place original CSV and image dataset here (not committed)
  processed/          Generated, versionable dataset manifests
docs/                 Architecture, operations, security, and development notes
infra/render/         Render deployment blueprint
models/               Model artifacts and model documentation
packages/             Shared libraries (reserved)
scripts/              Dataset and maintenance tooling (reserved)
```

## Local development

Requires Node.js 20 or later and npm.

```sh
npm install
npm run dev
```

The web client runs at `http://localhost:5173`; the API runs at `http://localhost:8000`. Copy `.env.example` values as needed. Run `npm run build` to compile the web application.

## Deployment

The Render blueprint in `infra/render/render.yaml` defines separate web and API services. Set the web service's `VITE_API_URL` to the public API URL after deployment. See [deployment notes](docs/deployment.md).

## Android

The current app is a responsive web client; an Android APK has not been created. See [Android notes](apps/mobile/README.md) for the intended packaging workflow.

## Project status

- Working: responsive intake UI, image upload transport, browser geolocation, basic API and cautious safety content.
- Not implemented: validated snake classification model, dataset pipeline, Google authentication, patient history, doctor workflows, and native Android shell.

Read [security notes](docs/SECURITY.md) before using real patient information. This prototype is not a medical device.
