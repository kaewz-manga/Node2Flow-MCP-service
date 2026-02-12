/**
 * Gemini RAG Plugin - MCP Gateway
 * Manages Gemini File Search stores, documents, and RAG queries
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { GeminiRagClient } from './client';
import type { CustomMetadata } from './types';

export const geminiRagPlugin: MCPPlugin = {
  id: 'gemini-rag',
  name: 'Gemini RAG',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new GeminiRagClient({
      apiKey: config.api_key as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const gemini = client as GeminiRagClient;

    try {
      let result: unknown;

      switch (toolName) {
        // ========== Store Operations ==========
        case 'gemini_create_store':
          result = await gemini.createStore(args.display_name as string);
          break;
        case 'gemini_list_stores':
          result = await gemini.listStores(
            args.page_size as number | undefined,
            args.page_token as string | undefined
          );
          break;
        case 'gemini_get_store':
          result = await gemini.getStore(args.store_name as string);
          break;
        case 'gemini_delete_store':
          result = await gemini.deleteStore(
            args.store_name as string,
            args.force as boolean | undefined
          );
          break;

        // ========== Upload & Import ==========
        case 'gemini_upload_to_store':
          result = await gemini.uploadToStore(args.store_name as string, {
            mimeType: args.mime_type as string,
            content: args.content as string,
            displayName: args.display_name as string | undefined,
            contentEncoding: (args.content_encoding as 'base64' | 'text') || 'text',
            customMetadata: args.custom_metadata as CustomMetadata[] | undefined,
            chunkingConfig: args.chunking_config as { chunkSize?: number; chunkOverlap?: number } | undefined,
          });
          break;
        case 'gemini_import_file_to_store':
          result = await gemini.importFileToStore(args.store_name as string, {
            fileName: args.file_name as string,
            customMetadata: args.custom_metadata as CustomMetadata[] | undefined,
            chunkingConfig: args.chunking_config as { chunkSize?: number; chunkOverlap?: number } | undefined,
          });
          break;

        // ========== Operations ==========
        case 'gemini_get_operation':
          result = await gemini.getOperation(args.operation_name as string);
          break;
        case 'gemini_get_upload_operation':
          result = await gemini.getUploadOperation(args.operation_name as string);
          break;

        // ========== Document Operations ==========
        case 'gemini_list_documents':
          result = await gemini.listDocuments(
            args.store_name as string,
            args.page_size as number | undefined,
            args.page_token as string | undefined
          );
          break;
        case 'gemini_get_document':
          result = await gemini.getDocument(args.document_name as string);
          break;
        case 'gemini_delete_document':
          result = await gemini.deleteDocument(
            args.document_name as string,
            args.force as boolean | undefined
          );
          break;

        // ========== RAG Query ==========
        case 'gemini_rag_query':
          result = await gemini.ragQuery({
            query: args.query as string,
            storeNames: args.store_names as string[],
            model: args.model as string | undefined,
            metadataFilter: args.metadata_filter as string | undefined,
          });
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
