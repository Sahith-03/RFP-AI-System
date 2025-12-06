# AI-Powered RFP Management System

[![Status](https://img.shields.io/badge/status-alpha-orange)](https://example.com) [![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)
A full‑stack intelligent procurement solution built with **React**, **Node.js**, and **Google Gemini AI**. This application streamlines the Request for Proposal (RFP) lifecycle by letting users generate requirements from natural language, automatically email vendors, parse unstructured email replies into structured data, and receive AI‑driven vendor recommendations.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Key Design Decisions](#key-design-decisions)
7. [Assumptions & Limitations](#assumptions--limitations)
8. [Development Notes](#development-notes)
9. [Contributing](#contributing)

---

## Features

* **Natural Language → Structured RFPs** — Convert plain-text requirements into validated JSON RFP drafts.
* **Automated Vendor Communication** — Send HTML invitations directly from the dashboard.
* **Smart Email Parsing** — Parse vendor replies (IMAP) and extract pricing, timelines, and warranty terms.
* **AI Comparison Engine** — Score and rank vendor proposals vs. original budget and specs.
* **Draft Workflow** — Preview everything before saving to avoid DB clutter.

---

## Tech Stack

**Frontend**

* React (Vite) + TypeScript
* Tailwind CSS
* Lucide React (icons)

**Backend**

* Node.js + Express (TypeScript)
* MongoDB (Mongoose)
* Google Gemini (via `@google/generative-ai`)
* Email: Nodemailer (SMTP) + imap‑simple (IMAP)

---

## Quick Start

> Requirements: Node.js v18+, MongoDB Atlas (or local), Google Gemini API Key, Gmail app password for SMTP/IMAP (recommended).

```bash
# clone
git clone <your-repo-link>
cd rfp-ai-system

# backend
cd server
npm install
cp .env.example .env   # update values
npm run dev

# frontend (open a new terminal)
cd ../client
npm install
npm run dev
```

**Default dev URLs**

* Backend: `http://localhost:5000`
* Frontend: `http://localhost:5173`

---

## Configuration

Create a `.env` file in the `server/` directory and add:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rfp-db
GEMINI_API_KEY=AIzaSy_YOUR_GEMINI_KEY
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

> ⚠️ Keep your keys secret. Do not commit `.env` to source control.

---

## API Reference (selected endpoints)

| Method | Endpoint                  | Description                                                  |
| ------ | ------------------------- | ------------------------------------------------------------ |
| POST   | `/api/rfps/preview`       | Generate structured JSON from natural language (no DB save). |
| POST   | `/api/rfps/create`        | Save previewed RFP to DB as a Draft.                         |
| GET    | `/api/rfps`               | List all RFPs (Drafts + Sent).                               |
| POST   | `/api/rfps/:id/send`      | Email selected vendors and mark RFP as Sent.                 |
| POST   | `/api/rfps/sync-emails`   | Connect to IMAP, parse replies, save proposals.              |
| GET    | `/api/rfps/:id/proposals` | Fetch parsed proposals for an RFP.                           |
| POST   | `/api/rfps/:id/analyze`   | Use AI to compare all proposals against the budget/specs.    |

Include authentication middleware (if added) around sending/syncing endpoints in production.

---

## Key Design Decisions

* **AI Model**: Google Gemini 1.5 Flash — chosen for speed and large context when parsing long emails. Configuration used: `temperature: 0.1` and `responseMimeType: "application/json"` to enforce structured responses.

* **Email Tracking**: Outgoing emails include a reference token in the subject (`[Ref:65a...]`). IMAP parsing uses this token to reliably link replies back to the correct RFP.

* **Strict Scoring Persona**: The comparison prompt guides the AI to act as a procurement officer and penalize non‑conforming or over‑budget proposals.

---

## Assumptions & Limitations

* Vendors respond directly to the RFP email and preserve the `Ref:ID` in the subject line.
* Attachment parsing (PDF/Excel) is out of scope for this prototype — can be added with OCR libraries in the future.
* Currently single‑tenant (no auth). Add an auth layer for multi‑user/enterprise deployments.

---

## Development Notes

* Interfaces and initial Mongoose schemas were scaffolded with AI assistance (Copilot / ChatGPT) to improve type safety between frontend and backend.
* To extend: add attachment parsing, tenant support, background job queue (e.g., BullMQ) for large volume email processing.

---

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes and open a PR

Please include tests for new backend logic (Jest + Supertest recommended).
