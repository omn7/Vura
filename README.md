<div align="center">

# Vura

### Automate Certificate Generation at Scale

**Bulk-generate, digitally sign, and publicly verify certificates — in minutes, not hours.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vurakit.vercel.app-6366f1?style=for-the-badge)](https://vurakit.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## What is Vura?

Vura is a production-ready certificate automation platform built for event organizers, colleges, and communities. Upload an Excel sheet of participants and a PDF template — Vura generates hundreds of personalized, verifiable certificates instantly. Each certificate gets a unique ID and QR code that anyone can scan to confirm its authenticity.

> Built because manually generating and emailing certificates for events is a broken, error-prone process.

---

## Features

- **Bulk Generation** — Upload participant data via Excel (.xlsx) and map it to any PDF template. Generate hundreds of certificates in a single operation.
- **Public Verification** — Every certificate carries a unique Certificate ID and QR code. Anyone can verify authenticity instantly via a public URL — no login required.
- **Secure Storage** — Generated certificates are stored on AWS S3. Metadata (names, IDs, issue dates) is persisted in Neon PostgreSQL via Prisma ORM.
- **Organization Auth** — NextAuth.js with bcrypt password hashing protects organization dashboards and templates. Each org manages its own certificate issuance independently.
- **Email Delivery** — Certificates are automatically emailed to recipients via Nodemailer upon generation.
- **Animated UI** — Responsive frontend built with Tailwind CSS v4 and Framer Motion for smooth, polished interactions.
- **CI/CD Pipeline** — GitHub Actions workflow automates linting, building, and deployment on every push to `main`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Framer Motion |
| Auth | NextAuth.js v4 + Prisma Adapter + bcryptjs |
| ORM | Prisma 6 |
| Database | Neon PostgreSQL (serverless) |
| File Storage | AWS S3 (via AWS SDK v3) |
| PDF Generation | pdf-lib |
| QR Codes | qrcode |
| Excel Parsing | xlsx |
| Email | Nodemailer |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

---

## Architecture Overview

```
Excel Upload (.xlsx)
       │
       ▼
  Parse Rows  ──►  Map to PDF Template (pdf-lib)
       │
       ▼
 Generate Certificate
       │
       ├──► Assign unique Certificate ID
       ├──► Embed QR Code → links to /verify/[id]
       ├──► Upload to AWS S3
       ├──► Save metadata to Neon PostgreSQL (Prisma)
       └──► Email to recipient (Nodemailer)

Public Verification:
  /verify/[certificateId]  ──►  Query DB  ──►  Show certificate details
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- An AWS S3 bucket with IAM credentials
- A mail provider (SMTP/Gmail for Nodemailer)

### Installation

```bash
git clone https://github.com/omn7/Vura.git
cd Vura
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Database Setup

```bash
npx prisma migrate dev
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How It Works

1. **Register your organization** and log in via the secure dashboard.
2. **Upload your PDF template** — design it with placeholder fields for names, dates, etc.
3. **Upload an Excel sheet** with participant data (name, email, role, etc.).
4. **Map Excel columns** to template fields and click Generate.
5. Vura generates all certificates, uploads them to S3, saves records to the database, and emails each participant.
6. Recipients can **scan the QR code** on their certificate to verify it at `vurakit.vercel.app/verify/[id]`.

---

## Project Structure

```
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # API routes (auth, generate, verify)
│   └── (dashboard)/      # Protected org dashboard pages
├── components/           # Reusable UI components
├── lib/                  # Utilities (prisma client, s3, pdf, qr, mail)
├── prisma/               # Prisma schema and migrations
├── types/                # TypeScript type definitions
└── .github/workflows/    # CI/CD pipeline
```

---

## Live Demo

🔗 [vurakit.vercel.app](https://vurakit.vercel.app/)

---

## Author

**Om Narkhede** — [omnarkhede.tech](https://omnarkhede.tech) · [LinkedIn](https://linkedin.com/in/omnarkhede) · [@omn7](https://github.com/omn7)
