import { useState } from 'react';
import CreateRFP from './components/CreateRFP';
import RFPManager from './components/RFPManager';
import { PlusCircle, LayoutDashboard } from 'lucide-react';

function App() {
  // Simple state to toggle views
  const [view, setView] = useState<'create' | 'dashboard'>('create');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight leading-none">ProcurementAI</h1>
              <p className="text-xs text-slate-400">Automated RFP Manager</p>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
            <button 
              onClick={() => setView('create')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'create' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <PlusCircle size={18} /> 
              Create RFP
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <LayoutDashboard size={18} /> 
              Dashboard & Compare
            </button>
          </div>

        </div>
      </nav>
      
      {/* Main Content Area */}
      <main className="py-8 animate-in fade-in duration-500 ">
        {view === 'create' ? (
          <CreateRFP />
        ) : (
          <RFPManager />
        )}
      </main>
    </div>
  );
}

export default App;