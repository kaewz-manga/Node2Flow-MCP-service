/**
 * Google Sheets API v4 - MCP Tool Definitions (23 tools)
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Spreadsheet (2) ==========
  {
    name: 'gs_create_spreadsheet',
    description:
      'Create a new Google Sheets spreadsheet. Optionally specify sheet/tab names, locale, and timezone. Returns the spreadsheet ID and URL.',
    annotations: {
      title: 'Create Spreadsheet',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Spreadsheet title',
        },
        sheet_titles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names for initial sheets/tabs (default: one sheet named "Sheet1")',
        },
        locale: {
          type: 'string',
          description: 'Locale code (e.g. "en_US", "th_TH")',
        },
        time_zone: {
          type: 'string',
          description: 'Timezone (e.g. "America/New_York", "Asia/Bangkok")',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'gs_get_spreadsheet',
    description:
      'Get spreadsheet metadata — title, sheets list with properties (ID, title, row/column count, frozen rows), and optionally cell data for specific ranges.',
    annotations: {
      title: 'Get Spreadsheet',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID (from URL: /spreadsheets/d/{spreadsheet_id}/)',
        },
        ranges: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional A1 ranges to include grid data (e.g. ["Sheet1!A1:C10"])',
        },
        include_grid_data: {
          type: 'boolean',
          description: 'Include cell data in response (default: false, requires ranges)',
        },
        fields: {
          type: 'string',
          description: 'Fields to return (e.g. "spreadsheetId,properties.title,sheets.properties")',
        },
        _fields: {
          type: 'string',
          description: 'Alias for fields parameter',
        },
      },
      required: ['spreadsheet_id'],
    },
  },

  // ========== Values (6) ==========
  {
    name: 'gs_read_values',
    description:
      'Read cell values from a range using A1 notation (e.g. "Sheet1!A1:C10", "A1:Z", "Sheet1"). Returns a 2D array of values.',
    annotations: {
      title: 'Read Values',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        range: {
          type: 'string',
          description: 'A1 notation range (e.g. "Sheet1!A1:C10", "Sheet1", "A:C")',
        },
        major_dimension: {
          type: 'string',
          description: 'How values are organized: "ROWS" (default) or "COLUMNS"',
        },
        value_render_option: {
          type: 'string',
          description: 'How values are rendered: "FORMATTED_VALUE" (default), "UNFORMATTED_VALUE", "FORMULA"',
        },
        date_time_render_option: {
          type: 'string',
          description: 'How dates are rendered: "SERIAL_NUMBER" or "FORMATTED_STRING" (default)',
        },
      },
      required: ['spreadsheet_id', 'range'],
    },
  },
  {
    name: 'gs_batch_read',
    description:
      'Read values from multiple ranges at once. More efficient than multiple gs_read_values calls.',
    annotations: {
      title: 'Batch Read Values',
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        ranges: {
          type: 'array',
          items: { type: 'string' },
          description: 'A1 notation ranges to read (e.g. ["Sheet1!A1:B5", "Sheet2!A1:D10"])',
        },
        major_dimension: {
          type: 'string',
          description: 'How values are organized: "ROWS" (default) or "COLUMNS"',
        },
        value_render_option: {
          type: 'string',
          description: 'How values are rendered: "FORMATTED_VALUE" (default), "UNFORMATTED_VALUE", "FORMULA"',
        },
      },
      required: ['spreadsheet_id', 'ranges'],
    },
  },
  {
    name: 'gs_write_values',
    description:
      'Write values to a range. Values are provided as a 2D array (rows of columns). By default uses USER_ENTERED input (formulas and formatting are parsed).',
    annotations: {
      title: 'Write Values',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        range: {
          type: 'string',
          description: 'A1 notation range to write to (e.g. "Sheet1!A1:C3")',
        },
        values: {
          type: 'array',
          items: { type: 'array', items: {} },
          description: '2D array of values. Each inner array is a row. Example: [["Name","Age"],["Alice",30],["Bob",25]]',
        },
        value_input_option: {
          type: 'string',
          description: 'How input is interpreted: "USER_ENTERED" (default, parses formulas) or "RAW" (stored as-is)',
        },
      },
      required: ['spreadsheet_id', 'range', 'values'],
    },
  },
  {
    name: 'gs_append_values',
    description:
      'Append rows after the last row with data in the specified range. Automatically finds the end of existing data and adds new rows below.',
    annotations: {
      title: 'Append Values',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        range: {
          type: 'string',
          description: 'A1 notation range that defines the table to append to (e.g. "Sheet1!A:E")',
        },
        values: {
          type: 'array',
          items: { type: 'array', items: {} },
          description: '2D array of rows to append. Example: [["Alice",30],["Bob",25]]',
        },
        value_input_option: {
          type: 'string',
          description: 'How input is interpreted: "USER_ENTERED" (default) or "RAW"',
        },
        insert_data_option: {
          type: 'string',
          description: '"INSERT_ROWS" (default, inserts new rows) or "OVERWRITE" (writes over existing)',
        },
      },
      required: ['spreadsheet_id', 'range', 'values'],
    },
  },
  {
    name: 'gs_clear_values',
    description:
      'Clear all values in a range. Only clears values — formatting, data validation, and other properties are preserved.',
    annotations: {
      title: 'Clear Values',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        range: {
          type: 'string',
          description: 'A1 notation range to clear (e.g. "Sheet1!A1:C10")',
        },
      },
      required: ['spreadsheet_id', 'range'],
    },
  },
  {
    name: 'gs_batch_write',
    description:
      'Write values to multiple ranges at once. More efficient than multiple gs_write_values calls.',
    annotations: {
      title: 'Batch Write Values',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              range: { type: 'string', description: 'A1 notation range' },
              values: { type: 'array', items: { type: 'array', items: {} }, description: '2D array of values' },
            },
            required: ['range', 'values'],
          },
          description: 'Array of {range, values} objects. Example: [{"range":"A1:B2","values":[["a","b"],["c","d"]]}]',
        },
        value_input_option: {
          type: 'string',
          description: 'How input is interpreted: "USER_ENTERED" (default) or "RAW"',
        },
      },
      required: ['spreadsheet_id', 'data'],
    },
  },

  // ========== Sheet Management (5) ==========
  {
    name: 'gs_add_sheet',
    description:
      'Add a new sheet/tab to a spreadsheet. Optionally set row/column count and tab color.',
    annotations: {
      title: 'Add Sheet',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        title: {
          type: 'string',
          description: 'Name for the new sheet/tab',
        },
        row_count: {
          type: 'number',
          description: 'Number of rows (default: 1000)',
        },
        column_count: {
          type: 'number',
          description: 'Number of columns (default: 26)',
        },
        tab_color_red: {
          type: 'number',
          description: 'Tab color red component (0-1)',
        },
        tab_color_green: {
          type: 'number',
          description: 'Tab color green component (0-1)',
        },
        tab_color_blue: {
          type: 'number',
          description: 'Tab color blue component (0-1)',
        },
      },
      required: ['spreadsheet_id', 'title'],
    },
  },
  {
    name: 'gs_delete_sheet',
    description:
      'Delete a sheet/tab from a spreadsheet. Use gs_get_spreadsheet to find the sheet_id first. This action is irreversible.',
    annotations: {
      title: 'Delete Sheet',
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The numeric sheet ID (from gs_get_spreadsheet, NOT the sheet name)',
        },
      },
      required: ['spreadsheet_id', 'sheet_id'],
    },
  },
  {
    name: 'gs_rename_sheet',
    description:
      'Rename a sheet/tab in a spreadsheet.',
    annotations: {
      title: 'Rename Sheet',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The numeric sheet ID to rename',
        },
        title: {
          type: 'string',
          description: 'New name for the sheet',
        },
      },
      required: ['spreadsheet_id', 'sheet_id', 'title'],
    },
  },
  {
    name: 'gs_copy_sheet',
    description:
      'Copy a sheet/tab to another spreadsheet. The authenticated user must have edit access to the destination spreadsheet.',
    annotations: {
      title: 'Copy Sheet',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'Source spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The sheet ID to copy',
        },
        destination_spreadsheet_id: {
          type: 'string',
          description: 'Destination spreadsheet ID to copy the sheet into',
        },
      },
      required: ['spreadsheet_id', 'sheet_id', 'destination_spreadsheet_id'],
    },
  },
  {
    name: 'gs_duplicate_sheet',
    description:
      'Duplicate a sheet/tab within the same spreadsheet. Creates a copy with an optional new name.',
    annotations: {
      title: 'Duplicate Sheet',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The sheet ID to duplicate',
        },
        new_sheet_name: {
          type: 'string',
          description: 'Name for the duplicated sheet (default: "Copy of {original}")',
        },
        insert_sheet_index: {
          type: 'number',
          description: 'Zero-based index where the new sheet should be inserted',
        },
      },
      required: ['spreadsheet_id', 'sheet_id'],
    },
  },

  // ========== Formatting (4) ==========
  {
    name: 'gs_format_cells',
    description:
      'Apply formatting to cells in a range — bold, italic, font size, colors, alignment, number format, and more. Uses 0-based row/column indices.',
    annotations: {
      title: 'Format Cells',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The numeric sheet ID',
        },
        start_row_index: {
          type: 'number',
          description: 'Start row (0-based inclusive, e.g. 0 = row 1)',
        },
        end_row_index: {
          type: 'number',
          description: 'End row (0-based exclusive, e.g. 5 = up to row 5)',
        },
        start_column_index: {
          type: 'number',
          description: 'Start column (0-based inclusive, e.g. 0 = column A)',
        },
        end_column_index: {
          type: 'number',
          description: 'End column (0-based exclusive, e.g. 3 = up to column C)',
        },
        bold: {
          type: 'boolean',
          description: 'Set bold text',
        },
        italic: {
          type: 'boolean',
          description: 'Set italic text',
        },
        strikethrough: {
          type: 'boolean',
          description: 'Set strikethrough text',
        },
        underline: {
          type: 'boolean',
          description: 'Set underline text',
        },
        font_size: {
          type: 'number',
          description: 'Font size in points (e.g. 10, 12, 14)',
        },
        font_family: {
          type: 'string',
          description: 'Font family (e.g. "Arial", "Roboto", "Courier New")',
        },
        foreground_color_red: {
          type: 'number',
          description: 'Text color red component (0-1)',
        },
        foreground_color_green: {
          type: 'number',
          description: 'Text color green component (0-1)',
        },
        foreground_color_blue: {
          type: 'number',
          description: 'Text color blue component (0-1)',
        },
        background_color_red: {
          type: 'number',
          description: 'Background color red component (0-1)',
        },
        background_color_green: {
          type: 'number',
          description: 'Background color green component (0-1)',
        },
        background_color_blue: {
          type: 'number',
          description: 'Background color blue component (0-1)',
        },
        horizontal_alignment: {
          type: 'string',
          description: 'Horizontal alignment: "LEFT", "CENTER", "RIGHT"',
        },
        vertical_alignment: {
          type: 'string',
          description: 'Vertical alignment: "TOP", "MIDDLE", "BOTTOM"',
        },
        wrap_strategy: {
          type: 'string',
          description: 'Text wrapping: "OVERFLOW_CELL", "CLIP", "WRAP"',
        },
        number_format_type: {
          type: 'string',
          description: 'Number format type: "TEXT", "NUMBER", "PERCENT", "CURRENCY", "DATE", "TIME", "DATE_TIME", "SCIENTIFIC"',
        },
        number_format_pattern: {
          type: 'string',
          description: 'Number format pattern (e.g. "#,##0.00", "yyyy-mm-dd", "$#,##0")',
        },
      },
      required: ['spreadsheet_id', 'sheet_id', 'start_row_index', 'end_row_index', 'start_column_index', 'end_column_index'],
    },
  },
  {
    name: 'gs_merge_cells',
    description:
      'Merge cells in a range. All values except the top-left cell are cleared.',
    annotations: {
      title: 'Merge Cells',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The numeric sheet ID',
        },
        start_row_index: {
          type: 'number',
          description: 'Start row (0-based inclusive)',
        },
        end_row_index: {
          type: 'number',
          description: 'End row (0-based exclusive)',
        },
        start_column_index: {
          type: 'number',
          description: 'Start column (0-based inclusive)',
        },
        end_column_index: {
          type: 'number',
          description: 'End column (0-based exclusive)',
        },
        merge_type: {
          type: 'string',
          description: 'Merge type: "MERGE_ALL" (default), "MERGE_COLUMNS", "MERGE_ROWS"',
        },
      },
      required: ['spreadsheet_id', 'sheet_id', 'start_row_index', 'end_row_index', 'start_column_index', 'end_column_index'],
    },
  },
  {
    name: 'gs_unmerge_cells',
    description:
      'Unmerge previously merged cells in a range.',
    annotations: {
      title: 'Unmerge Cells',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The numeric sheet ID',
        },
        start_row_index: {
          type: 'number',
          description: 'Start row (0-based inclusive)',
        },
        end_row_index: {
          type: 'number',
          description: 'End row (0-based exclusive)',
        },
        start_column_index: {
          type: 'number',
          description: 'Start column (0-based inclusive)',
        },
        end_column_index: {
          type: 'number',
          description: 'End column (0-based exclusive)',
        },
      },
      required: ['spreadsheet_id', 'sheet_id', 'start_row_index', 'end_row_index', 'start_column_index', 'end_column_index'],
    },
  },
  {
    name: 'gs_auto_resize',
    description:
      'Auto-resize columns or rows to fit their content.',
    annotations: {
      title: 'Auto Resize',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The numeric sheet ID',
        },
        dimension: {
          type: 'string',
          description: 'Dimension to resize: "COLUMNS" or "ROWS"',
        },
        start_index: {
          type: 'number',
          description: 'Start index (0-based inclusive, e.g. 0 = column A or row 1)',
        },
        end_index: {
          type: 'number',
          description: 'End index (0-based exclusive)',
        },
      },
      required: ['spreadsheet_id', 'sheet_id', 'dimension', 'start_index', 'end_index'],
    },
  },

  // ========== Data Operations (4) ==========
  {
    name: 'gs_sort_range',
    description:
      'Sort a range of data by a specific column. Uses 0-based indices for the range and sort column.',
    annotations: {
      title: 'Sort Range',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The numeric sheet ID',
        },
        start_row_index: {
          type: 'number',
          description: 'Start row of data range (0-based inclusive)',
        },
        end_row_index: {
          type: 'number',
          description: 'End row of data range (0-based exclusive)',
        },
        start_column_index: {
          type: 'number',
          description: 'Start column of data range (0-based inclusive)',
        },
        end_column_index: {
          type: 'number',
          description: 'End column of data range (0-based exclusive)',
        },
        sort_column_index: {
          type: 'number',
          description: 'Column to sort by (0-based, e.g. 0 = column A)',
        },
        sort_order: {
          type: 'string',
          description: 'Sort direction: "ASCENDING" (default) or "DESCENDING"',
        },
      },
      required: ['spreadsheet_id', 'sheet_id', 'start_row_index', 'end_row_index', 'start_column_index', 'end_column_index', 'sort_column_index'],
    },
  },
  {
    name: 'gs_find_replace',
    description:
      'Find and replace text across one sheet or all sheets. Supports case-sensitive and regex search.',
    annotations: {
      title: 'Find & Replace',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        find: {
          type: 'string',
          description: 'Text to find',
        },
        replacement: {
          type: 'string',
          description: 'Text to replace with (use empty string to delete matches)',
        },
        sheet_id: {
          type: 'number',
          description: 'Limit search to this sheet ID (omit for all sheets)',
        },
        match_case: {
          type: 'boolean',
          description: 'Case-sensitive search (default: false)',
        },
        match_entire_cell: {
          type: 'boolean',
          description: 'Only match if entire cell value matches (default: false)',
        },
        search_by_regex: {
          type: 'boolean',
          description: 'Treat find as a regex pattern (default: false)',
        },
        all_sheets: {
          type: 'boolean',
          description: 'Search across all sheets (default: false)',
        },
        include_formulas: {
          type: 'boolean',
          description: 'Also search within formulas (default: false)',
        },
      },
      required: ['spreadsheet_id', 'find', 'replacement'],
    },
  },
  {
    name: 'gs_set_basic_filter',
    description:
      'Set or clear a basic filter (auto-filter) on a sheet. When set, filter dropdowns appear in column headers.',
    annotations: {
      title: 'Set Basic Filter',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The numeric sheet ID',
        },
        start_row_index: {
          type: 'number',
          description: 'Start row of filter range (0-based inclusive)',
        },
        end_row_index: {
          type: 'number',
          description: 'End row of filter range (0-based exclusive)',
        },
        start_column_index: {
          type: 'number',
          description: 'Start column of filter range (0-based inclusive)',
        },
        end_column_index: {
          type: 'number',
          description: 'End column of filter range (0-based exclusive)',
        },
        clear: {
          type: 'boolean',
          description: 'Set to true to remove the basic filter instead of creating one',
        },
      },
      required: ['spreadsheet_id', 'sheet_id'],
    },
  },
  {
    name: 'gs_add_protected_range',
    description:
      'Protect a range of cells from editing. Optionally allow specific editors or show a warning instead of blocking.',
    annotations: {
      title: 'Add Protected Range',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'The numeric sheet ID',
        },
        start_row_index: {
          type: 'number',
          description: 'Start row (0-based inclusive)',
        },
        end_row_index: {
          type: 'number',
          description: 'End row (0-based exclusive)',
        },
        start_column_index: {
          type: 'number',
          description: 'Start column (0-based inclusive)',
        },
        end_column_index: {
          type: 'number',
          description: 'End column (0-based exclusive)',
        },
        description: {
          type: 'string',
          description: 'Description explaining why the range is protected',
        },
        warning_only: {
          type: 'boolean',
          description: 'If true, shows a warning but allows editing (default: false, blocks editing)',
        },
        editors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Email addresses of users allowed to edit the protected range',
        },
      },
      required: ['spreadsheet_id', 'sheet_id', 'start_row_index', 'end_row_index', 'start_column_index', 'end_column_index'],
    },
  },

  // ========== Advanced (2) ==========
  {
    name: 'gs_add_chart',
    description:
      'Add a chart to a sheet. Specify chart type, data range, and anchor position. The chart is overlaid on the sheet.',
    annotations: {
      title: 'Add Chart',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        sheet_id: {
          type: 'number',
          description: 'Sheet ID where the chart will be placed',
        },
        chart_type: {
          type: 'string',
          description: 'Chart type: "BAR", "LINE", "AREA", "COLUMN", "SCATTER", "COMBO", "STEPPED_AREA"',
        },
        title: {
          type: 'string',
          description: 'Chart title',
        },
        data_sheet_id: {
          type: 'number',
          description: 'Sheet ID containing the data for the chart',
        },
        data_start_row_index: {
          type: 'number',
          description: 'Start row of data range (0-based inclusive)',
        },
        data_end_row_index: {
          type: 'number',
          description: 'End row of data range (0-based exclusive)',
        },
        data_start_column_index: {
          type: 'number',
          description: 'Start column of data range (0-based inclusive)',
        },
        data_end_column_index: {
          type: 'number',
          description: 'End column of data range (0-based exclusive)',
        },
        anchor_row_index: {
          type: 'number',
          description: 'Row where chart top-left corner is placed (0-based, default: 0)',
        },
        anchor_column_index: {
          type: 'number',
          description: 'Column where chart top-left corner is placed (0-based, default: 0)',
        },
      },
      required: ['spreadsheet_id', 'sheet_id', 'chart_type', 'data_sheet_id', 'data_start_row_index', 'data_end_row_index', 'data_start_column_index', 'data_end_column_index'],
    },
  },
  {
    name: 'gs_batch_update',
    description:
      'Send a raw batchUpdate request with one or more request objects. Use this for advanced operations not covered by other tools (e.g. conditional formatting, data validation, dimension properties). See Google Sheets API batchUpdate documentation for available request types.',
    annotations: {
      title: 'Batch Update (Raw)',
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    inputSchema: {
      type: 'object',
      properties: {
        spreadsheet_id: {
          type: 'string',
          description: 'The spreadsheet ID',
        },
        requests: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of batchUpdate request objects. Example: [{"updateSheetProperties":{"properties":{"sheetId":0,"hidden":true},"fields":"hidden"}}]',
        },
        include_spreadsheet_in_response: {
          type: 'boolean',
          description: 'Include full spreadsheet data in response (default: false)',
        },
      },
      required: ['spreadsheet_id', 'requests'],
    },
  },
];
