/**
 * 25 Google Docs MCP Tool Definitions
 */

import type { MCPToolDefinition } from '../../types';

export const TOOLS: MCPToolDefinition[] = [
  // ========== Document (2) ==========
  {
    name: 'gdoc_create',
    description: 'Create a new Google Docs document with a title. Returns the document ID and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title for the new document' },
      },
      required: ['title'],
    },
    annotations: { title: 'Create Document', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_get',
    description: 'Get a Google Docs document including its full content structure, headers, footers, and named ranges.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The ID of the document to retrieve' },
        suggestions_view_mode: {
          type: 'string',
          description: 'How to render suggestions. Values: DEFAULT_FOR_CURRENT_ACCESS, SUGGESTIONS_INLINE, PREVIEW_SUGGESTIONS_ACCEPTED, PREVIEW_WITHOUT_SUGGESTIONS',
          enum: ['DEFAULT_FOR_CURRENT_ACCESS', 'SUGGESTIONS_INLINE', 'PREVIEW_SUGGESTIONS_ACCEPTED', 'PREVIEW_WITHOUT_SUGGESTIONS'],
        },
      },
      required: ['document_id'],
    },
    annotations: { title: 'Get Document', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },

  // ========== Content (5) ==========
  {
    name: 'gdoc_insert_text',
    description: 'Insert text at a specific position in the document. Use index 1 to insert at the beginning of the body.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        text: { type: 'string', description: 'Text to insert' },
        index: { type: 'number', description: 'The 0-based index to insert at (1 = start of body content)' },
        segment_id: { type: 'string', description: 'Segment ID (header/footer ID). Omit for body content' },
      },
      required: ['document_id', 'text', 'index'],
    },
    annotations: { title: 'Insert Text', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_delete_content',
    description: 'Delete content in a range. Get indices from gdoc_get response.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        start_index: { type: 'number', description: 'Start index of content to delete (inclusive)' },
        end_index: { type: 'number', description: 'End index of content to delete (exclusive)' },
        segment_id: { type: 'string', description: 'Segment ID (header/footer ID). Omit for body content' },
      },
      required: ['document_id', 'start_index', 'end_index'],
    },
    annotations: { title: 'Delete Content', readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_replace_all_text',
    description: 'Find and replace all occurrences of text in the entire document.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        search_text: { type: 'string', description: 'Text to search for' },
        replace_text: { type: 'string', description: 'Replacement text' },
        match_case: { type: 'boolean', description: 'Whether the search is case-sensitive (default: false)' },
      },
      required: ['document_id', 'search_text', 'replace_text'],
    },
    annotations: { title: 'Replace All Text', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gdoc_insert_inline_image',
    description: 'Insert an image from a URL at a specific position in the document.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        uri: { type: 'string', description: 'Public URL of the image to insert' },
        index: { type: 'number', description: 'Position to insert the image at' },
        segment_id: { type: 'string', description: 'Segment ID (header/footer ID). Omit for body content' },
        width_magnitude: { type: 'number', description: 'Image width value (in units specified by width_unit)' },
        height_magnitude: { type: 'number', description: 'Image height value (in units specified by height_unit)' },
        width_unit: { type: 'string', description: 'Unit for width: PT (points), EMU. Default: PT' },
        height_unit: { type: 'string', description: 'Unit for height: PT (points), EMU. Default: PT' },
      },
      required: ['document_id', 'uri', 'index'],
    },
    annotations: { title: 'Insert Image', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_insert_page_break',
    description: 'Insert a page break at a specific position in the document.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        index: { type: 'number', description: 'Position to insert the page break at' },
        segment_id: { type: 'string', description: 'Segment ID (header/footer ID). Omit for body content' },
      },
      required: ['document_id', 'index'],
    },
    annotations: { title: 'Insert Page Break', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },

  // ========== Text Formatting (2) ==========
  {
    name: 'gdoc_update_text_style',
    description: 'Update text style (bold, italic, font, color, etc.) for a range of text. Only specified fields are changed.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        start_index: { type: 'number', description: 'Start index of the text range (inclusive)' },
        end_index: { type: 'number', description: 'End index of the text range (exclusive)' },
        segment_id: { type: 'string', description: 'Segment ID (header/footer ID). Omit for body content' },
        bold: { type: 'boolean', description: 'Set text to bold' },
        italic: { type: 'boolean', description: 'Set text to italic' },
        underline: { type: 'boolean', description: 'Set text to underline' },
        strikethrough: { type: 'boolean', description: 'Set text to strikethrough' },
        small_caps: { type: 'boolean', description: 'Set text to small caps' },
        font_size: { type: 'number', description: 'Font size in points (e.g., 12, 14, 18)' },
        font_family: { type: 'string', description: 'Font family name (e.g., "Arial", "Times New Roman")' },
        foreground_color_red: { type: 'number', description: 'Text color red component (0-1)' },
        foreground_color_green: { type: 'number', description: 'Text color green component (0-1)' },
        foreground_color_blue: { type: 'number', description: 'Text color blue component (0-1)' },
        background_color_red: { type: 'number', description: 'Text background color red component (0-1)' },
        background_color_green: { type: 'number', description: 'Text background color green component (0-1)' },
        background_color_blue: { type: 'number', description: 'Text background color blue component (0-1)' },
        link_url: { type: 'string', description: 'URL to link the text to' },
        baseline_offset: { type: 'string', description: 'Baseline offset: NONE, SUPERSCRIPT, SUBSCRIPT' },
      },
      required: ['document_id', 'start_index', 'end_index'],
    },
    annotations: { title: 'Update Text Style', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gdoc_update_paragraph_style',
    description: 'Update paragraph style (alignment, spacing, indentation, heading) for a range.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        start_index: { type: 'number', description: 'Start index of the paragraph range (inclusive)' },
        end_index: { type: 'number', description: 'End index of the paragraph range (exclusive)' },
        segment_id: { type: 'string', description: 'Segment ID (header/footer ID). Omit for body content' },
        named_style_type: {
          type: 'string',
          description: 'Named style: NORMAL_TEXT, TITLE, SUBTITLE, HEADING_1 through HEADING_6',
          enum: ['NORMAL_TEXT', 'TITLE', 'SUBTITLE', 'HEADING_1', 'HEADING_2', 'HEADING_3', 'HEADING_4', 'HEADING_5', 'HEADING_6'],
        },
        alignment: {
          type: 'string',
          description: 'Paragraph alignment',
          enum: ['START', 'CENTER', 'END', 'JUSTIFIED'],
        },
        line_spacing: { type: 'number', description: 'Line spacing as percentage (e.g., 100 = single, 200 = double)' },
        space_above_magnitude: { type: 'number', description: 'Space above paragraph in points' },
        space_below_magnitude: { type: 'number', description: 'Space below paragraph in points' },
        indent_first_line_magnitude: { type: 'number', description: 'First line indent in points' },
        indent_start_magnitude: { type: 'number', description: 'Start (left) indent in points' },
        indent_end_magnitude: { type: 'number', description: 'End (right) indent in points' },
        direction: { type: 'string', description: 'Text direction: LEFT_TO_RIGHT or RIGHT_TO_LEFT' },
      },
      required: ['document_id', 'start_index', 'end_index'],
    },
    annotations: { title: 'Update Paragraph Style', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },

  // ========== Lists (2) ==========
  {
    name: 'gdoc_create_bullets',
    description: 'Convert paragraphs in a range to a bulleted or numbered list.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        start_index: { type: 'number', description: 'Start index of the range (inclusive)' },
        end_index: { type: 'number', description: 'End index of the range (exclusive)' },
        segment_id: { type: 'string', description: 'Segment ID (header/footer ID). Omit for body content' },
        bullet_preset: {
          type: 'string',
          description: 'Bullet preset type',
          enum: [
            'BULLET_DISC_CIRCLE_SQUARE',
            'BULLET_DIAMONDX_ARROW3D_SQUARE',
            'BULLET_CHECKBOX',
            'BULLET_ARROW_DIAMOND_DISC',
            'BULLET_STAR_CIRCLE_SQUARE',
            'BULLET_ARROW3D_CIRCLE_SQUARE',
            'BULLET_LEFTTRIANGLE_DIAMOND_DISC',
            'BULLET_DIAMONDX_HOLLOWDIAMOND_SQUARE',
            'NUMBERED_DECIMAL_ALPHA_ROMAN',
            'NUMBERED_DECIMAL_ALPHA_ROMAN_PARENS',
            'NUMBERED_DECIMAL_NESTED',
            'NUMBERED_UPPERALPHA_ALPHA_ROMAN',
            'NUMBERED_UPPERROMAN_UPPERALPHA_DECIMAL',
            'NUMBERED_ZERODECIMAL_ALPHA_ROMAN',
          ],
        },
      },
      required: ['document_id', 'start_index', 'end_index', 'bullet_preset'],
    },
    annotations: { title: 'Create Bullets', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gdoc_delete_bullets',
    description: 'Remove bullets or numbering from paragraphs in a range.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        start_index: { type: 'number', description: 'Start index of the range (inclusive)' },
        end_index: { type: 'number', description: 'End index of the range (exclusive)' },
        segment_id: { type: 'string', description: 'Segment ID (header/footer ID). Omit for body content' },
      },
      required: ['document_id', 'start_index', 'end_index'],
    },
    annotations: { title: 'Delete Bullets', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },

  // ========== Tables (7) ==========
  {
    name: 'gdoc_insert_table',
    description: 'Insert a new table at a specific position in the document.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        rows: { type: 'number', description: 'Number of rows in the table' },
        columns: { type: 'number', description: 'Number of columns in the table' },
        index: { type: 'number', description: 'Position to insert the table at' },
        segment_id: { type: 'string', description: 'Segment ID (header/footer ID). Omit for body content' },
      },
      required: ['document_id', 'rows', 'columns', 'index'],
    },
    annotations: { title: 'Insert Table', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_insert_table_row',
    description: 'Insert a new row in an existing table.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        table_start_index: { type: 'number', description: 'Start index of the table element in the document' },
        row_index: { type: 'number', description: '0-based row index of a reference cell' },
        column_index: { type: 'number', description: '0-based column index of a reference cell' },
        insert_below: { type: 'boolean', description: 'true = insert below reference row, false = insert above' },
      },
      required: ['document_id', 'table_start_index', 'row_index', 'column_index', 'insert_below'],
    },
    annotations: { title: 'Insert Table Row', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_insert_table_column',
    description: 'Insert a new column in an existing table.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        table_start_index: { type: 'number', description: 'Start index of the table element in the document' },
        row_index: { type: 'number', description: '0-based row index of a reference cell' },
        column_index: { type: 'number', description: '0-based column index of a reference cell' },
        insert_right: { type: 'boolean', description: 'true = insert right of reference column, false = insert left' },
      },
      required: ['document_id', 'table_start_index', 'row_index', 'column_index', 'insert_right'],
    },
    annotations: { title: 'Insert Table Column', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_delete_table_row',
    description: 'Delete a row from an existing table.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        table_start_index: { type: 'number', description: 'Start index of the table element in the document' },
        row_index: { type: 'number', description: '0-based index of the row to delete' },
        column_index: { type: 'number', description: '0-based column index for cell reference (typically 0)' },
      },
      required: ['document_id', 'table_start_index', 'row_index', 'column_index'],
    },
    annotations: { title: 'Delete Table Row', readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_delete_table_column',
    description: 'Delete a column from an existing table.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        table_start_index: { type: 'number', description: 'Start index of the table element in the document' },
        row_index: { type: 'number', description: '0-based row index for cell reference (typically 0)' },
        column_index: { type: 'number', description: '0-based index of the column to delete' },
      },
      required: ['document_id', 'table_start_index', 'row_index', 'column_index'],
    },
    annotations: { title: 'Delete Table Column', readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_merge_table_cells',
    description: 'Merge cells in a table. Specify the top-left cell and span.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        table_start_index: { type: 'number', description: 'Start index of the table element in the document' },
        row_index: { type: 'number', description: '0-based row index of the top-left cell to merge' },
        column_index: { type: 'number', description: '0-based column index of the top-left cell to merge' },
        row_span: { type: 'number', description: 'Number of rows to span in the merge' },
        column_span: { type: 'number', description: 'Number of columns to span in the merge' },
      },
      required: ['document_id', 'table_start_index', 'row_index', 'column_index', 'row_span', 'column_span'],
    },
    annotations: { title: 'Merge Table Cells', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gdoc_unmerge_table_cells',
    description: 'Unmerge previously merged cells in a table.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        table_start_index: { type: 'number', description: 'Start index of the table element in the document' },
        row_index: { type: 'number', description: '0-based row index of the merged cell' },
        column_index: { type: 'number', description: '0-based column index of the merged cell' },
        row_span: { type: 'number', description: 'Number of rows in the merged area' },
        column_span: { type: 'number', description: 'Number of columns in the merged area' },
      },
      required: ['document_id', 'table_start_index', 'row_index', 'column_index', 'row_span', 'column_span'],
    },
    annotations: { title: 'Unmerge Table Cells', readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },

  // ========== Headers & Footers (4) ==========
  {
    name: 'gdoc_create_header',
    description: 'Create a header in the document. Returns the header ID for inserting content.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        type: {
          type: 'string',
          description: 'Header type: DEFAULT (applies to all pages unless overridden)',
          enum: ['DEFAULT'],
        },
        section_break_index: { type: 'number', description: 'Index of section break to create header for (omit for document-level header)' },
      },
      required: ['document_id', 'type'],
    },
    annotations: { title: 'Create Header', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_create_footer',
    description: 'Create a footer in the document. Returns the footer ID for inserting content.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        type: {
          type: 'string',
          description: 'Footer type: DEFAULT (applies to all pages unless overridden)',
          enum: ['DEFAULT'],
        },
        section_break_index: { type: 'number', description: 'Index of section break to create footer for (omit for document-level footer)' },
      },
      required: ['document_id', 'type'],
    },
    annotations: { title: 'Create Footer', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_delete_header',
    description: 'Delete a header from the document. Get the header ID from gdoc_get.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        header_id: { type: 'string', description: 'ID of the header to delete (from gdoc_get response headers object)' },
      },
      required: ['document_id', 'header_id'],
    },
    annotations: { title: 'Delete Header', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'gdoc_delete_footer',
    description: 'Delete a footer from the document. Get the footer ID from gdoc_get.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        footer_id: { type: 'string', description: 'ID of the footer to delete (from gdoc_get response footers object)' },
      },
      required: ['document_id', 'footer_id'],
    },
    annotations: { title: 'Delete Footer', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },

  // ========== Sections & Named Ranges (3) ==========
  {
    name: 'gdoc_insert_section_break',
    description: 'Insert a section break at a specific position.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        index: { type: 'number', description: 'Position to insert the section break at' },
        section_type: {
          type: 'string',
          description: 'Type of section break',
          enum: ['NEXT_PAGE', 'CONTINUOUS'],
        },
        segment_id: { type: 'string', description: 'Segment ID. Omit for body content' },
      },
      required: ['document_id', 'index', 'section_type'],
    },
    annotations: { title: 'Insert Section Break', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_create_named_range',
    description: 'Create a named range in the document for referencing a section of content.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        name: { type: 'string', description: 'Name for the range (used for referencing later)' },
        start_index: { type: 'number', description: 'Start index of the range (inclusive)' },
        end_index: { type: 'number', description: 'End index of the range (exclusive)' },
        segment_id: { type: 'string', description: 'Segment ID. Omit for body content' },
      },
      required: ['document_id', 'name', 'start_index', 'end_index'],
    },
    annotations: { title: 'Create Named Range', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'gdoc_delete_named_range',
    description: 'Delete a named range by ID or name. Does not delete the content, only the reference.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        named_range_id: { type: 'string', description: 'ID of the named range to delete (from gdoc_get response)' },
        name: { type: 'string', description: 'Name of the named range to delete (alternative to named_range_id)' },
      },
      required: ['document_id'],
    },
    annotations: { title: 'Delete Named Range', readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },

  // ========== Advanced (1) ==========
  {
    name: 'gdoc_batch_update',
    description: 'Send a raw batchUpdate request with any combination of operations. Use this for complex multi-step updates or operations not covered by other tools.',
    inputSchema: {
      type: 'object',
      properties: {
        document_id: { type: 'string', description: 'The document ID' },
        requests: {
          type: 'array',
          description: 'Array of request objects. Each object has one key (e.g., insertText, updateTextStyle). See Google Docs API batchUpdate reference.',
          items: { type: 'object' },
        },
      },
      required: ['document_id', 'requests'],
    },
    annotations: { title: 'Batch Update', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
];
