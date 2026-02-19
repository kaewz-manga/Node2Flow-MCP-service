---
name: dashboard-theme
description: Auto-loads when editing dashboard CSS, styling, or UI components. Provides the dark theme CSS variables, component patterns, and design conventions.
---

# Dashboard Theme Reference

Dark-only theme. No light mode. All CSS vars in `apps/dashboard/src/index.css`.

## CSS Variables

### Colors (HSL format, no `hsl()` wrapper)
```css
--background: 0 0% 0%           /* pure black */
--foreground: 0 0% 98%          /* near white */
--card: 0 0% 0%                 /* pure black (matches bg) */
--card-foreground: 0 0% 98%
--popover: 240 10% 3.9%
--primary: 0 0% 98%
--primary-foreground: 240 5.9% 10%
--secondary: 240 3.7% 15.9%
--muted: 240 3.7% 15.9%
--muted-foreground: 240 5% 64.9%
--accent: 240 3.7% 15.9%
--border: 240 3.7% 15.9%
--ring: 240 4.9% 83.9%
--destructive: 0 62.8% 30.6%
```

### Sidebar
```css
--sidebar-background: 0 0% 0%   /* pure black */
--sidebar-foreground: 240 4.8% 95.9%
--sidebar-accent: 240 3.7% 15.9%
--sidebar-border: 240 3.7% 15.9%
--sidebar-ring: 217.2 91.2% 59.8%
```

### Chart
```css
--chart-1: 220 70% 50%
--chart-2: 160 60% 45%
--chart-3: 30 80% 55%
--chart-4: 280 65% 60%
--chart-5: 340 75% 55%
```

## Scrollbar
```css
/* Firefox */
scrollbar-color: hsl(var(--border)) transparent;
scrollbar-width: thin;

/* Chrome/Edge — 6px width */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: hsla(var(--muted-foreground) / 0.5); }
```

## Page Layout

### Standard page padding
```tsx
<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
```

### Card sizing
```tsx
<CardHeader className="px-4 pt-4 pb-2">
<CardContent className="px-4 pb-4">
```

### Tables — full width, no max-w
```tsx
<div className="rounded-md border">
  <Table>...</Table>
</div>
```

## Component Patterns

### Status dots (not Badge)
```tsx
<span className="inline-block h-2 w-2 rounded-full bg-green-500" />
```
- `bg-green-500` / `bg-green-400` — active
- `bg-amber-500` — warning/suspended
- `bg-red-500` — error/deleted
- `bg-blue-500` — new
- `bg-muted-foreground` — inactive

### Empty states
```tsx
<EmptyMedia variant="icon"><SomeIcon /></EmptyMedia>
```

### Info alerts (blue tint)
```tsx
<Alert className="bg-blue-950/20 border-blue-900/50">
  <Info className="h-4 w-4 text-blue-400" />
  <AlertDescription className="text-sm text-muted-foreground">...</AlertDescription>
</Alert>
```

## Rules
1. Never use `border-0` on cards — keep default visible borders
2. Pure black backgrounds everywhere (`0 0% 0%`)
3. Status: dots not badges
4. Tables: full width, `px-4 lg:px-6` padding on page
5. Cards blend with background (same black)
