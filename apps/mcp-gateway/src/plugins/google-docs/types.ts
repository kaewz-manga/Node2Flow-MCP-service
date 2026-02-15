/**
 * Google Docs API v1 Types
 */

export interface Document {
  documentId: string;
  title: string;
  body?: Body;
  headers?: Record<string, Header>;
  footers?: Record<string, Footer>;
  footnotes?: Record<string, Footnote>;
  documentStyle?: DocumentStyle;
  namedStyles?: NamedStyles;
  revisionId?: string;
  suggestionsViewMode?: string;
  inlineObjects?: Record<string, InlineObject>;
  namedRanges?: Record<string, NamedRange>;
}

export interface Body {
  content: StructuralElement[];
}

export interface StructuralElement {
  startIndex: number;
  endIndex: number;
  paragraph?: Paragraph;
  sectionBreak?: SectionBreak;
  table?: Table;
  tableOfContents?: TableOfContents;
}

export interface Paragraph {
  elements: ParagraphElement[];
  paragraphStyle?: ParagraphStyle;
  bullet?: Bullet;
}

export interface ParagraphElement {
  startIndex: number;
  endIndex: number;
  textRun?: TextRun;
  inlineObjectElement?: InlineObjectElement;
  pageBreak?: Record<string, unknown>;
}

export interface TextRun {
  content: string;
  textStyle?: TextStyle;
}

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  smallCaps?: boolean;
  fontSize?: Dimension;
  fontFamily?: string;
  foregroundColor?: OptionalColor;
  backgroundColor?: OptionalColor;
  link?: Link;
  baselineOffset?: string;
  weightedFontFamily?: WeightedFontFamily;
}

export interface ParagraphStyle {
  namedStyleType?: string;
  alignment?: string;
  lineSpacing?: number;
  direction?: string;
  spacingMode?: string;
  spaceAbove?: Dimension;
  spaceBelow?: Dimension;
  indentFirstLine?: Dimension;
  indentStart?: Dimension;
  indentEnd?: Dimension;
  headingId?: string;
}

export interface Dimension {
  magnitude: number;
  unit: string;
}

export interface OptionalColor {
  color?: Color;
}

export interface Color {
  rgbColor?: RgbColor;
}

export interface RgbColor {
  red?: number;
  green?: number;
  blue?: number;
}

export interface Link {
  url?: string;
  headingId?: string;
  bookmarkId?: string;
}

export interface WeightedFontFamily {
  fontFamily: string;
  weight: number;
}

export interface Bullet {
  listId: string;
  nestingLevel?: number;
}

export interface SectionBreak {
  sectionStyle?: SectionStyle;
}

export interface SectionStyle {
  sectionType?: string;
  columnSeparatorStyle?: string;
  contentDirection?: string;
}

export interface Table {
  rows: number;
  columns: number;
  tableRows: TableRow[];
  tableStyle?: TableStyle;
}

export interface TableRow {
  startIndex: number;
  endIndex: number;
  tableCells: TableCell[];
  tableRowStyle?: TableRowStyle;
}

export interface TableCell {
  startIndex: number;
  endIndex: number;
  content: StructuralElement[];
  tableCellStyle?: TableCellStyle;
}

export interface TableCellStyle {
  backgroundColor?: OptionalColor;
  borderTop?: TableCellBorder;
  borderBottom?: TableCellBorder;
  borderLeft?: TableCellBorder;
  borderRight?: TableCellBorder;
  paddingTop?: Dimension;
  paddingBottom?: Dimension;
  paddingLeft?: Dimension;
  paddingRight?: Dimension;
  contentAlignment?: string;
  rowSpan?: number;
  columnSpan?: number;
}

export interface TableCellBorder {
  color?: OptionalColor;
  width?: Dimension;
  dashStyle?: string;
}

export interface TableStyle {
  tableColumnProperties: TableColumnProperties[];
}

export interface TableColumnProperties {
  widthType?: string;
  width?: Dimension;
}

export interface TableRowStyle {
  minRowHeight?: Dimension;
}

export interface TableOfContents {
  content: StructuralElement[];
}

export interface Header {
  headerId: string;
  content: StructuralElement[];
}

export interface Footer {
  footerId: string;
  content: StructuralElement[];
}

export interface Footnote {
  footnoteId: string;
  content: StructuralElement[];
}

export interface DocumentStyle {
  background?: Background;
  defaultHeaderId?: string;
  defaultFooterId?: string;
  pageSize?: Dimension2D;
  marginTop?: Dimension;
  marginBottom?: Dimension;
  marginLeft?: Dimension;
  marginRight?: Dimension;
}

export interface Dimension2D {
  width: Dimension;
  height: Dimension;
}

export interface Background {
  color?: OptionalColor;
}

export interface NamedStyles {
  styles: NamedStyle[];
}

export interface NamedStyle {
  namedStyleType: string;
  textStyle?: TextStyle;
  paragraphStyle?: ParagraphStyle;
}

export interface InlineObject {
  objectId: string;
  inlineObjectProperties?: InlineObjectProperties;
}

export interface InlineObjectProperties {
  embeddedObject?: EmbeddedObject;
}

export interface EmbeddedObject {
  title?: string;
  description?: string;
  imageProperties?: ImageProperties;
  size?: Size;
}

export interface ImageProperties {
  sourceUri?: string;
  contentUri?: string;
  cropProperties?: CropProperties;
}

