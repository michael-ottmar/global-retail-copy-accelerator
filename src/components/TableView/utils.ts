import type { Deliverable, Asset, Field } from '../../types';

export function formatVariableName(deliverable: Deliverable, asset: Asset, field: Field): string {
  const parts = [
    deliverable.name.toLowerCase(),
    asset.name.toLowerCase(),
    (field.customName || field.name).toLowerCase()
  ];
  
  return parts.join('/').replace(/\s+/g, '_');
}

export function getFieldDisplayName(field: Field): string {
  return field.customName || field.name;
}

export function shouldShowField(
  field: Field,
  asset: Asset,
  deliverable: Deliverable,
  searchQuery: string
): boolean {
  if (!searchQuery) return true;
  
  const query = searchQuery.toLowerCase();
  const fieldName = getFieldDisplayName(field).toLowerCase();
  const assetName = asset.name.toLowerCase();
  const deliverableName = deliverable.name.toLowerCase();
  
  return (
    fieldName.includes(query) ||
    assetName.includes(query) ||
    deliverableName.includes(query)
  );
}