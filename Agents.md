# AI Agent Repository Rules (`Agents.md`)

This file contains the strict architectural, structural, and coding guidelines for the `e-com` monorepo. **All AI agents operating within this repository MUST adhere to these rules without exception.** Do not write "just works" code; write scalable, production-grade code following the established patterns below.

## 1. Monorepo Structure
- **Package Manager:** `pnpm` workspaces.
- **Packages:**
  - `packages/backend`: Node.js / Express backend.
  - `packages/user-frontend`: React / Vite user-facing web app.
  - `packages/admin-frontend`: React admin dashboard.
  - `packages/shared`: Shared TypeScript types and Zod schemas.
- **Rule:** Never duplicate types or validation schemas between frontend and backend. Always define them in `packages/shared`, export them, and import them into the respective packages (e.g., `import { userRegistrationSchema } from "@e-com/shared/schemas"`).

## 2. Backend Architecture (`packages/backend`)
The backend is a strictly typed Node.js/Express application using Mongoose. It follows a multi-tier architecture: **Routes → Middlewares → Controllers → Services → Data Models**.

### 2.1 Dependency Injection (DI)
- **Rule:** Controllers must not be instantiated as raw classes. They MUST be created via factory functions that accept their dependencies as arguments.
- **Example:** `export const authControllerCreator = (authServices: IAuthService, loginLimiter: RateLimiter, tokenService: TokenServiceInterface) => { ... }`
- **Rule:** Services should be defined as classes implementing strict TypeScript interfaces (e.g., `class TokenService implements TokenServiceInterface`).

### 2.2 Logging & Request Context (`ctx`)
- **Rule:** DO NOT use `console.log`.
- **Rule:** Every incoming request must construct a `RequestContext` (`ctx`) containing a Pino logger instance (`req.log.child({ route })`), IP, Device Info, and Request ID.
- **Rule:** This `ctx` MUST be passed down to EVERY service method. Logging inside services must use `ctx?.logger?.info()`, `ctx?.logger?.warn()`, etc.

### 2.3 Error Handling
- **Rule:** Never throw raw string errors.
- **Rule:** Use the custom `ApiError` class for all expected HTTP errors (e.g., `throw new ApiError(401, "Invalid credentials")`). Handled by the global Express error middleware via `next(error)`.
- **Rule:** Domain-specific errors should have custom classes (e.g., `JWTError`).

### 2.4 Authentication & Security
- **Rule:** JWT tokens must be utilized. Access Tokens (short-lived) in JSON response; Refresh Tokens (long-lived) in `HttpOnly`, `Secure`, `SameSite` cookies.
- **Rule:** **Strict Refresh Token Rotation and Reuse Detection** must be enforced. If a session is valid but the refresh token in the DB does not match the hashed incoming token, assume compromise and revoke *all* sessions for that user.
- **Rule:** Hash sensitive tokens (like Refresh Tokens) via `crypto` before storing in the database.
- **Rule:** Use Rate Limiting on public, sensitive endpoints (e.g., Login).

## 3. Frontend Architecture (`packages/user-frontend`)
The frontend is a modern React SPA using Vite, Tailwind CSS, and DOM Routing.

### 3.1 Routing & Data Fetching
- **Rule:** Use `react-router-dom` v6+ Data APIs (`createBrowserRouter`, `LoaderFunctionArgs`, `ActionFunctionArgs`).
- **Rule:** Minimize the use of `useEffect` for data fetching. Data mutations must be handled by Route `action` functions (e.g., form submissions using `request.formData()`).
- **Rule:** State related to form submissions should be read via `useActionData()` and `useNavigation().state` (for loading indicators).

### 3.2 HTTP Client API Integration
- **Rule:** DO NOT use `axios`. DO NOT use native `fetch` directly in components or actions.
- **Rule:** Most external API calls MUST go through the custom `fetchClient` utility located at `@/http/fetchClient`.
- 

### 3.3 Components & Styling
- **Rule:** Use tailwindcss classes strictly configured in the project.
- **Rule:** UI primitives (Button, Input, FieldLabel) belong in `@/components/ui/` and must be utilized instead of raw HTML elements.
- **Rule:** Page-specific logic and specialized components belong in `src/features/`. Actual route endpoint files go in `src/pages/`.

## 4. Code Quality & Standards
- **Rule:** Use explicit type definitions. Avoid `any` unless absolutely necessary (and document why if used).
- **Rule:** Stick to `const` and `let`.
- **Rule:** All endpoints and data inputs MUST be validated at the boundary using `Zod` before processing.
