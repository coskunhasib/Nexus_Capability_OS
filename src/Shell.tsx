import { useState } from 'react';
import { Boxes, BrainCircuit, Database, FlaskConical, Hammer, ListChecks, Map as MapIcon, ShieldCheck } from 'lucide-react';
import App from './App.tsx';
import CapabilityPackDetailView from './CapabilityPackDetailView.tsx';
import CompilerView from './CompilerView.tsx';
import LabsView from './LabsView.tsx';
import PackBuilderView from './PackBuilderView.tsx';
import RegistryGovernance from './RegistryGovernance.tsx';
import RegistryInspector from './RegistryInspector.tsx';
import TaskRunnerMock from './TaskRunnerMock.tsx';
import TrialScenarioView from './TrialScenarioView.tsx';

type ViewMode = 'explore' | 'studio' | 'packs' | 'builder' | 'trials' | 'runner' | 'governance' | 'inspector' | 'labs';

const primaryModes: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
  { id: 'explore', label: 'Explore', icon: <MapIcon size={16} /> },
  { id: 'studio', label: 'Studio', icon: <BrainCircuit size={16} /> },
  { id: 'runner', label: 'Runner', icon: <ListChecks size={16} /> },
  { id: 'governance', label: 'Governance', icon: <ShieldCheck size={16} /> },
  { id: 'labs', label: 'Labs', icon: <FlaskConical size={16} /> },
];

const studioModes: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
  { id: 'studio', label: 'Compiler', icon: <BrainCircuit size={16} /> },
  { id: 'trials', label: 'Trials', icon: <FlaskConical size={16} /> },
  { id: 'packs', label: 'Packs', icon: <Boxes size={16} /> },
  { id: 'builder', label: 'Builder', icon: <Hammer size={16} /> },
];

const governanceModes: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
  { id: 'governance', label: 'Health', icon: <ShieldCheck size={16} /> },
  { id: 'inspector', label: 'Inspector', icon: <Database size={16} /> },
];

export default function Shell() {
  const [view, setView] = useState<ViewMode>('studio');
  const [runnerPacket, setRunnerPacket] = useState<unknown>();

  const openRunnerWithPacket = (packet: unknown) => {
    setRunnerPacket(packet);
    setView('runner');
  };

  const isPrimaryActive = (mode: ViewMode) => {
    if (mode === 'studio') return view === 'studio' || view === 'packs' || view === 'builder' || view === 'trials';
    if (mode === 'governance') return view === 'governance' || view === 'inspector';
    return view === mode;
  };

  const buttonClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
      active ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <div className="fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
        <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/70 p-1 shadow-2xl backdrop-blur-xl">
          {primaryModes.map((mode) => (
            <button key={mode.id} onClick={() => setView(mode.id)} className={buttonClass(isPrimaryActive(mode.id))}>
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
        {(view === 'studio' || view === 'packs' || view === 'builder' || view === 'trials') && (
          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/70 p-1 shadow-2xl backdrop-blur-xl">
            {studioModes.map((mode) => (
              <button key={mode.id} onClick={() => setView(mode.id)} className={buttonClass(view === mode.id)}>
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>
        )}
        {(view === 'governance' || view === 'inspector') && (
          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/70 p-1 shadow-2xl backdrop-blur-xl">
            {governanceModes.map((mode) => (
              <button key={mode.id} onClick={() => setView(mode.id)} className={buttonClass(view === mode.id)}>
                {mode.icon}
                {mode.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === 'explore' && <App />}
      {view === 'studio' && <CompilerView onSendTaskPacket={openRunnerWithPacket} />}
      {view === 'trials' && <TrialScenarioView onOpenCompiler={() => setView('studio')} />}
      {view === 'packs' && <CapabilityPackDetailView />}
      {view === 'builder' && <PackBuilderView />}
      {view === 'governance' && <RegistryGovernance />}
      {view === 'inspector' && <RegistryInspector />}
      {view === 'runner' && <TaskRunnerMock initialPacket={runnerPacket} />}
      {view === 'labs' && <LabsView />}
    </div>
  );
}
