# AWS Cognito Auth Implementation Plan

> Related: `plan/GAME_PLAN_FINAL.md` §11 (Related Plans). This adds accounts on top of the currently-anonymous game architecture — touches the WebSocket gateway and game creation flow described there.

## Goal
Add user authentication to the Impostor game using AWS Cognito with login, sign-up, and password reset flows integrated across frontend (Vue) and backend (Fastify).

## Scope

### In
- AWS Cognito user pool setup and configuration
- Frontend: Login, sign-up, password reset pages and flows
- Backend: Auth endpoints integration with Cognito
- Session/token management (access token, ID token)
- Protected game routes (require authenticated users) — both REST (`/api/games/*`) and WebSocket (socket handshake auth, gates join/submit/vote/guess events)
- User profile association (user ID from Cognito → game player)

### Out
- Social login (Google, Facebook, etc.)
- Multi-factor authentication (MFA) beyond basic Cognito support
- User profile management UI (edit name, email, etc.)
- Admin user management dashboard
- Role-based access control (RBAC) beyond basic user/admin

## Approach

### Phase 1: AWS Cognito Setup
- Create Cognito User Pool
- Configure app client (implicit/auth code flow)
- Set up hosted UI or custom auth pages
- Configure password policy
- Create user pool domain (for hosted UI if used)
- Add password reset email template

### Phase 2: Backend Integration
- Install AWS SDK and auth libraries (`@aws-sdk/client-cognito-identity-provider`, `jose` for JWT verification)
- Add user table to SQLite schema
- Create user repository (to link Cognito user ID to game players)
- Create auth service (token validation, user lookup, OAuth code exchange)
- Create JWT verification middleware for Fastify
- Add protected route decorator/wrapper
- Implement `/api/auth/callback` endpoint (exchanges OAuth code for tokens, sets httpOnly cookie, redirects to frontend)
- Implement `/api/auth/me` endpoint (GET, returns current user from JWT cookie)
- Implement `/api/auth/refresh` endpoint (POST, refreshes access token via refresh token)
- Implement `/api/auth/logout` endpoint (POST, clears cookies, invalidates refresh token)
- Update existing game routes to require auth (check JWT cookie)
- Store refresh tokens in SQLite (new `refresh_tokens` table) for revocation — no Redis, no new infra dep, fits existing sqlite3 setup
- Verify JWT on Socket.IO handshake (`io.use()` middleware, read cookie from handshake headers) — reject connection if missing/invalid. Without this, REST auth is cosmetic since all real gameplay (join, submit, vote, guess) runs over `GameEventHandler`/`socket.gateway.ts`, not REST
- Design `Player` ↔ `users` linkage: on join, resolve `Player.id` (`PlayerId`) from authenticated `users.id` (Cognito sub) instead of ad-hoc name entry; decide whether one user can hold multiple concurrent `Player` instances (multi-tab) or is single-session

### Phase 3: Frontend Setup (Backend Proxy)
- Create auth store (Pinia) for user state (no token storage—server-side session via cookie)
- Create login button component that redirects to Cognito via backend
- Create logout button that calls `/api/auth/logout`
- Add router guards for protected routes (check if user is authenticated)
- Set up HTTP client with credentials: 'include' to send cookies on requests
- Create `/api/auth/refresh` call for token refresh (backend handles refresh token)
- Add user info endpoint call to get current user (backend provides user from JWT cookie)
- Initialize auth on app load (fetch `/api/auth/me` to populate store if session exists)

### Phase 4: Integration & Flow
- On app load: Check if user has valid session (from httpOnly cookie)
- If no session: Show login button
- Login button → redirects to Cognito Hosted UI (via backend redirect)
- After login: Cognito redirects to backend `/api/auth/callback?code=XXXX`
- Backend: exchanges auth code for tokens via Cognito token endpoint
- Backend: extracts user info from ID token, creates/updates user in SQLite
- Backend: sets httpOnly cookie with access token (refresh token kept server-side)
- Backend: redirects to frontend `/dashboard`
- Frontend: checks cookie on app load, shows dashboard if authenticated
- Token refresh: Frontend requests `/api/auth/refresh`, backend validates refresh token + sets new access token cookie
- On logout: Frontend calls `/api/auth/logout`, backend clears cookies + invalidates refresh token

