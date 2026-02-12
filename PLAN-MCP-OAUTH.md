# Plan: MCP Gateway OAuth Authentication (Google)

## Context

Node2Flow MCP Gateway (`mcp.node2flow.net/mcp`) ปัจจุบัน authenticate ด้วย API key (`n2f_xxx`) เท่านั้น
เมื่อ user ใช้ Claude Desktop Remote MCP → ต้อง copy API key ไปใส่ config
ต้องการเพิ่ม **Google OAuth** เป็นอีกวิธี authenticate → user กด login ผ่าน browser ได้เลย

**ผลลัพธ์**: MCP Gateway รับ auth ได้ 2 วิธี ใช้แทนกันได้:
1. `Authorization: Bearer n2f_xxx` → API key (เหมือนเดิม)
2. `Authorization: Bearer eyJhbG...` → JWT จาก OAuth flow (ใหม่)

**ทดสอบกับ**: n8n plugin เป็นตัวแรก

---

## Architecture

```
                                        ┌─ API Key (n2f_xxx) ────┐
                                        │  เหมือนเดิม            │
Claude Desktop ──► mcp.node2flow.net ──►├─────────────────────────├──► Plugin (n8n)
                                        │  JWT (OAuth) ────────── │
                                        │  ใหม่                   │
                                        └─────────────────────────┘
```

### OAuth Flow (MCP spec compliant)

```
Claude Desktop                    MCP Gateway                    Google
      │                               │                            │
      │ POST /mcp (no auth)           │                            │
      │──────────────────────────────►│                            │
      │◄── 401 + WWW-Authenticate     │                            │
      │    resource_metadata URL       │                            │
      │                               │                            │
      │ GET /.well-known/             │                            │
      │     oauth-protected-resource  │                            │
      │──────────────────────────────►│                            │
      │◄── { authorization_servers }   │                            │
      │                               │                            │
      │ GET /.well-known/             │                            │
      │     oauth-authorization-server │                            │
      │──────────────────────────────►│                            │
      │◄── { authorize, token, reg }   │                            │
      │                               │                            │
      │ POST /oauth/register          │                            │
      │ { redirect_uris, client_name } │                            │
      │──────────────────────────────►│                            │
      │◄── { client_id, client_secret }│                            │
      │                               │                            │
      │ Open browser:                  │                            │
      │ /oauth/authorize?client_id=    │                            │
      │ &code_challenge=&state=        │                            │
      │──────────────────────────────►│                            │
      │                               │ Redirect to Google OAuth   │
      │                               │───────────────────────────►│
      │                               │                            │
      │                               │      User logs in Google   │
      │                               │◄───────────────────────────│
      │                               │  code + state              │
      │                               │                            │
      │                               │ Find/create user           │
      │                               │ Generate auth_code         │
      │◄── Redirect to client          │                            │
      │    redirect_uri?code=&state=   │                            │
      │                               │                            │
      │ POST /oauth/token             │                            │
      │ { code, code_verifier }        │                            │
      │──────────────────────────────►│                            │
      │◄── { access_token (JWT) }      │                            │
      │                               │                            │
      │ POST /mcp                     │                            │
      │ Authorization: Bearer JWT      │                            │
      │──────────────────────────────►│ Verify JWT → find user     │
      │                               │ → find connection          │
      │◄── MCP response               │ → execute tool             │
```

---

## Key Design Decisions

1. **MCP Gateway เป็น OAuth Authorization Server** — ไม่ใช่ redirect ไป Google ตรงๆ แต่ Gateway issue token เอง (JWT) โดยใช้ Google เป็น upstream IdP
2. **JWT เดียวกับ Dashboard** — ใช้ `JWT_SECRET` ตัวเดียวกัน, verify ด้วย `verifyJWT()` ที่มีอยู่แล้ว
3. **Connection resolve แบบ dynamic** — API key ผูกกับ connection ตัวเดียว, JWT ผูกกับ user → Gateway หา connection จาก `user_id + product_type` ของ tool ที่เรียก
4. **PKCE required** — ตาม MCP spec, ป้องกัน authorization code interception
5. **Dynamic Client Registration** — MCP clients register ตัวเอง, ไม่ต้อง pre-configure
6. **KV สำหรับ temporary state** — auth codes, PKCE challenges, client registrations ใช้ `OAUTH_STATE_KV` ที่มีอยู่แล้ว (ผ่าน service binding ไป Platform Worker)

---

## Files to Change

### MCP Gateway (`apps/mcp-gateway/`)

#### 1. `src/routes/oauth.ts` (NEW — ~300 lines)

OAuth Authorization Server endpoints:

