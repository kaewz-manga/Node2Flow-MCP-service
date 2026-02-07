# HANDOFF - Node2Flow MCP Service

> Centralized Platform + Plugin Architecture for multiple SaaS MCP products.

**Repo**: https://github.com/kaewz-manga/Node2Flow-MCP-service
**Local**: `D:\Dev\playground\Claude_Code_Commander\Node2Flow-MCP-service\`
**Source of truth**: `D:\Dev\playground\Claude_Code_Commander\n8n-management-mcp\` (original, untouched)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Dashboard (Single SPA)           app.node2flow.net                      │
│  Sidebar: [Overview] [n8n] [WordPress] [Make] [Admin]                    │
└────────────────────────────┬─────────────────────┬───────────────────────┘
                             │ JWT                  │ JWT
              ┌──────────────┴────────┐  ┌─────────┴──────────────────┐
              │  Platform Worker      │  │  MCP Gateway Worker        │
              │  platform.n2f.net     │  │  mcp.node2flow.net         │
              │                       │  │                            │
              │  /api/auth/*          │  │  POST /mcp (JSON-RPC 2.0)  │
              │  /api/user/*          │  │  /api/connections (CRUD)   │
              │  /api/billing/*       │  │  /api/proxy/:product/*     │
              │  /api/admin/*         │  │                            │
              │  /api/agent/*  (HMAC) │  │  plugins/                  │
              │  /internal/*          │◄─┤    n8n/     (31 tools)     │
              │                       │  │    wordpress/ (future)     │
              │  D1: platform-db      │  │    make/     (future)      │
              │  KV: rate-limits      │  │                            │
              └───────────────────────┘  │  D1: products-db           │
                                         └────────────────────────────┘
```

**2 Workers** (ไม่ว่าจะมีกี่ product):
- **Platform Worker** - auth, billing, user management, rate limits, usage tracking
- **MCP Gateway Worker** - MCP tools ทุก product เป็น plugin, connections CRUD

**Service Binding**: Gateway → Platform (0ms latency, internal-only)

---

## Migration Progress

| Phase | Description | Status | Commit |
|-------|-------------|--------|--------|
| **Phase 1** | Monorepo skeleton (Turborepo + pnpm) | Done | `12bbc4b` |
| **Phase 2** | Extract shared code → `packages/` | Done | `a694762` |
| **Phase 3** | Refactor into Plugin Architecture | Done | `296f3c1` |
| **Phase 4** | Build Platform Worker with all routes | Done | `0091d5c` |
| **Phase 5** | Data migration + switchover | Done | `2d11b46` |
| **Phase 6** | Dashboard SPA build | Done | `858d92e` |

---

## What's Done (Phase 1-5)

### packages/platform-core (shared library)

Extracted from `n8n-management-mcp/src/` — all platform-level code:

| Module | Lines | Contents |
|--------|-------|----------|
| `auth.ts` | ~794 | Register, login, JWT, API key auth, TOTP, sudo |
| `crypto-utils.ts` | ~504 | PBKDF2, AES-256-GCM, JWT, TOTP, API key generation |
| `oauth.ts` | ~364 | GitHub + Google OAuth 2.0 flows |
| `stripe.ts` | ~296 | Checkout, billing portal, Stripe webhooks |
| `email.ts` | ~319 | Resend API integration, email templates |
| `db/` | ~1,525 | 6 modules: users, plans, api-keys, usage, connections, admin |
| `types/platform.ts` | ~285 | All TypeScript interfaces (PlatformEnv, User, Plan, etc.) |

### apps/platform-worker (Central auth/billing)

| Route File | Lines | Endpoints |
|------------|-------|-----------|
| `auth.ts` | 264 | register, login, OAuth, TOTP setup/enable/disable, sudo, plans (public), platform-stats (public) |
| `user.ts` | 349 | profile, password, session-duration, export (JSON/CSV), delete/recover/force-delete, API keys, AI connections, bot connections, feedback, usage |
| `admin.ts` | 202 | stats, users CRUD, analytics (usage/tools/top-users/revenue/errors), feedback mgmt, system controls (recalculate, clear-logs, full-reset, maintenance) |
| `billing.ts` | 54 | Stripe checkout, portal, webhook |
| `internal.ts` | 196 | validate-api-key, validate-token, report-usage, check-limits (service binding only) |
| `agent.ts` | 93 | HMAC-authenticated config endpoints for Vercel agent |
| `index.ts` | 140 | Main router + CORS + maintenance check + cron (log cleanup, account deletion) |

