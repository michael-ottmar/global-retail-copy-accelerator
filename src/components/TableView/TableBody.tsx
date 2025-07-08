import { useState } from 'react';
import type { Deliverable, Language } from '../../types';
import type { ColumnConfig, ColumnPosition } from './types';
import { DeliverableRow } from './DeliverableRow';
import { useDragAndDrop } from './hooks/useDragAndDrop';

interface TableBodyProps {
  columns: ColumnConfig[];
  columnPositions: Record<string, ColumnPosition>;
  deliverables: Deliverable[];
  languages: Language[];
  searchQuery: string;
  onVariableHover: (variable: string) => void;
}

export function TableBody({
  columns,
  columnPositions,
  deliverables,
  languages,
  searchQuery,
  onVariableHover
}: TableBodyProps) {
  const [expandedDeliverables, setExpandedDeliverables] = useState<Set<string>>(
    new Set(['pdp-1']) // Default expand first deliverable
  );
  
  const dragAndDrop = useDragAndDrop();

  const toggleDeliverable = (deliverableId: string) => {
    setExpandedDeliverables(prev => {
      const next = new Set(prev);
      if (next.has(deliverableId)) {
        next.delete(deliverableId);
      } else {
        next.add(deliverableId);
      }
      return next;
    });
  };

  return (
    <tbody>
      {deliverables.map((deliverable) => (
        <DeliverableRow
          key={deliverable.id}
          deliverable={deliverable}
          columns={columns}
          columnPositions={columnPositions}
          languages={languages}
          isExpanded={expandedDeliverables.has(deliverable.id)}
          onToggle={() => toggleDeliverable(deliverable.id)}
          searchQuery={searchQuery}
          onVariableHover={onVariableHover}
          dragAndDrop={dragAndDrop}
        />
      ))}
    </tbody>
  );
}