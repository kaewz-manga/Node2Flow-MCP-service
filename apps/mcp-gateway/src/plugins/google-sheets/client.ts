/**
 * Google Sheets API v4 Client
 * Uses OAuth 2.0 (Client ID + Client Secret + Refresh Token).
 * Access tokens are auto-refreshed.
 */

import type {
  SheetsConfig,
  Spreadsheet,
  ValueRange,
  BatchGetResponse,
  UpdateValuesResponse,
  AppendValuesResponse,
  BatchUpdateValuesResponse,
  BatchUpdateResponse,
  CopySheetResponse,
  GridRange,
} from './types';

export class SheetsClient {
  private config: SheetsConfig;
  private baseUrl = 'https://sheets.googleapis.com/v4';
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config: SheetsConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token refresh failed (${response.status}): ${error}`);
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown> | unknown[],
    params: Record<string, string> = {},
  ): Promise<T> {
    const token = await this.getAccessToken();
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${path}${query ? `?${query}` : ''}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Sheets API Error (${response.status}): ${error}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  // ========== Spreadsheet (2) ==========

  async createSpreadsheet(params: {
    title: string;
    sheetTitles?: string[];
    locale?: string;
    timeZone?: string;
  }): Promise<Spreadsheet> {
    const body: Record<string, unknown> = {
      properties: { title: params.title },
    };
    if (params.locale) (body.properties as Record<string, unknown>).locale = params.locale;
    if (params.timeZone) (body.properties as Record<string, unknown>).timeZone = params.timeZone;
    if (params.sheetTitles && params.sheetTitles.length > 0) {
      body.sheets = params.sheetTitles.map(t => ({ properties: { title: t } }));
    }
    return this.request('POST', '/spreadsheets', body);
  }

  async getSpreadsheet(params: {
    spreadsheetId: string;
    ranges?: string[];
    includeGridData?: boolean;
    fields?: string;
  }): Promise<Spreadsheet> {
    const queryParams: Record<string, string> = {};
    if (params.ranges) queryParams.ranges = params.ranges.join(',');
    if (params.includeGridData) queryParams.includeGridData = 'true';
    if (params.fields) queryParams.fields = params.fields;
    return this.request('GET', `/spreadsheets/${params.spreadsheetId}`, undefined, queryParams);
  }

  // ========== Values (6) ==========

  async readValues(params: {
    spreadsheetId: string;
    range: string;
    majorDimension?: string;
    valueRenderOption?: string;
    dateTimeRenderOption?: string;
  }): Promise<ValueRange> {
    const queryParams: Record<string, string> = {};
    if (params.majorDimension) queryParams.majorDimension = params.majorDimension;
    if (params.valueRenderOption) queryParams.valueRenderOption = params.valueRenderOption;
    if (params.dateTimeRenderOption) queryParams.dateTimeRenderOption = params.dateTimeRenderOption;
    return this.request('GET', `/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}`, undefined, queryParams);
  }

  async batchRead(params: {
    spreadsheetId: string;
    ranges: string[];
    majorDimension?: string;
    valueRenderOption?: string;
    dateTimeRenderOption?: string;
  }): Promise<BatchGetResponse> {
    const queryParams: Record<string, string> = {};
    if (params.majorDimension) queryParams.majorDimension = params.majorDimension;
    if (params.valueRenderOption) queryParams.valueRenderOption = params.valueRenderOption;
    if (params.dateTimeRenderOption) queryParams.dateTimeRenderOption = params.dateTimeRenderOption;
    // batchGet uses repeated 'ranges' param
    const url = new URL(`${this.baseUrl}/spreadsheets/${params.spreadsheetId}/values:batchGet`);
    for (const [key, val] of Object.entries(queryParams)) url.searchParams.set(key, val);
    for (const range of params.ranges) url.searchParams.append('ranges', range);

    const token = await this.getAccessToken();
    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Sheets API Error (${response.status}): ${error}`);
    }
    return response.json() as Promise<BatchGetResponse>;
  }

  async writeValues(params: {
    spreadsheetId: string;
    range: string;
    values: unknown[][];
    majorDimension?: string;
    valueInputOption?: string;
    includeValuesInResponse?: boolean;
  }): Promise<UpdateValuesResponse> {
    const queryParams: Record<string, string> = {
      valueInputOption: params.valueInputOption || 'USER_ENTERED',
    };
    if (params.includeValuesInResponse) queryParams.includeValuesInResponse = 'true';
    const body: Record<string, unknown> = {
      range: params.range,
      values: params.values,
    };
    if (params.majorDimension) body.majorDimension = params.majorDimension;
    return this.request('PUT', `/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}`, body, queryParams);
  }

  async appendValues(params: {
    spreadsheetId: string;
    range: string;
    values: unknown[][];
    valueInputOption?: string;
    insertDataOption?: string;
    includeValuesInResponse?: boolean;
  }): Promise<AppendValuesResponse> {
    const queryParams: Record<string, string> = {
      valueInputOption: params.valueInputOption || 'USER_ENTERED',
    };
    if (params.insertDataOption) queryParams.insertDataOption = params.insertDataOption;
    if (params.includeValuesInResponse) queryParams.includeValuesInResponse = 'true';
    return this.request('POST', `/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}:append`, { values: params.values }, queryParams);
  }

  async clearValues(params: {
    spreadsheetId: string;
    range: string;
  }): Promise<{ spreadsheetId: string; clearedRange: string }> {
    return this.request('POST', `/spreadsheets/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}:clear`, {});
  }

  async batchWrite(params: {
    spreadsheetId: string;
    data: Array<{ range: string; values: unknown[][] }>;
    valueInputOption?: string;
    includeValuesInResponse?: boolean;
  }): Promise<BatchUpdateValuesResponse> {
    const body: Record<string, unknown> = {
      valueInputOption: params.valueInputOption || 'USER_ENTERED',
      data: params.data,
    };
    if (params.includeValuesInResponse) body.includeValuesInResponse = true;
    return this.request('POST', `/spreadsheets/${params.spreadsheetId}/values:batchUpdate`, body);
  }

  // ========== Sheet Management (5) ==========

  async addSheet(params: {
    spreadsheetId: string;
    title: string;
    rowCount?: number;
    columnCount?: number;
    tabColorRed?: number;
    tabColorGreen?: number;
    tabColorBlue?: number;
  }): Promise<BatchUpdateResponse> {
    const sheetProperties: Record<string, unknown> = { title: params.title };
    if (params.rowCount || params.columnCount) {
      sheetProperties.gridProperties = {
        rowCount: params.rowCount || 1000,
        columnCount: params.columnCount || 26,
      };
    }
    if (params.tabColorRed !== undefined || params.tabColorGreen !== undefined || params.tabColorBlue !== undefined) {
      sheetProperties.tabColor = {
        red: params.tabColorRed || 0,
        green: params.tabColorGreen || 0,
        blue: params.tabColorBlue || 0,
      };
    }
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{ addSheet: { properties: sheetProperties } }],
    });
  }

  async deleteSheet(params: {
    spreadsheetId: string;
    sheetId: number;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{ deleteSheet: { sheetId: params.sheetId } }],
    });
  }

  async renameSheet(params: {
    spreadsheetId: string;
    sheetId: number;
    title: string;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{
        updateSheetProperties: {
          properties: { sheetId: params.sheetId, title: params.title },
          fields: 'title',
        },
      }],
    });
  }

  async copySheet(params: {
    spreadsheetId: string;
    sheetId: number;
    destinationSpreadsheetId: string;
  }): Promise<CopySheetResponse> {
    return this.request('POST', `/spreadsheets/${params.spreadsheetId}/sheets/${params.sheetId}:copyTo`, {
      destinationSpreadsheetId: params.destinationSpreadsheetId,
    });
  }

  async duplicateSheet(params: {
    spreadsheetId: string;
    sheetId: number;
    newSheetName?: string;
    insertSheetIndex?: number;
  }): Promise<BatchUpdateResponse> {
    const req: Record<string, unknown> = {
      sourceSheetId: params.sheetId,
    };
    if (params.newSheetName) req.newSheetName = params.newSheetName;
    if (params.insertSheetIndex !== undefined) req.insertSheetIndex = params.insertSheetIndex;
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{ duplicateSheet: req }],
    });
  }

  // ========== Formatting (4) ==========

  async formatCells(params: {
    spreadsheetId: string;
    sheetId: number;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    fontSize?: number;
    fontFamily?: string;
    foregroundColorRed?: number;
    foregroundColorGreen?: number;
    foregroundColorBlue?: number;
    backgroundColorRed?: number;
    backgroundColorGreen?: number;
    backgroundColorBlue?: number;
    horizontalAlignment?: string;
    verticalAlignment?: string;
    wrapStrategy?: string;
    numberFormatType?: string;
    numberFormatPattern?: string;
  }): Promise<BatchUpdateResponse> {
    const cellFormat: Record<string, unknown> = {};
    const fields: string[] = [];

    // Text format
    const textFormat: Record<string, unknown> = {};
    if (params.bold !== undefined) { textFormat.bold = params.bold; fields.push('userEnteredFormat.textFormat.bold'); }
    if (params.italic !== undefined) { textFormat.italic = params.italic; fields.push('userEnteredFormat.textFormat.italic'); }
    if (params.strikethrough !== undefined) { textFormat.strikethrough = params.strikethrough; fields.push('userEnteredFormat.textFormat.strikethrough'); }
    if (params.underline !== undefined) { textFormat.underline = params.underline; fields.push('userEnteredFormat.textFormat.underline'); }
    if (params.fontSize !== undefined) { textFormat.fontSize = params.fontSize; fields.push('userEnteredFormat.textFormat.fontSize'); }
    if (params.fontFamily) { textFormat.fontFamily = params.fontFamily; fields.push('userEnteredFormat.textFormat.fontFamily'); }
    if (params.foregroundColorRed !== undefined || params.foregroundColorGreen !== undefined || params.foregroundColorBlue !== undefined) {
      textFormat.foregroundColor = {
        red: params.foregroundColorRed || 0,
        green: params.foregroundColorGreen || 0,
        blue: params.foregroundColorBlue || 0,
      };
      fields.push('userEnteredFormat.textFormat.foregroundColor');
    }
    if (Object.keys(textFormat).length > 0) cellFormat.textFormat = textFormat;

    // Background color
    if (params.backgroundColorRed !== undefined || params.backgroundColorGreen !== undefined || params.backgroundColorBlue !== undefined) {
      cellFormat.backgroundColor = {
        red: params.backgroundColorRed || 0,
        green: params.backgroundColorGreen || 0,
        blue: params.backgroundColorBlue || 0,
      };
      fields.push('userEnteredFormat.backgroundColor');
    }

    // Alignment
    if (params.horizontalAlignment) { cellFormat.horizontalAlignment = params.horizontalAlignment; fields.push('userEnteredFormat.horizontalAlignment'); }
    if (params.verticalAlignment) { cellFormat.verticalAlignment = params.verticalAlignment; fields.push('userEnteredFormat.verticalAlignment'); }
    if (params.wrapStrategy) { cellFormat.wrapStrategy = params.wrapStrategy; fields.push('userEnteredFormat.wrapStrategy'); }

    // Number format
    if (params.numberFormatType) {
      cellFormat.numberFormat = { type: params.numberFormatType, pattern: params.numberFormatPattern };
      fields.push('userEnteredFormat.numberFormat');
    }

    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{
        repeatCell: {
          range: {
            sheetId: params.sheetId,
            startRowIndex: params.startRowIndex,
            endRowIndex: params.endRowIndex,
            startColumnIndex: params.startColumnIndex,
            endColumnIndex: params.endColumnIndex,
          },
          cell: { userEnteredFormat: cellFormat },
          fields: fields.join(','),
        },
      }],
    });
  }

  async mergeCells(params: {
    spreadsheetId: string;
    sheetId: number;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
    mergeType?: string;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{
        mergeCells: {
          range: {
            sheetId: params.sheetId,
            startRowIndex: params.startRowIndex,
            endRowIndex: params.endRowIndex,
            startColumnIndex: params.startColumnIndex,
            endColumnIndex: params.endColumnIndex,
          },
          mergeType: params.mergeType || 'MERGE_ALL',
        },
      }],
    });
  }

  async unmergeCells(params: {
    spreadsheetId: string;
    sheetId: number;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{
        unmergeCells: {
          range: {
            sheetId: params.sheetId,
            startRowIndex: params.startRowIndex,
            endRowIndex: params.endRowIndex,
            startColumnIndex: params.startColumnIndex,
            endColumnIndex: params.endColumnIndex,
          },
        },
      }],
    });
  }

  async autoResize(params: {
    spreadsheetId: string;
    sheetId: number;
    dimension: string;
    startIndex: number;
    endIndex: number;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{
        autoResizeDimensions: {
          dimensions: {
            sheetId: params.sheetId,
            dimension: params.dimension,
            startIndex: params.startIndex,
            endIndex: params.endIndex,
          },
        },
      }],
    });
  }

  // ========== Data Operations (4) ==========

  async sortRange(params: {
    spreadsheetId: string;
    sheetId: number;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
    sortColumnIndex: number;
    sortOrder?: string;
  }): Promise<BatchUpdateResponse> {
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{
        sortRange: {
          range: {
            sheetId: params.sheetId,
            startRowIndex: params.startRowIndex,
            endRowIndex: params.endRowIndex,
            startColumnIndex: params.startColumnIndex,
            endColumnIndex: params.endColumnIndex,
          },
          sortSpecs: [{
            dimensionIndex: params.sortColumnIndex,
            sortOrder: params.sortOrder || 'ASCENDING',
          }],
        },
      }],
    });
  }

  async findReplace(params: {
    spreadsheetId: string;
    find: string;
    replacement: string;
    sheetId?: number;
    matchCase?: boolean;
    matchEntireCell?: boolean;
    searchByRegex?: boolean;
    allSheets?: boolean;
    includeFormulas?: boolean;
  }): Promise<BatchUpdateResponse> {
    const req: Record<string, unknown> = {
      find: params.find,
      replacement: params.replacement,
    };
    if (params.sheetId !== undefined) req.sheetId = params.sheetId;
    if (params.matchCase) req.matchCase = true;
    if (params.matchEntireCell) req.matchEntireCell = true;
    if (params.searchByRegex) req.searchByRegex = true;
    if (params.allSheets) req.allSheets = true;
    if (params.includeFormulas) req.includeFormulas = true;
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{ findReplace: req }],
    });
  }

  async setBasicFilter(params: {
    spreadsheetId: string;
    sheetId: number;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
    clear?: boolean;
  }): Promise<BatchUpdateResponse> {
    if (params.clear) {
      return this.batchUpdate({
        spreadsheetId: params.spreadsheetId,
        requests: [{ clearBasicFilter: { sheetId: params.sheetId } }],
      });
    }
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{
        setBasicFilter: {
          filter: {
            range: {
              sheetId: params.sheetId,
              startRowIndex: params.startRowIndex,
              endRowIndex: params.endRowIndex,
              startColumnIndex: params.startColumnIndex,
              endColumnIndex: params.endColumnIndex,
            },
          },
        },
      }],
    });
  }

  async addProtectedRange(params: {
    spreadsheetId: string;
    sheetId: number;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
    description?: string;
    warningOnly?: boolean;
    editors?: string[];
  }): Promise<BatchUpdateResponse> {
    const protectedRange: Record<string, unknown> = {
      range: {
        sheetId: params.sheetId,
        startRowIndex: params.startRowIndex,
        endRowIndex: params.endRowIndex,
        startColumnIndex: params.startColumnIndex,
        endColumnIndex: params.endColumnIndex,
      },
    };
    if (params.description) protectedRange.description = params.description;
    if (params.warningOnly) protectedRange.warningOnly = true;
    if (params.editors) protectedRange.editors = { users: params.editors };
    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{ addProtectedRange: { protectedRange } }],
    });
  }

  // ========== Advanced (2) ==========

  async addChart(params: {
    spreadsheetId: string;
    sheetId: number;
    chartType: string;
    title?: string;
    dataSheetId: number;
    dataStartRowIndex: number;
    dataEndRowIndex: number;
    dataStartColumnIndex: number;
    dataEndColumnIndex: number;
    anchorRowIndex?: number;
    anchorColumnIndex?: number;
  }): Promise<BatchUpdateResponse> {
    const dataRange: GridRange = {
      sheetId: params.dataSheetId,
      startRowIndex: params.dataStartRowIndex,
      endRowIndex: params.dataEndRowIndex,
      startColumnIndex: params.dataStartColumnIndex,
      endColumnIndex: params.dataEndColumnIndex,
    };

    const chart: Record<string, unknown> = {
      position: {
        overlayPosition: {
          anchorCell: {
            sheetId: params.sheetId,
            rowIndex: params.anchorRowIndex || 0,
            columnIndex: params.anchorColumnIndex || 0,
          },
          widthPixels: 600,
          heightPixels: 400,
        },
      },
      spec: {
        title: params.title || '',
        basicChart: {
          chartType: params.chartType,
          legendPosition: 'BOTTOM_LEGEND',
          axis: [
            { position: 'BOTTOM_AXIS' },
            { position: 'LEFT_AXIS' },
          ],
          domains: [{
            domain: { sourceRange: { sources: [dataRange] } },
          }],
          series: [{
            series: { sourceRange: { sources: [dataRange] } },
            targetAxis: 'LEFT_AXIS',
          }],
          headerCount: 1,
        },
      },
    };

    return this.batchUpdate({
      spreadsheetId: params.spreadsheetId,
      requests: [{ addChart: { chart } }],
    });
  }

  async batchUpdate(params: {
    spreadsheetId: string;
    requests: Record<string, unknown>[];
    includeSpreadsheetInResponse?: boolean;
  }): Promise<BatchUpdateResponse> {
    const body: Record<string, unknown> = { requests: params.requests };
    if (params.includeSpreadsheetInResponse) body.includeSpreadsheetInResponse = true;
    return this.request('POST', `/spreadsheets/${params.spreadsheetId}:batchUpdate`, body);
  }
}
