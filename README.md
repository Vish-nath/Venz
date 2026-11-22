<div align="center">

# 🐍 Venz Snake Safety & Triage

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-18.x-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/express-4.x-lightgrey.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Render Deployment](https://img.shields.io/badge/deploy-render-purple.svg)](https://render.com)

*A responsive web application and API foundation for snakebite triage, emergency safety guidance, and wildlife sighting reports.*

</div>

---

## 🧭 Overview

**Venz** is a modern full-stack web application designed to provide instant, conservative safety guidance during snake sightings and potential snakebite emergencies. 

> [!CAUTION]
> **Medical Disclaimer:** Venz is an educational prototype and safety reference tool. It does **not** provide medical diagnosis or AI-based species identification. In the event of a suspected venomous snakebite, always contact emergency medical services or your local poison control center immediately.

---

## 🚀 Key Features

- **🚨 Emergency Bite Triage:** Immediate conservative first-aid guidance and urgent safety instructions for suspected snakebites.
- **📸 Sighting Reports:** Secure image upload transport and location-aware sighting logs for wildlife safety.
- **🔐 Google Authentication:** Secure identity verification via Google OAuth client-side credentials & backend token verification.
- **📍 Geolocation Support:** Browser geolocation integration to capture regional context for emergency/sighting reporting.
- **🛡️ Enterprise Security:** Hardened Express API powered by `helmet`, strict CORS policies, and rate/size-limiting controls.
- **🚀 Unified Monorepo & Deployment:** Single-service Render deployment architecture serving both the compiled React/Vite frontend and Express backend.

---

## 📂 Repository Architecture

```text
Venz/
├── apps/
│   ├── api/             # Express.js REST API & static file server
│   ├── mobile/          # Android packaging notes and mobile integration
│   └── web/             # React, TypeScript, & Vite client application
├── data/
│   ├── raw/             # Original dataset and images (local/uncommitted)
│   └── processed/       # Versionable dataset manifests
├── docs/                # Architecture, deployment, and security notes
├── infra/render/        # Render deployment blueprint (render.yaml)
├── models/              # Model artifacts and documentation
└── packages/            # Shared libraries and utilities
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Modern CSS / Responsive UI
- **Backend:** Node.js, Express, Helmet, CORS, Morgan
- **Infrastructure:** Render (Unified Node Web Service), Docker-ready
- **Tooling:** npm Workspaces, Concurrently

---

## 🏁 Quick Start

### Prerequisites
- **Node.js** `>=20.x`
- **npm** `>=10.x`

### Installation & Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Vish-nath/Venz.git
   cd Venz
   ```

2. **Install dependencies across the monorepo:**
   ```sh
   npm install
   ```

3. **Start development servers (API + Web client concurrently):**
   ```sh
   npm run dev
   ```

- Web Client: [`http://localhost:5173`](http://localhost:5173)
- Express API: [`http://localhost:8000`](http://localhost:8000)

### Production Build

```sh
npm run build
npm start
```

---

## 🚀 Deployment

Venz is configured for seamless deployment on **Render** using the blueprint in [`infra/render/render.yaml`](infra/render/render.yaml). 

The application builds both frontend and backend into a unified service where Express serves the compiled static web assets alongside the REST API endpoints. See [deployment documentation](docs/deployment.md) for environment variable configurations (`GOOGLE_CLIENT_ID`, `FRONTEND_URL`, etc.).

---

## 📄 Documentation & Security

- **Security Policy:** Read our [security notes](docs/SECURITY.md) before handling user credentials or sensitive telemetry.
- **Deployment Guide:** [docs/deployment.md](docs/deployment.md)
- **API Development:** [docs/api-development.md](docs/api-development.md)

---

## 📜 License

Distributed under the [MIT License](LICENSE).
