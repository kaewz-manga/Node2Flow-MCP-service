/**
 * Google Docs API v1 Client — OAuth 2.0 refresh token pattern
 */

import type {
  Document,
  BatchUpdateResponse,
  TextStyle,
  ParagraphStyle,
  Size,
} from './types';

export interface DocsClientConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export class DocsClient {
  private config: DocsClientConfig;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  private static readonly BASE = 'https://docs.googleapis.com/v1';
  private static readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';

  constructor(config: DocsClientConfig) {
    this.config = config;
  }

  // ========== OAuth ==========

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const res = await fetch(DocsClient.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token refresh failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private async request(path: string, options: RequestInit = {}): Promise<unknown> {
    const token = await this.getAccessToken();
    const url = `${DocsClient.BASE}${path}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google Docs API error (${res.status}): ${text}`);
    }

    return res.json();
  }

  // ========== Document ==========

  async createDocument(opts: {
    title: string;
  }): Promise<Document> {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify({ title: opts.title }),
    }) as Promise<Document>;
  }

  async getDocument(opts: {
    documentId: string;
    suggestionsViewMode?: string;
  }): Promise<Document> {
    const params = new URLSearchParams();
    if (opts.suggestionsViewMode) params.set('suggestionsViewMode', opts.suggestionsViewMode);
    const qs = params.toString();
    return this.request(`/documents/${opts.documentId}${qs ? `?${qs}` : ''}`) as Promise<Document>;
  }

  // ========== BatchUpdate helper ==========

  private async batchUpdateInternal(
    documentId: string,
    requests: Record<string, unknown>[],
  ): Promise<BatchUpdateResponse> {
    return this.request(`/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({ requests }),
    }) as Promise<BatchUpdateResponse>;
  }

  // ========== Content ==========

  async insertText(opts: {
    documentId: string;
    text: string;
    index: number;
    segmentId?: string;
  }): Promise<BatchUpdateResponse> {
    const location: Record<string, unknown> = { index: opts.index };
    if (opts.segmentId) location.segmentId = opts.segmentId;
    return this.batchUpdateInternal(opts.documentId, [
      { insertText: { text: opts.text, location } },
    ]);
  }

  async deleteContent(opts: {
    documentId: string;
    startIndex: number;
    endIndex: number;
    segmentId?: string;
  }): Promise<BatchUpdateResponse> {
    const range: Record<string, unknown> = {
      startIndex: opts.startIndex,
      endIndex: opts.endIndex,
    };
    if (opts.segmentId) range.segmentId = opts.segmentId;
    return this.batchUpdateInternal(opts.documentId, [
      { deleteContentRange: { range } },
    ]);
  }

  async replaceAllText(opts: {
    documentId: string;
    searchText: string;
    replaceText: string;
    matchCase?: boolean;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, [
      {
        replaceAllText: {
          containsText: { text: opts.searchText, matchCase: opts.matchCase ?? false },
          replaceText: opts.replaceText,
        },
      },
    ]);
  }

  async insertInlineImage(opts: {
    documentId: string;
    uri: string;
    index: number;
    segmentId?: string;
    widthMagnitude?: number;
    heightMagnitude?: number;
    widthUnit?: string;
    heightUnit?: string;
  }): Promise<BatchUpdateResponse> {
    const location: Record<string, unknown> = { index: opts.index };
    if (opts.segmentId) location.segmentId = opts.segmentId;
    const req: Record<string, unknown> = { uri: opts.uri, location };
    if (opts.widthMagnitude || opts.heightMagnitude) {
      const objectSize: Size = {};
      if (opts.widthMagnitude) objectSize.width = { magnitude: opts.widthMagnitude, unit: opts.widthUnit || 'PT' };
      if (opts.heightMagnitude) objectSize.height = { magnitude: opts.heightMagnitude, unit: opts.heightUnit || 'PT' };
      req.objectSize = objectSize;
    }
    return this.batchUpdateInternal(opts.documentId, [
      { insertInlineImage: req },
    ]);
  }

  async insertPageBreak(opts: {
    documentId: string;
    index: number;
    segmentId?: string;
  }): Promise<BatchUpdateResponse> {
    const location: Record<string, unknown> = { index: opts.index };
    if (opts.segmentId) location.segmentId = opts.segmentId;
    return this.batchUpdateInternal(opts.documentId, [
      { insertPageBreak: { location } },
    ]);
  }

  // ========== Text Formatting ==========

  async updateTextStyle(opts: {
    documentId: string;
    startIndex: number;
    endIndex: number;
    segmentId?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    fontSize?: number;
    fontFamily?: string;
    foregroundColorRed?: number;
    foregroundColorGreen?: number;
    foregroundColorBlue?: number;
    backgroundColorRed?: number;
    backgroundColorGreen?: number;
    backgroundColorBlue?: number;
    linkUrl?: string;
    baselineOffset?: string;
    smallCaps?: boolean;
  }): Promise<BatchUpdateResponse> {
    const range: Record<string, unknown> = {
      startIndex: opts.startIndex,
      endIndex: opts.endIndex,
    };
    if (opts.segmentId) range.segmentId = opts.segmentId;

    const textStyle: TextStyle = {};
    const fields: string[] = [];

    if (opts.bold !== undefined) { textStyle.bold = opts.bold; fields.push('bold'); }
    if (opts.italic !== undefined) { textStyle.italic = opts.italic; fields.push('italic'); }
    if (opts.underline !== undefined) { textStyle.underline = opts.underline; fields.push('underline'); }
    if (opts.strikethrough !== undefined) { textStyle.strikethrough = opts.strikethrough; fields.push('strikethrough'); }
    if (opts.smallCaps !== undefined) { textStyle.smallCaps = opts.smallCaps; fields.push('smallCaps'); }
    if (opts.fontSize !== undefined) {
      textStyle.fontSize = { magnitude: opts.fontSize, unit: 'PT' };
      fields.push('fontSize');
    }
    if (opts.fontFamily) {
      textStyle.fontFamily = opts.fontFamily;
      fields.push('weightedFontFamily');
    }
    if (opts.foregroundColorRed !== undefined || opts.foregroundColorGreen !== undefined || opts.foregroundColorBlue !== undefined) {
      textStyle.foregroundColor = {
        color: {
          rgbColor: {
            red: opts.foregroundColorRed ?? 0,
            green: opts.foregroundColorGreen ?? 0,
            blue: opts.foregroundColorBlue ?? 0,
          },
        },
      };
      fields.push('foregroundColor');
    }
    if (opts.backgroundColorRed !== undefined || opts.backgroundColorGreen !== undefined || opts.backgroundColorBlue !== undefined) {
      textStyle.backgroundColor = {
        color: {
          rgbColor: {
            red: opts.backgroundColorRed ?? 0,
            green: opts.backgroundColorGreen ?? 0,
            blue: opts.backgroundColorBlue ?? 0,
          },
        },
      };
      fields.push('backgroundColor');
    }
    if (opts.linkUrl) {
      textStyle.link = { url: opts.linkUrl };
      fields.push('link');
    }
    if (opts.baselineOffset) {
      textStyle.baselineOffset = opts.baselineOffset;
      fields.push('baselineOffset');
    }

    return this.batchUpdateInternal(opts.documentId, [
      { updateTextStyle: { textStyle, range, fields: fields.join(',') } },
    ]);
  }

  async updateParagraphStyle(opts: {
    documentId: string;
    startIndex: number;
    endIndex: number;
    segmentId?: string;
    namedStyleType?: string;
    alignment?: string;
    lineSpacing?: number;
    spaceAboveMagnitude?: number;
    spaceBelowMagnitude?: number;
    indentFirstLineMagnitude?: number;
    indentStartMagnitude?: number;
    indentEndMagnitude?: number;
    direction?: string;
    headingId?: string;
  }): Promise<BatchUpdateResponse> {
    const range: Record<string, unknown> = {
      startIndex: opts.startIndex,
      endIndex: opts.endIndex,
    };
    if (opts.segmentId) range.segmentId = opts.segmentId;

    const paragraphStyle: ParagraphStyle = {};
    const fields: string[] = [];

    if (opts.namedStyleType) { paragraphStyle.namedStyleType = opts.namedStyleType; fields.push('namedStyleType'); }
    if (opts.alignment) { paragraphStyle.alignment = opts.alignment; fields.push('alignment'); }
    if (opts.lineSpacing !== undefined) { paragraphStyle.lineSpacing = opts.lineSpacing; fields.push('lineSpacing'); }
    if (opts.direction) { paragraphStyle.direction = opts.direction; fields.push('direction'); }
    if (opts.headingId) { paragraphStyle.headingId = opts.headingId; fields.push('headingId'); }
    if (opts.spaceAboveMagnitude !== undefined) {
      paragraphStyle.spaceAbove = { magnitude: opts.spaceAboveMagnitude, unit: 'PT' };
      fields.push('spaceAbove');
    }
    if (opts.spaceBelowMagnitude !== undefined) {
      paragraphStyle.spaceBelow = { magnitude: opts.spaceBelowMagnitude, unit: 'PT' };
      fields.push('spaceBelow');
    }
    if (opts.indentFirstLineMagnitude !== undefined) {
      paragraphStyle.indentFirstLine = { magnitude: opts.indentFirstLineMagnitude, unit: 'PT' };
      fields.push('indentFirstLine');
    }
    if (opts.indentStartMagnitude !== undefined) {
      paragraphStyle.indentStart = { magnitude: opts.indentStartMagnitude, unit: 'PT' };
      fields.push('indentStart');
    }
    if (opts.indentEndMagnitude !== undefined) {
      paragraphStyle.indentEnd = { magnitude: opts.indentEndMagnitude, unit: 'PT' };
      fields.push('indentEnd');
    }

    return this.batchUpdateInternal(opts.documentId, [
      { updateParagraphStyle: { paragraphStyle, range, fields: fields.join(',') } },
    ]);
  }

  // ========== Lists ==========

  async createBullets(opts: {
    documentId: string;
    startIndex: number;
    endIndex: number;
    segmentId?: string;
    bulletPreset: string;
  }): Promise<BatchUpdateResponse> {
    const range: Record<string, unknown> = {
      startIndex: opts.startIndex,
      endIndex: opts.endIndex,
    };
    if (opts.segmentId) range.segmentId = opts.segmentId;
    return this.batchUpdateInternal(opts.documentId, [
      { createParagraphBullets: { range, bulletPreset: opts.bulletPreset } },
    ]);
  }

  async deleteBullets(opts: {
    documentId: string;
    startIndex: number;
    endIndex: number;
    segmentId?: string;
  }): Promise<BatchUpdateResponse> {
    const range: Record<string, unknown> = {
      startIndex: opts.startIndex,
      endIndex: opts.endIndex,
    };
    if (opts.segmentId) range.segmentId = opts.segmentId;
    return this.batchUpdateInternal(opts.documentId, [
      { deleteParagraphBullets: { range } },
    ]);
  }

  // ========== Tables ==========

  async insertTable(opts: {
    documentId: string;
    rows: number;
    columns: number;
    index: number;
    segmentId?: string;
  }): Promise<BatchUpdateResponse> {
    const location: Record<string, unknown> = { index: opts.index };
    if (opts.segmentId) location.segmentId = opts.segmentId;
    return this.batchUpdateInternal(opts.documentId, [
      { insertTable: { rows: opts.rows, columns: opts.columns, location } },
    ]);
  }

  async insertTableRow(opts: {
    documentId: string;
    tableStartIndex: number;
    rowIndex: number;
    columnIndex: number;
    insertBelow: boolean;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, [
      {
        insertTableRow: {
          tableCellLocation: {
            tableStartLocation: { index: opts.tableStartIndex },
            rowIndex: opts.rowIndex,
            columnIndex: opts.columnIndex,
          },
          insertBelow: opts.insertBelow,
        },
      },
    ]);
  }

  async insertTableColumn(opts: {
    documentId: string;
    tableStartIndex: number;
    rowIndex: number;
    columnIndex: number;
    insertRight: boolean;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, [
      {
        insertTableColumn: {
          tableCellLocation: {
            tableStartLocation: { index: opts.tableStartIndex },
            rowIndex: opts.rowIndex,
            columnIndex: opts.columnIndex,
          },
          insertRight: opts.insertRight,
        },
      },
    ]);
  }

  async deleteTableRow(opts: {
    documentId: string;
    tableStartIndex: number;
    rowIndex: number;
    columnIndex: number;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, [
      {
        deleteTableRow: {
          tableCellLocation: {
            tableStartLocation: { index: opts.tableStartIndex },
            rowIndex: opts.rowIndex,
            columnIndex: opts.columnIndex,
          },
        },
      },
    ]);
  }

  async deleteTableColumn(opts: {
    documentId: string;
    tableStartIndex: number;
    rowIndex: number;
    columnIndex: number;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, [
      {
        deleteTableColumn: {
          tableCellLocation: {
            tableStartLocation: { index: opts.tableStartIndex },
            rowIndex: opts.rowIndex,
            columnIndex: opts.columnIndex,
          },
        },
      },
    ]);
  }

  async mergeTableCells(opts: {
    documentId: string;
    tableStartIndex: number;
    rowIndex: number;
    columnIndex: number;
    rowSpan: number;
    columnSpan: number;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, [
      {
        mergeTableCells: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { index: opts.tableStartIndex },
              rowIndex: opts.rowIndex,
              columnIndex: opts.columnIndex,
            },
            rowSpan: opts.rowSpan,
            columnSpan: opts.columnSpan,
          },
        },
      },
    ]);
  }

  async unmergeTableCells(opts: {
    documentId: string;
    tableStartIndex: number;
    rowIndex: number;
    columnIndex: number;
    rowSpan: number;
    columnSpan: number;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, [
      {
        unmergeTableCells: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { index: opts.tableStartIndex },
              rowIndex: opts.rowIndex,
              columnIndex: opts.columnIndex,
            },
            rowSpan: opts.rowSpan,
            columnSpan: opts.columnSpan,
          },
        },
      },
    ]);
  }

  // ========== Headers & Footers ==========

  async createHeader(opts: {
    documentId: string;
    type: string;
    sectionBreakIndex?: number;
  }): Promise<BatchUpdateResponse> {
    const req: Record<string, unknown> = { type: opts.type };
    if (opts.sectionBreakIndex !== undefined) {
      req.sectionBreakLocation = { index: opts.sectionBreakIndex };
    }
    return this.batchUpdateInternal(opts.documentId, [
      { createHeader: req },
    ]);
  }

  async createFooter(opts: {
    documentId: string;
    type: string;
    sectionBreakIndex?: number;
  }): Promise<BatchUpdateResponse> {
    const req: Record<string, unknown> = { type: opts.type };
    if (opts.sectionBreakIndex !== undefined) {
      req.sectionBreakLocation = { index: opts.sectionBreakIndex };
    }
    return this.batchUpdateInternal(opts.documentId, [
      { createFooter: req },
    ]);
  }

  async deleteHeader(opts: {
    documentId: string;
    headerId: string;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, [
      { deleteHeader: { headerId: opts.headerId } },
    ]);
  }

  async deleteFooter(opts: {
    documentId: string;
    footerId: string;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, [
      { deleteFooter: { footerId: opts.footerId } },
    ]);
  }

  // ========== Sections & Named Ranges ==========

  async insertSectionBreak(opts: {
    documentId: string;
    index: number;
    sectionType: string;
    segmentId?: string;
  }): Promise<BatchUpdateResponse> {
    const location: Record<string, unknown> = { index: opts.index };
    if (opts.segmentId) location.segmentId = opts.segmentId;
    return this.batchUpdateInternal(opts.documentId, [
      { insertSectionBreak: { location, sectionType: opts.sectionType } },
    ]);
  }

  async createNamedRange(opts: {
    documentId: string;
    name: string;
    startIndex: number;
    endIndex: number;
    segmentId?: string;
  }): Promise<BatchUpdateResponse> {
    const range: Record<string, unknown> = {
      startIndex: opts.startIndex,
      endIndex: opts.endIndex,
    };
    if (opts.segmentId) range.segmentId = opts.segmentId;
    return this.batchUpdateInternal(opts.documentId, [
      { createNamedRange: { name: opts.name, range } },
    ]);
  }

  async deleteNamedRange(opts: {
    documentId: string;
    namedRangeId?: string;
    name?: string;
  }): Promise<BatchUpdateResponse> {
    const req: Record<string, unknown> = {};
    if (opts.namedRangeId) req.namedRangeId = opts.namedRangeId;
    else if (opts.name) req.name = opts.name;
    return this.batchUpdateInternal(opts.documentId, [
      { deleteNamedRange: req },
    ]);
  }

  // ========== Advanced ==========

  async batchUpdate(opts: {
    documentId: string;
    requests: Record<string, unknown>[];
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdateInternal(opts.documentId, opts.requests);
  }
}
