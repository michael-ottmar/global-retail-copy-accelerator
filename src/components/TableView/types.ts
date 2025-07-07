export interface ColumnConfig {
  id: string;
  width: number;
  sticky: boolean;
  label: string;
  isSource?: boolean;
  isSelected?: boolean;
}

export interface ColumnPosition {
  left: number;
  width: number;
  isSticky: boolean;
}

export interface CellEditState {
  fieldId: string;
  languageCode: string;
}

export interface TableCellProps {
  value: string;
  status?: 'empty' | 'in_progress' | 'completed' | 'ai_generated';
  isEditing: boolean;
  isSource?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  onBlur: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export interface VariableInfo {
  deliverable: string;
  asset: string;
  field: string;
  formatted: string;
}