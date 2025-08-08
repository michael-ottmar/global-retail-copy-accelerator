export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutConstraint {
  vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
  horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
}

export interface EdgeInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Paint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  color?: { r: number; g: number; b: number; a: number };
  gradientStops?: Array<{ color: { r: number; g: number; b: number; a: number }; position: number }>;
  imageRef?: string;
}

export interface Effect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  color?: { r: number; g: number; b: number; a: number };
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
}

export interface TextStyle {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  letterSpacing: number;
  lineHeight: { unit: 'PIXELS' | 'PERCENT'; value: number };
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
}

export interface FigmaNode {
  id: string;
  name: string;
  type: 'FRAME' | 'GROUP' | 'TEXT' | 'RECTANGLE' | 'COMPONENT' | 'INSTANCE';
  visible?: boolean;
  locked?: boolean;
  absoluteBoundingBox: BoundingBox;
  constraints: LayoutConstraint;
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
  layoutGrow?: number;
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  cornerRadius?: number;
  effects?: Effect[];
  opacity?: number;
  characters?: string;
  style?: TextStyle;
  children?: FigmaNode[];
}

export interface ParsedComponent {
  id: string;
  figmaId: string;
  type: 'container' | 'text' | 'image' | 'shape';
  name: string;
  styles: React.CSSProperties;
  textContent?: string;
  children: ParsedComponent[];
  variableId?: string;
  variablePath?: string; // e.g., "pdp/gallery_image_1/headline"
}

export interface VariableMapping {
  figmaNodeId: string;
  figmaNodeName: string;
  figmaTextContent: string;
  variablePath: string; // "pdp/gallery_image_1/headline"
  deliverable: string;
  asset: string;
  field: string;
  syncStatus: 'mapped' | 'unmapped' | 'conflict' | 'suggested';
  confidence?: number; // 0-1 for auto-suggestions
}

export interface DesignSandboxState {
  connection: {
    fileKey: string;
    fileName: string;
    status: 'disconnected' | 'connecting' | 'connected';
  };
  selectedFrame: string | null;
  parsedComponents: Map<string, ParsedComponent>;
  variableMappings: Map<string, VariableMapping>;
  renderMode: 'figma' | 'mapped' | 'split';
  cssCache: Map<string, React.CSSProperties>;
}