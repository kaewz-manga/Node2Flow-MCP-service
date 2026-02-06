import type { MCPPlugin } from './types';
// import { n8nPlugin } from './plugins/n8n';
// import { wordpressPlugin } from './plugins/wordpress';

const PLUGINS = new Map<string, MCPPlugin>();

// Register plugins here:
// PLUGINS.set('n8n', n8nPlugin);
// PLUGINS.set('wordpress', wordpressPlugin);

export function getPlugin(productType: string): MCPPlugin | undefined {
  return PLUGINS.get(productType);
}

export function getAllPlugins(): MCPPlugin[] {
  return Array.from(PLUGINS.values());
}

export function getAllTools() {
  return getAllPlugins().flatMap((plugin) => plugin.tools);
}

export function registerPlugin(plugin: MCPPlugin): void {
  PLUGINS.set(plugin.id, plugin);
}
