# 🚀 Welcoming All Vura Contributors !

Thank you for your interest in contributing to **Vura**—our open-source SaaS platform designed for high-performance, bulk certificate generation and verification. 

Vura is an official project for **GirlScript Summer of Code (GSSoC) 2026**. This one-page document contains everything you need to set up your environment, follow our UI guidelines, and successfully get your Pull Requests merged.

Contributor Recognition: We value your effort! Once your Pull Request is successfully merged into the repository, your name will be featured on our Contributor Wall, and you will be issued a digital certificate of contribution for your work on Vura.

---

## 📑 Quick Navigation
* [📋 GSSoC '26 Rules](#-gssoc-26-rules)
* [💻 Tech Stack & Design Rules](#-tech-stack--design-rules)
* [⚙️ 5-Step Local Setup](#️-5-step-local-setup)
* [✅ Pull Request Checklist](#-pull-request-checklist)

---

## 📋 GSSoC '26 Rules

To ensure a smooth workflow and avoid chaotic review cycles, we enforce these repository guidelines strictly:

* **Issue Assignment First:** Look through the open repository issues. Comment on the issue you wish to work on. **Do not write code until a Project Admin or Mentor explicitly assigns it to you.**
* **3-Day PR SLA:** Once an issue is assigned, you have exactly **3 days** to submit your Pull Request. If you need an extension, ask in the comments; otherwise, it will be reassigned to keep development moving.
* **No Unsolicited PRs:** Pull Requests opened without an associated, assigned issue will be closed automatically with zero point allocation. 

---

## 💻 Tech Stack & Design Rules

Vura has a highly intentional, minimalist production design layer. Submissions that break our core style rules or slow down database operations will not be accepted.

### 🛠️ Technical Baseline
* **Framework:** Next.js 14+ (App Router setup utilizing strict TypeScript types).
* **Styling:** Tailwind CSS integrated with Framer Motion for animations.
* **Database Layer:** MongoDB Atlas / PostgreSQL.

### 🎨 UI/UX & Formatting Guidelines
* **The Aesthetics:** We favor clean **Bento Grid** structures and ultra-clean whitespace. Do not introduce chaotic layouts or busy components.
* **Color Integrity:** Use Vura's established design token rules. Our core aesthetic is built around professional **teal-green gradients**. Do not introduce random hex codes or default Tailwind primary hues (like standard blues, purples, or neon accents) unless explicit UI issues ask for them.
* **Strict Code Quality:** Avoid using the `any` type fallback in TypeScript. Ensure every component is modular, typed, and cleanly destructured.
* **Database Overhead:** Optimize your asynchronous logic and database queries. Avoid triggering infinite re-renders that hammer API routes or generate loose, unindexed database fetches.

---

## ⚙️ 5-Step Local Setup

Make sure you have Node.js installed on your machine before beginning the environment configuration.

### 1. Fork & Clone
Fork the repository to your personal profile, then clone your fork locally:
```bash
git clone [https://github.com/omn7/vura.git](https://github.com/omn7/vura.git)
cd vura
