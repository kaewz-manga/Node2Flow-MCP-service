import type { MCPPlugin } from './types';
import { n8nPlugin } from './plugins/n8n';
import { wordpressPlugin } from './plugins/wordpress';
import { clN8nMcpPlugin } from './plugins/cl-n8n-mcp';
import { geminiRagPlugin } from './plugins/gemini-rag';
import { linePlugin } from './plugins/line';
import { telegramPlugin } from './plugins/telegram';
import { notionPlugin } from './plugins/notion';
import { notionOfficialPlugin } from './plugins/notion-official';
import { lineOfficialPlugin } from './plugins/line-official';
import { playwrightPlugin } from './plugins/playwright';
import { googleWorkspacePlugin } from './plugins/google-workspace';
import { slackPlugin } from './plugins/slack';
import { airtablePlugin } from './plugins/airtable';
import { youtubePlugin } from './plugins/youtube';
import { postgrestPlugin } from './plugins/postgrest';
import { bitkubPlugin } from './plugins/bitkub';
import { binancePlugin } from './plugins/binance';
import { binanceThPlugin } from './plugins/binance-th';
import { googleSheetsPlugin } from './plugins/google-sheets';
import { googleDrivePlugin } from './plugins/google-drive';
import { googleDocsPlugin } from './plugins/google-docs';
import { supabasePlugin } from './plugins/supabase';
import { sqlitePlugin } from './plugins/sqlite';
import { gmailPlugin } from './plugins/gmail';

const PLUGINS = new Map<string, MCPPlugin>();

// Register plugins
PLUGINS.set('n8n', n8nPlugin);
PLUGINS.set('wordpress', wordpressPlugin);
PLUGINS.set('cl-n8n-mcp', clN8nMcpPlugin);
PLUGINS.set('gemini-rag', geminiRagPlugin);
PLUGINS.set('line', linePlugin);
PLUGINS.set('telegram', telegramPlugin);
PLUGINS.set('notion', notionPlugin);
PLUGINS.set('notion-official', notionOfficialPlugin);
PLUGINS.set('line-official', lineOfficialPlugin);
PLUGINS.set('playwright', playwrightPlugin);
PLUGINS.set('google-workspace', googleWorkspacePlugin);
PLUGINS.set('slack', slackPlugin);
PLUGINS.set('airtable', airtablePlugin);
PLUGINS.set('youtube', youtubePlugin);
PLUGINS.set('postgrest', postgrestPlugin);
PLUGINS.set('bitkub', bitkubPlugin);
PLUGINS.set('binance', binancePlugin);
PLUGINS.set('binance-th', binanceThPlugin);
PLUGINS.set('google-sheets', googleSheetsPlugin);
PLUGINS.set('google-drive', googleDrivePlugin);
PLUGINS.set('google-docs', googleDocsPlugin);
PLUGINS.set('supabase', supabasePlugin);
PLUGINS.set('sqlite', sqlitePlugin);
PLUGINS.set('gmail', gmailPlugin);

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