### Phase 5: Testing & Validation
- Test sign-up via Cognito (email verification required)
- Test login flow (redirect to Cognito, callback handling)
- Test callback page exchange (auth code → tokens)
- Test protected routes (redirect to login if no cookie) — REST and WebSocket handshake both
- Test token auto-refresh (request with expired access token cookie, backend `/api/auth/refresh` issues new cookie)
- Test logout (cookies cleared, refresh token revoked server-side, Cognito session revoked)
- Test concurrent sessions (one user, multiple browser tabs - cookie shared per browser, refresh shouldn't race)
- Test cookie persistence (should survive page reload)
- Test invalid/expired cookie handling (backend rejects, frontend redirects to login)
- Test socket reconnect after token refresh (socket doesn't auto-pick-up new cookie until reconnect — verify behavior)

## Tech Details

### Backend Dependencies
```
@aws-sdk/client-cognito-identity-provider (OAuth code exchange, user lookup)
jose (JWT verification and parsing)
@fastify/cookie (httpOnly cookie support)
```

### Frontend Dependencies
```
(minimal—no auth library needed, backend handles OAuth)
pinia (state management for user info)
```

### Cognito Hosted UI Flow (Backend Proxy)
```
1. User clicks "Login" on frontend
2. Frontend redirects to: https://yourdomain.com/api/auth/login
3. Backend redirects to Cognito: https://your-domain.auth.us-east-1.amazoncognito.com/oauth2/authorize?
   - client_id=YOUR_CLIENT_ID
   - response_type=code
   - redirect_uri=https://yourdomain.com/api/auth/callback (backend URL!)
   - scope=openid email profile
   - state=<CSRF state>

4. User signs up/logs in on Cognito page
5. Cognito sends email verification link (if new user)
6. User verifies email, returned to Cognito login page
7. User logs in again (or completes login if already verified)
8. Cognito redirects to: https://yourdomain.com/api/auth/callback?code=XXXX&state=XXXX
9. Backend exchanges code for tokens (calls Cognito token endpoint)
10. Backend extracts user info, creates/updates user in SQLite
11. Backend sets httpOnly cookie with access token
12. Backend redirects to: https://yourdomain.com/dashboard
13. Frontend loads dashboard, user is authenticated (cookie present)
```

### Database Changes (SQLite)
Add users table to link Cognito user ID to game player info, plus a refresh_tokens table for revocation (SQLite, not Redis — no new infra dep):
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- Cognito sub (user ID)
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE TABLE refresh_tokens (
  token_hash TEXT PRIMARY KEY,            -- hash of refresh token, never store raw
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME
);
```

### Environment Variables

**Backend (.env)**
```
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxx
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxx
```

**Frontend (.env.local for dev)**
```
VITE_COGNITO_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxx (public client ID only)
VITE_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
VITE_APP_CALLBACK_URL=http://localhost:8080/auth/callback (dev) or https://yourdomain.com/auth/callback (prod)
```

**Note on Cognito Domain**: Request custom domain or use Cognito's auto-generated domain (e.g., `https://impostor-dev.auth.us-east-1.amazoncognito.com`)

### Cookie & CSRF Spec
- Access token cookie: `httpOnly`, `Secure`, `SameSite=Lax` (Lax survives the top-level Cognito redirect back; Strict would drop it), scoped to backend path
- `SameSite=Lax` alone doesn't stop CSRF on state-changing REST endpoints (cookie still auto-attaches on cross-site navigations) — add explicit CSRF check (double-submit token or custom header check) on mutating routes (`POST /api/games`, etc.), same as the OAuth `state` param protects the login redirect
- Socket.IO handshake: cookie arrives in handshake headers (same-origin, `credentials:true` already set in `main.ts` CORS config) — verify JWT in `io.use()` before allowing connection

## Architecture Changes

### Backend (`packages/backend/`)
- New file: `src/infra/adapters/auth/cognito.auth-service.ts` - OAuth code exchange, JWT verification, user lookup
- New file: `src/infra/middleware/jwt-auth.middleware.ts` - extract JWT from cookie, verify signature
- New file: `src/infra/adapters/websocket/socket-auth.middleware.ts` - verify JWT on socket handshake (`io.use()`), reject unauthenticated connections
- New file: `src/infra/adapters/persistence/sqlite/user.repository.ts` - user CRUD (link Cognito sub → game player)
- New file: `src/infra/adapters/persistence/sqlite/refresh-token.repository.ts` - store refresh tokens for revocation
- Update: `src/main.ts` - register @fastify/cookie plugin, register auth middleware, register cookie settings, wire socket auth middleware into `io.use()`
- Update: `src/infra/adapters/http/routes.ts` - add `/api/auth/login`, `/api/auth/callback`, `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout`
- Update: `src/infra/adapters/websocket/game-event.handler.ts` - resolve `Player.id` from authenticated user (`socket.data.userId`) instead of client-supplied name only

### Frontend (`packages/frontend/`)
- New folder: `src/features/auth/`
- New file: `src/features/auth/stores/auth.store.ts` (Pinia) - manages user info (tokens handled server-side)
- New file: `src/features/auth/composables/use-auth.ts` - login/logout logic (redirects to backend)
- New file: `src/core/http-client.ts` - HTTP client with credentials: 'include' for cookie transport
- Update: `src/router/index.ts` - add auth guards, redirect to login if not authenticated
- Update: `src/main.ts` - on app load, call `/api/auth/me` to populate user store if session exists
- Update: `App.vue` - show login button if not authenticated, dashboard if authenticated

## Risks & Blockers

- **Cognito setup**: Requires AWS account and domain configuration
- **Email verification**: Cognito sends verification emails automatically. No SES setup needed if using Cognito-hosted email.
- **CORS**: Backend proxy handles Cognito redirect, but frontend needs CORS for `/api/auth/*` calls (same origin, no CORS needed if frontend + backend on same domain)
- **Cookie security**: httpOnly cookies are immune to XSS but vulnerable if backend is compromised. Ensure CSRF protection via state parameter.
- **Refresh token storage**: Store hashed refresh tokens in SQLite (`refresh_tokens` table). Losing refresh tokens = user must re-login.
- **Token refresh race condition**: If multiple tabs refresh simultaneously, could create duplicate tokens. Use request deduplication or server-side token tracking.
- **Email verification UX**: User must verify email, then manually return to app and log in again (adds friction). Alternative: Cognito auto-login after verification (less common, check Cognito docs).

## Architecture Decision: Backend Proxy + httpOnly Cookies

**Why not Amplify + localStorage?**
- localStorage vulnerable to XSS attacks (any script on page can steal tokens)
- httpOnly cookies immune to JavaScript access, better security posture

**Backend proxy flow:**
1. Frontend redirects to `/api/auth/login` (backend endpoint)
2. Backend redirects to Cognito OAuth flow
3. Cognito redirects back to backend `/api/auth/callback` (not frontend)
4. Backend exchanges authorization code for tokens (client secret never exposed to frontend)
5. Backend sets httpOnly cookie with access token
6. Backend redirects frontend to dashboard (user already authenticated via cookie)
7. All subsequent requests include httpOnly cookie automatically
8. Frontend calls `/api/auth/refresh` when access token expires; backend updates cookie server-side

**Security benefits:**
- Client secret never exposed to browser
- Tokens never stored in frontend memory (can't be stolen via XSS)
- Refresh tokens stored server-side, never sent to frontend

**Trade-offs:**
- More backend complexity (OAuth code exchange logic)
- Backend must handle redirect URLs (no pure frontend-side flow)
- CSRF protection via state parameter required

## Success Criteria

- User can sign up with email/password via frontend
- User can log in with valid credentials
- Unauthenticated users redirected to login page when accessing game routes (REST and WebSocket)
- Authenticated users can create/join games (user ID resolved from session cookie, linked to `Player`)
- User can reset password via Cognito flow
- Access token travels only via httpOnly cookie — never exposed to frontend JS, never in localStorage
- Backend validates JWT (REST middleware + socket handshake) and rejects invalid/missing tokens
- Session persists across page refreshes (httpOnly cookie survives reload)
- User can log out (cookies cleared, refresh token revoked, redirected to login)
- Game player is linked to authenticated user

## Implementation Order

### Week 1 (Sprint)
1. **AWS Setup** (manual, ~30 min)
   - Create Cognito User Pool
   - Create App Client (OAuth 2.0 with auth code flow)
   - Add callback URL to App Client (localhost:8080/auth/callback)
   - Create Cognito Domain (or use auto-generated)
   - Test Cognito signup/login via hosted UI

2. **Backend** (~5-6 hours)
   - Add users table migration to SQLite
   - Add refresh_tokens table (for revocation)
   - Install dependencies (aws-sdk/client-cognito-identity-provider, jose, @fastify/cookie)
   - Create auth service (OAuth code exchange, JWT verification, user lookup)
   - Create JWT middleware for routes (extract + verify JWT from cookie)
   - Create socket auth middleware (`io.use()`, verify JWT from handshake cookie, reject if missing/invalid)
   - Create user repository (link Cognito sub → game player)
   - Create refresh token repository (store + revoke)
   - Implement `/api/auth/login` endpoint (redirects to Cognito)
   - Implement `/api/auth/callback` endpoint (exchanges code, sets httpOnly cookie, redirects to frontend)
   - Implement `/api/auth/me` endpoint (returns current user from JWT)
   - Implement `/api/auth/refresh` endpoint (validates refresh token, sets new access token)
   - Implement `/api/auth/logout` endpoint (clears cookies, invalidates refresh token)
   - Protect game routes (check JWT from cookie) — REST and socket handshake
   - Wire `Player.id` resolution from authenticated `socket.data.userId` in `game-event.handler.ts`
   - Add CSRF check (double-submit token or custom header) on mutating REST routes
   - Update game creation to link to authenticated user

3. **Frontend - Core** (~2 hours)
   - Create auth store (user info, loading states—no token storage)
   - Create auth composable (login/logout logic)
   - Create HTTP client with credentials: 'include' for cookie transport
   - Initialize auth on app load (call `/api/auth/me`)

4. **Frontend - UI** (~1.5 hours)
   - Create login button component (redirects to `/api/auth/login`)
   - Add router guards for protected routes (redirect to login if not authenticated)
   - Update App.vue to show login button or dashboard
   - Add logout button (calls `/api/auth/logout`)

5. **Integration & Testing** (~2 hours)
   - Test full sign-up → email verification → login flow
   - Test OAuth callback (code exchange, cookie setting, redirect)
   - Test httpOnly cookie persistence (survives page reload)
   - Test token auto-refresh (requests with expired token)
   - Test protected routes (backend validation)
   - Test logout (cookie cleared, refresh token revoked)
   - Test concurrent requests during token refresh
   - Fix edge cases (network errors, Cognito errors, clock skew)

**Total: ~11-13 hours of development + AWS setup time (backend-heavy vs frontend-heavy; revised up from original 9-10h estimate to cover socket handshake auth, `Player`↔`users` linkage, and CSRF, none of which were scoped originally)**