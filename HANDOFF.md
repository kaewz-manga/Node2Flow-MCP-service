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
| `plugins/gemini-rag/` | 4 files | Gemini RAG plugin: 12 tools, Gemini API client |
| `plugins/line/` | 4 files | LINE Bot plugin (official): 11 tools |
| `plugins/line-extended/` | 4 files | LINE Extended plugin: 25 tools, full LINE API |
| `plugins/telegram/` | 4 files | Telegram Bot plugin: 27 tools, Bot API client |
| `plugins/notion/` | 4 files | Notion plugin (official): 22 tools |
| `plugins/notion-extended/` | 4 files | Notion Extended plugin: 25 tools, full Notion API |
| `plugins/win-cli/` | 4 files | Windows CLI plugin: 9 tools, JSON-RPC proxy |
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
| MCP Gateway | `mcp.node2flow.net` | ✅ Live (198 tools: n8n 27 + WP 20 + cl-n8n-mcp 20 + Gemini 12 + LINE 11 + TG 27 + Notion 22 + Notion Ext 25 + LINE Ext 25 + Win CLI 9) |
| Dashboard | `app.node2flow.net` | ✅ Live (CF Pages) |
| D1: platform-db | `9c73d346-da37-4152-9572-8499a969b8fb` | ✅ 10 tables |
| D1: products-db | `d58d9176-0836-4e83-90d9-4450ca8b3bb9` | ✅ 1 table |
| KV: RATE_LIMIT_KV | `9a87f5a1d2a7413dba6f022976b7b874` | ✅ Dedicated (separated 2026-02-07) |
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

### Session 10-14: Additional Plugins + Fixes (2026-02-07/08)

- **Session 10**: Critical stats fix + per-product analytics (`9abdac6`)
- **Session 11**: Gemini RAG File Search plugin — 12 tools (`7274981`)
- **Session 12**: LINE Messaging API plugin — 25 tools (`1dccc89`)
- **Session 13**: Telegram Bot API plugin — 27 tools (`457cfd8`)
- **Session 14**: Notion REST API plugin — 25 tools (`ad6ef44`)
- **Gateway total**: 156 tools (n8n 27 + WordPress 20 + cl-n8n-mcp 20 + Gemini RAG 12 + LINE 25 + Telegram 27 + Notion 25)

### Session 15: shadcn/ui Dashboard Migration (2026-02-08)

Complete UI overhaul of the dashboard from custom `n2f-*` CSS classes to shadcn/ui components.

1. **shadcn/ui migration** (`132e742` + `f67753a`):
   - Cyan theme, medium radius — all 34+ plugin files + 11 platform pages + 7 admin pages
   - New UI components in `packages/dashboard-core/src/components/ui/`: Button, Card, Input, Select, Badge, Table, Dialog, Alert, Tabs, Tooltip, Separator, Label, Textarea, Progress, Sheet, Skeleton, Sidebar, Collapsible, DropdownMenu
   - Removed all custom `n2f-*` CSS classes from `index.css`

2. **Icon-collapsible sidebar** (`cfca4e0` + `5e106c2`):
   - `<Sidebar collapsible="icon">` — collapses to ~48px icon strip with tooltips
   - `<SidebarRail />` — thin rail to toggle expand/collapse
   - `<SidebarTrigger />` — header button + `Ctrl+B` keyboard shortcut
   - Plugin sections as collapsible dropdowns under "Services" group
   - User profile `<DropdownMenu>` in sidebar footer
   - AdminLayout with same pattern (Shield branding, 7 nav items)

3. **Bundle optimization** (part of `f67753a`):
   - `React.lazy()` for all platform + admin + plugin pages
   - `manualChunks` in Vite: vendor-react (36KB), vendor-radix (99KB), vendor-query (27KB), vendor-icons (46KB)
   - Main bundle: 717KB → 364KB (-49%), zero build warnings

4. **New dependencies**:
   - `@radix-ui/react-collapsible`, `@radix-ui/react-dropdown-menu` in dashboard-core
   - `use-mobile.tsx` hook for responsive sidebar behavior

### Session 16: Dashboard UX Polish (2026-02-08)

1. **Sidebar reorganization** (`a714715`):
   - Moved Usage, Settings from Platform group to user DropdownMenu
   - Moved Documentation, FAQ, Status from Resources group to user DropdownMenu
   - Moved Admin Panel to user DropdownMenu (admin only)
   - Platform nav = Dashboard only; removed Resources + Admin SidebarGroups
   - Cleaner sidebar: only Dashboard + Services (collapsible plugins)

