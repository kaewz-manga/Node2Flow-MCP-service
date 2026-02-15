/**
 * Google Sheets Plugin - MCP Gateway
 * Manages spreadsheets, values, sheets, formatting, and data operations
 */

import type { MCPPlugin } from '../../types';
import { TOOLS } from './tools';
import { SheetsClient } from './client';

export const googleSheetsPlugin: MCPPlugin = {
  id: 'google-sheets',
  name: 'Google Sheets',
  version: '1.0.0',
  tools: TOOLS,

  createClient(config: Record<string, unknown>) {
    return new SheetsClient({
      clientId: config.client_id as string,
      clientSecret: config.client_secret as string,
      refreshToken: config.refresh_token as string,
    });
  },

  async handleToolCall(toolName: string, args: Record<string, unknown>, client: unknown) {
    const gs = client as SheetsClient;

    try {
      let result: unknown;

      switch (toolName) {
        case 'gs_create_spreadsheet':
          result = await gs.createSpreadsheet({ title: args.title as string, sheetTitles: args.sheet_titles as string[] | undefined, locale: args.locale as string | undefined, timeZone: args.time_zone as string | undefined });
          break;
        case 'gs_get_spreadsheet':
          result = await gs.getSpreadsheet({ spreadsheetId: args.spreadsheet_id as string, ranges: args.ranges as string[] | undefined, includeGridData: args.include_grid_data as boolean | undefined, fields: (args.fields || args._fields) as string | undefined });
          break;
        case 'gs_read_values':
          result = await gs.readValues({ spreadsheetId: args.spreadsheet_id as string, range: args.range as string, majorDimension: args.major_dimension as string | undefined, valueRenderOption: args.value_render_option as string | undefined, dateTimeRenderOption: args.date_time_render_option as string | undefined });
          break;
        case 'gs_batch_read':
          result = await gs.batchRead({ spreadsheetId: args.spreadsheet_id as string, ranges: args.ranges as string[], majorDimension: args.major_dimension as string | undefined, valueRenderOption: args.value_render_option as string | undefined });
          break;
        case 'gs_write_values':
          result = await gs.writeValues({ spreadsheetId: args.spreadsheet_id as string, range: args.range as string, values: args.values as unknown[][], valueInputOption: args.value_input_option as string | undefined });
          break;
        case 'gs_append_values':
          result = await gs.appendValues({ spreadsheetId: args.spreadsheet_id as string, range: args.range as string, values: args.values as unknown[][], valueInputOption: args.value_input_option as string | undefined, insertDataOption: args.insert_data_option as string | undefined });
          break;
        case 'gs_clear_values':
          result = await gs.clearValues({ spreadsheetId: args.spreadsheet_id as string, range: args.range as string });
          break;
        case 'gs_batch_write':
          result = await gs.batchWrite({ spreadsheetId: args.spreadsheet_id as string, data: args.data as Array<{ range: string; values: unknown[][] }>, valueInputOption: args.value_input_option as string | undefined });
          break;
        case 'gs_add_sheet':
          result = await gs.addSheet({ spreadsheetId: args.spreadsheet_id as string, title: args.title as string, rowCount: args.row_count as number | undefined, columnCount: args.column_count as number | undefined, tabColorRed: args.tab_color_red as number | undefined, tabColorGreen: args.tab_color_green as number | undefined, tabColorBlue: args.tab_color_blue as number | undefined });
          break;
        case 'gs_delete_sheet':
          result = await gs.deleteSheet({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number });
          break;
        case 'gs_rename_sheet':
          result = await gs.renameSheet({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, title: args.title as string });
          break;
        case 'gs_copy_sheet':
          result = await gs.copySheet({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, destinationSpreadsheetId: args.destination_spreadsheet_id as string });
          break;
        case 'gs_duplicate_sheet':
          result = await gs.duplicateSheet({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, newSheetName: args.new_sheet_name as string | undefined, insertSheetIndex: args.insert_sheet_index as number | undefined });
          break;
        case 'gs_format_cells':
          result = await gs.formatCells({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, startRowIndex: args.start_row_index as number, endRowIndex: args.end_row_index as number, startColumnIndex: args.start_column_index as number, endColumnIndex: args.end_column_index as number, bold: args.bold as boolean | undefined, italic: args.italic as boolean | undefined, strikethrough: args.strikethrough as boolean | undefined, underline: args.underline as boolean | undefined, fontSize: args.font_size as number | undefined, fontFamily: args.font_family as string | undefined, foregroundColorRed: args.foreground_color_red as number | undefined, foregroundColorGreen: args.foreground_color_green as number | undefined, foregroundColorBlue: args.foreground_color_blue as number | undefined, backgroundColorRed: args.background_color_red as number | undefined, backgroundColorGreen: args.background_color_green as number | undefined, backgroundColorBlue: args.background_color_blue as number | undefined, horizontalAlignment: args.horizontal_alignment as string | undefined, verticalAlignment: args.vertical_alignment as string | undefined, wrapStrategy: args.wrap_strategy as string | undefined, numberFormatType: args.number_format_type as string | undefined, numberFormatPattern: args.number_format_pattern as string | undefined });
          break;
        case 'gs_merge_cells':
          result = await gs.mergeCells({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, startRowIndex: args.start_row_index as number, endRowIndex: args.end_row_index as number, startColumnIndex: args.start_column_index as number, endColumnIndex: args.end_column_index as number, mergeType: args.merge_type as string | undefined });
          break;
        case 'gs_unmerge_cells':
          result = await gs.unmergeCells({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, startRowIndex: args.start_row_index as number, endRowIndex: args.end_row_index as number, startColumnIndex: args.start_column_index as number, endColumnIndex: args.end_column_index as number });
          break;
        case 'gs_auto_resize':
          result = await gs.autoResize({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, dimension: args.dimension as string, startIndex: args.start_index as number, endIndex: args.end_index as number });
          break;
        case 'gs_sort_range':
          result = await gs.sortRange({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, startRowIndex: args.start_row_index as number, endRowIndex: args.end_row_index as number, startColumnIndex: args.start_column_index as number, endColumnIndex: args.end_column_index as number, sortColumnIndex: args.sort_column_index as number, sortOrder: args.sort_order as string | undefined });
          break;
        case 'gs_find_replace':
          result = await gs.findReplace({ spreadsheetId: args.spreadsheet_id as string, find: args.find as string, replacement: args.replacement as string, sheetId: args.sheet_id as number | undefined, matchCase: args.match_case as boolean | undefined, matchEntireCell: args.match_entire_cell as boolean | undefined, searchByRegex: args.search_by_regex as boolean | undefined, allSheets: args.all_sheets as boolean | undefined, includeFormulas: args.include_formulas as boolean | undefined });
          break;
        case 'gs_set_basic_filter':
          result = await gs.setBasicFilter({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, startRowIndex: args.start_row_index as number || 0, endRowIndex: args.end_row_index as number || 0, startColumnIndex: args.start_column_index as number || 0, endColumnIndex: args.end_column_index as number || 0, clear: args.clear as boolean | undefined });
          break;
        case 'gs_add_protected_range':
          result = await gs.addProtectedRange({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, startRowIndex: args.start_row_index as number, endRowIndex: args.end_row_index as number, startColumnIndex: args.start_column_index as number, endColumnIndex: args.end_column_index as number, description: args.description as string | undefined, warningOnly: args.warning_only as boolean | undefined, editors: args.editors as string[] | undefined });
          break;
        case 'gs_add_chart':
          result = await gs.addChart({ spreadsheetId: args.spreadsheet_id as string, sheetId: args.sheet_id as number, chartType: args.chart_type as string, title: args.title as string | undefined, dataSheetId: args.data_sheet_id as number, dataStartRowIndex: args.data_start_row_index as number, dataEndRowIndex: args.data_end_row_index as number, dataStartColumnIndex: args.data_start_column_index as number, dataEndColumnIndex: args.data_end_column_index as number, anchorRowIndex: args.anchor_row_index as number | undefined, anchorColumnIndex: args.anchor_column_index as number | undefined });
          break;
        case 'gs_batch_update':
          result = await gs.batchUpdate({ spreadsheetId: args.spreadsheet_id as string, requests: args.requests as Record<string, unknown>[], includeSpreadsheetInResponse: args.include_spreadsheet_in_response as boolean | undefined });
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
