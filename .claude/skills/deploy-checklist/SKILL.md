---
name: deploy-checklist
description: Deployment checklist and commands for Node2Flow services. Auto-loads when deploying gateway, dashboard, or platform-worker.
disable-model-invocation: true
---

# Deploy Checklist

## Pre-Deploy

```bash
# 1. Verify TypeScript compiles (ALWAYS first)
pnpm turbo build
```

If build fails → fix TypeScript errors before deploying.

## Deploy Commands

### Gateway (`mcp.node2flow.net`)
```bash
cd apps/mcp-gateway && npx wrangler deploy
```

### Dashboard (`app.node2flow.net`)
```bash
cd apps/dashboard && npx wrangler pages deploy dist --project-name=node2flow-dashboard
```

### Platform Worker (`platform.node2flow.net`)
```bash
cd apps/platform-worker && npx wrangler deploy
```

### Shorthand: "deploy" = gateway + dashboard
```bash
pnpm turbo build && cd apps/mcp-gateway && npx wrangler deploy && cd ../dashboard && npx wrangler pages deploy dist --project-name=node2flow-dashboard
```

## Post-Deploy Verification

```bash
# Health checks
curl -s https://mcp.node2flow.net/ | head -5
curl -s -o /dev/null -w "%{http_code}" https://app.node2flow.net/
curl -s https://platform.node2flow.net/ | head -5
```

## D1 Migrations (only when needed)

```bash
cd apps/mcp-gateway && npx wrangler d1 migrations apply node2flow-products-db
cd apps/platform-worker && npx wrangler d1 migrations apply node2flow-platform-db
```

## Wrangler Secrets (set once, persist)

```bash
# Set a new secret
cd apps/mcp-gateway && npx wrangler secret put SECRET_NAME
# List existing secrets
cd apps/mcp-gateway && npx wrangler secret list
```

Never display secret values. Only set new ones when explicitly requested.

## Common Issues

| Issue | Fix |
|-------|-----|
| TypeScript error in packages | `pnpm turbo build` catches it — fix source in `packages/` |
| Dashboard deploy fails | Ensure `dist/` exists — run `tsc -b && vite build` first |
| Wrangler auth expired | `npx wrangler login` |
| D1 migration conflict | Check `migrations/` folder for duplicate numbers |