```typescript
// GET /.well-known/oauth-protected-resource
// Returns: { resource: "https://mcp.node2flow.net", authorization_servers: ["https://mcp.node2flow.net"] }

// GET /.well-known/oauth-authorization-server
// Returns: {
//   issuer: "https://mcp.node2flow.net",
//   authorization_endpoint: "https://mcp.node2flow.net/oauth/authorize",
//   token_endpoint: "https://mcp.node2flow.net/oauth/token",
//   registration_endpoint: "https://mcp.node2flow.net/oauth/register",
//   response_types_supported: ["code"],
//   grant_types_supported: ["authorization_code"],
//   code_challenge_methods_supported: ["S256"],
//   token_endpoint_auth_methods_supported: ["client_secret_post"]
// }

// POST /oauth/register — Dynamic Client Registration (RFC 7591)
// Body: { redirect_uris: ["http://localhost:..."], client_name: "Claude Desktop" }
// Generates client_id + client_secret, stores in KV (24h TTL)
// Returns: { client_id, client_secret, redirect_uris, client_name }

// GET /oauth/authorize — Authorization Endpoint
// Params: client_id, redirect_uri, state, code_challenge, code_challenge_method, response_type=code
// 1. Validate client_id (from KV)
// 2. Validate redirect_uri matches registered
// 3. Store PKCE challenge + state + client_id + redirect_uri in KV
// 4. Redirect to Google OAuth:
//    https://accounts.google.com/o/oauth2/v2/auth?
//    client_id=GOOGLE_CLIENT_ID&redirect_uri=.../oauth/callback
//    &scope=email+profile&state=internal_state&access_type=online

// GET /oauth/callback — Google OAuth callback (internal)
// 1. Exchange Google code for access token
// 2. Get user info (email)
// 3. Find/create user in Platform DB (via service binding)
// 4. Generate authorization code, store in KV (5min TTL)
//    KV: oauth_authcode:{code} → { user_id, email, plan, client_id, redirect_uri, code_challenge }
// 5. Redirect to client's redirect_uri with code + state

// POST /oauth/token — Token Endpoint
// Body: { grant_type: "authorization_code", code, redirect_uri, client_id, client_secret, code_verifier }
// 1. Validate client_id + client_secret
// 2. Get auth code data from KV
// 3. Verify PKCE: SHA256(code_verifier) === code_challenge
// 4. Delete auth code from KV (one-time use)
// 5. Generate JWT (same format as Dashboard JWT)
// 6. Returns: { access_token: JWT, token_type: "bearer", expires_in: 86400 }
```

#### 2. `src/routes/auth.ts` (MODIFY — ~30 lines added)

เพิ่ม JWT auth ใน `authenticateMcpRequest()`:

```typescript
export async function authenticateMcpRequest(request, env) {
  const token = authHeader.slice(7);

  // 1. API key auth (existing)
  if (token.startsWith('n2f_')) {
    // ... existing code unchanged ...
  }

  // 2. JWT auth (NEW)
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (payload) {
    // Find user's connection dynamically
    // For tools/list: return all tools from all products with active connections
    // For tools/call: resolve connection by tool name → plugin → product_type
    return {
      context: {
        userId: payload.sub,
        email: payload.email,
        plan: payload.plan,
        connectionId: null,          // resolved later per tool call
        productType: null,           // resolved later per tool call
        config: null,                // resolved later per tool call
        apiKeyId: 'oauth',           // special marker
        usage: await getJwtUsage(env, payload.sub, payload.plan),
      },
      error: null,
    };
  }

  // 3. No valid auth → return 401 with OAuth metadata
  return { context: null, error: 'OAUTH_REQUIRED' };
}
```

#### 3. `src/routes/mcp.ts` (MODIFY — ~40 lines added)

Handle JWT auth where connection is resolved per tool call:

```typescript
// In handleMcpRequest():

case 'tools/list': {
  if (authContext.connection.product_type) {
    // API key auth → specific plugin's tools
    const plugin = getPlugin(authContext.connection.product_type);
    return jsonRpcResponse(id, { tools: plugin?.tools || [] }, rateLimitInfo);
  } else {
    // JWT auth → return all tools from products with active connections
    const connections = await env.DB.prepare(
      'SELECT DISTINCT product_type FROM connections WHERE user_id = ? AND status = ?'
    ).bind(authContext.user.id, 'active').all();

    const tools = connections.results.flatMap(c => {
      const plugin = getPlugin(c.product_type);
      return plugin ? plugin.tools : [];
    });
    return jsonRpcResponse(id, { tools }, rateLimitInfo);
  }
}

case 'tools/call': {
  // Find plugin for the tool
  const plugin = findPluginForTool(toolName);
  if (!plugin) return jsonRpcError(id, -32601, `Unknown tool: ${toolName}`);

  // Resolve connection (API key: already resolved, JWT: find by product_type)
  let connectionConfig = authContext.connection.config;
  let connectionId = authContext.connection.id;

  if (!connectionConfig) {
    // JWT auth → find connection by user_id + product_type
    const conn = await env.DB.prepare(
      'SELECT * FROM connections WHERE user_id = ? AND product_type = ? AND status = ? LIMIT 1'
    ).bind(authContext.user.id, plugin.id, 'active').first();

    if (!conn) {
      return jsonRpcError(id, -32000, `No active ${plugin.id} connection. Set up in dashboard first.`);
    }

    connectionConfig = await decryptConfig(conn.config_encrypted, env.ENCRYPTION_KEY);
    connectionId = conn.id;
  }

  const client = plugin.createClient(connectionConfig, env);
  // ... rest of tool execution unchanged ...
}
```

