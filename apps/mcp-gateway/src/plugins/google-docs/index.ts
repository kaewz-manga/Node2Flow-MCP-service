/**
 * Google Docs Plugin - MCP Gateway
 * Manages documents, content, text formatting, tables, headers/footers, and named ranges
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { DocsClient } from './client';

export const googleDocsPlugin: MCPPlugin = {
  id: 'google-docs',
  name: 'Google Docs',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new DocsClient({
      clientId: config.client_id as string,
      clientSecret: config.client_secret as string,
      refreshToken: config.refresh_token as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const doc = client as DocsClient;

    try {
      let result: unknown;

      switch (toolName) {
        case 'gdoc_create':
          result = await doc.createDocument({ title: args.title as string });
          break;
        case 'gdoc_get':
          result = await doc.getDocument({ documentId: args.document_id as string, suggestionsViewMode: args.suggestions_view_mode as string | undefined });
          break;
        case 'gdoc_insert_text':
          result = await doc.insertText({ documentId: args.document_id as string, text: args.text as string, index: args.index as number, segmentId: args.segment_id as string | undefined });
          break;
        case 'gdoc_delete_content':
          result = await doc.deleteContent({ documentId: args.document_id as string, startIndex: args.start_index as number, endIndex: args.end_index as number, segmentId: args.segment_id as string | undefined });
          break;
        case 'gdoc_replace_all_text':
          result = await doc.replaceAllText({ documentId: args.document_id as string, searchText: args.search_text as string, replaceText: args.replace_text as string, matchCase: args.match_case as boolean | undefined });
          break;
        case 'gdoc_insert_inline_image':
          result = await doc.insertInlineImage({ documentId: args.document_id as string, uri: args.uri as string, index: args.index as number, segmentId: args.segment_id as string | undefined, widthMagnitude: args.width_magnitude as number | undefined, heightMagnitude: args.height_magnitude as number | undefined, widthUnit: args.width_unit as string | undefined, heightUnit: args.height_unit as string | undefined });
          break;
        case 'gdoc_insert_page_break':
          result = await doc.insertPageBreak({ documentId: args.document_id as string, index: args.index as number, segmentId: args.segment_id as string | undefined });
          break;
        case 'gdoc_update_text_style':
          result = await doc.updateTextStyle({ documentId: args.document_id as string, startIndex: args.start_index as number, endIndex: args.end_index as number, segmentId: args.segment_id as string | undefined, bold: args.bold as boolean | undefined, italic: args.italic as boolean | undefined, underline: args.underline as boolean | undefined, strikethrough: args.strikethrough as boolean | undefined, fontSize: args.font_size as number | undefined, fontFamily: args.font_family as string | undefined, foregroundColorRed: args.foreground_color_red as number | undefined, foregroundColorGreen: args.foreground_color_green as number | undefined, foregroundColorBlue: args.foreground_color_blue as number | undefined, backgroundColorRed: args.background_color_red as number | undefined, backgroundColorGreen: args.background_color_green as number | undefined, backgroundColorBlue: args.background_color_blue as number | undefined, linkUrl: args.link_url as string | undefined, baselineOffset: args.baseline_offset as string | undefined, smallCaps: args.small_caps as boolean | undefined });
          break;
        case 'gdoc_update_paragraph_style':
          result = await doc.updateParagraphStyle({ documentId: args.document_id as string, startIndex: args.start_index as number, endIndex: args.end_index as number, segmentId: args.segment_id as string | undefined, namedStyleType: args.named_style_type as string | undefined, alignment: args.alignment as string | undefined, lineSpacing: args.line_spacing as number | undefined, spaceAboveMagnitude: args.space_above_magnitude as number | undefined, spaceBelowMagnitude: args.space_below_magnitude as number | undefined, indentFirstLineMagnitude: args.indent_first_line_magnitude as number | undefined, indentStartMagnitude: args.indent_start_magnitude as number | undefined, indentEndMagnitude: args.indent_end_magnitude as number | undefined, direction: args.direction as string | undefined, headingId: args.heading_id as string | undefined });
          break;
        case 'gdoc_create_bullets':
          result = await doc.createBullets({ documentId: args.document_id as string, startIndex: args.start_index as number, endIndex: args.end_index as number, segmentId: args.segment_id as string | undefined, bulletPreset: args.bullet_preset as string });
          break;
        case 'gdoc_delete_bullets':
          result = await doc.deleteBullets({ documentId: args.document_id as string, startIndex: args.start_index as number, endIndex: args.end_index as number, segmentId: args.segment_id as string | undefined });
          break;
        case 'gdoc_insert_table':
          result = await doc.insertTable({ documentId: args.document_id as string, rows: args.rows as number, columns: args.columns as number, index: args.index as number, segmentId: args.segment_id as string | undefined });
          break;
        case 'gdoc_insert_table_row':
          result = await doc.insertTableRow({ documentId: args.document_id as string, tableStartIndex: args.table_start_index as number, rowIndex: args.row_index as number, columnIndex: args.column_index as number, insertBelow: args.insert_below as boolean });
          break;
        case 'gdoc_insert_table_column':
          result = await doc.insertTableColumn({ documentId: args.document_id as string, tableStartIndex: args.table_start_index as number, rowIndex: args.row_index as number, columnIndex: args.column_index as number, insertRight: args.insert_right as boolean });
          break;
        case 'gdoc_delete_table_row':
          result = await doc.deleteTableRow({ documentId: args.document_id as string, tableStartIndex: args.table_start_index as number, rowIndex: args.row_index as number, columnIndex: args.column_index as number });
          break;
        case 'gdoc_delete_table_column':
          result = await doc.deleteTableColumn({ documentId: args.document_id as string, tableStartIndex: args.table_start_index as number, rowIndex: args.row_index as number, columnIndex: args.column_index as number });
          break;
        case 'gdoc_merge_table_cells':
          result = await doc.mergeTableCells({ documentId: args.document_id as string, tableStartIndex: args.table_start_index as number, rowIndex: args.row_index as number, columnIndex: args.column_index as number, rowSpan: args.row_span as number, columnSpan: args.column_span as number });
          break;
        case 'gdoc_unmerge_table_cells':
          result = await doc.unmergeTableCells({ documentId: args.document_id as string, tableStartIndex: args.table_start_index as number, rowIndex: args.row_index as number, columnIndex: args.column_index as number, rowSpan: args.row_span as number, columnSpan: args.column_span as number });
          break;
        case 'gdoc_create_header':
          result = await doc.createHeader({ documentId: args.document_id as string, type: args.type as string, sectionBreakIndex: args.section_break_index as number | undefined });
          break;
        case 'gdoc_create_footer':
          result = await doc.createFooter({ documentId: args.document_id as string, type: args.type as string, sectionBreakIndex: args.section_break_index as number | undefined });
          break;
        case 'gdoc_delete_header':
          result = await doc.deleteHeader({ documentId: args.document_id as string, headerId: args.header_id as string });
          break;
        case 'gdoc_delete_footer':
          result = await doc.deleteFooter({ documentId: args.document_id as string, footerId: args.footer_id as string });
          break;
        case 'gdoc_insert_section_break':
          result = await doc.insertSectionBreak({ documentId: args.document_id as string, index: args.index as number, sectionType: args.section_type as string, segmentId: args.segment_id as string | undefined });
          break;
        case 'gdoc_create_named_range':
          result = await doc.createNamedRange({ documentId: args.document_id as string, name: args.name as string, startIndex: args.start_index as number, endIndex: args.end_index as number, segmentId: args.segment_id as string | undefined });
          break;
        case 'gdoc_delete_named_range':
          result = await doc.deleteNamedRange({ documentId: args.document_id as string, namedRangeId: args.named_range_id as string | undefined, name: args.name as string | undefined });
          break;
        case 'gdoc_batch_update':
          result = await doc.batchUpdate({ documentId: args.document_id as string, requests: args.requests as Record<string, unknown>[] });
          break;
        default:
          return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }], isError: false };
    } catch (error) {
      return { content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
  },
};