**D1 Schema**: `migrations/001_platform_schema.sql` — 10 tables (users, plans, api_keys, usage_logs, usage_monthly, platform_stats, admin_logs, ai_connections, bot_connections, feedback)

### apps/mcp-gateway (MCP tools as plugins)

| File | Lines | Purpose |
|------|-------|---------|
| `index.ts` | 201 | Main router: MCP endpoint + Dashboard API + proxy |
| `routes/auth.ts` | 163 | API key auth via Platform service binding + JWT verify |
| `routes/mcp.ts` | 168 | JSON-RPC 2.0 handler: initialize, tools/list, tools/call, ping |
| `routes/connections.ts` | 226 | Unified connection CRUD with AES-256-GCM encryption |
| `plugin-registry.ts` | 41 | Plugin registration + tool discovery |
| `plugins/n8n/` | 4 files | Full n8n plugin: 27 tools, HTTP client, types |
| `plugins/wordpress/` | 4 files | WordPress plugin: 20 tools, REST API client |
| `plugins/cl-n8n-mcp/` | 4 files | cl-n8n-mcp proxy plugin: 20 tools, JSON-RPC client |
| `plugins/_template/` | 1 file | Template for new plugins |

**D1 Schema**: `migrations/001_unified_connections.sql` — 1 table (connections with `product_type` column)

**MCP Request Flow**:
```
1. POST /mcp + Bearer n2f_xxx
2. Gateway → Platform /internal/validate-api-key (service binding)
3. Platform returns: user_id, plan, connection_id, usage
4. Gateway queries connections WHERE id = connection_id
5. Decrypt config → plugin.createClient(config)
6. plugin.handleToolCall(toolName, args, client)
7. Return MCP response
8. ctx.waitUntil → Platform /internal/report-usage
```

### packages/dashboard-core (shared React components)

Extracted from `n8n-management-mcp/dashboard/`:

| Component | Description |
|-----------|-------------|
| `AuthContext` | JWT auth state management |
| `SudoContext` | TOTP verification state |
| `ConnectionContext` | Connection selection state |
| `Layout` | Sidebar + main layout with dark theme |
| `AdminLayout` | Admin panel layout |
| `AdminRoute` | Protected admin route component |
| `SudoModal` | TOTP verification modal |
| `FeedbackBubble` | Floating feedback widget |
| `Login` / `Register` | Auth pages |
| `useSudo` | Sudo verification hook |
| `lib/api.ts` | Configurable API layer (`configureApi`, `platformRequest`, `gatewayRequest`) |

### scripts/ (Data Migration)

| File | Purpose |
|------|---------|
| `migrate-data.sql` | SQL to copy platform tables from old DB → platform-db |
| `migrate-connections.ts` | TypeScript Worker to re-encrypt n8n connections → unified format |

---

## What's Done (Phase 6)

### Phase 6: Dashboard SPA Build

1. **Dashboard API split** (Done):
   - `packages/dashboard-core/src/lib/api.ts` — configurable API layer with `configureApi({ platformUrl, gatewayUrl })`
   - `apps/dashboard/src/lib/platform-api.ts` — Platform Worker API (~40 functions)
   - `apps/dashboard/src/lib/gateway-api.ts` — Gateway Worker API (connections + n8n proxy)

2. **Dashboard plugin system** (Done):
   - `apps/dashboard/src/plugins/registry.ts` — Plugin registry with `DashboardPlugin` interface
   - `apps/dashboard/src/plugins/n8n/` — 7 pages + 3 components (lazy-loaded)
   - Layout accepts `plugins` prop for dynamic sidebar navigation
   - Each plugin: icon, expandable sidebar, connection selector per product

3. **Full page migration** (Done):
   - 11 platform pages: Landing, Dashboard, Usage, Settings, AuthCallback, AccountDeleted, Terms, Privacy, FAQ, Documentation, Status
   - 7 admin pages: AdminOverview, AdminUsers, AdminAnalytics, AdminRevenue, AdminHealth, AdminFeedback, AdminSystem
   - App.tsx with ProtectedRoute, PublicRoute, SmartRoute wrappers

