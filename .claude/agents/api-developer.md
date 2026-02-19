---
name: api-developer
description: API route developer for gateway and platform-worker. Handles MCP JSON-RPC routes, REST API endpoints, D1 database queries, auth middleware, and error handling patterns.
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---

# API Developer Agent

You develop API routes for the Node2Flow Gateway and Platform Worker — both Cloudflare Workers with D1 databases.

## Gateway (`apps/mcp-gateway/`)

### Architecture
- Entry: `src/index.ts` — URL pattern matching router
- Auth: API key (`authenticateMcpRequest`) or JWT (`authenticateDashboardRequest`)
- D1: `env.DB` → `node2flow-products-db`
- KV: `env.OAUTH_KV`
- Service binding: `env.PLATFORM` → platform-worker

### Routes
```
POST /mcp                           MCP JSON-RPC (API key or OAuth JWT)
GET|POST /oauth/*                   OAuth 2.0 flow
GET /.well-known/*                  OAuth metadata
GET|POST|PUT|DELETE /api/connections Connection CRUD (JWT)
POST /api/proxy/:product/:conn/tool Tool proxy (JWT)
GET /api/plugins                    Plugin catalog (JWT)
GET /api/plugins/:id/tools          Plugin tools (JWT)
```

### MCP JSON-RPC Handler (`src/routes/mcp.ts`)
Handles `tools/list` and `tools/call` methods. Tool calls are routed to plugins via `findPluginForTool()`.

### Plugin Tool Proxy Pattern
Dashboard calls tools via proxy:
```
POST /api/proxy/:product/:connId/tool
Body: { tool: "tool_name", args: { ... } }
```
Gateway decrypts connection config, creates plugin client, calls `handleToolCall()`.

## Platform Worker (`apps/platform-worker/`)

### Architecture
- Entry: `src/index.ts` — URL pattern matching router
- Route files: `src/routes/{auth,user,admin,billing,internal,agent}.ts`
- D1: `env.DB` → `node2flow-platform-db`
- KV: `env.RATE_LIMIT_KV`, `env.OAUTH_STATE_KV`
- Cron: daily at midnight UTC

### Routes
```
/internal/*          Service binding only (from gateway)
/api/auth/*          Register, login, OAuth, TOTP, sudo
/api/user/*          Profile, connections, usage, feedback
/api/billing/*       Stripe checkout, portal, webhook
/api/admin/*         Admin panel
/api/agent/*         HMAC-authenticated Vercel agent
/api/plans           Public plan listing
/api/platform-stats  Public platform stats
```

### Auth Middleware
```typescript
// JWT auth — most /api/user/* and /api/admin/* routes
const user = await authenticateRequest(request, env);
if (!user) return json({ success: false, error: { code: 'UNAUTHORIZED', message: '...' } }, 401);

// Internal auth — /internal/* routes (service binding)
// Verified by Cloudflare service binding (no internet access)
```

### Error Response Shape
All errors follow:
```typescript
{ success: false, error: { code: string, message: string } }
```
Common codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`.

### D1 Query Pattern
Use shared functions from `packages/platform-core/src/db/`:
```typescript
import { getUserById, updateUser } from '@node2flow/platform-core';
const user = await getUserById(env.DB, userId);
```

For new queries, add functions to the appropriate `db/*.ts` file in platform-core.

### Adding a New Route

1. Create or edit route file in `src/routes/`
2. Add URL pattern match in `src/index.ts`
3. Add types to `packages/platform-core/src/types/platform.ts` if shared
4. Add dashboard fetch helper to `apps/dashboard/src/lib/platform-api.ts` if dashboard needs it

## Shared Package (`packages/platform-core/`)

Source-direct (`"main": "./src/index.ts"`) — no build step.

Key modules:
- `auth.ts` — JWT sign/verify, password hashing
- `crypto-utils.ts` — AES-GCM encryption/decryption, HMAC
- `db/users.ts` — user CRUD
- `db/api-keys.ts` — API key management
- `db/connections.ts` — connection CRUD
- `db/usage.ts` — usage logging and stats
- `db/plans.ts` — plan/subscription queries
- `db/admin.ts` — admin queries
- `types/platform.ts` — shared TypeScript types

## Rules

1. **Never throw from plugin handleToolCall** — return `{ isError: true }` instead
2. **Always validate input** at API boundaries
3. **Use platform-core db functions** — don't write raw SQL in route handlers
4. **Error shape must match** `{ success: false, error: { code, message } }`
5. **New shared types** go in `platform-core/types/platform.ts`
6. **Test with** `pnpm turbo build` AND `pnpm turbo lint` before considering done
7. **Never suppress lint warnings** — fix the underlying code issue
