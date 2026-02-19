---
name: plugin-template
description: Auto-loads when creating a new MCP plugin. Provides complete file templates for backend (gateway) and frontend (dashboard) plugin files with all required patterns.
---

# New Plugin Template

Use these templates when creating a new plugin. Replace `xyz` with the plugin name.

## Backend: `apps/mcp-gateway/src/plugins/xyz/types.ts`

```typescript
// Response types from the external API

export interface XyzItem {
  id: string;
  name: string;
  // Add fields matching API responses
}

export interface XyzListResponse {
  items: XyzItem[];
  total: number;
}
```

## Backend: `apps/mcp-gateway/src/plugins/xyz/client.ts`

```typescript
import type { XyzItem, XyzListResponse } from './types';

export class XyzClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: { apiKey: string }) {
    this.baseUrl = 'https://api.example.com';
    this.apiKey = config.apiKey;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text}`);
    }
    return res.json();
  }

  async list(): Promise<XyzListResponse> {
    return this.request('GET', '/items');
  }

  async get(id: string): Promise<XyzItem> {
    return this.request('GET', `/items/${id}`);
  }

  async create(data: Partial<XyzItem>): Promise<XyzItem> {
    return this.request('POST', '/items', data);
  }

  async update(id: string, data: Partial<XyzItem>): Promise<XyzItem> {
    return this.request('PUT', `/items/${id}`, data);
  }

  async remove(id: string): Promise<void> {
    await this.request('DELETE', `/items/${id}`);
  }
}
```

## Backend: `apps/mcp-gateway/src/plugins/xyz/tools.ts`

```typescript
import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  {
    name: 'xyz_list',
    description: 'List all items',
    inputSchema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Max results (default 20)' },
      },
      required: [],
    },
  },
  {
    name: 'xyz_get',
    description: 'Get item by ID',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Item ID' },
      },
      required: ['id'],
    },
  },
  // Add more tools...
];
```

## Backend: `apps/mcp-gateway/src/plugins/xyz/index.ts`

```typescript
import type { MCPPlugin, MCPToolResult } from '../../types';
import { TOOLS } from './tools';
import { XyzClient } from './client';

function ok(data: unknown): MCPToolResult {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function err(msg: string): MCPToolResult {
  return { content: [{ type: 'text' as const, text: msg }], isError: true };
}

export const xyzPlugin: MCPPlugin = {
  id: 'xyz',
  name: 'XYZ Service',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new XyzClient({
      apiKey: config.api_key as string,
    });
  },

  async handleToolCall(toolName, args, client) {
    const c = client as XyzClient;
    try {
      switch (toolName) {
        case 'xyz_list': return ok(await c.list());
        case 'xyz_get': return ok(await c.get(args.id as string));
        default: return err(`Unknown tool: ${toolName}`);
      }
    } catch (e: unknown) {
      return err(e instanceof Error ? e.message : String(e));
    }
  },
};
```

## Registration: `apps/mcp-gateway/src/plugin-registry.ts`

```typescript
import { xyzPlugin } from './plugins/xyz';
PLUGINS.set('xyz', xyzPlugin);
```

## Frontend: `apps/dashboard/src/plugins/xyz/content.tsx`

```typescript
import { SomeIcon, AnotherIcon, ThirdIcon } from 'lucide-react';
import type { PluginContent } from '../registry';

export const xyzContent: PluginContent = {
  tagline: 'Manage XYZ with AI',
  description: 'Brief description of what this plugin does.',
  features: [
    { icon: <SomeIcon className="h-6 w-6" />, title: 'Feature Group 1', description: 'What this group does' },
    { icon: <AnotherIcon className="h-6 w-6" />, title: 'Feature Group 2', description: 'What this group does' },
    { icon: <ThirdIcon className="h-6 w-6" />, title: 'Feature Group 3', description: 'What this group does' },
  ],
  setupSteps: [{ title: 'Get API Key', description: 'Where to find the API key...' }],
  demoCode: `> Example prompt\n\nExample response...`,
  externalDocUrl: 'https://docs.example.com',
  quickStartSteps: ['Get API key from service', 'Add connection', 'Copy generated API key', 'Start using!'],
  emptyConnectionCTA: 'Add your first XYZ connection',
  connectionGuide: (<>...</>),
  examplePrompts: ['List all items', 'Create a new item called "test"'],
  mcpConfigName: 'xyz',
  faqCategories: [{ name: 'XYZ', icon: <SomeIcon className="h-5 w-5" />, items: [
    { question: 'What do I need?', answer: (<p>An API key from...</p>) },
  ]}],
};
```

## Frontend: `apps/dashboard/src/plugins/xyz/Connections.tsx`

See the `connection-page` skill for the full Connections.tsx template.

## Frontend Registration

**`apps/dashboard/src/plugins/registry.ts`**:
```typescript
import { xyzContent } from './xyz/content';
export const xyzPlugin: AppPlugin = {
  id: 'xyz',
  name: 'XYZ',
  icon: SomeIcon,
  logo: '/logos/xyz.svg',
  requiresConnection: true,
  sidebarItems: [{ name: 'Connections', href: '/xyz/connections' }],
  routes: [{ path: '/xyz/connections', component: lazy(() => import('./xyz/Connections')) }],
  content: xyzContent,
};
// Add to: export const PLUGINS: AppPlugin[] = [..., xyzPlugin];
```

**`apps/dashboard/src/lib/gateway-api.ts`**:
```typescript
export const xzCall = callFactory('xyz');
export async function xyzListItems(connId: string) { return xzCall(connId, 'xyz_list', {}); }
```

## Code Quality Rules (MUST follow)

All generated code MUST pass `npx eslint src/` with 0 errors.

### React Hooks Standards
```tsx
// ✅ CORRECT — function defined inside useEffect
useEffect(() => {
  async function fetchData() {
    setLoading(true);
    const res = await getConnections('xyz');
    if (res.success && res.data) setConnections(res.data.connections);
    setLoading(false);
  }
  fetchData();
}, []);

// ❌ WRONG — hook after early return
if (loading) return <Spinner />;
const filtered = useMemo(() => ..., [search]);  // NEVER after return!

// ❌ WRONG — setState at effect top level
useEffect(() => {
  setLoading(true);  // synchronous setState = cascading render
  fetchData();
}, []);

// ❌ WRONG — function accessed before declaration
useEffect(() => { loadData(); }, []);
const loadData = async () => { ... };  // declared after use!
```

### Verification
After generating any frontend code, run:
```bash
cd apps/dashboard && npx eslint src/plugins/xyz/ && cd ../.. && pnpm turbo build
```