4. **Build verification** (Done):
   - TypeScript: `tsc --noEmit` passes with 0 errors
   - Vite build: 1810 modules, 3.56s, all plugin pages code-split
   - dashboard-core also passes TypeScript check independently

### Deployment (Done - 2026-02-07)

All infrastructure deployed and verified:

| Resource | URL / ID | Status |
|----------|----------|--------|
| Platform Worker | `platform.node2flow.net` | ✅ Live |
| MCP Gateway | `mcp.node2flow.net` | ✅ Live (67 tools: n8n 27 + WP 20 + cl-n8n-mcp 20) |
| Dashboard | `app.node2flow.net` | ✅ Live (CF Pages) |
| D1: platform-db | `9c73d346-da37-4152-9572-8499a969b8fb` | ✅ 10 tables |
| D1: products-db | `d58d9176-0836-4e83-90d9-4450ca8b3bb9` | ✅ 1 table |
| KV: RATE_LIMIT_KV | `45d5d994b649440ab34e4f0a3a5eaa66` | ✅ Reused |
| KV: OAUTH_STATE_KV | `a65a07688d774d56bb915cf9e961881a` | ✅ New |
| OAuth (GitHub/Google) | redirect URIs updated | ✅ |
| Secrets | JWT_SECRET, ENCRYPTION_KEY, OAuth, Resend | ✅ Fresh keys |

**Deployment commit**: `a38af50`

**Issues fixed during deployment**:
1. OAuth redirect URI path: `/api/auth/oauth/{provider}/callback` (not `/callback/{provider}`)
2. `APP_URL` secret must be set to `https://app.node2flow.net` for OAuth redirect
3. Dashboard crash: `usage.connections` undefined (connections live in Gateway DB, not Platform DB)

**Data**: Fresh start, no migration from old system. New ENCRYPTION_KEY + JWT_SECRET.

### Session 8: Multi-Product Plugin Refactor + WordPress Plugin (2026-02-07)

1. **Dashboard pages plugin-driven** (`c638672`):
   - Extracted n8n-specific content from 4 global pages (Dashboard, Landing, Documentation, FAQ)
   - Created `PluginContent` interface in registry with tagline, features, FAQ, docs, etc.
   - Each plugin provides content via `content.tsx` — global pages read from registry
   - Adding new product = create content file, no need to touch global pages

2. **WordPress plugin added** (`258a8a3`):
   - **Gateway**: `plugins/wordpress/` — 20 MCP tools (posts, pages, media, comments, categories, tags, users, site info)
   - **Dashboard**: `plugins/wordpress/` — Connections page (with Application Password auth), Posts, Pages, Media, Comments pages
   - **Content**: WordPress-specific landing, docs, FAQ content
   - **Gateway total**: 47 tools (n8n 27 + WordPress 20), verified via `GET mcp.node2flow.net/`

3. **Plugin system proven**:
   - Sidebar shows both n8n Management + WordPress sections
   - Each section has its own connection selector + sub-pages
   - FAQ page merges generic categories + plugin-specific categories
   - Documentation tools tab fetches from all plugins dynamically

### Session 9: cl-n8n-mcp Plugin (2026-02-07)

1. **cl-n8n-mcp proxy plugin added** (`f31c02a`):
   - **Gateway**: `plugins/cl-n8n-mcp/` — Proxy plugin that forwards tool calls to cl-n8n-mcp server via JSON-RPC 2.0
   - **Client**: `ClN8nMcpClient` sends `POST {mcp_url}/mcp` with `tools/call` method, Bearer auth, optional `x-n8n-url`/`x-n8n-key` headers
   - **20 tools**: 7 documentation (search_nodes, get_node, validate_node, templates, validate_workflow) + 13 management (workflow CRUD, autofix, test, deploy_template, versions)
   - **Tool prefix**: All names prefixed `mcp_` (e.g., `mcp_search_nodes`) to avoid conflicts with existing n8n plugin
   - **Dashboard**: Connections page (MCP URL, auth token, optional n8n URL + API key), Node Explorer, Templates, Workflow Tools pages
   - **Gateway total**: 67 tools (n8n 27 + WordPress 20 + cl-n8n-mcp 20)

2. **Unique architecture**: Unlike n8n/WordPress plugins that call APIs directly, cl-n8n-mcp plugin PROXIES to an external MCP server. The `handleToolCall` strips `mcp_` prefix and forwards via JSON-RPC.

### What's Left

