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
              │  /api/user/*          │  │  /oauth/* (OAuth 2.1)      │
              │  /api/billing/*       │  │  /api/connections (CRUD)   │
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
| `index.ts` | 230 | Main router: OAuth + MCP endpoint + Dashboard API + proxy |
| `routes/oauth.ts` | 460 | OAuth 2.1 Authorization Server (PKCE, Dynamic Client Registration, Google/GitHub) |
| `routes/auth.ts` | 186 | API key + JWT auth, OAUTH_REQUIRED signaling |
| `routes/mcp.ts` | 230 | JSON-RPC 2.0 handler with dual auth (API key + OAuth JWT) |
| `routes/connections.ts` | 226 | Unified connection CRUD with AES-256-GCM encryption |
| `plugin-registry.ts` | 41 | Plugin registration + tool discovery |
| `plugins/n8n/` | 4 files | n8n plugin: 27 tools, HTTP client |
| `plugins/wordpress/` | 4 files | WordPress plugin: 20 tools, REST API |
| `plugins/cl-n8n-mcp/` | 4 files | cl-n8n-mcp proxy: 20 tools, JSON-RPC |
| `plugins/gemini-rag/` | 4 files | Gemini RAG: 12 tools, Gemini API |
| `plugins/line/` | 4 files | LINE: 25 tools, LINE Messaging API |
| `plugins/telegram/` | 4 files | Telegram: 27 tools, Bot API |
| `plugins/notion/` | 4 files | Notion: 25 tools, Notion REST API |
| `plugins/notion-official/` | 4 files | Notion Official: 22 tools, VPS proxy |
| `plugins/line-official/` | 4 files | LINE Official: 12 tools, VPS proxy |
| `plugins/playwright/` | 4 files | Playwright: 22 tools, VPS proxy |
| `plugins/google-workspace/` | 4 files | Google Workspace: 54 tools, VPS proxy |
| `plugins/slack/` | 4 files | Slack: 38 tools, Slack Web API |
| `plugins/_template/` | 1 file | Template for new plugins |

**D1 Schema**: `migrations/001_unified_connections.sql` — 1 table (connections with `product_type` column)

**MCP Request Flow (API Key — single connection)**:
```
1. POST /mcp + Bearer n2f_xxx
2. Gateway → Platform /internal/validate-api-key (service binding)
3. Platform returns: user_id, plan, connection_id, scope, usage
4. Gateway queries connections WHERE id = connection_id
5. Decrypt config → plugin.createClient(config)
6. plugin.handleToolCall(toolName, args, client)
7. Return MCP response
8. ctx.waitUntil → Platform /internal/report-usage
```

**MCP Request Flow (API Key — `_all` scoped)**:
```
1. POST /mcp + Bearer n2f_xxx (connection_id='_all')
2. Gateway → Platform /internal/validate-api-key (service binding)
3. Platform returns: user_id, plan, connection_id='_all', scope, usage
4. Gateway sets connectionId=null (like OAuth path)
5. tools/list: queries all active connections → filter by scope
6. tools/call: finds plugin → checks scope → resolves connection by user_id + product_type
7. Return MCP response
8. ctx.waitUntil → Platform /internal/report-usage
```

**MCP Request Flow (OAuth JWT)**:
```
1. POST /mcp + Bearer eyJhbG... (JWT from OAuth flow)
2. Gateway verifies JWT signature + expiry (shared JWT_SECRET)
3. Gateway → Platform /internal/get-user-usage
4. JWT may contain mcp_scope (from API key selected during OAuth login)
5. tools/list: queries ALL user's active connections → filter by scope
6. tools/call: finds plugin → checks scope → resolves connection by user_id + product_type
7. Decrypt config → plugin.createClient(config) → handleToolCall
8. Return MCP response
9. ctx.waitUntil → Platform /internal/report-usage
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
| MCP Gateway | `mcp.node2flow.net` | ✅ Live (304 tools across 12 plugins) |
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

### Sessions 19-22: Visual Redesign + Color Polish (2026-02-08)

- **Session 19**: Complete visual redesign of ALL 37 pages (gradient stat cards, feature grids)
- **Session 20**: Connections Table+Alert+Item redesign + real brand logos (SimpleIcons CDN)
- **Session 21**: 3-dot DropdownMenu actions + Edit Connection Name dialog on all 7 plugins
- **Session 22**: Color polish (green buttons, gray 2FA card, white Enable button) + Settings Tabs + OAuth provider logos

### Sessions 23-28: 2FA UX + Button Polish + Delete Account (2026-02-09)

- **Sessions 23-24**: 2FA complete overhaul — Switch toggle, InputOTP, disable verifies TOTP code
- **Session 25**: shadcn v4 component update (7 components) + admin test accounts
- **Session 26**: Brand logos in sidebar + all connection pages (SimpleIcons CDN)
- **Session 27**: OAuth avatar (Google picture/GitHub avatar_url + Gravatar fallback) + dashboard blue gradient card + green buttons everywhere (14 files)
- **Session 28**: 2FA alert `statusLoaded` fix + outline Add Connection buttons + Terms links + type "delete" to confirm account deletion

### Sessions 29-31: Docker/VPS Plugins + Domain Migration + Google Workspace (2026-02-09/10)

- **Session 29**: Notion Official (22 tools, `noff_` prefix) + LINE Official (12 tools, `loff_` prefix)
  - Plugin types: In-Worker vs Docker/VPS (mcp-http-bridge v2)
  - Multi-tenant: per-request tokens via `x-service-token` headers
  - Worker secret auth for cl-n8n-mcp: `CL_N8N_MCP_AUTH_TOKEN`
- **Session 30**: Playwright plugin (22 tools, `pw_` prefix) + VPS domain migration to node2flow.net
  - SaaS services: `*.node2flow.net` (old missmanga.org routes kept)
- **Session 31**: Google Workspace plugin (54 tools, `gws_` prefix) via gemini-cli-extensions/workspace
  - 9 services: Docs(8), Drive(4), Calendar(7), Gmail(9), Chat(8), Sheets(4), Slides(5), People(3), Time(3)
  - Docker: port 3016, git clone + build (private npm, Apache 2.0)
  - **Connections UX fix**: Removed MCP URL + Auth Token fields from all 4 Docker/VPS plugins
    - Gateway hardcodes VPS URLs, auth tokens stored as Worker secrets
    - Users only provide: Name (all), Notion Token, LINE Channel Token + User ID
  - **Total**: 266 tools across 11 plugins

### Session 32: WordPress + cl-n8n-mcp Dashboard Pages (2026-02-10)

1. **Gateway proxy fix** (`744626f`):
   - Added `POST /api/proxy/:product/:conn/tool` handler for explicit tool calls
   - Body: `{ tool: "wp_list_posts", args: { per_page: 10 } }` — explicit tool name instead of path-based guessing
   - Added MCP result unwrapping: parses `content[0].text` JSON → returns clean data to dashboard
   - Fixed `createClient(config)` → `createClient(config, env)` to pass env for VPS URL vars

2. **Dashboard API layer** (`gateway-api.ts`):
   - New `toolProxy()` generic helper: `POST /api/proxy/:product/:conn/tool`
   - `wpCall()` + 16 WordPress functions: listPosts, getPost, createPost, updatePost, deletePost, listPages, getPage, createPage, updatePage, deletePage, listMedia, deleteMedia, listComments, createComment, updateComment, deleteComment + listWpCategories, listWpTags, listWpUsers, getWpSiteInfo
   - `mcpCall()` + 9 cl-n8n-mcp functions: searchMcpNodes, getMcpNode, validateMcpNode, searchMcpTemplates, getMcpTemplate, deployMcpTemplate, validateMcpWorkflow, autofixMcpWorkflow, testMcpWorkflow

3. **4 WordPress pages** (full rewrite from placeholders):
   - **PostList**: Stat cards (Total/Published/Drafts/Last Modified), expand/collapse list, create dialog (title+content+status), edit dialog, delete with ConfirmDialog
   - **PageList**: Same CRUD pattern, status badges (publish/draft), parent page display
   - **MediaList**: Media type icons (image/video/audio/file), image preview on expand, file size display, delete
   - **CommentList**: Approve/Hold/Spam status actions, create comment (post ID + content + author), author/email display

4. **3 cl-n8n-mcp pages** (full rewrite from placeholders):
   - **NodeExplorer**: Search input → results list → expand for full node details (version, group, properties, credentials) + JsonViewer
   - **Templates**: Search → template list → expand for details (nodes used, views, author) → Deploy dialog with custom name
   - **WorkflowTools**: 3 sections — Validate (paste JSON), Auto-Fix (by workflow ID), Test (by ID + optional data JSON)

5. **Shared components**: All 7 pages import `JsonViewer` and `ConfirmDialog` from n8n plugin's components

6. **wrangler update**: v3.105.0 → v4.63.0 across all 3 apps + VPS MCP URLs moved to `[vars]` in wrangler.toml (`fbce152`)

### VPS MCP Servers (Docker/VPS plugins)

| Container | Port | URL | Type |
|-----------|------|-----|------|
| n8n-mcp-dynamic | 3011 | n8n-mcp-dynamic.node2flow.net | Streamable HTTP |
| notion-mcp-official | 3013 | notion-mcp-official.node2flow.net | HTTP bridge |
| line-mcp-official | 3014 | line-mcp-official.node2flow.net | HTTP bridge + chromium |
| playwright-mcp | 3015 | playwright-mcp.node2flow.net | HTTP bridge + chromium |
| google-workspace-mcp | 3016 | google-workspace-mcp.node2flow.net | HTTP bridge (git clone + build) |

All containers: 512MB mem_limit, mcp-http-bridge.mjs, AUTH_TOKEN env.

### Gateway Worker Secrets

| Secret | Purpose |
|--------|---------|
| JWT_SECRET | JWT verification (shared with Platform Worker) |
| ENCRYPTION_KEY | AES-256-GCM config encryption |
| GOOGLE_CLIENT_ID | Google OAuth (MCP Gateway) |
| GOOGLE_CLIENT_SECRET | Google OAuth (MCP Gateway) |
| GITHUB_CLIENT_ID | GitHub OAuth (MCP Gateway) |
| GITHUB_CLIENT_SECRET | GitHub OAuth (MCP Gateway) |
| CL_N8N_MCP_AUTH_TOKEN | cl-n8n-mcp VPS auth |
| NOTION_OFFICIAL_MCP_AUTH_TOKEN | Notion Official VPS auth |
| LINE_OFFICIAL_MCP_AUTH_TOKEN | LINE Official VPS auth |
| PLAYWRIGHT_MCP_AUTH_TOKEN | Playwright VPS auth |
| GOOGLE_WORKSPACE_MCP_AUTH_TOKEN | Google Workspace VPS auth |

### Plugin Architecture

| Type | Plugins | How it works |
|------|---------|-------------|
| **In-Worker** (8) | n8n, wordpress, cl-n8n-mcp, gemini-rag, line, telegram, notion, slack | Custom code calls REST API directly |
| **Docker/VPS** (4) | notion-official, line-official, playwright, google-workspace | Proxy to MCP packages via mcp-http-bridge |
| **Hybrid** | cl-n8n-mcp | In-Worker code but proxies to VPS MCP server |

### Session 33: Playwright Testing + Bug Fixes (2026-02-10)

Tested all 7 new pages (Session 32) with Playwright browser automation. Found and fixed 4 bugs:

1. **cl-n8n-mcp `mcpUrl` undefined** — `createClient()` had no env fallback for connection configs missing `mcp_url`
   - Fix: Added `CL_N8N_MCP_URL` to wrangler.toml `[vars]` + types.ts + index.ts fallback chain: `config.mcp_url || env.CL_N8N_MCP_URL || hardcoded`

2. **Templates crash on load** — `getTemplateName(null)` called by Dialog content (renders even when `open=false`)
   - Fix: `t.name` → `t?.name` null safety

3. **Templates empty search results** — API returns `{items: [...]}` but code checked `templates/results/workflows`
   - Fix: Added `data.items` to parse chain

4. **PostList crash on load** — Same Dialog null pattern: `getTitle(null)` called by ConfirmDialog
   - Fix: `post.title` → `post?.title` null safety

**Test Results**: All 7 pages verified working (NodeExplorer search+detail, Templates search+deploy, WorkflowTools 3 sections, PostList/PageList/MediaList/CommentList all render with stat cards). WordPress pages show "Invalid URL" error because no WordPress connection exists for test user — expected behavior.

**Known**: Playwright logo 404 from SimpleIcons CDN (`cdn.simpleicons.org/playwright/2EAD33`) — cosmetic only.

**Lesson**: Dialog/ConfirmDialog content renders even when `open={false}`. Always use `?.` for helper functions that receive nullable state from Dialog props.

Commit: `5bdb1dd`

### Session 34: Fix n8n "Unknown Tool" + Variable Tools (2026-02-10)

n8n dashboard pages (workflows, executions, tags, variables, users) all showed "Unknown tool" errors.

**Root cause**: `n8nProxy()` used legacy path-based proxy that generated tool names like `n8n_workflows` instead of the correct `n8n_list_workflows`. The n8n plugin was the first plugin built — before `toolProxy()` existed — so it still used the old pattern.

**Fix**: Replaced `n8nProxy()` with `n8nCall()` using `toolProxy()` with explicit tool names (same pattern as `wpCall()`/`mcpCall()`).

**New tools**: Added 4 variable tools to gateway: `n8n_list_variables`, `n8n_create_variable`, `n8n_update_variable`, `n8n_delete_variable` (tools.ts + client.ts + index.ts). n8n total: 27 → 31 tools.

**Note**: n8n/variables returns 403 on Community Edition (requires paid license) — not our bug.

**Audit**: Checked all 11 plugins — only n8n had the legacy proxy issue.

Commit: `1c2de6c`

### Session 35: Fix Cross-Plugin Connection Scoping (2026-02-10)

All sidebar sub-pages showed errors when navigating between plugins because `useConnection()` returned a global active connection regardless of plugin type.

**Root cause**: `useConnection()` in ConnectionContext.tsx returns `activeConnection` without product_type filtering. When user has an n8n connection active and navigates to WordPress pages, WordPress code uses the n8n connection config (which has no `site_url`) → `Invalid URL: undefined/wp-json/wp/v2/posts`.

**Fix**: Created `usePluginConnection(productType)` hook:
```typescript
export function usePluginConnection(productType: string) {
  const { connections, activeConnection } = useConnection();
  if (activeConnection?.product_type === productType) return activeConnection;
  return connections.find(c => c.product_type === productType) || null;
}
```

**Files changed (29)**:
- `packages/dashboard-core/src/contexts/ConnectionContext.tsx` — new hook
- `packages/dashboard-core/src/index.ts` — export
- 24 sub-pages across all 11 plugins → `usePluginConnection` instead of `useConnection`
- 3 Playwright logo URLs → `playwright.dev/img/playwright-logo.svg` (was 404 from SimpleIcons)
- Dashboard.tsx TOOL_COUNTS n8n: 27 → 31

**Verification**: 28 pages tested via Playwright — 12 OK, 15 "No connection selected" (correct), 1 expected n8n 403. Zero errors.

Commit: `2ff48fb`

### Session 36: Gemini RAG + Telegram + Notion Dashboard Pages (2026-02-10)

**Removed n8n variable tools** — All 4 variable operations (list/create/update/delete) return 403 on Community Edition (paid license required). Removed from gateway (tools.ts, client.ts, index.ts), dashboard (VariableList.tsx deleted, sidebar removed), and gateway-api.ts. n8n tools: 31 → 27.

Commit: `d51be8b`

**Implemented 8 functional dashboard pages** for 3 plugins (replacing static placeholders):

| Plugin | Page | Features |
|--------|------|----------|
| **Gemini RAG** | StoreList | CRUD stores, stat cards, expand for JSON details |
| **Gemini RAG** | DocumentList | Store selector dropdown, upload text, RAG query with response, delete docs |
| **Telegram** | MessageTools | Bot info on mount, send message/photo forms, result viewer |
| **Telegram** | ChatManagement | Chat lookup, member info, ban/unban with ConfirmDialog, invite links |
| **Telegram** | WebhookSettings | Webhook status cards (URL, pending, errors), set/delete webhook |
| **Notion** | DatabaseList | Search databases, expand to see properties + query results |
| **Notion** | PageList | Search pages, expand for full properties, external link to Notion |
| **Notion** | BlockList | Load blocks by page ID, append new blocks (6 types), delete blocks |

Added `geminiCall()`, `tgCall()`, `notionCall()` + 40+ API helper functions to `gateway-api.ts`.

**Playwright test**: 34 pages — 19 OK, 15 NO_CONN (correct, no connection for those plugins), 0 errors, 0 failures.

Commit: `328748c`

### Session 37: LINE Plugin Dashboard Pages (2026-02-10)

Replaced 3 static placeholder LINE pages with functional data-fetching pages.

Added `lineCall()` + 18 LINE API helper functions to `gateway-api.ts`:
- Messages: `linePushMessage`, `lineBroadcastMessage`, `lineValidateMessage`
- User/Bot: `lineGetProfile`, `lineGetFollowerIds`, `lineGetBotInfo`
- Group: `lineGetGroupSummary`, `lineGetGroupMembersCount`, `lineGetGroupMemberIds`
- Rich Menus: `lineGetRichMenus`, `lineGetRichMenu`, `lineDeleteRichMenu`, `lineSetDefaultRichMenu`, `lineLinkRichMenuToUser`
- Quota: `lineGetQuota`, `lineGetQuotaConsumption`
- Webhook: `lineGetWebhookInfo`, `lineSetWebhookUrl`, `lineTestWebhook`

| Page | Features |
|------|----------|
| **MessageTools** | Bot info stat cards (name, quota, consumed), push message form (to + text) |
| **RichMenuList** | List menus with expand/collapse, delete with ConfirmDialog, set default, link menu to user |
| **UserList** | Bot info cards, user profile lookup (avatar + display name + status), group lookup (summary + members), follower ID list with quick lookup buttons |

**Playwright test**: All 3 pages render correctly with "No connection selected" (no LINE connection configured for test user).

Commit: `055de6c`

### Session 38: Gemini RAG + Notion Bug Fixes + Playwright Testing (2026-02-11)

Fixed 3 bugs found during Playwright testing of Gemini RAG and Notion dashboard pages.

**Bug 1: Gemini RAG gateway-api.ts camelCase/snake_case mismatch**
- `gateway-api.ts` sent camelCase args (`displayName`, `storeName`) but gateway handler expects snake_case (`display_name`, `store_name`)
- All args arrived as `undefined` on the handler side
- Fix: Changed all Gemini functions in `gateway-api.ts` to use snake_case arg names

**Bug 2: Gemini RAG response key mismatch**
- `StoreList.tsx` + `DocumentList.tsx` parsed `d.stores` but API actually returns `{ fileSearchStores: [...] }`
- Stores always showed empty despite data existing
- Fix: Changed to `d.fileSearchStores || d.stores || []`

**Bug 3: Notion API version breaking changes**
- `client.ts` used `Notion-Version: 2025-09-03` which has breaking changes (`/databases/` → `/data_sources/`)
- All database operations failed silently
- Fix: Downgraded to `Notion-Version: 2022-06-28` (stable)

**Playwright test results** (6 pages tested):
| Page | Result |
|------|--------|
| Gemini RAG Stores | 10 stores loaded OK |
| Gemini RAG Documents | 4 docs in Spider-man store OK, store selector + stat cards working |
| Notion Connections | Connection displayed OK |
| Notion Databases | 0 databases (workspace has no DBs, correct — created test DB via API, showed correctly) |
| Notion Pages | 3 pages displayed OK |
| Notion Blocks | 1 block loaded + expand OK |

Commits: `7c9cdeb` (Notion version + Gemini args) → `0f655e1` (Gemini response keys)

### What's Left

1. **Stripe integration** - Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET, update webhook URL
2. **Lightning payment** - Plan ready, needs Neutron API key (see lightning-plan.md in memory)
3. ~~**WordPress pages**~~ - Done (Session 32)
4. ~~**cl-n8n-mcp pages**~~ - Done (Session 32)
5. ~~**Playwright testing**~~ - Done (Sessions 33, 36, 37, 38)
6. ~~**n8n unknown tool**~~ - Done (Session 34)
7. ~~**Cross-plugin errors**~~ - Done (Session 35)
8. ~~**Gemini RAG / Telegram / Notion pages**~~ - Done (Session 36): 8 functional pages
9. ~~**Remove n8n variables**~~ - Done (Session 36): CE returns 403
10. ~~**LINE pages**~~ - Done (Session 37): 3 functional pages
11. ~~**Gemini RAG + Notion bugs**~~ - Done (Session 38): 3 bugs fixed
12. ~~**Dashboard UX polish**~~ - Done (Session 39): 5 tasks completed

### Session 39 Completed (2026-02-11)

All 5 tasks implemented, built, deployed, committed (`1fa1b3a`).

**Task 1 - Create Database dialog** (Notion DatabaseList.tsx):
- Added Create Database button + dialog with title, parent page ID, dynamic property rows
- Property types: title, rich_text, number, select, checkbox, date, url, email
- Added `notionCreateDatabase()` to gateway-api.ts

**Task 2 - Fix store selector doc count** (Gemini DocumentList.tsx):
- Store selector now shows actual loaded doc count for selected store instead of stale `documentCount`

**Task 3 - Custom Metadata UI** (Gemini DocumentList.tsx + types.ts):
- Added collapsible "Custom Metadata" section with dynamic key-value rows
- Supports String, Number, String List types
- Added `StringList` interface and `stringListValue` to `CustomMetadata` type
- Updated `uploadToStore()` in gateway-api.ts to accept metadata param

**Task 4 - Pagination** (8 pages across 4 plugins):
- Added "Load More" pagination with `PAGE_SIZE=20` to all 8 list pages
- Notion: DatabaseList, PageList, BlockList (cursor-based)
- Gemini RAG: StoreList, DocumentList (token-based)
- n8n: WorkflowList, ExecutionList (cursor-based)
- LINE: UserList (start-token-based)
- Added pagination params to 7 gateway-api.ts functions

**Task 5 - shadcn migration** (3 files):
- DocumentList: native `<select>` → shadcn Select, native `<textarea>` → shadcn Textarea
- BlockList: native `<select>` → shadcn Select
- MessageTools: native `<textarea>` → shadcn Textarea

**Files changed** (11 total): gateway-api.ts, gemini-rag/types.ts, DocumentList.tsx, StoreList.tsx, DatabaseList.tsx, PageList.tsx, BlockList.tsx, WorkflowList.tsx, ExecutionList.tsx, UserList.tsx, MessageTools.tsx

**Bug fix - LINE MessageTools shadcn** (`6805cd9`):
- Subagent missed LINE `MessageTools.tsx` — still had native `<textarea>`
- Fixed: replaced with shadcn `Textarea` component
- Verified: 0 native `<select>` / `<textarea>` remaining in entire `plugins/` folder

**Bug fix - usage_monthly UPSERT** (`3f715eb`):
- `internal.ts` `/internal/report-usage` used `UPDATE` only for `usage_monthly`
- If row didn't exist yet (new month / new user) → UPDATE affects 0 rows → usage not counted
- Fixed: changed to `INSERT ... ON CONFLICT(user_id, year_month) DO UPDATE SET ...` (upsert)
- Note: Usage only tracks MCP tool calls (`POST /mcp` → `tools/call`), NOT dashboard REST API calls

**Playwright test results** (10 pages, 0 crashes):
- n8n WorkflowList/ExecutionList: renders OK (401 = expired API key, not code bug)
- Gemini RAG, Notion, LINE, Telegram pages: "No connection selected" — correct behavior
- Test accounts (`claude-admin`, `test-card-check`) don't have Gemini/Notion connections
- Owner account (`node2flow@gmail.com`) is OAuth-only — can't login via Playwright headless

### Session 40: UI Color Overhaul — Remove Orange/Emerald (2026-02-12)

Removed all custom accent colors from the entire dashboard. User preference: use shadcn defaults only, no custom brand color.

1. **Responsive Dialog/Sheet** on remaining 4 connection pages (`2066f4c`):
   - notion-official, line-official, playwright, google-workspace
   - Desktop (>=768px): Dialog, Mobile (<768px): Sheet (bottom drawer)
   - Pagination component added to dashboard-core

2. **Gemini RAG UX** (`2066f4c`):
   - StoreList: Dialog for create store + Pagination (token-based)
   - DocumentList: Pagination + TS fix (`onClick={() => fetchDocuments()}`)

3. **Remove emerald, use green** (`a11bc0c` → `c306e29`):
   - `emerald-*` → `green-*` across 45 files (semantic success/active color)
   - Removed `bg-green-600 hover:bg-green-700 text-white` from all buttons (use default shadcn Button)
   - Cleaned up empty `className=""` attributes
   - Connection pages: success icons `bg-green-900/30` + `text-green-400`
   - Core UI: alert success variant, badge success variant, SudoModal

4. **Change primary color** (`b07cd78`):
   - `--primary: 25 95% 53%` (orange) → `0 0% 98%` (neutral white, shadcn zinc default)
   - Also updated: `--ring`, `--chart-1`, `--sidebar-primary`, `--sidebar-ring`
   - `--primary-foreground: 240 5.9% 10%` (dark text on white buttons)

**Lesson learned**: When user says "remove orange" → change CSS variable `--primary`, not replace class names with `primary`. If `--primary` IS orange, replacing `emerald-*` with `primary` makes everything orange (worse than before).

**Current theme**: Dark (black bg), neutral white primary, Tailwind `green-*` for success, `red-*` for destructive, `amber-*` for warnings.

### Session 42: MCP OAuth Authentication — Google + GitHub (2026-02-13)

Added OAuth 2.1 authentication to the MCP Gateway, enabling Claude Desktop and other MCP clients to authenticate via Google or GitHub instead of API keys.

1. **New OAuth Authorization Server** (`oauth.ts`, ~460 lines):
   - `/.well-known/oauth-protected-resource` — Resource metadata discovery
   - `/.well-known/oauth-authorization-server` — Authorization server metadata
   - `POST /oauth/register` — Dynamic Client Registration (RFC 7591)
   - `GET /oauth/authorize` — Authorization endpoint (redirects to Google/GitHub)
   - `GET /oauth/callback` — Upstream IdP callback (exchanges code, creates/finds user, generates auth code)
   - `POST /oauth/token` — Token endpoint (PKCE verification, JWT generation)

2. **Dual auth support** in MCP handler:
   - **API key** (`n2f_xxx`): Connection resolved at auth time (existing flow)
   - **JWT** (OAuth): Connection resolved per tool call — queries all user's active connections, returns tools from all matching plugins
   - `AuthResult` interface: nullable `connectionId`, `productType`, `config` + `authMethod: 'api_key' | 'oauth'`

3. **Platform Worker additions** (`internal.ts`):
   - `POST /internal/find-or-create-oauth-user` — Find existing user by email or create new free user
   - `POST /internal/get-user-usage` — Return daily usage count + plan limits for JWT users

4. **Infrastructure**:
   - KV binding `OAUTH_KV` (`a65a07688d774d56bb915cf9e961881a`) — shared with Platform OAuth KV
   - New secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - MCP spec 401 response: `WWW-Authenticate: Bearer resource_metadata="..."`

5. **Bugs fixed during testing**:
   - 401 not returned (error string `'Missing Authorization header'` didn't match `'OAUTH_REQUIRED'` check)
   - `/oauth/token` crashed on `application/x-www-form-urlencoded` body (OAuth spec requires this format, but code used `request.json()`)

6. **Files changed** (7):
   - `apps/mcp-gateway/src/routes/oauth.ts` — NEW
   - `apps/mcp-gateway/src/routes/auth.ts` — JWT auth path + OAUTH_REQUIRED
   - `apps/mcp-gateway/src/routes/mcp.ts` — Nullable connection + dynamic resolve
   - `apps/mcp-gateway/src/index.ts` — OAuth routes + WWW-Authenticate header
   - `apps/mcp-gateway/src/types.ts` — Env + AuthResult
   - `apps/mcp-gateway/wrangler.toml` — KV binding
   - `apps/platform-worker/src/routes/internal.ts` — 2 new endpoints

7. **Provider selection login page** (`36bbb60`):
   - `/oauth/authorize` now shows dark-themed HTML page with Google and GitHub buttons
   - Previously auto-redirected to Google — no way for user to choose GitHub
   - Buttons link to `/oauth/authorize/start?provider=google|github&...` which does the actual IdP redirect
   - Styled to match Node2Flow dark theme (zinc bg, white/gray buttons, brand SVG icons)

**Tested**: Claude Desktop → Google OAuth + GitHub OAuth → both working, MCP tools accessible.

Commits: `3f23d60` (OAuth implementation) → `36bbb60` (login page)

### Session 41: shadcn Accordion on FAQ Page (2026-02-12)

Replaced custom FAQ accordion (Card + Button + ChevronDown + manual state) with shadcn Accordion component.

1. **New shadcn Accordion component** added to dashboard-core:
   - `packages/dashboard-core/src/components/ui/accordion.tsx` — Radix UI based
   - New dep: `@radix-ui/react-accordion`
   - Exported from `packages/dashboard-core/src/index.ts`
   - Accordion keyframes added to `apps/dashboard/tailwind.config.js`

2. **FAQ.tsx refactored**:
   - Removed custom `FAQAccordion` component + `useState<Set<string>>` + `toggleItem`
   - Removed `ChevronDown` import (built into AccordionTrigger)
   - `type="single" collapsible` — one item open at a time, can close all
   - Smooth animated expand/collapse (was instant show/hide)
   - Clean border-separated items (no Card wrapper per item)

3. **Files changed** (4):
   - `packages/dashboard-core/package.json` — added `@radix-ui/react-accordion`
   - `packages/dashboard-core/src/components/ui/accordion.tsx` — new component
   - `packages/dashboard-core/src/index.ts` — export Accordion
   - `apps/dashboard/tailwind.config.js` — accordion keyframes
   - `apps/dashboard/src/pages/FAQ.tsx` — use shadcn Accordion

Deployed to CF Pages.

### Session 43: Port Community n8n Plugin Quality to SaaS Gateway (2026-02-13)

Ported the community npm package (`@node2flow/n8n-management-mcp`, Smithery quality 85/100) tool definitions and HTTP client into the SaaS Gateway n8n plugin. Same 27 tools, now with full annotations and rich descriptions.

1. **tools.ts replaced** — All 27 tool definitions now have:
   - `annotations`: `title`, `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` on every tool
   - Rich property descriptions (e.g. `'Filter by active status (true = active only, false = inactive only, omit for all)'`)
   - New filter parameters on `listWorkflows` (`active`, `tags`), `listTags`/`listUsers` (`limit`)

2. **client.ts replaced** — Community HTTP client with improvements:
   - 30s timeout via `AbortSignal.timeout(30000)` (was no timeout)
   - URL normalization: `config.apiUrl.replace(/\/+$/, '')`
   - `listWorkflows` now accepts `params?: { active?: boolean; tags?: string }` for filtering

3. **index.ts minor update** — Updated `listWorkflows` call to pass filter args

4. **No breaking changes**:
   - All 27 tool names identical
   - Plugin interface unchanged (createClient, handleToolCall)
   - Dashboard gateway-api.ts unaffected (uses same tool names)
   - Auth, billing, connections untouched

**Source**: `D:\Dev\playground\Claude_Code_Commander\n8n-management-mcp-community\src\tools.ts` + `n8n-client.ts`
**Target**: `apps/mcp-gateway/src/plugins/n8n/tools.ts` + `client.ts` + `index.ts`

Commit: `1fd744f`

### Session 44: Port Community Quality to All 6 Gateway Plugins (2026-02-13)

Extended Session 43's quality port from just n8n to ALL 6 in-worker plugins. Every tool now has Smithery-quality annotations.

1. **6 `tools.ts` files updated** — All ported from community npm packages:
   - n8n (27 tools) — type fix from Session 43
   - WordPress (20 tools) — from `@node2flow/wordpress-mcp`
   - Telegram (27 tools) — from `@node2flow/telegram-bot-mcp`
   - LINE (25 tools) — from `@node2flow/line-bot-mcp`
   - Notion (25 tools) — from `@node2flow/notion-mcp`
   - Gemini RAG (12 tools) — from `@node2flow/gemini-file-search-rag-mcp`

2. **`types.ts` updated** — Added `annotations` field to `MCPToolDefinition` interface:
   - `title`, `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`

3. **`_fields` param added** — Read-only tools with empty `properties: {}` now have `_fields` parameter for Smithery param description coverage

4. **Total**: 136 tools across 6 plugins, all with full annotations

Commit: `d857548`

### Session 45: Scoped API Keys (2026-02-13)

API keys (`n2f_xxx`) can now optionally access all services instead of being tied to a single connection. Added scope system with plugin and permission filtering.

1. **Migration** (`003_api_key_scope.sql`):
   - `ALTER TABLE api_keys ADD COLUMN scope TEXT` — nullable JSON column

2. **Platform changes**:
   - `platform-core/types/platform.ts` — Added `scope: string | null` to `ApiKey` interface
   - `platform-core/db/api-keys.ts` — `createApiKey()` accepts optional `scope` parameter
   - `user.ts` POST /api/api-keys — `connection_id` optional (defaults to `_all`), accepts `scope` JSON
   - `user.ts` GET /api/api-keys — returns parsed scope object
   - `internal.ts` — `/internal/validate-api-key` returns `scope` in response + KV cache

3. **Gateway changes**:
   - `types.ts` — Added `scope` to `AuthResult` interface
   - `auth.ts` — Handles `connection_id='_all'` (sets connectionId/productType/config to null, like OAuth). Passes scope through
   - `mcp.ts` — Scope enforcement:
     - `filterToolsByScope()` — filters tools by plugin ID + permission annotations
     - `matchesPermission()` — maps annotations to permission types (read=readOnlyHint, write=default, delete=destructiveHint)
     - `tools/list` applies scope filter, `tools/call` enforces scope before execution
   - `index.ts` — Passes `scope` from AuthResult to MCP handler

4. **Scope format**: `{ plugins?: string[], permissions?: string[] }` — null = full access
   - `plugins`: filter by plugin ID (e.g. `["n8n", "wordpress"]`)
   - `permissions`: filter by type (`read`, `write`, `delete`) — maps to tool annotations

5. **Backward compatible**: Existing keys (scope=null, specific connection_id) work unchanged

Commit: `885381f`

### Session 45b: Dashboard UI for Scoped API Keys (2026-02-13)

Added "API Keys" tab to Settings page for creating/managing global scoped API keys.

1. **`platform-api.ts`** — Updated types + function:
   - New `ApiKeyScope` interface: `{ plugins?: string[]; permissions?: string[] }`
   - `ApiKeyInfo.scope: ApiKeyScope | null` added
   - `createApiKey(connectionId?, name?, scope?)` — all params now optional

2. **`ApiKeys.tsx`** — NEW page component (~300 lines):
   - **Table**: Lists global keys (prefix, name, scope badge, status, last used)
   - **Scope badges**: "Full Access" / "Read Only" / "Custom" / "Connection"
   - **Create dialog**: Name input + scope preset Select (Full Access / Read Only / Custom)
   - **Custom mode**: Plugin checkboxes (11 plugins, Select All) + Permission checkboxes (Read/Write/Delete)
   - **Key display dialog**: One-time display with copy button (same pattern as Connections.tsx)
   - **Revoke**: DropdownMenu → AlertDialog + withSudo()
   - **Empty state**: Key icon + create CTA

3. **`Settings.tsx`** — Added tab:
   - New `<TabsTrigger value="api-keys">API Keys</TabsTrigger>`
   - Lazy import: `const ApiKeysTab = lazy(() => import('./ApiKeys'))`
   - `<Suspense>` wrapper with loading spinner

4. **Filters**: Only shows `connection_id === '_all'` keys (global keys, not per-connection)

Commit: `1c12cac`

### Session 46: OAuth Default Scope → Key Selector (2026-02-13)

**Phase 1** — OAuth default scope (later replaced):
- Migration `004_oauth_scope.sql` — `ALTER TABLE users ADD COLUMN oauth_scope TEXT`
- Settings "MCP Access" tab with scope presets
- Commit: `d510e6e`

**Phase 2** — Replaced with API key selector on OAuth login:
- Scope defined ONLY on API Keys (single source of truth)
- Removed: `OAuthScope.tsx`, MCP Access tab, `GET/PUT /api/user/oauth-scope`, `oauth_scope` from usage response
- **New OAuth flow**:
  1. Login page (simple Google/GitHub buttons, no scope dropdown)
  2. `/oauth/callback` → find/create user → query user's global API keys
  3. If user has keys → show key selector page (key name, prefix, scope badge)
  4. User clicks key → `POST /oauth/select-key` → key's scope embedded in JWT → redirect
  5. If no keys → full access, redirect immediately (no intermediate page)
- **New endpoints**: `/internal/get-user-api-keys` (Platform), `/oauth/select-key` (Gateway)
- **New KV key**: `mcp_oauth_session:{id}` (10min TTL) — stores user + OAuth params + keys between callback and selection
- **JWT `mcp_scope`**: Now contains actual JSON scope string from selected API key (not preset like "readonly")
- Commit: `fed80c7`

## Session 46b: OAuth Key Selector UX + HMAC Token Fix (2026-02-13)

**UX improvements** — Key selector page redesign:
- Changed click-to-select pattern to radio button + confirm pattern
- Radio buttons for key selection (clearer than click-to-select cards)
- "Confirm Selection" button → explicit user action before redirecting
- Success page after selection: "You can close this page" message + green check icon
- Commit: `14f039d`

**HMAC-signed tokens replace KV session**:
- **Problem**: KV eventual consistency caused users to see "Session not found" error after callback (key selector page 500 error)
- **Root cause**: `/oauth/callback` writes to KV → redirects to `/oauth/keys` → reads from KV too fast → data not yet propagated
- **Fix**: Replaced KV session with HMAC-signed query param token
  - `?session=HMAC(sessionId, JWT_SECRET)` — tamper-proof, no KV dependency
  - Token stores JSON payload (user_id, keys, OAuth params) in `mcp_oauth_session:{id}` KV (still used but no read race)
  - `/oauth/keys` verifies HMAC signature + reads KV (now has time to propagate)
  - `/oauth/select-key` verifies HMAC before updating session
- **Security**: HMAC prevents token tampering, 10min TTL, single-use (deleted after selection)
- Commit: `a7de180`

### Test Accounts

- **Admin**: `claude-admin@node2flow.net` / `ClaudeAdmin123!`
- **Admin**: `test-card-check@node2flow.net` / `TestCard123!`
- **Owner**: `node2flow@gmail.com` (OAuth, has real connections with data)

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
| **API key scope** | 1 key = 1 connection OR `_all` | Scoped by plugins + permissions (read/write/delete) |
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
│           │   └── ui/               # shadcn/ui: 27 components — Accordion, Button, Card, Input,
│           │                          #   Select, Badge, Table, Dialog, Alert, AlertDialog, Tabs,
│           │                          #   Tooltip, Separator, Label, Textarea, Progress, Sheet,
│           │                          #   Skeleton, Sidebar, Collapsible, DropdownMenu, Sonner,
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
│   │   │       ├── line/            # 25 tools, LINE API client
│   │   │       ├── telegram/        # 27 tools, Telegram Bot API client
│   │   │       ├── notion/          # 25 tools, Notion API client
│   │   │       ├── notion-official/ # 22 tools, VPS proxy (Docker)
│   │   │       ├── line-official/   # 12 tools, VPS proxy (Docker)
│   │   │       ├── playwright/     # 22 tools, VPS proxy (Docker)
│   │   │       ├── google-workspace/ # 54 tools, VPS proxy (Docker)
│   │   │       ├── slack/           # 38 tools, Slack Web API
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
│           │   ├── registry.ts        # Plugin registration (12 plugins)
│           │   ├── n8n/               # n8n plugin (7 pages + content)
│           │   ├── wordpress/         # WordPress plugin (6 pages + content)
│           │   ├── cl-n8n-mcp/        # cl-n8n-mcp plugin (5 pages + content)
│           │   ├── gemini-rag/        # Gemini RAG plugin (3 pages + content)
│           │   ├── line/              # LINE plugin (4 pages + content)
│           │   ├── telegram/          # Telegram plugin (4 pages + content)
│           │   ├── notion/            # Notion plugin (4 pages + content)
│           │   ├── slack/             # Slack plugin (6 pages + content)
│           │   ├── notion-official/   # Notion Official (Connections + content)
│           │   ├── line-official/     # LINE Official (Connections + content)
│           │   ├── playwright/        # Playwright (Connections + content)
│           │   └── google-workspace/  # Google Workspace (Connections + content)
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
- **OAuth callback path (Dashboard)**: `/api/auth/oauth/{provider}/callback` (ไม่ใช่ `/callback/{provider}`)
- **OAuth callback path (MCP Gateway)**: `/oauth/callback` — separate GitHub OAuth App needed (1 callback URL per app)
- **MCP OAuth KV**: shares `a65a07688d774d56bb915cf9e961881a` with Platform OAuth KV

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

**Total code written**: ~300+ files across 6 phases + 31 sessions
**Phase 6 added**: 34 new files (1 lib, 7 build configs, 2 API layers, 1 registry, 10 n8n plugin, 11 platform pages, 7 admin pages)
**Sessions 8-10**: WordPress + cl-n8n-mcp plugins + critical stats fix (67 gateway tools)
**Sessions 11-14**: Gemini RAG + LINE + Telegram + Notion plugins (156 gateway tools total)
**Session 15**: Full shadcn/ui migration + icon-collapsible sidebar + bundle optimization
**Sessions 16-18**: Sidebar reorg + Field/InputGroup + Toast/AlertDialog/Switch + SectionCards + zero native HTML
**Sessions 19-22**: Complete visual redesign (37 pages) + brand logos + DropdownMenu + Settings Tabs
**Sessions 23-25**: 2FA UX overhaul (InputOTP, Switch toggle, deep linking) + shadcn v4 components
**Sessions 26-28**: Brand logos in sidebar + OAuth avatar + green buttons + 2FA alert fix + terms links
**Sessions 29-31**: 4 Docker/VPS plugins (Notion Official + LINE Official + Playwright + Google Workspace)
**Session 32**: WordPress + cl-n8n-mcp dashboard pages (7 pages rewritten with full CRUD + proxy fix)
**Session 33**: Playwright testing of all 7 new pages + 4 bug fixes (null-safety + URL fallback + API parsing)
**Session 34**: Fix n8n "Unknown tool" errors (legacy proxy replaced)
**Session 35**: Fix cross-plugin connection scoping (`usePluginConnection` hook) + Playwright logo 404 fix
**Session 36**: Remove n8n variable tools (CE 403) + implement Gemini RAG, Telegram, Notion dashboard pages (8 pages)
**Session 37**: LINE plugin dashboard pages (3 pages)
**Session 38**: Gemini RAG + Notion bug fixes (camelCase/snake_case, response key, API version)
**Session 39**: Pagination (8 pages), Create Database dialog, Custom Metadata UI, shadcn migration, usage UPSERT fix, LINE shadcn fix
**Session 40**: Remove orange/emerald → neutral white `--primary` + Tailwind `green-*` for success + responsive Dialog/Sheet
**Gateway**: 304 tools across 12 plugins (8 In-Worker + 4 Docker/VPS)
**VPS**: 5 Docker containers on ports 3011-3016 (n8n-mcp-dynamic, notion, line, playwright, google-workspace)
**Branding**: Rebranded from "n8n Management MCP" → "Node2Flow" across all pages (`f80107d`)
**Session 40**: Remove orange/emerald colors → neutral white primary + green semantic + default shadcn buttons
**Session 41**: shadcn Accordion on FAQ page (replaces custom Card+Button accordion)
**Session 42**: MCP OAuth (Google + GitHub) — Claude Desktop can authenticate via Google/GitHub OAuth (PKCE + Dynamic Client Registration)
**Session 43**: Port community n8n plugin quality to SaaS Gateway (annotations, rich descriptions, improved client)
**Session 44**: Port community quality to ALL 6 gateway plugins (136 tools with annotations + _fields params)
**Session 45**: Scoped API keys — `n2f_xxx` keys can now access all services (`connection_id='_all'`) with optional plugin + permission scope filtering
**Session 45b**: Dashboard UI — Settings → API Keys tab with scope presets (Full Access / Read Only / Custom)
**Session 48**: API key system overhaul — expiry dates, OAuth default scope, hard delete, 3 audit bug fixes
**Session 49**: Revoke Key UX — rename Delete→Revoke, AlertDialog for connection keys (no 2FA), emergency bulk revoke in Settings
**Session 50**: Slack plugin — 38 tools (Messages, Conversations, Users, Reactions, Search, Files, Pins, Bookmarks, Team, Emoji) → 304 total tools
**Session 51**: Slack dashboard pages — 4 sub-pages (Messages, Channels, Files & Pins) + content + 38 API helpers in gateway-api.ts
**Session 52**: Slack dashboard full 38/38 tool coverage — enhanced 3 pages + new UserList.tsx (reactions, bookmarks, emoji) + Slack logo fix

### Session 48: API Key System Improvements — Expiry Dates, OAuth Scope, Hard Delete (2026-02-14)

Complete overhaul of API key system with 4 major features. Fixed 3 audit bugs, added expiry dates, OAuth default scope, and hard delete instead of revoke.

**1. Fix 3 Audit Bugs** (commit `8e68d61`):
- **Bug 1 (CRITICAL)**: KV cache not invalidated on key revoke → delete `apikey:{hash}` from KV on revoke
- **Bug 2 (MEDIUM)**: JSON.parse without try-catch for scope → added try-catch in auth.ts + user.ts
- **Bug 3 (MEDIUM)**: LIMIT 1 picks arbitrary connection → error if multiple connections for same plugin

**2. OAuth Default Scope** (commit `6404539`):
- Migration 004: `oauth_scope TEXT` on users table
- GET/PUT `/api/user/oauth-scope` endpoints
- Gateway auth: JWT mcp_scope > user's default oauth_scope > full access
- Dashboard: Settings > MCP Access tab with Full/ReadOnly/Custom presets
- New file: `apps/dashboard/src/pages/OAuthScope.tsx`

**3. API Key Expiry Date** (commit `0b507bc`):
- Migration 005: `expires_at TEXT` on api_keys table
- createApiKey accepts expiresAt parameter
- Validation checks expiry on both cache hit and cache miss
- KV cache TTL capped to time-until-expiry
- Dashboard: expiry preset selector (Never/7d/30d/90d/Custom) in create dialog
- Dashboard: Expires column + Expired badge in table

**4. Revoke → Hard Delete** (commit `ab165a2`):
- revokeApiKey (UPDATE status='revoked') → deleteApiKey (DELETE FROM api_keys)
- Revoked keys had no purpose in DB — can't reactivate, just waste space
- Updated all 16 files: DB function, API, ApiKeys.tsx, 11 Connections.tsx
- "Revoke Key" → "Delete Key" everywhere

**Files changed** (16 total):
- `packages/platform-core/src/db/api-keys.ts` — createApiKey + expiresAt param, revokeApiKey → deleteApiKey
- `packages/platform-core/src/types/platform.ts` — expires_at on ApiKey
- `apps/platform-worker/src/routes/internal.ts` — expiry validation, oauth_scope in usage response, KV cache expires_at
- `apps/platform-worker/src/routes/user.ts` — GET/PUT oauth-scope, expires_at in create, hard delete
- `apps/platform-worker/migrations/005_api_key_expires.sql` — NEW
- `apps/mcp-gateway/src/routes/auth.ts` — scope priority (JWT > oauth_scope > full), try-catch
- `apps/mcp-gateway/src/routes/mcp.ts` — multiple connections error instead of LIMIT 1
- `apps/dashboard/src/pages/OAuthScope.tsx` — NEW
- `apps/dashboard/src/pages/Settings.tsx` — MCP Access tab
- `apps/dashboard/src/pages/ApiKeys.tsx` — expiry picker, Expires column, revoke→delete
- `apps/dashboard/src/lib/platform-api.ts` — expires_at, expiresAt param, deleteApiKey, getOAuthScope, updateOAuthScope
- All 11 `apps/dashboard/src/plugins/*/Connections.tsx` — revoke→delete

**Deployed**: 2026-02-14

---

### Session 49: Revoke Key UX + Emergency Bulk Revoke (2026-02-14)

API key management UX improvements with security-appropriate confirmation levels.

**1. Rename "Delete Key" → "Revoke Key"** (all 11 Connection pages + ApiKeys.tsx):
- Better terminology for credential revocation
- DropdownMenuItem text, AlertDialog titles, toast messages all updated

**2. Connection key generation: AlertDialog instead of 2FA**:
- Removed `withSudo()` from handleGenerateApiKey on all 11 Connection pages
- Now uses AlertDialog confirmation (faster UX for connection-scoped keys)
- Added `generateKeyTarget` state + `confirmGenerateApiKey` handler

**3. Connection key revoke: AlertDialog instead of 2FA**:
- Removed `withSudo()` from handleRevokeApiKey on all 11 Connection pages
- Direct AlertDialog confirmation (connection keys are limited scope)

**4. Global API keys: Keep 2FA** (ApiKeys.tsx):
- Create + Revoke still use `withSudo()` (global keys = Full Access = higher risk)
- Only text renamed (Delete → Revoke)

**5. Emergency "Revoke All Connection Keys"** (Settings.tsx Danger Zone):
- New bulk revoke button above Delete Account
- Type "REVOKE ALL" to confirm (no 2FA — emergency needs speed)
- Backend: `DELETE /api/api-keys/connection-keys` with KV cache invalidation
- `deleteAllConnectionApiKeys()` in platform-core: deletes all keys where `connection_id != '_all'`

**Security hierarchy**:
- Connection keys → AlertDialog (fast)
- Global keys → 2FA/TOTP (secure)
- Emergency revoke all → type confirmation (fast for emergencies)

**Files changed** (17):
- `packages/platform-core/src/db/api-keys.ts` — `deleteAllConnectionApiKeys()`
- `packages/platform-core/src/db/index.ts` — barrel export
- `apps/platform-worker/src/routes/user.ts` — bulk revoke endpoint (before `:id` regex)
- `apps/dashboard/src/lib/platform-api.ts` — `revokeAllConnectionKeys()`
- `apps/dashboard/src/pages/ApiKeys.tsx` — Delete → Revoke text
- `apps/dashboard/src/pages/Settings.tsx` — Emergency Revoke All in Danger Zone
- 11x `apps/dashboard/src/plugins/*/Connections.tsx` — Revoke naming + AlertDialog (no sudo)

Commit: `b2e9383`
**Deployed**: 2026-02-14

### Session 52: Slack Dashboard Full Tool Coverage — 38/38 (2026-02-14)

Enhanced all Slack dashboard pages to cover 100% of 38 tools (was 14/38 from Session 51).

**Enhanced pages (3)**:

| Page | Before | After | Added Tools |
|------|--------|-------|-------------|
| MessageTools.tsx | 4 tools | 9 tools | update, delete, list/cancel scheduled, get permalink |
| ChannelList.tsx | 7 tools | 12 tools | thread replies, invite, kick, join, open conversation |
| FileManager.tsx | 5 tools | 7 tools | pin message, unpin message |

**New page (1)**:

| Page | Tools | Features |
|------|-------|----------|
| UserList.tsx | 10 tools | List users (with avatar, filter), user lookup, add/remove/get reactions, channel bookmarks CRUD (list/add/edit/remove), custom emoji list |

**Registry update**:
- Added 5th sidebar item: "Users & Tools" → `/slack/users`
- Added 5th route: `lazy(() => import('./slack/UserList'))`

**Logo fix**:
- `cdn.simpleicons.org/slack/4A154B` → 404
- Changed to `cdn.jsdelivr.net/npm/simple-icons@v13/icons/slack.svg` → 200 OK

**Playwright test results** (no login):
- Landing page: Slack product card renders with logo + "38 tools" description
- FAQ page: 3 Slack categories (Setup 3 items, Usage 3 items, Troubleshooting 3 items)
- Docs page: Connection guide (3 steps + 22 scopes), 8 example prompts
- Auth-protected routes: Redirect to login (expected)

**Deployed**: `app.node2flow.net` (CF Pages)

---

### Session 47: Fix 3 Audit Bugs in API Key System (2026-02-13)

Fixed 3 critical bugs discovered during API key system audit.

**Bug 1 (CRITICAL): KV cache not invalidated on key revoke**
- When API key revoked, KV cache (`apikey:{hash}` with 1hr TTL) still served old valid key data
- User could continue using revoked key for up to 1 hour
- Fix: Added `env.RATE_LIMIT_KV.delete(cacheKey)` in `/api/api-keys/:id/revoke` handler
- File: `apps/platform-worker/src/routes/user.ts`

**Bug 2 (MEDIUM): JSON.parse without try-catch for scope**
- Corrupt or invalid scope JSON in 2 places caused 500 crashes:
  1. `auth.ts:169` — JWT `mcp_scope` claim parsed without error handling
  2. `user.ts:192` — API key `scope` field displayed in listing
- Fix: Added try-catch blocks with fallback to null (means full access / empty scope)
- Files: `apps/mcp-gateway/src/routes/auth.ts`, `apps/platform-worker/src/routes/user.ts`

**Bug 3 (MEDIUM): LIMIT 1 picks arbitrary connection**
- OAuth/global key user with multiple connections for same plugin (e.g., multiple n8n instances)
- Query: `SELECT * FROM connections WHERE user_id=? AND product_type=? LIMIT 1`
- Would pick arbitrarily, not clearly signal error
- Fix: Changed to `SELECT * FROM connections WHERE user_id=? AND product_type=?` (no limit), check `count > 1` in handler, return clear error message
- File: `apps/mcp-gateway/src/routes/mcp.ts:211`

**Files changed** (2):
- `apps/platform-worker/src/routes/user.ts` — KV cache deletion + try-catch for scope
- `apps/mcp-gateway/src/routes/auth.ts` — try-catch for JWT mcp_scope
- `apps/mcp-gateway/src/routes/mcp.ts` — Multiple connection check

**Deployed**: 2026-02-13 — Both platform-worker and mcp-gateway (automatic via wrangler)
**Commit**: `8e68d61`

---

### Session 50: Slack Plugin (2026-02-14)

Added Slack Web API plugin to MCP Gateway — 38 tools ported from `@node2flow/slack-mcp` community npm.

1. **4 new files** in `apps/mcp-gateway/src/plugins/slack/`:
   - `types.ts` — SlackConfig, SlackUser, SlackChannel, SlackMessage, SlackFile, etc.
   - `client.ts` — SlackClient with 38 methods (Bearer auth, `ok` field checking, 2-step file upload)
   - `tools.ts` — 38 MCP tool definitions with annotations
   - `index.ts` — Plugin entry: `createClient(config)` + `handleToolCall()` switch

2. **Updated `plugin-registry.ts`** — registered `slackPlugin` as 12th plugin

3. **38 tools across 10 categories**:
   - Messages (7): send, update, delete, schedule, delete scheduled, list scheduled, get permalink
   - Conversations (12): list channels, get info, history, thread replies, members, create, archive, invite, kick, join, set topic, open DM
   - Users (2): list, get info
   - Reactions (3): add, remove, get
   - Search (2): messages, files
   - Files (3): upload, list, delete
   - Pins (3): pin, unpin, list
   - Bookmarks (4): add, edit, remove, list
   - Team (1): get info
   - Emoji (1): list custom emoji

4. **Config key**: `bot_token` in encrypted connection config
5. **Type**: In-Worker (calls `https://slack.com/api/*` directly)
6. **Gateway total**: 304 tools across 12 plugins (8 In-Worker + 4 Docker/VPS)

**Deployed**: `mcp.node2flow.net` — 306.20 KiB / gzip: 50.01 KiB
**Date**: 2026-02-14

### Session 51: Slack Dashboard Pages (2026-02-14)

Added 4 functional dashboard pages for the Slack plugin + content metadata + 38 API helpers.

1. **5 new files** in `apps/dashboard/src/plugins/slack/`:
   - `Connections.tsx` — Connection CRUD (bot_token), API key generation, responsive edit Dialog/Sheet, MCP endpoint display
   - `MessageTools.tsx` — Send message, schedule message, search messages, workspace info card
   - `ChannelList.tsx` — List/create/archive channels, channel history, members, set topic, expand/collapse
   - `FileManager.tsx` — Upload files (text content), list files, delete files, search files, view pinned items
   - `content.tsx` — Landing (4 features, 4 setup steps, demo code), dashboard quickstart, docs (connection guide, scopes list, example prompts), FAQ (3 categories: Setup, Usage, Troubleshooting)

2. **Updated `registry.ts`** — Registered `slackPlugin` as 12th dashboard plugin:
   - Sidebar: Connections, Messages, Channels, Files & Pins
   - 4 lazy-loaded routes: `/slack/connections`, `/slack/messages`, `/slack/channels`, `/slack/files`
   - Logo: `cdn.simpleicons.org/slack/4A154B`

3. **Updated `gateway-api.ts`** — Added `slackCall()` + 38 Slack API helper functions:
   - Messages (7): slackSendMessage, slackUpdateMessage, slackDeleteMessage, slackScheduleMessage, slackDeleteScheduledMessage, slackListScheduledMessages, slackGetPermalink
   - Conversations (13): slackListChannels, slackGetChannelInfo, slackGetChannelHistory, slackGetThreadReplies, slackGetChannelMembers, slackCreateChannel, slackArchiveChannel, slackInviteToChannel, slackKickFromChannel, slackJoinChannel, slackSetChannelTopic, slackOpenConversation
   - Users (2): slackListUsers, slackGetUserInfo
   - Reactions (3): slackAddReaction, slackRemoveReaction, slackGetReactions
   - Search (2): slackSearchMessages, slackSearchFiles
   - Files (3): slackUploadFile, slackListFiles, slackDeleteFile
   - Pins (3): slackPinMessage, slackUnpinMessage, slackListPins
   - Bookmarks (4): slackAddBookmark, slackEditBookmark, slackRemoveBookmark, slackListBookmarks
   - Team/Emoji (2): slackGetTeamInfo, slackListEmoji

4. **TypeScript**: 0 errors (tsc --noEmit clean)

**Deployed**: `app.node2flow.net` (CF Pages)
**Date**: 2026-02-14

### Session 52: Slack Pattern Fix + Local Logos + Dashboard UI Polish (2026-02-14)

Rewrote Slack Connections page, migrated all logos from CDN to local, and polished Dashboard + Connection table UI.

1. **Slack Connections.tsx rewrite** — Full rewrite to match established plugin pattern (Table layout, 2FA alert, MCP endpoint Item, InputGroup forms, green-check API key modal, responsive edit Dialog/Sheet)

2. **Local logos** — Migrated all 11 logos from external CDN to `apps/dashboard/public/logos/`:
   - User-provided: `telegram.svg`, `line.png`, `gemini.png`, `slack.png`
   - Downloaded: `playwright.svg`, `n8n.svg`, `n8n-alt.svg`, `wordpress.svg`, `notion.svg`, `google.svg`, `github.svg`
   - Updated: `registry.ts` (12 plugins), `Dashboard.tsx` (SERVICE_LOGOS 12 entries), `Settings.tsx` (OAUTH_LOGOS), 10 Connections.tsx files
   - Zero external CDN references remaining

3. **Connection table UI** — All 12 plugins:
   - Removed "Actions" column header text (empty column header)
   - Replaced Active badge with green dot (`bg-green-400`, 2.5x2.5 rounded-full)
   - Center-aligned all TableHead and TableCell text

4. **Dashboard cards** — Plugin cards with active connections show green border (`border-green-400`)

5. **Commits** (7):
   - `7d67165` — fix: align Slack Connections page with established plugin pattern
   - `6890a95` — feat: replace CDN logos with local color logos
   - `e5a349a` — fix: add missing Slack, LINE Official, Notion Official logos
   - `74bf8a0` — fix: move Playwright logo to local
   - `04a709f` — feat: move all remaining logos from CDN to local
   - `ff24ce8` — style: remove Actions column header text
   - `0deca79` — style: replace Active badge with green dot, green border
   - `2522a78` — style: remove Actions from Dashboard and AdminUsers
   - `b3a8926` — style: center-align all table text in connection pages
   - `29df57d` — fix: add missing text-center to playwright, notion-official, line-official

**Deployed**: `app.node2flow.net` (CF Pages)
**Date**: 2026-02-14

### Session 54: Per-User Google Workspace OAuth (2026-02-15)

Migrated Per-User OAuth flow to Gateway Worker + Dashboard. Each user can now connect their own Google account for Gmail, Drive, Calendar, Docs, Sheets access.

1. **New file: `apps/mcp-gateway/src/routes/google-workspace-oauth.ts`**
   - `POST /api/oauth/google-workspace/start` — JWT auth, verify connection ownership, create KV state, return Google authorize URL
   - `GET /api/oauth/google-workspace/callback` — Public, exchange code for tokens, store in `config_encrypted`, redirect to Dashboard
   - `GET /api/oauth/google-workspace/status/:id` — JWT auth, return `{ connected, email, expired }`
   - `POST /api/oauth/google-workspace/disconnect/:id` — JWT auth, remove OAuth fields, revoke at Google
   - `refreshGoogleTokenIfNeeded()` — Auto-refresh utility (300s buffer), called before tool calls

2. **Gateway route registration** (`index.ts`, `mcp.ts`):
   - OAuth routes registered before Dashboard API section (callback is public, others need JWT)
   - Token refresh in both MCP path (`/mcp`) and proxy path (`/api/proxy`)

3. **Dashboard UI** (`Connections.tsx`):
   - Per-connection Google Account status: green dot + `user@gmail.com` or "Connect" button
   - "Connect Google Account" / "Disconnect Google" menu items
   - URL param handling: `?google_connected=true` → toast, `?google_error=...` → error toast

4. **Gateway API helpers** (`gateway-api.ts`):
   - `startGoogleWorkspaceOAuth(connectionId)` — Returns authorize URL
   - `getGoogleWorkspaceOAuthStatus(connectionId)` — Connected/email/expired
   - `disconnectGoogleWorkspace(connectionId)` — Remove tokens + revoke

5. **Token storage**: `connections.config_encrypted` (AES-256-GCM) — no new table needed
   ```json
   { "oauth_token": "ya29.xxx", "refresh_token": "1//0xxx", "token_expires_at": 1708000000, "google_email": "user@gmail.com" }
   ```

6. **Security**:
   - CSRF: KV state `gws_state:{random}` → 10min TTL, deleted synchronously (`await`, not `waitUntil`)
   - Callback: exact path match (not `includes`)
   - Refresh token rotation: handles Google returning new refresh_token
   - Revocation: logs errors instead of silent catch

7. **Files changed**:
   - NEW: `apps/mcp-gateway/src/routes/google-workspace-oauth.ts`
   - EDIT: `apps/mcp-gateway/src/routes/connections.ts` (export `encryptConfig`)
   - EDIT: `apps/mcp-gateway/src/routes/mcp.ts` (refresh before createClient)
   - EDIT: `apps/mcp-gateway/src/index.ts` (register OAuth routes + refresh in proxy)
   - EDIT: `apps/mcp-gateway/src/types.ts` (add `DASHBOARD_URL`)
   - EDIT: `apps/mcp-gateway/wrangler.toml` (add `DASHBOARD_URL` var)
   - EDIT: `apps/dashboard/src/lib/gateway-api.ts` (3 OAuth helpers)
   - EDIT: `apps/dashboard/src/plugins/google-workspace/Connections.tsx` (Connect/Disconnect UI)

**Commit**: `d9f1f71` — feat: add per-user Google Workspace OAuth to Gateway + Dashboard
**Deployed**: Gateway `b8b129a2` (`mcp.node2flow.net`) + Dashboard `7477b13d` (`app.node2flow.net`)
**Date**: 2026-02-15

### Session 55: Airtable + YouTube + PostgREST Plugins (2026-02-15)

Added 3 community MCP packages as Gateway plugins + Dashboard pages. Platform now has **15 plugins (352 tools)** — up from 12 plugins (304 tools).

1. **Gateway — Airtable Plugin** (18 tools, PAT auth):
   - Records (6): list, get, create, update, delete, upsert
   - Schema (7): list bases, get schema, create base/table/field, update table/field
   - Webhooks (5): create, list, refresh, payloads, delete
   - Files: `apps/mcp-gateway/src/plugins/airtable/{types,client,tools,index}.ts`

2. **Gateway — YouTube Plugin** (20 tools, OAuth 2.0):
   - Read (10): search, get video/channel, list playlists/items/comments/replies/categories/subscriptions, popular
   - Write (10): post/reply/update/delete comment, create/update/delete playlist, add/remove playlist item, rate video
   - Files: `apps/mcp-gateway/src/plugins/youtube/{types,client,tools,index}.ts`

3. **Gateway — PostgREST Plugin** (10 tools, optional JWT):
   - Schema (2): get OpenAPI schema, describe table
   - Read (3): list records, count records, call function (RPC)
   - Write (5): insert, update, upsert, delete, replace
   - Files: `apps/mcp-gateway/src/plugins/postgrest/{types,client,tools,index}.ts`

4. **Dashboard — 3 Plugin UIs**:
   - `content.tsx` + `Connections.tsx` for each (airtable, youtube, postgrest)
   - SVG logos: `apps/dashboard/public/logos/{airtable,youtube,postgrest}.svg`
   - Registry entries + 48 API helpers in `gateway-api.ts`

5. **Files changed** (24 total):
   - NEW (12): Gateway plugin files (4 per plugin × 3)
   - NEW (9): Dashboard plugin files (content + Connections × 3) + 3 SVGs
   - EDIT (3): `plugin-registry.ts`, `registry.ts`, `gateway-api.ts`

**Commit**: `5aa8364` — feat: add Airtable, YouTube, PostgREST plugins to Gateway + Dashboard
**Deployed**: Gateway `13ad2386` (`mcp.node2flow.net`) + Dashboard `9fdb3533` (`app.node2flow.net`)
**Date**: 2026-02-15

### Session 56: Bitkub + Binance + Binance TH Crypto Exchange Plugins (2026-02-15)

Added 3 crypto exchange MCP packages as Gateway plugins + Dashboard pages. Platform now has **18 plugins (382 tools)** — up from 15 plugins (352 tools).

1. **Shared Utility — `_crypto-utils.ts`**:
   - `hmacSha256Hex()` using Web Crypto API (Cloudflare Workers compatible)
   - Used by all 3 exchange clients for HMAC-SHA256 request signing

2. **Gateway — Bitkub Plugin** (28 tools, `btk_` prefix):
   - Market (8): ticker, symbols, trades, bids, asks, orderbook, depth, ohlcv
   - Account (3): balances, trading credits, deposit history
   - Trading (6): place bid/ask, cancel order, order info, open orders, order history
   - Server (2): server time, status
   - Wallet (5): crypto addresses, deposit history, withdraw, withdrawal history, fiat accounts
   - Test (4): place bid/ask test, websocket tokens
   - Auth: Custom headers (`X-BTK-APIKEY`, `X-BTK-TIMESTAMP`, `X-BTK-SIGN`)
   - Files: `apps/mcp-gateway/src/plugins/bitkub/{types,client,tools,index}.ts`

3. **Gateway — Binance Plugin** (23 tools, `bn_` prefix):
   - Market (6): exchange info, orderbook, recent trades, klines, ticker 24hr, ticker price
   - Account (4): account info, trade history, open orders, all orders
   - Trading (4): new order, test order, cancel order, cancel all orders
   - Wallet (5): deposit history, withdraw history, deposit address, withdraw, coin info
   - User Streams (4): create/keepalive/close listen key, account status
   - Auth: Query param signature + `X-MBX-APIKEY` header
   - Files: `apps/mcp-gateway/src/plugins/binance/{types,client,tools,index}.ts`

4. **Gateway — Binance TH Plugin** (27 tools, `bth_` prefix):
   - Market (6): exchange info, orderbook, recent trades, klines, ticker 24hr, ticker price
   - Account (5): account info, trade history, open orders, all orders, trade fees
   - Trading (4): new order, test order, cancel order, cancel all orders
   - Wallet (8): deposit history, withdraw history, deposit address, withdraw, coin info, sub-account list, transfer, transfer history
   - User Streams (4): create/keepalive/close listen key, account status
   - Auth: Same as Binance but base URL `api.binance.th` with API v1
   - Files: `apps/mcp-gateway/src/plugins/binance-th/{types,client,tools,index}.ts`

5. **Dashboard — 3 Plugin UIs**:
   - `content.tsx` + `Connections.tsx` for each (bitkub, binance, binance-th)
   - SVG logos: `apps/dashboard/public/logos/{bitkub,binance,binance-th}.svg`
   - Registry entries + 9 API helpers in `gateway-api.ts`

6. **Files changed** (25 total):
   - NEW (1): `_crypto-utils.ts` (shared HMAC utility)
   - NEW (12): Gateway plugin files (4 per plugin × 3)
   - NEW (9): Dashboard plugin files (content + Connections × 3) + 3 SVGs
   - EDIT (4): `plugin-registry.ts`, `registry.ts`, `Dashboard.tsx`, `gateway-api.ts`

**Date**: 2026-02-15

### Planned: Per-User OAuth Flow (Other Providers)

**Done**: Google Workspace — Per-user OAuth via Gateway Worker (Session 54)

**Remaining**: Notion Official, LINE Official (same pattern — Gateway OAuth routes + Dashboard UI)

**Architecture** (established by Google Workspace):
1. Gateway OAuth routes: start → callback → status → disconnect → auto-refresh
2. Tokens in `connections.config_encrypted` (no separate table)
3. Gateway passes token via `x-service-token` header to VPS bridge
4. VPS bridge spawns isolated subprocess per unique token

**Priority**: Notion Official → LINE Official
**Status**: Google Workspace DONE, others NOT STARTED
