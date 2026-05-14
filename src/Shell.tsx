import { useState } from 'react';
import { BrainCircuit, Map as MapIcon } from 'lucide-react';
import App from './App.tsx';
import CompilerView from './CompilerView.tsx';

export default function Shell() {
  const [view, setView] = useState<'map' | 'compiler'>('map');

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <div className="fixed right-4 top-4 z-50 flex overflow-hidden rounded-xl border border-white/10 bg-black/70 p-1 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => setView('map')}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
            view === 'map' ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <MapIcon size={16} />
          Map
        </button>
        <button
          onClick={() => setView('compiler')}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
            view === 'compiler' ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BrainCircuit size={16} />
          Compiler
        </button>
      </div>

      {view === 'map' ? <App /> : <CompilerView />}
    </div>
  );
}
