---
name: connection-page
description: Auto-loads when creating or editing a plugin Connections.tsx page. Provides the exact standardized pattern used by all 32 plugins.
---

# Connection Page Pattern

All 32 plugins use this identical Connections.tsx structure. Only the form fields and plugin-specific text change.

## Structure

```
1. MCP Endpoint card (top)           — Copy URL button
2. Header (title + Add button)       — Add button hidden when empty
3. 2FA Alert (conditional)           — Shield icon + enable link
4. Error Alert (conditional)
5. Blue Info Alert                   — Connection key explanation
6. Empty State OR Table              — Ternary switch
7. Add Connection Dialog
8. API Key Display Dialog
9. Edit Name (Sheet on mobile, Dialog on desktop)
10. Delete Confirmation AlertDialog
11. Revoke Key AlertDialog
12. Generate Key AlertDialog
```

## Key Patterns

### Imports
All from `@node2flow/dashboard-core` (single import):
```typescript
import { getConnections, useConnection, useSudoContext, type Connection, Field, FieldLabel,
  FieldDescription, InputGroup, InputGroupInput, InputGroupAddon, Button, Card, CardContent,
  Alert, AlertTitle, AlertDescription, Badge, Table, TableHeader, TableBody, TableHead,
  TableRow, TableCell, Dialog, DialogContent, DialogHeader, DialogTitle, AlertDialog,
  AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Item, ItemMedia, ItemContent,
  ItemTitle, ItemDescription, ItemActions, DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, Empty, EmptyHeader,
  EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, useIsMobile, Sheet, SheetContent,
  SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@node2flow/dashboard-core';
```

### API functions
```typescript
import { createConnection, updateConnection, deleteConnection } from '../../lib/gateway-api';
import { getApiKeys, createApiKey, deleteApiKey } from '../../lib/platform-api';
import type { ApiKeyInfo } from '../../lib/platform-api';
```

### MCP Endpoint card
```tsx
const mcpUrl = `${import.meta.env.VITE_GATEWAY_URL || 'https://mcp.node2flow.net'}/mcp`;

<Item>
  <ItemMedia><img src="/logos/xyz.svg?v=2" alt="XYZ" className="h-10 w-10" /></ItemMedia>
  <ItemContent>
    <ItemTitle>MCP Endpoint</ItemTitle>
    <ItemDescription><code className="font-mono text-xs text-foreground break-all">{mcpUrl}</code></ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(mcpUrl); ... }}>
      {copiedMcp ? <><Check /> Copied</> : <><Copy /> Copy URL</>}
    </Button>
  </ItemActions>
</Item>
```

### Header (hide Add button when empty)
```tsx
{connections.length > 0 && (
  <Button variant="outline" onClick={() => setShowAddModal(true)}>
    <Plus className="h-4 w-4 mr-2" /> Add Connection
  </Button>
)}
```

### Empty state
```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><PluginSpecificIcon /></EmptyMedia>
    <EmptyTitle>No connections yet</EmptyTitle>
    <EmptyDescription>Add your XYZ credentials to get started.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button variant="outline" onClick={() => setShowAddModal(true)}>
      <Plus className="h-4 w-4 mr-2" />Add Connection
    </Button>
    <p className="text-xs text-muted-foreground">
      By connecting, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>
    </p>
  </EmptyContent>
</Empty>
```

### Edit: mobile Sheet, desktop Dialog
```tsx
{isMobile ? (
  <Sheet open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
    <SheetContent side="bottom">...</SheetContent>
  </Sheet>
) : (
  <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
    <DialogContent>...</DialogContent>
  </Dialog>
)}
```

### Status dot (not Badge)
```tsx
<div className={`w-2.5 h-2.5 rounded-full mx-auto ${conn.status === 'active' ? 'bg-green-400' : 'bg-muted-foreground'}`} />
```

### Page wrapper
```tsx
<div className="space-y-6 px-4 lg:px-6">
```

## What Changes Per Plugin

Only these parts differ between plugins:

| Part | Changes |
|------|---------|
| Logo path | `/logos/xyz.svg` |
| Plugin ID | `'xyz'` in `getConnections()` / `createConnection()` |
| Page title | "XYZ Connections" |
| Form fields | Match `createClient()` config keys |
| Empty state icon | Plugin-specific Lucide icon |
| Empty state description | Plugin-specific text |
| Info alert text | How to get credentials |
| Add dialog fields | `Field` + `InputGroup` for each config key |

## Form Field Patterns

```tsx
{/* Text field */}
<Field>
  <FieldLabel>API Key</FieldLabel>
  <InputGroup>
    <InputGroupAddon><Key /></InputGroupAddon>
    <InputGroupInput type="password" placeholder="sk-xxx" value={formApiKey}
      onChange={(e) => setFormApiKey(e.target.value)} required />
  </InputGroup>
  <FieldDescription>From Settings → API Keys</FieldDescription>
</Field>

{/* Optional field (no required attr) */}
<Field>
  <FieldLabel>Account ID <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
  <InputGroup>
    <InputGroupAddon><Hash /></InputGroupAddon>
    <InputGroupInput type="text" value={formAccountId}
      onChange={(e) => setFormAccountId(e.target.value)} />
  </InputGroup>
</Field>
```

## Code Quality Rules (MUST follow)

All Connections.tsx code MUST pass ESLint with 0 errors.

### Standard useEffect pattern for data fetching
```tsx
// ✅ CORRECT — async function INSIDE useEffect, no top-level setState
useEffect(() => {
  async function fetchData() {
    try {
      setError('');
      const [connRes, keyRes] = await Promise.all([
        getConnections('xyz'),
        getApiKeys(),
      ]);
      if (connRes.success && connRes.data) setConnections(connRes.data.connections);
      if (keyRes.success && keyRes.data) setApiKeys(keyRes.data.api_keys);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

### Rules
- **NEVER** place `useMemo`/`useCallback` after early returns (`if (loading) return`)
- **NEVER** call setState synchronously at useEffect body top level
- **NEVER** access functions before they are declared
- **ALWAYS** include all deps in useEffect/useMemo dependency arrays
- **ALWAYS** only import components that are actually used
- **Verify**: `cd apps/dashboard && npx eslint src/plugins/xyz/Connections.tsx`
