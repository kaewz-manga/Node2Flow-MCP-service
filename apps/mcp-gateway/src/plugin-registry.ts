import type { MCPPlugin } from './types';
import { n8nPlugin } from './plugins/n8n';
import { wordpressPlugin } from './plugins/wordpress';
import { clN8nMcpPlugin } from './plugins/cl-n8n-mcp';
import { geminiRagPlugin } from './plugins/gemini-rag';
import { linePlugin } from './plugins/line';
import { telegramPlugin } from './plugins/telegram';
import { notionPlugin } from './plugins/notion';
import { notionExtendedPlugin } from './plugins/notion-extended';
import { lineExtendedPlugin } from './plugins/line-extended';

const PLUGINS = new Map<string, MCPPlugin>();

// Register plugins
PLUGINS.set('n8n', n8nPlugin);
PLUGINS.set('wordpress', wordpressPlugin);
PLUGINS.set('cl-n8n-mcp', clN8nMcpPlugin);
PLUGINS.set('gemini-rag', geminiRagPlugin);
PLUGINS.set('line', linePlugin);
PLUGINS.set('telegram', telegramPlugin);
PLUGINS.set('notion', notionPlugin);
PLUGINS.set('notion-extended', notionExtendedPlugin);
PLUGINS.set('line-extended', lineExtendedPlugin);

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