#### 4. `src/index.ts` (MODIFY — ~20 lines added)

Add OAuth routes and 401 response with metadata:

```typescript
import { handleOAuthRoutes } from './routes/oauth';

// Before MCP handler:

// OAuth endpoints
if (path.startsWith('/oauth/') || path.startsWith('/.well-known/')) {
  return handleOAuthRoutes(request, env, path, ctx);
}

// MCP handler: change 401 response to include WWW-Authenticate
if (path === '/mcp' && method === 'POST') {
  const { context, error } = await authenticateMcpRequest(request, env);

  if (error === 'OAUTH_REQUIRED' || (!context && !error)) {
    return new Response(
      JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Authentication required' } }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': `Bearer resource_metadata="https://mcp.node2flow.net/.well-known/oauth-protected-resource"`,
          ...CORS_HEADERS,
        },
      }
    );
  }
  // ... existing error handling + handleMcpRequest unchanged ...
}
```

#### 5. `src/types.ts` (MODIFY — ~5 lines)

Update AuthResult to allow null connection (for JWT auth):

```typescript
interface AuthResult {
  userId: string;
  email: string;
  plan: string;
  connectionId: string | null;      // null for JWT auth (resolved per tool)
  productType: string | null;       // null for JWT auth
  config: Record<string, unknown> | null;  // null for JWT auth
  apiKeyId: string;                 // 'oauth' for JWT auth
  usage: { current: number; limit: number; remaining: number };
}
```

#### 6. `wrangler.toml` (MODIFY — ~3 lines)

Gateway ต้อง access Google OAuth → ต้องมี GOOGLE_CLIENT_ID/SECRET
แต่ secrets เหล่านี้อยู่ที่ Platform Worker → ใช้ service binding เรียก

ไม่ต้องเพิ่ม secrets ใหม่ — สร้าง internal endpoint ที่ Platform Worker:
`POST /internal/oauth/google-exchange` → Gateway ส่ง code มา, Platform exchange กับ Google

หรือเพิ่ม secrets ตรงๆ ที่ Gateway (ง่ายกว่า):
```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put JWT_SECRET  # ต้องเป็นตัวเดียวกับ Platform
```

เพิ่มใน Env type:
```typescript
GOOGLE_CLIENT_ID: string;
GOOGLE_CLIENT_SECRET: string;
```

### Platform Worker (`apps/platform-worker/`)

#### 7. `src/routes/internal.ts` (MODIFY — ~40 lines)

เพิ่ม endpoint สำหรับ Gateway เรียก:

```typescript
// POST /internal/find-or-create-oauth-user
// Body: { email, oauth_provider: 'google', oauth_id, avatar_url }
// Returns: { user_id, email, plan, is_new_user }
// Logic: เหมือน handleOAuthCallback() แต่ไม่ issue JWT (Gateway จะ issue เอง)

// POST /internal/get-user-usage
// Body: { user_id }
// Returns: { current, limit, remaining }
// Logic: ดึง plan limits + daily usage count
```

---

## KV Storage Keys (New)

ใช้ `OAUTH_STATE_KV` ที่มีอยู่แล้ว (Gateway ต้อง access ผ่าน service binding หรือเพิ่ม KV binding):

| Key | Value | TTL | Purpose |
|-----|-------|-----|---------|
| `mcp_client:{client_id}` | `{client_secret, redirect_uris, client_name}` | 24h | Dynamic client registration |
| `mcp_authcode:{code}` | `{user_id, email, plan, client_id, redirect_uri, code_challenge}` | 5min | Authorization code (one-time use) |
| `mcp_oauth_state:{state}` | `{client_state, client_id, redirect_uri, code_challenge, code_challenge_method}` | 10min | OAuth state (CSRF + PKCE) |

