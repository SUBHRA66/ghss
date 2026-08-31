# Authentication & Authorization Architecture (Microservices)

This document outlines the centralized authentication ideology, architecture, and implementation plan for the **GHSS** microservices platform.

---

## 1. Architectural Principles

1. **Centralized Authority, Decentralized Verification**:
   - `services/auth` is the sole service responsible for issuing, refreshing, and revoking credentials.
   - Downstream microservices (`services/students`, `services/classes`, etc.) verify tokens **locally** without making inter-service network calls.
2. **Asymmetric Cryptography (RS256 / Ed25519)**:
   - **Private Key**: Kept exclusively in `services/auth` to sign JWT access tokens.
   - **Public Key**: Shared with all downstream microservices to verify cryptographic signatures.
3. **Defense-in-Depth via HttpOnly Cookies**:
   - Access and refresh tokens are stored in `HttpOnly`, `SameSite`, and `Secure` cookies.
   - JavaScript running in the browser cannot access the tokens, eliminating token theft via Cross-Site Scripting (XSS).
4. **Edge Routing via NGINX**:
   - NGINX serves as the single entry point, path-routing requests to backend services under the same origin domain.
   - Because all services share the origin, the browser automatically attaches relevant cookies to requests routed by NGINX.
5. **Actor Scope**:
   - Currently scoped to **Admins** (stored in the `admins` table via `@ghss/database`).

---

