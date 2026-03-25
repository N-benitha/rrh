import { useState } from 'react';
import type { Page } from './types';
import LandingPage from './pages/LandingPage';
import Dashboard from './components/Dashboard';
import RiskMap from './components/RiskMap';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage setPage={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard setPage={setCurrentPage} />;
      case 'map':
        return <RiskMap setPage={setCurrentPage} />;
      default:
        return <LandingPage setPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;