2. **Field + InputGroup components** (`e9bf03b`):
   - New `packages/dashboard-core/src/components/ui/field.tsx` — Field, FieldLabel (with `optional` prop), FieldDescription, FieldError
   - New `packages/dashboard-core/src/components/ui/input-group.tsx` — InputGroup (shared border/focus ring), InputGroupInput, InputGroupAddon (icon container)
   - Applied to all 7 plugin Connections.tsx forms for consistent styling
   - Icons: Tag (name), Lock (passwords/tokens), Globe (URLs), User (username)

3. **Dashboard redesign with Services Status Grid** (`2f8067f`):
   - Replaced "Connections" stat card with "Services" (connected count / total plugins)
   - New Services Status Grid: 4-column grid of all plugins from registry
   - Each card: plugin icon + name + connection count + status dot (green = connected, muted = not)
   - Click card → navigate to plugin's Connections page
   - Auto-scales when new plugins are added to registry (reads from `plugins` array)
   - Connections list: shows all connections (not limited to 3), with plugin icon + product badge
   - Quick Start Guide: generic steps instead of plugin-specific

4. **shadcn v4 Field/InputGroup refactor** (`bd07087`):
   - Rewrote `field.tsx` and `input-group.tsx` to match actual shadcn/ui v4 source patterns
   - `cva` (class-variance-authority) for variant-based styling, `data-slot` attributes throughout
   - Field: `orientation` prop (vertical/horizontal), `FieldGroup` container, `FieldContent` wrapper
   - FieldLabel: `optional` prop with "(optional)" badge
   - FieldError: `errors` array prop with deduplication + single/list rendering
   - FieldDescription: auto-styled links (`[&>a]:text-primary`)
   - InputGroupAddon: `align` prop (inline-start/inline-end), click-to-focus behavior
   - InputGroupInput: uses `Input` component (borderless, no shadow)
   - New: `InputGroupButton` (action button inside group), `InputGroupText` (static text)
   - Added `data-slot="input"` to base Input component
   - All existing plugin imports remain compatible (additive exports only)

5. **data-invalid support** (`6ac8c0e`):
   - `<Field data-invalid>` triggers destructive (red) styling on all children automatically
   - FieldLabel: `group-data-[invalid]/field:text-destructive`
   - FieldDescription: `group-data-[invalid]/field:text-destructive`
   - Input: `aria-invalid:border-destructive aria-invalid:ring-destructive/20`
   - InputGroup: `group-data-[invalid]/field:border-destructive group-data-[invalid]/field:ring-destructive/20`

6. **UI component consolidation** (`e98373c`):
   - Moved badge, progress, table, avatar from `apps/dashboard/src/components/ui/` to `packages/dashboard-core/src/components/ui/`
   - Exported all 23 UI components from `dashboard-core/index.ts` (was only exporting Field + InputGroup)
   - Rewrote imports across 52 files from `@/components/ui/*` to `@node2flow/dashboard-core`
   - Deleted all 19 duplicate UI files from `apps/dashboard/src/components/ui/`
   - Single source of truth: all UI components now live only in `packages/dashboard-core/`

### Session 17: shadcn Toast, AlertDialog, Switch + Native HTML Replacement (2026-02-08)

