# AWS Cognito Setup Plan

Manual AWS console steps to enable backend + frontend auth flow.

## Prerequisites

- AWS account with permissions to create Cognito resources (IAM user or root)
- Region: `us-east-1` (change if needed; update `COGNITO_REGION` in backend/.env)
- No custom domain required (use Cognito auto-generated domain)

## Steps

### 1. Create Cognito User Pool

**AWS Console** → Cognito → User Pools → Create User Pool

**Name:** `impostor-user-pool` (or any name)

**Configure sign-up experience:**
- Sign-up options: `Email` (require email for login)
- Password policy: Standard (8+ chars, mixed case, numbers, symbols)
- MFA: Optional (skip for now)

**Configure message delivery:**
- Email provider: `Send email with Cognito` (default, no SES setup needed)

**Create user pool** → saves config

**Copy & note:**
- User Pool ID: `us-east-1_xxxxx` (format)
- This goes in `COGNITO_USER_POOL_ID` env var

---

### 2. Create Cognito Domain

**In User Pool** → App Integration → Domain Name

**Enter domain:** `impostor-dev-<random>` (e.g., `impostor-dev-a1b2c3d4`)
- AWS generates unique domain; replace `<random>` with something unique (timestamp/hash OK)

**Cognito domain:** Will be `https://impostor-dev-a1b2c3d4.auth.us-east-1.amazoncognito.com`

**Copy & note:**
- Domain: `impostor-dev-a1b2c3d4.auth.us-east-1.amazoncognito.com` (without https://)
- This goes in `COGNITO_DOMAIN` env var

---

### 3. Create App Client

**In User Pool** → App Integration → App Clients and Analytics → Create app client

**App client name:** `impostor-frontend` (or any name)

**Client type:** Public client (frontend only, no client secret)

**Authentication flows:**
- ✓ Authorization code grant (OAuth 2.0)
- ✓ Allow user password auth (optional, for testing)

**Allowed redirect URIs:**
```
http://localhost:3000/api/auth/callback
http://localhost:8080/auth/callback
https://yourdomain.com/api/auth/callback
```
(Add prod URLs later; localhost for dev)

**Allowed sign-out redirect URIs:**
```
http://localhost:8080
https://yourdomain.com
```

**Save** → App client created

**Copy & note from App Client Settings:**
- Client ID: `xxxxxxxxxxxxxxxxxxxxxx`
- This goes in `COGNITO_CLIENT_ID` env var (frontend + backend)
- **No client secret** (public client; don't check "Generate client secret")

---

### 4. Create App Client for Backend (with Secret)

**Repeat step 3** but for backend OAuth code exchange:

**App client name:** `impostor-backend` (or `-server`)

**Client type:** Confidential client (has secret)

**Authentication flows:**
- ✓ Authorization code grant

**Allowed redirect URIs:**
```
http://localhost:3000/api/auth/callback
https://yourdomain.com/api/auth/callback
```

**Save** → App client created

**Copy & note from App Client Settings:**
- Client ID: `xxxxxxxxxxxxxxxxxxxxxx`
- Client Secret: `xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Both go in backend `.env`:
- `COGNITO_CLIENT_ID` = this client ID
- `COGNITO_CLIENT_SECRET` = this secret
- `COGNITO_CALLBACK_URL` = `http://localhost:3000/api/auth/callback` (dev)

---

### 5. Configure Environment Variables

**Backend** (`packages/backend/.env`):
```
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxx
COGNITO_CLIENT_ID=<backend-app-client-id>
COGNITO_CLIENT_SECRET=<backend-client-secret>
COGNITO_DOMAIN=impostor-dev-abc123.auth.us-east-1.amazoncognito.com
COGNITO_CALLBACK_URL=http://localhost:3000/api/auth/callback
```

**Frontend** (`packages/frontend/.env.local` or `.env`):
```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```
(Frontend doesn't need Cognito env vars; backend proxies OAuth)

---

### 6. Test Sign-Up Flow

1. **Start backend** (`cd packages/backend && pnpm dev`)
2. **Open browser:** `http://localhost:3000/api/auth/login`
   - Redirects to Cognito Hosted UI
3. **Click "Create account"**
4. **Enter email + password, verify email** (check email inbox or SES console)
5. **After verification, log in** with same credentials
6. **Redirected to** `http://localhost:3000/dashboard` (backend callback, but frontend dashboard doesn't exist yet)
   - httpOnly cookies set (check DevTools → Application → Cookies)

---

### 7. Test Backend Protected Routes

```bash
# No cookies → 401
curl http://localhost:3000/api/games

# After login (cookies auto-sent by browser)
curl http://localhost:3000/api/games -X POST -H "Content-Type: application/json" -d '{"numberOfRounds": 3}'
# → 201 with gameId (or success response)
```

---

### 8. Test Full Frontend Flow

1. **Start backend + frontend** (`pnpm dev` in both)
2. **Open** `http://localhost:8080`
3. **Header shows "Login" button** (no auth cookie)
4. **Click "Login"** → redirected to Cognito
5. **Sign up / Log in**
6. **After Cognito callback** → redirected to `http://localhost:3000/dashboard`
   - Backend redirects to frontend dashboard (frontend doesn't exist yet)
   - Check: App.vue header shows user name + "Logout" button
7. **Click "Logout"** → clears cookies, redirects to home
8. **Header shows "Login" again**

---

## Prod Migration (Later)

1. Create separate Cognito domain / app clients for prod
2. Update env vars in prod deployment
3. Add prod callback URLs to Cognito app clients:
   - `https://yourdomain.com/api/auth/callback`
   - `https://yourdomain.com/auth/callback`
4. Add prod sign-out URLs:
   - `https://yourdomain.com`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Invalid client id" | Check `COGNITO_CLIENT_ID` in backend/.env matches app client |
| "Invalid redirect_uri" | Add exact URL (with protocol + path) to app client "Allowed redirect URIs" |
| "Email not verified" | Check email inbox (or Cognito sandbox SES config) for verification link |
| Cookies not set | Check backend response has `Set-Cookie` header; browser has `credentials: 'include'` |
| Socket auth rejects | Backend has `withCredentials: true`; cookies must arrive in handshake headers |
| CORS errors | Check backend CORS config allows frontend origin |

---

## Timeline

- Steps 1-5: ~15-20 min (manual console clicks)
- Step 6-7 test: ~10 min (email verification wait)
- Total: ~30 min for full dev flow
