import { useMemo } from 'react';
import { useStore } from '../../../store';

export type ColumnStatus = 'empty' | 'in_progress' | 'completed' | 'mixed';

export function useColumnStatus() {
  const { translations, project } = useStore();
  
  const columnStatuses = useMemo(() => {
    if (!project) return {};
    
    const statuses: Record<string, ColumnStatus> = {};
    
    // Calculate status for each language column
    project.languages.forEach(language => {
      const langTranslations = translations.filter(t => t.languageCode === language.code);
      
      if (langTranslations.length === 0) {
        statuses[language.code] = 'empty';
        return;
      }
      
      const hasEmpty = langTranslations.some(t => !t.value || t.status === 'empty');
      const hasInProgress = langTranslations.some(t => t.status === 'in_progress');
      const hasCompleted = langTranslations.some(t => t.status === 'completed');
      
      if (hasEmpty && !hasInProgress && !hasCompleted) {
        statuses[language.code] = 'empty';
      } else if (hasCompleted && !hasEmpty && !hasInProgress) {
        statuses[language.code] = 'completed';
      } else if (hasInProgress || (hasCompleted && hasEmpty)) {
        statuses[language.code] = 'in_progress';
      } else {
        statuses[language.code] = 'mixed';
      }
    });
    
    return statuses;
  }, [translations, project]);
  
  return columnStatuses;
}