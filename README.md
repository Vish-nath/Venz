<div align="center">

# 🛡️ Snake Triage System

  <br />

  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![Security](https://img.shields.io/badge/AppSec-Hardened-brightgreen?style=for-the-badge)](SECURITY.md)

  <p align="center">
    <b>A secure full-stack web application for identifying, triaging, and managing snake bites with robust security guardrails.</b>
  </p>

</div>

---

## 🌟 Overview

**Snake Triage System** is designed for rapid, secure medical triage and incident reporting. It features a hardened Node.js & Express REST API backend with Helmet, CORS, and rate limiting, paired with a modern React & TypeScript frontend interface.

---

## 📁 Repository Structure

```text
Venz/
├── backend/          # Node.js + Express secure REST API
│   ├── src/          # Server source code (server.js)
│   └── package.json  # Backend dependencies & scripts
├── frontend/         # React + TypeScript + Vite client application
│   ├── src/          # App components (App.tsx, main.tsx)
│   └── package.json  # Frontend dependencies & scripts
├── demos/            # Standalone UI & CSS custom cursor prototypes
├── SECURITY.md       # Application security checklist & audit log
└── README.md         # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ recommended
- **npm** or **yarn**

### 1. Running the Backend

```bash
cd backend
npm install
npm run dev
```
*(Backend runs on `http://localhost:8000`)*

### 2. Running the Frontend

```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

---

## 🛡️ Security

Review our [SECURITY.md](SECURITY.md) checklist covering authentication, authorization, input validation, secure file uploads, and API hardening.

---

## 📄 License

This project is licensed under the MIT License.