1. **Stripe integration** - Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET, update webhook URL
2. **Lightning payment** - Plan ready, needs Neutron API key (see lightning-plan.md in memory)
3. **Custom domain for old system** - `n8n-management-mcp.node2flow.net` still live separately
4. **WordPress pages** - PostList/PageList/MediaList/CommentList are placeholder pages (MCP tool guidance only)
5. **cl-n8n-mcp pages** - NodeExplorer/Templates/WorkflowTools are placeholder pages

---

## Data Split

### Platform DB (platform-db)

| Table | Rows From | Notes |
|-------|-----------|-------|
| users | Direct copy | All fields including TOTP, OAuth |
| plans | Seeded | free, pro, enterprise |
| api_keys | Direct copy | `connection_id` is cross-DB reference (no FK) |
| usage_logs | Direct copy | 90-day retention via cron |
| usage_monthly | Direct copy | Aggregated monthly stats |
| platform_stats | Direct copy | total_users, total_executions, total_successes |
| admin_logs | Direct copy | Admin action audit log |
| ai_connections | Direct copy | BYOK AI provider keys |
| bot_connections | Direct copy | Telegram/LINE bot configs |
| feedback | Direct copy | User feedback |

### Gateway DB (products-db)

| Table | Rows From | Notes |
|-------|-----------|-------|
| connections | Transformed from `n8n_connections` | `product_type='n8n'`, config re-encrypted as JSON |

**Migration**: Old `n8n_connections` (separate `n8n_url` + encrypted `api_key`) → unified `connections` (encrypted JSON `{"api_url":"...","api_key":"..."}` + `product_type`)

---

## Key Design Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **2 Workers** | Platform + Gateway | Platform is stable, Gateway changes per product |
| **Plugin Architecture** | 4 files per product | Add product without touching core code |
| **Unified connections** | 1 table, `product_type` column | No new tables per product |
| **Encrypted JSON config** | AES-256-GCM | Each product defines own config schema |
| **Service Binding** | Gateway → Platform | 0ms latency, not internet-facing |
| **API key scope** | 1 key = 1 connection | Key leak affects only 1 connection |
| **Pooled billing** | Plan covers all products | 100 req/day = shared across n8n + WP + etc. |
| **JWT SSO** | Shared secret between Workers | Login once, access all products |

---

## Adding a New Product

Create 4 files + 1 line:

```
apps/mcp-gateway/src/plugins/new-product/
├── index.ts    → Plugin registration (metadata + tools + handler)
├── tools.ts    → MCP tool definitions
├── client.ts   → HTTP client for target API
└── types.ts    → Connection config schema
```

Then in `plugin-registry.ts`:
```typescript
import { newProductPlugin } from './plugins/new-product';
PLUGINS.set('new-product', newProductPlugin);
```

No changes needed to: MCP protocol handler, auth, connections CRUD, rate limiting, billing, dashboard shell.

---

## File Tree

