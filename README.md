 # Demo SaaS Billing

  A production-ready SaaS billing system built in a single session using [One Shot Ship](https://www.oneshotship.com).

  ## What This Is

  This repository demonstrates what OSS Dev Workflow produces: a complete Next.js 14 application with Stripe billing, Google OAuth, and subscription management—built from a single idea prompt.

  **Built with:**
  - `/oss:ideate` → Requirements extraction
  - `/oss:plan` → Architecture generation
  - `/oss:build` → TDD code generation
  - `/oss:ship` → Quality check & PR

  ## Quality Metrics

  | Metric | Value |
  |--------|-------|
  | Tests | 78+ |
  | Test-to-code ratio | 1.6:1 |
  | `any` types | **Zero** |
  | TypeScript | Strict mode |
  | CI/CD | GitHub Actions |

  ## Tech Stack

  - **Framework:** Next.js 14 (App Router)
  - **Auth:** NextAuth.js with Google OAuth
  - **Payments:** Stripe (subscriptions + one-time)
  - **Database:** PostgreSQL with Prisma ORM
  - **Language:** TypeScript (strict)
  - **Testing:** Jest + React Testing Library

  ## Features

  - Google OAuth authentication
  - Stripe subscription management
  - Usage-based billing support
  - Webhook handling for payment events
  - Middleware-based route protection
  - Subscription status checking

  ## Getting Started

  ### Prerequisites

  - Node.js 18+
  - PostgreSQL database
  - Stripe account
  - Google OAuth credentials

  ### Environment Variables

  ```bash
  cp .env.example .env

  Required variables:
  - DATABASE_URL - PostgreSQL connection string
  - NEXTAUTH_SECRET - Random secret for NextAuth
  - GOOGLE_CLIENT_ID - Google OAuth client ID
  - GOOGLE_CLIENT_SECRET - Google OAuth secret
  - STRIPE_SECRET_KEY - Stripe secret key
  - STRIPE_WEBHOOK_SECRET - Stripe webhook signing secret
  - STRIPE_PRICE_ID - Stripe price ID for subscription

  Installation

  npm install
  npx prisma migrate dev
  npm run dev

  Running Tests

  npm test

  Project Structure

  src/
  ├── app/                    # Next.js App Router
  │   ├── api/               # API routes (auth, Stripe)
  │   ├── app/               # Protected pages
  │   └── subscribe/         # Subscription page
  ├── components/            # React components
  ├── hooks/                 # Custom React hooks
  ├── lib/                   # Business logic
  ├── middleware.ts          # Auth & subscription checks
  └── types/                 # TypeScript definitions

  Learn More

  This project was built live using OSS Dev Workflow. Watch the demo:
  - https://www.oneshotship.com - The Claude Code plugin
  - https://www.oneshotship.com/#demo - See it built in real-time

  License

  MIT
  ```
