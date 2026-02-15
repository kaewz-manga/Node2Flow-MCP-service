/**
 * Google Sheets API v4 - Type Definitions
 */

export interface SheetsConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

// --- GridRange (used everywhere) ---

export interface GridRange {
  sheetId: number;
  startRowIndex?: number;
  endRowIndex?: number;
  startColumnIndex?: number;
  endColumnIndex?: number;
}

// --- Spreadsheet ---

export interface Spreadsheet {
  spreadsheetId: string;
  properties: SpreadsheetProperties;
  sheets: Sheet[];
  spreadsheetUrl: string;
}

export interface SpreadsheetProperties {
  title: string;
  locale?: string;
  autoRecalc?: string;
  timeZone?: string;
  defaultFormat?: CellFormat;
}

// --- Sheet ---

export interface Sheet {
  properties: SheetProperties;
  data?: GridData[];
  merges?: GridRange[];
  conditionalFormats?: ConditionalFormatRule[];
  filterViews?: FilterView[];
  protectedRanges?: ProtectedRange[];
  basicFilter?: BasicFilter;
  charts?: EmbeddedChart[];
}

export interface SheetProperties {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
  gridProperties?: {
    rowCount: number;
    columnCount: number;
    frozenRowCount?: number;
    frozenColumnCount?: number;
    hideGridlines?: boolean;
  };
  hidden?: boolean;
  tabColor?: Color;
  tabColorStyle?: ColorStyle;
  rightToLeft?: boolean;
}

// --- Cell Format ---

export interface CellFormat {
  numberFormat?: {
    type: string;
    pattern?: string;
  };
  backgroundColor?: Color;
  borders?: {
    top?: Border;
    bottom?: Border;
    left?: Border;
    right?: Border;
  };
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  horizontalAlignment?: string;
  verticalAlignment?: string;
  wrapStrategy?: string;
  textDirection?: string;
  textFormat?: TextFormat;
  hyperlinkDisplayType?: string;
  textRotation?: {
    angle?: number;
    vertical?: boolean;
  };
}

export interface TextFormat {
  foregroundColor?: Color;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
}

export interface Color {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
}

export interface ColorStyle {
  rgbColor?: Color;
  themeColor?: string;
}

export interface Border {
  style?: string;
  color?: Color;
  colorStyle?: ColorStyle;
}

// --- Values ---

export interface ValueRange {
  range: string;
  majorDimension?: string;
  values: unknown[][];
}

export interface BatchGetResponse {
  spreadsheetId: string;
  valueRanges: ValueRange[];
}

export interface UpdateValuesResponse {
  spreadsheetId: string;
  updatedRange: string;
  updatedRows: number;
  updatedColumns: number;
  updatedCells: number;
  updatedData?: ValueRange;
}

export interface AppendValuesResponse {
  spreadsheetId: string;
  tableRange: string;
  updates: UpdateValuesResponse;
}

export interface BatchUpdateValuesResponse {
  spreadsheetId: string;
  totalUpdatedRows: number;
  totalUpdatedColumns: number;
  totalUpdatedCells: number;
  totalUpdatedSheets: number;
  responses: UpdateValuesResponse[];
}

// --- Batch Update ---

export interface BatchUpdateRequest {
  requests: Record<string, unknown>[];
  includeSpreadsheetInResponse?: boolean;
  responseRanges?: string[];
  responseIncludeGridData?: boolean;
}

export interface BatchUpdateResponse {
  spreadsheetId: string;
  replies: Record<string, unknown>[];
  updatedSpreadsheet?: Spreadsheet;
}

// --- Protected Range ---

export interface ProtectedRange {
  protectedRangeId?: number;
  range: GridRange;
  namedRangeId?: string;
  description?: string;
  warningOnly?: boolean;
  requestingUserCanEdit?: boolean;
  editors?: {
    users?: string[];
    groups?: string[];
    domainUsersCanEdit?: boolean;
  };
}

// --- Filter ---

export interface BasicFilter {
  range: GridRange;
  sortSpecs?: SortSpec[];
  criteria?: Record<string, FilterCriteria>;
}

export interface FilterView {
  filterViewId: number;
  title: string;
  range: GridRange;
  namedRangeId?: string;
  sortSpecs?: SortSpec[];
  criteria?: Record<string, FilterCriteria>;
}

export interface SortSpec {
  dimensionIndex: number;
  sortOrder: string;
}

export interface FilterCriteria {
  hiddenValues?: string[];
  condition?: {
    type: string;
    values?: Array<{ userEnteredValue?: string }>;
  };
}

// --- Chart ---

export interface EmbeddedChart {
  chartId: number;
  position: {
    overlayPosition?: {
      anchorCell: {
        sheetId: number;
        rowIndex: number;
        columnIndex: number;
      };
      offsetXPixels?: number;
      offsetYPixels?: number;
      widthPixels?: number;
      heightPixels?: number;
    };
    newSheet?: boolean;
  };
  spec: Record<string, unknown>;
}

// --- Find Replace ---

export interface FindReplaceResponse {
  valuesChanged: number;
  formulasChanged: number;
  rowsChanged: number;
  sheetsChanged: number;
  occurrencesChanged: number;
}

// --- Conditional Format ---

export interface ConditionalFormatRule {
  ranges: GridRange[];
  booleanRule?: {
    condition: {
      type: string;
      values?: Array<{ userEnteredValue?: string }>;
    };
    format: CellFormat;
  };
  gradientRule?: Record<string, unknown>;
}

// --- Grid Data ---

export interface GridData {
  startRow?: number;
  startColumn?: number;
  rowData?: Array<{
    values?: Array<{
      userEnteredValue?: Record<string, unknown>;
      effectiveValue?: Record<string, unknown>;
      formattedValue?: string;
      userEnteredFormat?: CellFormat;
      effectiveFormat?: CellFormat;
    }>;
  }>;
  rowMetadata?: Array<{ pixelSize: number; hideSeries?: boolean }>;
  columnMetadata?: Array<{ pixelSize: number; hideSeries?: boolean }>;
}

// --- Copy Sheet ---

export interface CopySheetResponse {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
}
