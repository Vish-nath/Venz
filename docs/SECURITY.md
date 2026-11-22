# 🛡️ AppSec Checklist & Vulnerability Log

This file tracks the security hardening of the Snake Triage Application as you develop it. Since this project is meant to highlight your Application Security skills for internships, treat it as a live audit log.

## 1. Authentication & Authorization
- [ ] Implement JWT (JSON Web Tokens) for the `/api/doctor/*` endpoints.
- [ ] Implement Role-Based Access Control (RBAC). Ensure a user with role `patient` receives a `403 Forbidden` when accessing `doctor` endpoints.
- [ ] Prevent Broken Object Level Authorization (BOLA/IDOR) by validating that a user can only query their own triage reports in `GET /api/incidents/:id`.

## 2. Input Validation & Data Sanitization
- [ ] Validate GPS coordinates (Latitudes must be between -90 and 90, Longitudes between -180 and 180).
- [ ] Implement strict JSON schema validation (e.g., using `Zod` or `Joi`) to prevent NoSQL/SQL Injection payloads.

## 3. Secure File Uploads (Image Triage)
- [ ] Verify magic bytes (file signatures) of uploaded snake photos. Don't trust the `.png`/`.jpg` extension.
- [ ] Strip EXIF metadata (e.g., precise GPS tags hidden inside photos) before saving to protect patient privacy.
- [ ] Enforce a strict file size limit (e.g., `5MB`) to prevent Denial of Service (DoS) attacks on the storage bucket.

## 4. API Hardening (Backend)
- [ ] Enable `helmet` for secure HTTP headers.
- [ ] Implement Rate Limiting on the `/api/alerts/dispatch` endpoint to prevent SMS/Email spamming.
- [ ] Ensure CORS is strictly configured to only allow requests from your frontend origin (no wildcard `*` in production).

## 5. Mobile & Client Security (React + Capacitor)
- [ ] Audit the Android `.apk` (using tools like `apktool` or `jadx`) to guarantee NO API keys (e.g., database credentials, SMS gateway keys) are hardcoded in the frontend bundle.
- [ ] Ensure sensitive data is not logged to `console.log` in production.

---
*Created as part of the Snake Triage AppSec Portfolio Project.*