# GNOSIS Admin Authentication Architecture

This document describes the security model, session management, route protection, and operational procedures implemented in **Phase 3** for the Gnosis editorial platform.

---

## 1. Authentication Architecture

- **Engine:** Server-side stateless encrypted JWT sessions using [`jose`](https://github.com/panva/jose).
- **Password Security:** Salted cryptographic hashes using [`bcryptjs`](https://github.com/dcodeIO/bcrypt.js) with 12 rounds.
- **Runtime Isolation:** All authentication logic, password comparisons, and database lookups run strictly server-side (`import "server-only";`).
- **Protection Architecture:** Multi-layered defense consisting of Next.js Edge Middleware for rapid URL routing and Server Component Layout guards (`requireAdmin()`) for deep database authorization checks.

---

## 2. User & Admin Model

Defined in `prisma/schema.prisma`:
```prisma
enum UserRole {
  ADMIN
  EDITOR
}

model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  role         UserRole  @default(ADMIN)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([email])
}
```

---

## 3. Session Strategy

- **Cookie Name:** `gnosis_admin_session`
- **Lifespan:** 8 hours (standard working editorial shift).
- **Security Flags:**
  - `httpOnly: true` (inaccessible to browser JavaScript / XSS defense).
  - `secure: true` in production (enforced over HTTPS).
  - `sameSite: "lax"` (mitigates Cross-Site Request Forgery).
  - `path: "/"`
- **Token Invalidation:** Triggered immediately upon calling `destroySession()` / logout.

---

## 4. Route Protection Strategy

1. **Edge Middleware (`middleware.ts`):**
   - Intercepts all `/admin/:path*` requests before rendering.
   - Unauthenticated visitors attempting to access `/admin` or nested routes are redirected to `/admin/login`.
   - Logged-in administrators attempting to access `/admin/login` are redirected to `/admin`.
   - Public routes (`/`, `/world`, `/us`, `/technology`, etc.) are completely unaffected.
2. **Server-Side Layout Guard (`app/admin/(dashboard)/layout.tsx`):**
   - Runs `await requireAdmin()`.
   - Re-verifies user existence and `isActive === true` from the database.
   - Blocks deactivated users immediately even if they hold a valid cookie.

---

## 5. Environment Configuration

Placeholders defined in `.env.example`:
```bash
# Generate a strong 32+ character random secret (e.g., openssl rand -base64 32)
AUTH_SECRET="your-32-character-random-secret-key-here"

# Initial Administrator Credentials (for development seeding)
ADMIN_EMAIL="admin@gnosis.news"
ADMIN_PASSWORD="change-this-secure-password"
```

---

## 6. Development Setup & Seeding

### 1. Run Migration:
```bash
npx prisma migrate deploy
```

### 2. Seed Initial Admin Account:
```bash
npm run db:seed
```
This generates the initial active administrator account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` hashed with 12 salt rounds.

### 3. Log In to Dashboard:
1. Navigate to `/admin/login`.
2. Enter the configured administrator email and password.
3. Upon success, you are redirected into the `/admin` dashboard.
4. Clicking "Sign Out" destroys the session cookie and redirects back to `/admin/login`.

---

## 7. Security Best Practices Observed

- **Account Enumeration Defense:** Form validation returns a uniform generic error (`"Invalid email or password."`) regardless of whether the email was not found, the account is inactive, or the password was incorrect.
- **Zero Plaintext Storage:** Plaintext passwords are never stored, logged to terminal, or exposed in API responses.
- **Client Bundle Isolation:** `User.passwordHash` is never passed to client components.
