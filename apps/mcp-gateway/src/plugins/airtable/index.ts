/**
 * Airtable API Plugin - MCP Gateway
 * Manages Airtable bases, records, schema, and webhooks
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { AirtableClient } from './client';

export const airtablePlugin: MCPPlugin = {
  id: 'airtable',
  name: 'Airtable',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new AirtableClient({
      pat: config.personal_access_token as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const at = client as AirtableClient;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Records (6) ==========
        case 'airtable_list_records':
          result = await at.listRecords(
            args.base_id as string,
            args.table_id_or_name as string,
            {
              pageSize: args.page_size as number | undefined,
              maxRecords: args.max_records as number | undefined,
              view: args.view as string | undefined,
              filterByFormula: args.filter_by_formula as string | undefined,
              sort: args.sort as Array<{ field: string; direction?: string }> | undefined,
              fields: args.fields as string[] | undefined,
              offset: args.offset as string | undefined,
            }
          );
          break;
        case 'airtable_get_record':
          result = await at.getRecord(
            args.base_id as string,
            args.table_id_or_name as string,
            args.record_id as string
          );
          break;
        case 'airtable_create_records':
          result = await at.createRecords(
            args.base_id as string,
            args.table_id_or_name as string,
            args.records as Array<{ fields: Record<string, unknown> }>,
            args.typecast as boolean | undefined
          );
          break;
        case 'airtable_update_records':
          result = await at.updateRecords(
            args.base_id as string,
            args.table_id_or_name as string,
            args.records as Array<{ id: string; fields: Record<string, unknown> }>,
            args.typecast as boolean | undefined
          );
          break;
        case 'airtable_delete_records':
          result = await at.deleteRecords(
            args.base_id as string,
            args.table_id_or_name as string,
            args.record_ids as string[]
          );
          break;
        case 'airtable_upsert_records':
          result = await at.upsertRecords(
            args.base_id as string,
            args.table_id_or_name as string,
            args.records as Array<{ fields: Record<string, unknown> }>,
            args.fields_to_merge_on as string[],
            args.typecast as boolean | undefined
          );
          break;

        // ========== Bases & Schema (7) ==========
        case 'airtable_list_bases':
          result = await at.listBases(args.offset as string | undefined);
          break;
        case 'airtable_get_base_schema':
          result = await at.getBaseSchema(args.base_id as string);
          break;
        case 'airtable_create_base':
          result = await at.createBase(
            args.name as string,
            args.workspace_id as string,
            args.tables as Array<{
              name: string;
              fields: Array<{ name: string; type: string; options?: Record<string, unknown> }>;
              description?: string;
            }>
          );
          break;
        case 'airtable_create_table':
          result = await at.createTable(
            args.base_id as string,
            args.name as string,
            args.fields as Array<{ name: string; type: string; options?: Record<string, unknown> }>,
            args.description as string | undefined
          );
          break;
        case 'airtable_update_table':
          result = await at.updateTable(
            args.base_id as string,
            args.table_id as string,
            { name: args.name as string | undefined, description: args.description as string | undefined }
          );
          break;
        case 'airtable_create_field':
          result = await at.createField(
            args.base_id as string,
            args.table_id as string,
            args.name as string,
            args.type as string,
            args.options as Record<string, unknown> | undefined,
            args.description as string | undefined
          );
          break;
        case 'airtable_update_field':
          result = await at.updateField(
            args.base_id as string,
            args.table_id as string,
            args.field_id as string,
            { name: args.name as string | undefined, description: args.description as string | undefined }
          );
          break;

        // ========== Webhooks (5) ==========
        case 'airtable_create_webhook':
          result = await at.createWebhook(
            args.base_id as string,
            args.notification_url as string,
            args.specification as Record<string, unknown> | undefined
          );
          break;
        case 'airtable_list_webhooks':
          result = await at.listWebhooks(args.base_id as string);
          break;
        case 'airtable_refresh_webhook':
          result = await at.refreshWebhook(
            args.base_id as string,
            args.webhook_id as string
          );
          break;
        case 'airtable_list_webhook_payloads':
          result = await at.listWebhookPayloads(
            args.base_id as string,
            args.webhook_id as string,
            args.cursor as number | undefined,
            args.limit as number | undefined
          );
          break;
        case 'airtable_delete_webhook':
          result = await at.deleteWebhook(
            args.base_id as string,
            args.webhook_id as string
          );
          break;

        default:
          return {
            content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }],
            isError: true,
          };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  },
};
