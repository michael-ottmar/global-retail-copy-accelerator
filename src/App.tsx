import { useEffect } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { TableView } from './components/TableView';
import { MockupView } from './components/MockupView';
import { WordView } from './components/WordView';
import { createSampleProject } from './utils/sampleData';

function App() {
  const { project, currentView, setProject, setTranslations } = useStore();

  useEffect(() => {
    // Initialize with sample data
    const sampleProject = createSampleProject();
    setProject(sampleProject);
    
    // Create empty translations for all fields and languages
    const translations = [];
    for (const deliverable of sampleProject.deliverables) {
      for (const asset of deliverable.assets) {
        for (const field of asset.fields) {
          for (const language of sampleProject.languages) {
            translations.push({
              fieldId: field.id,
              languageCode: language.code,
              value: '',
              status: 'empty' as const,
            });
          }
        }
      }
    }
    setTranslations(translations);
  }, [setProject, setTranslations]);

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        {currentView === 'table' ? <TableView /> : currentView === 'mockup' ? <MockupView /> : <WordView />}
      </main>
    </div>
  );
}

export default App;