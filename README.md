<div align="center">

# 🐍 VENZ
### Snake Safety Field Guide

**A calm, mobile-ready space for snake sightings and suspected bites.**

[![Live on Render](https://img.shields.io/badge/Live%20demo-Render-46E3B7?logo=render&logoColor=white)](https://venz-1y7c.onrender.com)
[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/API-Express-333333?logo=express&logoColor=white)](https://expressjs.com/)
[![Hosted on Render](https://img.shields.io/badge/Hosted%20on-Render-7A3EF0?logo=render&logoColor=white)](https://render.com/)

[Open the Venz web app ↗](https://venz-1y7c.onrender.com)

</div>

---

## The idea

Venz is a responsive web app for recording a **snake sighting** or a **suspected snakebite**. It brings photo capture, optional patient context, location entry, and practical safety guidance into one focused workflow that works across desktop and mobile screens.

The app is designed to help people take safer next steps. It is an early-stage prototype, not a diagnostic or emergency-response service.

> [!CAUTION]
> **Suspected bite? Contact local emergency medical services or a poison center immediately.** Do not wait for this app. A photo cannot determine whether venom was injected, and Venz does not currently identify snake species from images.

## What you can do

- **Sign in with Google** using Google Identity Services, with the ID token checked by the API.
- **Report a bite or sighting** and attach a JPG, PNG, or WebP image from your device.
- **Take a live photo** using the browser camera on supported devices, after granting camera permission.
- **Install Venz** on supported phones and desktops as a progressive web app, with a small offline app shell.
- **Add location context** by entering a place or using browser geolocation.
- **Look up an emergency number** from the detected country after tapping the location button; supported countries show a tap-to-call link.
- **Save optional profile details** such as age, blood type, and relevant allergies for the form.
- **Review safety guidance** for suspected bites and snake sightings.
- **Browse recent activity** saved in the current browser.

### What the assessment currently returns

The API validates the request and returns conservative safety guidance. **Image-based species classification is not implemented**, even though a CSV and image collection are available locally for future model development. The app also does not yet provide verified emergency phone numbers for a user’s region.

## A quick look at the flow

```text
Sign in → Assessment → Add or capture a photo → Add optional context → Read safety guidance
                    ↘ Profile · My activity · Safety guide
```

The visual system uses a dark forest palette, soft glass surfaces, responsive layouts, reduced-motion support, and pixel snakes that patrol the screen edge and follow mouse or touch movement. The camera uses the browser’s live media API; camera access requires permission and a secure context such as HTTPS. PWA installation is available in supported browsers; it is not a signed native Android APK.

## Built with

| Area | Tools |
| --- | --- |
| Web client | React 18, TypeScript, Vite, responsive CSS |
| API | Node.js, Express, Helmet, Morgan |
| Sign-in | Google Identity Services and server-side token verification |
| Hosting | Render Node Web Service, serving the web build and API together |

## Run locally

**Requirements:** Node.js 20+ and npm.

```bash
git clone https://github.com/Vish-nath/Venz.git
cd Venz
npm install
npm run dev
```

- Web client: <http://localhost:5173>
- API health check: <http://localhost:8000/api/health>

Build and run the production app locally:

```bash
npm run build
npm start
```

The Express server serves the compiled web client and `/api/*` routes from the same origin.

## Deploy on Render

The repository includes a Render Blueprint at [`infra/render/render.yaml`](infra/render/render.yaml). It defines a single Node Web Service:

| Setting | Value |
| --- | --- |
| Root directory | Repository root |
| Build command | `npm install --include=dev --no-audit --no-fund && npm run build` |
| Start command | `npm start` |
| Health check path | `/api/health` |

### Configure Google sign-in

1. Create a Google OAuth **Web application** client in Google Cloud Console.
2. Add your deployed origin (for example, `https://venz-1y7c.onrender.com`) under **Authorized JavaScript origins**.
3. Set `VITE_GOOGLE_CLIENT_ID` on the Render service to that Web client ID (the public value ending in `.apps.googleusercontent.com`).
4. Redeploy so Vite embeds the value in the frontend build.

The same `VITE_GOOGLE_CLIENT_ID` is used by the API to verify the ID token audience. **Do not put the Google client secret in a `VITE_` variable or in the frontend.** The sign-in page includes a connection check and reports configuration problems.

For more detail, see [`docs/deployment.md`](docs/deployment.md).

## Project layout

```text
apps/
  api/               Express API and static web server
  mobile/            Notes for a future native Android shell
  web/               React application
data/
  raw/               Local source dataset (not committed)
  processed/         Reserved for prepared dataset metadata
docs/                 Deployment, security, and development notes
infra/render/         Render Blueprint
models/               Reserved for model artifacts
packages/             Reserved for shared workspace packages
scripts/              Reserved for dataset tooling
```

## Data and privacy

- Profile and recent activity are stored in browser storage on the current device; they are not synced to a Google account or server.
- Uploaded image data is sent to the API for the current request and is not written to disk by the current API implementation.
- The supplied snake CSV and image set are kept under `data/raw/` locally and excluded from Git. Their redistribution terms were not provided with the archive.
- Do not enter information you do not need. This prototype has not been designed or reviewed for storing protected medical records.

## Current limitations

- No trained or validated snake-image or bite-mark model.
- No doctor workspace, patient record database, or server-side profile storage.
- No region-specific emergency-contact directory.
- No native Android project or APK yet; the web client is responsive and camera access depends on browser/device support.
- No automated rate limiting or durable server-side login session.

## Documentation

- [Render deployment guide](docs/deployment.md)
- [Security notes](docs/SECURITY.md)
- [API development notes](docs/api-development.md)
- [Web development notes](docs/web-development.md)
- [Android packaging notes](apps/mobile/README.md)

---

<div align="center">

**Venz — safer decisions start with distance, calm, and qualified medical care.**

</div>