## 2. High-Level System Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Client (Browser)       │
                                  └──────────────┬──────────────┘
                                                 │ HTTP Requests with Cookies
                                                 │ (access_token, refresh_token)
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │             NGINX Proxy               │
                             │  /api/auth/*      -> :3001 (auth)     │
                             │  /api/students/*  -> :3002 (students) │
                             └───────┬───────────────────────┬───────┘
                                     │                       │
           Forward with Cookies      │                       │ Forward with Cookies
                                     ▼                       ▼
                         ┌───────────────────────┐   ┌───────────────────────┐
                         │     services/auth     │   │   services/students   │
                         │   (:3001 - NestJS)    │   │   (:3002 - NestJS)    │
                         ├───────────────────────┤   ├───────────────────────┤
                         │ • Login / Logout      │   │ • Extracts cookie     │
                         │ • Refresh Token       │   │ • Verifies signature  │
                         │ • Private Key (Signs) │   │   via PUBLIC KEY      │
                         │ • Password Hashing    │   │   (0 inter-service    │
                         │   (argon2id)          │   │    network overhead)  │
                         └───────────────────────┘   └───────────────────────┘
```

---

## 3. Cookie & Token Strategy

| Cookie Name | Expiry | Path | Content | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`access_token`** | 15 minutes | `/` | RS256 JWT (`sub`, `email`, `name`) | Sent on all requests; verified locally by microservices using the Public Key. |
| **`refresh_token`** | 7 days | `/api/auth/refresh` | Opaque cryptographically random token (or hashed UUID) | Restricted to the refresh endpoint; used to renew expired access tokens. |

### Cookie Security Attributes
- `httpOnly: true` — Inaccessible to `document.cookie` (mitigates XSS).
- `secure: true` — Sent only over HTTPS (in production environments).
- `sameSite: 'lax'` (or `'strict'`) — Defends against Cross-Site Request Forgery (CSRF).
- `path: '/api/auth/refresh'` on `refresh_token` ensures long-lived credentials are never exposed to downstream microservices.

---

## 4. End-to-End Request Lifecycles

### 4.1 Admin Login (`POST /api/auth/login`)
1. Client posts `{ email, password }` to `/api/auth/login`.
2. `services/auth` queries `Admin` from database using [`PrismaService`](file:///home/rocket/ghss/packages/database/src/prisma.service.ts).
3. Verifies password against `hash` using `argon2id`.
4. Signs `access_token` using the **Private Key** with payload:
   ```json
   {
     "sub": "admin-uuid",
     "email": "admin@ghss.edu",
     "name": "Super Admin",
     "role": "ADMIN",
     "iat": 1756660000,
     "exp": 1756660900
   }
   ```
5. Generates a cryptographically random `refresh_token` and stores its hash in database/Redis with expiry.
6. Returns `200 OK` with response headers:
   ```http
   Set-Cookie: access_token=<jwt>; HttpOnly; Path=/; SameSite=Lax; Max-Age=900
   Set-Cookie: refresh_token=<token>; HttpOnly; Path=/api/auth/refresh; SameSite=Lax; Max-Age=604800
   ```

### 4.2 Protected Microservice Call (`GET /api/students`)
1. Browser sends `GET /api/students` with `Cookie: access_token=...`.
2. NGINX proxies request to `services/students`.
3. Downstream NestJS `JwtAuthGuard` (from `@ghss/common-auth`):
   - Extracts `access_token` from the incoming `Cookie` header.
   - Verifies the signature using the embedded **Public Key**.
   - Validates `exp` (expiration timestamp).
   - Injects the authenticated payload into `req.user`.
4. Controller executes business logic immediately with zero network latency.

### 4.3 Silent Token Refresh (`POST /api/auth/refresh`)
1. When `access_token` expires, microservices reject requests with `401 Unauthorized`.
2. Frontend interceptor catches `401` and invokes `POST /api/auth/refresh`.
3. Browser automatically includes `Cookie: refresh_token=...` (due to path restriction).
4. `services/auth` verifies the refresh token against the stored session:
   - If valid, rotates the refresh token (issues a new refresh token and invalidates the old one).
   - Issues a fresh `access_token` cookie.
5. Frontend transparently retries the original request.

### 4.4 Admin Logout (`POST /api/auth/logout`)
1. Client invokes `POST /api/auth/logout`.
2. `services/auth` deletes/invalidates the refresh token record in the database.
3. Responds with cleared cookies:
   ```http
   Set-Cookie: access_token=; HttpOnly; Path=/; Max-Age=0
   Set-Cookie: refresh_token=; HttpOnly; Path=/api/auth/refresh; Max-Age=0
   ```

---

## 5. Monorepo Structure & Package Design

```
ghss/
├── packages/
│   ├── database/                  # Prisma models (Admin, Student, etc.)
│   └── common-auth/               # Shared NestJS Authentication & Authorization Library
│       ├── src/
│       │   ├── decorators/
│       │   │   ├── current-admin.decorator.ts  # Parameter decorator: @CurrentAdmin()
│       │   │   └── public.decorator.ts         # Metadata decorator: @Public()
│       │   ├── guards/
│       │   │   └── jwt-auth.guard.ts           # Global/Route Guard extracting from cookie
│       │   ├── strategies/
│       │   │   └── jwt.strategy.ts             # Passport JWT strategy with Public Key
│       │   ├── extractors/
│       │   │   └── cookie.extractor.ts         # Utility to extract JWT from req.cookies
│       │   ├── keys/
│       │   │   └── public.key.ts               # Public key or env loader
│       │   └── common-auth.module.ts
│       └── package.json
└── services/
    ├── auth/                      # Central Auth Authority
    │   ├── src/
    │   │   ├── auth.controller.ts # /login, /refresh, /logout, /me
    │   │   ├── auth.service.ts    # Argon2 hashing, private key token generation
    │   │   └── keys/              # Private & Public key configuration
    │   └── package.json
    └── students/                  # Domain Microservice
        ├── src/
        │   ├── students.controller.ts # Protected by JwtAuthGuard
        │   └── app.module.ts          # Imports CommonAuthModule
        └── package.json
```

---

## 6. Security Considerations

1. **Private Key Protection**:
   - The Private Key must never be committed to Git or packaged inside shared libraries.
   - Injected into `services/auth` via environment variables (`JWT_PRIVATE_KEY`) or Docker/Kubernetes secrets.
2. **CSRF Mitigation**:
   - Using `SameSite=Lax` or `SameSite=Strict` blocks standard cross-origin form/fetch attacks.
   - For state-mutating requests (`POST`, `PUT`, `DELETE`), requiring custom headers (e.g., `X-Requested-With` or `X-GHSS-Client: web`) prevents basic HTML form submissions.
3. **Password Security**:
   - Hashing with `argon2id` (memory-hard, resistant to GPU/ASIC cracking).
4. **Session Invalidation**:
   - If an admin account is deactivated (`isActive: false`), the refresh token session is immediately deleted, preventing token renewals past the remaining 15-minute access token window.

---

## 7. Implementation Roadmap

- [ ] **Step 1: Key Generation**: Generate RSA key pair (2048/4096-bit RS256) or Ed25519 keys.
- [ ] **Step 2: Shared Library (`@ghss/common-auth`)**:
  - Implement cookie extractor for `passport-jwt`.
  - Implement `JwtStrategy` configured with Public Key and RS256 algorithm.
  - Implement `@CurrentAdmin()` and `@Public()` decorators.
- [ ] **Step 3: Auth Service (`services/auth`)**:
  - Implement `argon2` password hashing and verification.
  - Implement `/login`, `/refresh`, `/logout`, and `/me` endpoints.
  - Implement refresh token storage and rotation logic.
- [ ] **Step 4: Microservices Integration**:
  - Register `CommonAuthModule` in `services/students` and future microservices.
  - Protect controllers and test token verification.
- [ ] **Step 5: NGINX Configuration**:
  - Configure reverse proxy routing and ensure cookie pass-through headers are enabled.