1. **3 new shadcn components created** (`7ab1e28`):
   - `sonner.tsx` — Toast notifications (dark theme, replaces `alert()`)
   - `alert-dialog.tsx` — Confirmation dialogs (replaces `confirm()`)
   - `switch.tsx` — Toggle switch (replaces button toggles)
   - New deps: `sonner`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-switch`
   - `<Toaster />` added to Layout.tsx root

2. **68 `alert()` → `toast.success()`/`toast.error()`**:
   - 7 Connections.tsx (all plugins: n8n, wordpress, cl-n8n-mcp, gemini-rag, line, telegram, notion)
   - 6 n8n plugin pages: CredentialList, ExecutionList, WorkflowList, TagList, VariableList, N8nUserList
   - 2 admin pages: AdminUsers, AdminFeedback

3. **`confirm()` → AlertDialog**:
   - 7 Connections.tsx — delete connection, revoke API key
   - AdminUsers.tsx — delete user
   - Each uses state pattern: `deleteTarget` state → open dialog → confirm → execute

4. **9 native `<select>` → shadcn Select**:
   - AdminFeedback.tsx — status filter, category filter, status in modal (3)
   - AdminAnalytics.tsx — days filter, product filter (2)
   - AdminUsers.tsx — plan filter, status filter, plan change (3)
   - ExecutionList.tsx — status filter (1)
   - Used `"all"` as default value (shadcn Select doesn't allow empty string)

5. **Switch component**: AdminSystem.tsx — maintenance mode toggle button → Switch

6. **25 files changed**: 846 insertions, 217 deletions

### Session 18: Dashboard Page Visual Redesign (2026-02-08)

1. **Dashboard.tsx rewritten** with shadcn SectionCards pattern (`a39e53b`):
   - Gradient stat cards: `bg-gradient-to-t from-primary/5 to-card`
   - `CardDescription` (label) → `CardTitle` (big number) → `CardFooter` (icon + context)
   - 4 stats: Current Plan, Connected Services (x/7), Requests This Month, Success Rate

2. **Platform stats strip**: Inline `Users · Executions · Pass Rate` with vertical `Separator`s

3. **Services grid** (4 columns on desktop):
   - Each plugin card: icon + name + tagline + tool count + Connect/Manage button
   - Connected services: green left border (`border-l-4 border-l-emerald-500`) + "Connected" badge
   - `TOOL_COUNTS` map for displaying per-plugin tool counts

4. **Two-column layout**:
   - Left 2/3: Connections Table (`Table, TableHeader, TableBody, TableRow, TableCell`)
   - Right 1/3: Daily Rate Limit (Progress bar) + MCP Endpoint card (or Quick Start for new users)

5. **1 file changed**: 290 insertions, 222 deletions

6. **Full native HTML cleanup** (`31181dd`):
   - Replaced last 5 native `<button>` → shadcn `Button` across 3 files:
     - `FAQ.tsx` — accordion toggle → `Button variant="ghost"`
     - `WorkflowList.tsx` — workflow name link, status toggle, tag selector → `Button`
     - `ExecutionList.tsx` — execution ID link → `Button variant="link"`
   - **Zero native HTML elements remaining in entire dashboard**:
     - No `<button>`, `<input>`, `<textarea>`, `<select>`, `<label>`, `<table>`
     - No `alert()`, `confirm()`
     - Only semantic `<a href>` for mailto: and external links (correct usage)

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
│           ├── components/            # Layout, AdminLayout, AdminRoute, SudoModal, FeedbackBubble
│           │   └── ui/               # shadcn/ui: 26 components — Button, Card, Input, Select,
│           │                          #   Badge, Table, Dialog, Alert, AlertDialog, Tabs, Tooltip,
│           │                          #   Separator, Label, Textarea, Progress, Sheet, Skeleton,
│           │                          #   Sidebar, Collapsible, DropdownMenu, Sonner (Toast),
│           │                          #   Switch, Field, InputGroup, Popover, InputOTP, Avatar
│           ├── pages/                 # Login, Register
│           ├── hooks/                 # useSudo, use-mobile
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
│   │   │       ├── gemini-rag/      # 12 tools, Gemini API client
│   │   │       ├── line/            # 11 tools, LINE Bot (official)
│   │   │       ├── line-extended/   # 25 tools, LINE full API
│   │   │       ├── telegram/        # 27 tools, Telegram Bot API client
│   │   │       ├── notion/          # 22 tools, Notion (official)
│   │   │       ├── notion-extended/ # 25 tools, Notion full API
│   │   │       ├── win-cli/         # 9 tools, Windows CLI + SSH
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
│           │   ├── registry.ts        # Plugin registration (7 plugins)
│           │   ├── n8n/               # n8n plugin (7 pages + content)
│           │   ├── wordpress/         # WordPress plugin (6 pages + content)
│           │   ├── cl-n8n-mcp/        # cl-n8n-mcp plugin (5 pages + content)
│           │   ├── gemini-rag/        # Gemini RAG plugin (3 pages + content)
│           │   ├── line/              # LINE plugin (4 pages + content)
│           │   ├── telegram/          # Telegram plugin (4 pages + content)
│           │   └── notion/            # Notion plugin (4 pages + content)
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

**Total code written**: ~200+ files across 6 phases + 10 sessions
**Phase 6 added**: 34 new files (1 lib, 7 build configs, 2 API layers, 1 registry, 10 n8n plugin, 11 platform pages, 7 admin pages)
**Sessions 8-9**: WordPress + cl-n8n-mcp plugins (67 gateway tools)
**Sessions 11-14**: Gemini RAG + LINE + Telegram + Notion plugins (156 gateway tools total)
**Session 15**: Full shadcn/ui migration + icon-collapsible sidebar + bundle optimization
**Session 16**: Sidebar reorg + Field/InputGroup forms + Services Status Grid + shadcn v4 refactor + UI consolidation
**Session 17**: Toast/AlertDialog/Switch + replaced 68 alert(), 9 native select, confirm() across 25 files
**Session 18**: Dashboard visual redesign (SectionCards) + full native HTML cleanup (zero `<button>`/`<input>`/`<select>`/`alert()` remaining)
**Branding**: Rebranded from "n8n Management MCP" → "Node2Flow" across all pages (`f80107d`)
**Session 19**: Official Notion (22 tools) + LINE (11 tools) MCP, added Extended variants (25+25 tools)
**Session 20**: Windows CLI MCP plugin (9 tools) — 198 gateway tools total
**Deployed**: 2026-02-08 — Platform + Gateway + Dashboard all live
**Date**: 2026-02-09
