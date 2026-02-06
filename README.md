# Node2Flow MCP Service

Centralized platform for multiple SaaS MCP products with Plugin Architecture.

## Architecture

- **Platform Worker** (`apps/platform-worker/`) - Auth, billing, user management
- **MCP Gateway Worker** (`apps/mcp-gateway/`) - All MCP products as plugins
- **Dashboard** (`apps/dashboard/`) - Single SPA for all products

## Shared Packages

- `@node2flow/platform-core` - Auth, billing, crypto, database utilities
- `@node2flow/dashboard-core` - Shared React components, themes, contexts

## Quick Start

```bash
pnpm install
pnpm dev          # Start all apps
pnpm build        # Build all
pnpm test         # Run tests
```

## Adding a New Product Plugin

1. Copy `apps/mcp-gateway/src/plugins/_template/` to `plugins/your-product/`
2. Define MCP tools in `tools.ts`
3. Create HTTP client in `client.ts`
4. Implement handler in `index.ts`
5. Register in `plugin-registry.ts`

See [docs/PLATFORM_PLAN.md](docs/PLATFORM_PLAN.md) for full architecture details.