**Option**: เพิ่ม KV binding ที่ Gateway แทน service binding (ง่ายกว่า):
```toml
# wrangler.toml (mcp-gateway)
[[kv_namespaces]]
binding = "OAUTH_KV"
id = "a65a07688d774d56bb915cf9e961881a"  # same as OAUTH_STATE_KV
```

---

## AuthContext Change for MCP Handler

ปัจจุบัน `AuthContext` ใน mcp.ts ต้องมี connection ทุก field
ต้องเปลี่ยนให้รองรับ 2 modes:

```typescript
interface AuthContext {
  user: { id: string; email: string; plan: string };
  connection: {
    id: string | null;
    product_type: string | null;
    config: Record<string, unknown> | null;
  };
  apiKey: { id: string };
  usage: { current: number; limit: number; remaining: number };
  authMethod: 'api_key' | 'oauth';  // NEW
}
```

- `authMethod: 'api_key'` → connection filled at auth time (เหมือนเดิม)
- `authMethod: 'oauth'` → connection resolved per tool call

---

## Rate Limiting for OAuth Users

เหมือน API key users — ใช้ plan limits ของ user:
- Free: 100/day, 50/min
- Pro: 5,000/day, 100/min

Gateway ต้องเรียก Platform เพื่อดู usage:
```
POST /internal/get-user-usage { user_id }
→ { current: 42, limit: 100, remaining: 58 }
```

Usage tracking: report ผ่าน `POST /internal/report-usage` เหมือนเดิม
แต่ `api_key_id` = `'oauth'` (ไม่มี API key)

---

## Implementation Order

| Step | File | Description | Depends On |
|------|------|-------------|------------|
| 1 | `mcp-gateway/wrangler.toml` | Add KV binding + secrets | — |
| 2 | `mcp-gateway/src/types.ts` | Update AuthResult + Env types | — |
| 3 | `mcp-gateway/src/routes/oauth.ts` | OAuth Authorization Server (6 endpoints) | 1, 2 |
| 4 | `platform-worker/src/routes/internal.ts` | Add 2 internal endpoints | — |
| 5 | `mcp-gateway/src/routes/auth.ts` | Add JWT auth in authenticateMcpRequest | 2, 4 |
| 6 | `mcp-gateway/src/routes/mcp.ts` | Dynamic connection resolve for JWT | 5 |
| 7 | `mcp-gateway/src/index.ts` | Route OAuth endpoints + 401 response | 3, 5 |
| 8 | Set secrets | `wrangler secret put` for Gateway | — |

Steps 1-2 + 4 ทำ parallel ได้
Steps 3 + 5 + 6 + 7 ทำตามลำดับ

---

## Secrets to Set on MCP Gateway

```bash
cd apps/mcp-gateway
npx wrangler secret put GOOGLE_CLIENT_ID    # ตัวเดียวกับ Platform
npx wrangler secret put GOOGLE_CLIENT_SECRET # ตัวเดียวกับ Platform
npx wrangler secret put JWT_SECRET           # ตัวเดียวกับ Platform (ใช้ verify JWT)
```

**Note**: `JWT_SECRET` ต้องเป็นค่าเดียวกับ Platform Worker เพื่อให้ JWT ที่ issue จาก Gateway verify ได้ทั้ง Gateway และ Platform

---

## Verification

### 1. Test OAuth Discovery
```bash
curl https://mcp.node2flow.net/.well-known/oauth-protected-resource
curl https://mcp.node2flow.net/.well-known/oauth-authorization-server
```

### 2. Test 401 Response
```bash
curl -X POST https://mcp.node2flow.net/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
# Should return 401 + WWW-Authenticate header
```

### 3. Test with Claude Desktop Remote MCP
1. Add `mcp.node2flow.net/mcp` as Remote MCP in Claude Desktop
2. Claude Desktop should detect OAuth → open browser
3. Login with Google → authorize
4. Claude Desktop gets token → connects
5. Test: "List my n8n workflows" → should work

### 4. Test API Key Still Works
```bash
curl -X POST https://mcp.node2flow.net/mcp \
  -H "Authorization: Bearer n2f_xxx" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
# Should work as before
```

---

## Notes

- **ไม่ต้องแก้ Dashboard** — OAuth flow ทำทั้งหมดใน MCP Gateway + Claude Desktop
- **ไม่ต้อง migration** — ไม่มี table ใหม่ ใช้ KV สำหรับ temporary state
- **Existing API key auth ไม่เปลี่ยน** — เพิ่ม JWT path เฉยๆ
- **Google OAuth Redirect URI**: `https://mcp.node2flow.net/oauth/callback` — ต้องเพิ่มใน Google Cloud Console
- **PKCE S256**: `code_challenge = BASE64URL(SHA256(code_verifier))` — required by MCP spec