```
Node2Flow-MCP-service/
├── turbo.json                          # Turborepo config
├── pnpm-workspace.yaml                 # pnpm workspaces
├── tsconfig.base.json                  # Shared TS config
├── package.json                        # Root package
│
├── packages/
│   ├── platform-core/                  # @node2flow/platform-core
│   │   └── src/
│   │       ├── auth.ts                 # Auth (register, login, JWT, TOTP, sudo)
│   │       ├── crypto-utils.ts         # Crypto (PBKDF2, AES-GCM, HMAC)
│   │       ├── oauth.ts               # OAuth (GitHub, Google)
│   │       ├── stripe.ts              # Stripe (checkout, portal, webhook)
│   │       ├── email.ts               # Email (Resend API)
│   │       ├── db/                    # D1 database operations (6 modules)
│   │       ├── types/platform.ts      # All TypeScript interfaces
│   │       └── index.ts               # Barrel export
│   │
│   └── dashboard-core/                # @node2flow/dashboard-core
│       └── src/
│           ├── contexts/              # AuthContext, SudoContext, ConnectionContext
│           ├── components/            # Layout, AdminRoute, SudoModal, etc.
│           ├── pages/                 # Login, Register
│           ├── hooks/                 # useSudo
│           └── index.ts              # Barrel export
│
├── apps/
│   ├── platform-worker/               # Central auth/billing Worker
│   │   ├── migrations/               # D1 schema (10 tables)
│   │   ├── src/
│   │   │   ├── index.ts              # Main router + cron
│   │   │   ├── types.ts              # Env interface
│   │   │   ├── helpers.ts            # CORS, response helpers
│   │   │   └── routes/               # auth, user, admin, billing, internal, agent
│   │   └── wrangler.toml
│   │
│   ├── mcp-gateway/                   # MCP Gateway Worker (all products)
│   │   ├── migrations/               # D1 schema (1 table: connections)
│   │   ├── src/
│   │   │   ├── index.ts              # Main router
│   │   │   ├── types.ts              # Env, Plugin, Connection interfaces
│   │   │   ├── plugin-registry.ts    # Plugin registration
│   │   │   ├── routes/               # auth, mcp, connections
│   │   │   └── plugins/
│   │   │       ├── n8n/              # 27 tools, HTTP client
│   │   │       ├── wordpress/        # 20 tools, REST API client
│   │   │       ├── cl-n8n-mcp/      # 20 tools, JSON-RPC proxy
│   │   │       └── _template/        # New plugin template
│   │   └── wrangler.toml
│   │
│   └── dashboard/                     # Single SPA (Phase 6)
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── src/
│           ├── main.tsx               # Entry: configureApi() + render
│           ├── App.tsx                # Routing + providers
│           ├── index.css              # Tailwind + n2f theme
│           ├── vite-env.d.ts          # Vite type declarations
│           ├── lib/
│           │   ├── platform-api.ts    # Platform Worker API (~40 functions)
│           │   └── gateway-api.ts     # Gateway Worker API (connections + proxy)
│           ├── plugins/
│           │   ├── registry.ts        # Plugin registration (n8n + WordPress + cl-n8n-mcp)
│           │   ├── n8n/               # n8n plugin (7 pages + content)
│           │   ├── wordpress/         # WordPress plugin (6 pages + content)
│           │   └── cl-n8n-mcp/        # cl-n8n-mcp plugin (5 pages + content)
│           └── pages/
│               ├── Landing.tsx ... Status.tsx   # 11 platform pages
│               └── admin/             # 7 admin pages
│
├── scripts/
│   ├── migrate-data.sql              # Platform data migration SQL
│   └── migrate-connections.ts        # Connection re-encryption script
│
└── docs/
    └── PLATFORM_PLAN.md              # Full architecture plan
```

---

## Critical Warnings

- **ENCRYPTION_KEY**: Fresh key ใหม่ (ไม่ได้ใช้ key เดิมจาก n8n-management-mcp)
- **JWT_SECRET**: ใช้ key เดียวกัน shared ระหว่าง Platform + Gateway
- **APP_URL**: ต้องตั้ง secret `APP_URL=https://app.node2flow.net` บน Platform Worker (OAuth redirect)
- **API key prefix**: `n2f_` (old `saas_` keys ไม่ทำงาน)
- **Original repo**: `n8n-management-mcp` ยังทำงานปกติ ไม่ได้แก้อะไร deploy แยกกัน
- **OAuth callback path**: `/api/auth/oauth/{provider}/callback` (ไม่ใช่ `/callback/{provider}`)

---

## Quick Reference

```bash
# Monorepo root
cd D:\Dev\playground\Claude_Code_Commander\Node2Flow-MCP-service

# Original (still running, untouched)
cd D:\Dev\playground\Claude_Code_Commander\n8n-management-mcp

# Git
git log --oneline                    # See all phases
git diff <hash1>..<hash2> --stat    # Compare phases

# Future deployment
wrangler d1 create node2flow-platform-db
wrangler d1 create node2flow-products-db
wrangler d1 migrations apply --remote   # In each app/
wrangler secret put JWT_SECRET          # In each app/
wrangler deploy                         # In each app/
```

---

**Total code written**: ~100 files across 6 phases + 3 plugin sessions
**Phase 6 added**: 34 new files (1 lib, 7 build configs, 2 API layers, 1 registry, 10 n8n plugin, 11 platform pages, 7 admin pages)
**Session 8**: Multi-product refactor + WordPress plugin (2 commits)
**Session 9**: cl-n8n-mcp proxy plugin (`f31c02a`) — 67 total gateway tools
**Branding**: Rebranded from "n8n Management MCP" → "Node2Flow" across all pages (`f80107d`)
**Deployed**: 2026-02-07 — Platform + Gateway + Dashboard all live
**Date**: 2026-02-07
