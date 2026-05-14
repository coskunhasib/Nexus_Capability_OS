import { useState } from 'react';
import { Boxes, BrainCircuit, Database, Hammer, ListChecks, Map as MapIcon, ShieldCheck } from 'lucide-react';
import App from './App.tsx';
import CapabilityPackDetailView from './CapabilityPackDetailView.tsx';
import CompilerView from './CompilerView.tsx';
import PackBuilderView from './PackBuilderView.tsx';
import RegistryGovernance from './RegistryGovernance.tsx';
import RegistryInspector from './RegistryInspector.tsx';
import TaskRunnerMock from './TaskRunnerMock.tsx';

type ViewMode = 'map' | 'compiler' | 'packs' | 'builder' | 'inspector' | 'governance' | 'runner';

export default function Shell() {
  const [view, setView] = useState<ViewMode>('map');
  const [runnerPacket, setRunnerPacket] = useState<unknown>();

  const openRunnerWithPacket = (packet: unknown) => {
    setRunnerPacket(packet);
    setView('runner');
  };

  const buttonClass = (mode: ViewMode) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
      view === mode ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <div className="fixed right-4 top-4 z-50 flex overflow-hidden rounded-xl border border-white/10 bg-black/70 p-1 shadow-2xl backdrop-blur-xl">
        <button onClick={() => setView('map')} className={buttonClass('map')}>
          <MapIcon size={16} />
          Map
        </button>
        <button onClick={() => setView('compiler')} className={buttonClass('compiler')}>
          <BrainCircuit size={16} />
          Compiler
        </button>
        <button onClick={() => setView('packs')} className={buttonClass('packs')}>
          <Boxes size={16} />
          Packs
        </button>
        <button onClick={() => setView('builder')} className={buttonClass('builder')}>
          <Hammer size={16} />
          Builder
        </button>
        <button onClick={() => setView('inspector')} className={buttonClass('inspector')}>
          <Database size={16} />
          Inspector
        </button>
        <button onClick={() => setView('governance')} className={buttonClass('governance')}>
          <ShieldCheck size={16} />
          Governance
        </button>
        <button onClick={() => setView('runner')} className={buttonClass('runner')}>
          <ListChecks size={16} />
          Runner
        </button>
      </div>

      {view === 'map' && <App />}
      {view === 'compiler' && <CompilerView onSendTaskPacket={openRunnerWithPacket} />}
      {view === 'packs' && <CapabilityPackDetailView />}
      {view === 'builder' && <PackBuilderView />}
      {view === 'inspector' && <RegistryInspector />}
      {view === 'governance' && <RegistryGovernance />}
      {view === 'runner' && <TaskRunnerMock initialPacket={runnerPacket} />}
    </div>
  );
}