export interface CropProperties {
  offsetLeft?: number;
  offsetRight?: number;
  offsetTop?: number;
  offsetBottom?: number;
}

export interface Size {
  width?: Dimension;
  height?: Dimension;
}

export interface InlineObjectElement {
  inlineObjectId: string;
}

export interface NamedRange {
  namedRangeId: string;
  name: string;
  ranges: Range[];
}

export interface Range {
  startIndex: number;
  endIndex: number;
  segmentId?: string;
}

// ========== Batch Update Types ==========

export interface BatchUpdateRequest {
  requests: Request[];
  writeControl?: WriteControl;
}

export interface WriteControl {
  requiredRevisionId?: string;
  targetRevisionId?: string;
}

export interface Request {
  insertText?: InsertTextRequest;
  deleteContentRange?: DeleteContentRangeRequest;
  insertInlineImage?: InsertInlineImageRequest;
  insertTable?: InsertTableRequest;
  insertTableRow?: InsertTableRowRequest;
  insertTableColumn?: InsertTableColumnRequest;
  deleteTableRow?: DeleteTableRowRequest;
  deleteTableColumn?: DeleteTableColumnRequest;
  replaceAllText?: ReplaceAllTextRequest;
  updateTextStyle?: UpdateTextStyleRequest;
  updateParagraphStyle?: UpdateParagraphStyleRequest;
  createParagraphBullets?: CreateParagraphBulletsRequest;
  deleteParagraphBullets?: DeleteParagraphBulletsRequest;
  insertPageBreak?: InsertPageBreakRequest;
  createHeader?: CreateHeaderRequest;
  createFooter?: CreateFooterRequest;
  deleteHeader?: DeleteHeaderRequest;
  deleteFooter?: DeleteFooterRequest;
  insertSectionBreak?: InsertSectionBreakRequest;
  mergeTableCells?: MergeTableCellsRequest;
  unmergeTableCells?: UnmergeTableCellsRequest;
  createNamedRange?: CreateNamedRangeRequest;
  deleteNamedRange?: DeleteNamedRangeRequest;
  replaceNamedRangeContent?: ReplaceNamedRangeContentRequest;
  [key: string]: unknown;
}

export interface Location {
  index: number;
  segmentId?: string;
}

export interface ContentRange {
  startIndex: number;
  endIndex: number;
  segmentId?: string;
}

export interface InsertTextRequest {
  text: string;
  location: Location;
}

export interface DeleteContentRangeRequest {
  range: ContentRange;
}

export interface InsertInlineImageRequest {
  uri: string;
  location: Location;
  objectSize?: Size;
}

export interface InsertTableRequest {
  rows: number;
  columns: number;
  location: Location;
}

export interface InsertTableRowRequest {
  tableCellLocation: TableCellLocation;
  insertBelow: boolean;
}

export interface InsertTableColumnRequest {
  tableCellLocation: TableCellLocation;
  insertRight: boolean;
}

export interface DeleteTableRowRequest {
  tableCellLocation: TableCellLocation;
}

export interface DeleteTableColumnRequest {
  tableCellLocation: TableCellLocation;
}

export interface TableCellLocation {
  tableStartLocation: Location;
  rowIndex: number;
  columnIndex: number;
}

export interface ReplaceAllTextRequest {
  replaceText: string;
  containsText: SubstringMatchCriteria;
}

export interface SubstringMatchCriteria {
  text: string;
  matchCase: boolean;
}

export interface UpdateTextStyleRequest {
  textStyle: TextStyle;
  range: ContentRange;
  fields: string;
}

export interface UpdateParagraphStyleRequest {
  paragraphStyle: ParagraphStyle;
  range: ContentRange;
  fields: string;
}

export interface CreateParagraphBulletsRequest {
  range: ContentRange;
  bulletPreset: string;
}

export interface DeleteParagraphBulletsRequest {
  range: ContentRange;
}

export interface InsertPageBreakRequest {
  location: Location;
}

export interface CreateHeaderRequest {
  type: string;
  sectionBreakLocation?: Location;
}

export interface CreateFooterRequest {
  type: string;
  sectionBreakLocation?: Location;
}

export interface DeleteHeaderRequest {
  headerId: string;
}

export interface DeleteFooterRequest {
  footerId: string;
}

export interface InsertSectionBreakRequest {
  location: Location;
  sectionType: string;
}

export interface MergeTableCellsRequest {
  tableRange: TableRange;
}

export interface UnmergeTableCellsRequest {
  tableRange: TableRange;
}

export interface TableRange {
  tableCellLocation: TableCellLocation;
  rowSpan: number;
  columnSpan: number;
}

export interface CreateNamedRangeRequest {
  name: string;
  range: ContentRange;
}

export interface DeleteNamedRangeRequest {
  namedRangeId?: string;
  name?: string;
}

export interface ReplaceNamedRangeContentRequest {
  namedRangeId?: string;
  namedRangeName?: string;
  text: string;
}

export interface BatchUpdateResponse {
  replies: Reply[];
  writeControl?: WriteControl;
  documentId: string;
}

export interface Reply {
  createHeader?: { headerId: string };
  createFooter?: { footerId: string };
  createNamedRange?: { namedRangeId: string };
  replaceAllText?: { occurrencesChanged: number };
  insertInlineImage?: { objectId: string };
  [key: string]: unknown;
}

