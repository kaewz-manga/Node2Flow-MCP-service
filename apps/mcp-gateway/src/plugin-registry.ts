import type { MCPPlugin } from './types';
import { n8nPlugin } from './plugins/n8n';

const PLUGINS = new Map<string, MCPPlugin>();

// Register plugins
PLUGINS.set('n8n', n8nPlugin);
// PLUGINS.set('wordpress', wordpressPlugin);
// PLUGINS.set('make', makePlugin);

export function getPlugin(productType: string): MCPPlugin | undefined {
  return PLUGINS.get(productType);
}

export function getAllPlugins(): MCPPlugin[] {
  return Array.from(PLUGINS.values());
}

export function getAllTools() {
  return getAllPlugins().flatMap((plugin) =>
    plugin.tools.map((tool) => ({
      ...tool,
      // Prefix with plugin id if not already prefixed
      name: tool.name,
    }))
  );
}

export function findPluginForTool(toolName: string): MCPPlugin | undefined {
  for (const plugin of PLUGINS.values()) {
    if (plugin.tools.some((t) => t.name === toolName)) {
      return plugin;
    }
  }
  return undefined;
}

export function registerPlugin(plugin: MCPPlugin): void {
  PLUGINS.set(plugin.id, plugin);
}
