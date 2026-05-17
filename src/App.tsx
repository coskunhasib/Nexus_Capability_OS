import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, ChevronDown, Search, Maximize2, Minimize2, 
  Moon, Sun, Map as MapIcon, Layers, Network, Boxes, Info,
  PanelRightClose, PanelRight, ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { treeData, TreeNode } from './data';
import { CapabilityRuntimePanel } from './CapabilityRuntimePanel';

function getAllIds(node: TreeNode): string[] {
  let ids = [node.id];
  if (node.children) {
    node.children.forEach(ch => {
      ids = ids.concat(getAllIds(ch));
    });
  }
  return ids;
}

function getDepth(node: TreeNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getDepth));
}

function hasTerm(node: TreeNode, term: string): boolean {
  if (!term) return false;
  const t = term.toLowerCase();
  const text = `${node.title} ${node.type || ''} ${node.mini || ''} ${node.desc || ''} ${(node.tags || []).join(' ')}`.toLowerCase();
  if (text.includes(t)) return true;
  if (node.children) {
    return node.children.some(ch => hasTerm(ch, t));
  }
  return false;
}

const NodeCard = ({ 
  node, 
  expanded, 
  selected, 
  matched,
  isRoot,
  onSelect,
  onToggle
}: { 
  node: TreeNode, 
  expanded: boolean, 
  selected: boolean,
  matched: boolean,
  isRoot: boolean,
  onSelect: () => void,
  onToggle: (e: React.MouseEvent) => void
}) => {
  const hasChildren = !!(node.children && node.children.length > 0);
  
  let bgClass = 'bg-[#0e0e0e] hover:border-white/10';
  let borderClass = 'border-white/5';
  let iconBg = 'bg-neutral-800 text-neutral-500';
  let titleColor = 'text-neutral-400 group-hover:text-white';
  let miniColor = 'text-neutral-600';

  if (selected || matched) {
    bgClass = 'bg-cyan-950/20 shadow-2xl shadow-cyan-950/20';
    borderClass = 'border-cyan-500/30';
    iconBg = 'bg-cyan-500/20 text-cyan-400';
    titleColor = 'text-white';
    miniColor = 'text-cyan-400/70';
  }

  return (
    <motion.div 
      layout="position"
      onClick={onSelect}
      className={`
        w-full relative flex items-center gap-4 p-5 
        border rounded-xl cursor-pointer transition-all duration-200 group
        ${bgClass} ${borderClass}
        ${isRoot ? 'max-w-[560px]' : ''}
      `}
    >
      <button 
        onClick={onToggle}
        className={`
          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center 
          transition-colors ${iconBg}
        `}
      >
        {hasChildren ? (
          <ChevronDown size={20} className={`transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`} />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="text-[10px] tracking-wider uppercase text-neutral-500 mb-1 font-bold">
          {node.type || 'Node'}
        </div>
        <div className={`font-medium tracking-tight ${titleColor} ${isRoot ? 'text-lg' : 'text-base'}`}>
          {node.title}
        </div>
        {node.mini && (
          <div className={`text-xs mt-1 ${miniColor}`}>
            {node.mini}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-semibold border border-white/5 bg-black/40 text-neutral-500">
        {hasChildren ? `${node.children!.length} DAL` : 'LEAF'}
      </div>
    </motion.div>
  );
};

const OrgBranch = ({ 
  node, 
  term, 
  state, 
  actions, 
  isRoot = false,
  level = 0
}: { 
  node: TreeNode, 
  term: string, 
  state: { expanded: Set<string>, selectedId: string }, 
  actions: { select: (id: string) => void, toggle: (id: string, expand?: boolean) => void },
  isRoot?: boolean,
  level?: number
}) => {
  const hasChildren = !!(node.children && node.children.length > 0);
  const expanded = state.expanded.has(node.id);
  const selected = state.selectedId === node.id;
  
  const matchesSelf = useMemo(() => {
    if (!term) return false;
    const searchStr = `${node.title} ${node.type || ''} ${node.mini || ''} ${node.desc || ''} ${(node.tags || []).join(' ')}`.toLowerCase();
    return searchStr.includes(term);
  }, [node, term]);

  const matchesTree = useMemo(() => hasTerm(node, term), [node, term]);

  // If there's a search term, and this node doesn't match itself, nor does any child match, hide it completely.
  if (term && !matchesSelf && !matchesTree) {
    return null;
  }

  return (
    <div className={`relative flex flex-col mb-2 ${level >= 2 ? 'items-start w-full' : 'items-center'}`}>
      <div className={`w-[320px] flex ${level >= 2 ? 'justify-start' : 'justify-center'} z-10`} style={isRoot ? { width: '100%', maxWidth: '600px' } : {}}>
        <NodeCard 
          node={node} 
          expanded={expanded} 
          selected={selected} 
          matched={matchesSelf}
          isRoot={isRoot}
          onSelect={() => {
            actions.select(node.id);
            if (hasChildren) {
              actions.toggle(node.id, !expanded);
            }
          }}
          onToggle={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasChildren) {
              actions.toggle(node.id);
            }
          }}
        />
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, scaleY: 0.8 }}
            animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
            exit={{ opacity: 0, height: 0, scaleY: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`origin-top ${level === 0 ? 'w-max mx-auto' : 'w-full'}`}
          >
            {level >= 1 ? (
              <div className="flex flex-col items-start justify-start w-full relative pt-2">
                {/* Vertical tree line dropping from near the left side of parent */}
                <div className="absolute left-[32px] top-0 bottom-[50px] w-[2px] bg-white/20" />
                {node.children!.map((ch) => (
                  <div key={ch.id} className="relative w-full flex flex-col items-start py-2 pl-[56px] pr-4">
                    {/* Horizontal branch line */}
                    <div className="absolute left-[32px] top-[40px] w-[24px] h-[2px] bg-white/20" />
                    <OrgBranch node={ch} term={term} state={state} actions={actions} level={level + 1} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-start w-max">
                <div className="org-line-down" />
                <div className="org-children-row">
                  {node.children!.map((ch) => (
                    <div key={ch.id} className="org-child-slot">
                      {/* Pass level + 1 down the tree */}
                      <OrgBranch node={ch} term={term} state={state} actions={actions} level={level + 1} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [selectedId, setSelectedId] = useState<string>('root');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root', 'compiler', 'macro-families', 'profile-families', 'core-layers', 'universal-flow']));
  const [searchTerm, setSearchTerm] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Build maps for quick access
  const { nodeMap, parentMap } = useMemo(() => {
    const nMap: Record<string, TreeNode> = {};
    const pMap: Record<string, string> = {};
    const traverse = (n: TreeNode, parentId?: string) => {
      nMap[n.id] = n;
      if (parentId) pMap[n.id] = parentId;
      n.children?.forEach(ch => traverse(ch, n.id));
    };
    traverse(treeData);
    return { nodeMap: nMap, parentMap: pMap };
  }, []);

  const openPath = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      let curr: string | undefined = parentMap[id];
      while (curr) {
        next.add(curr);
        curr = parentMap[curr];
      }
      return next;
    });
  };

  const actions = {
    select: (id: string) => {
      setSelectedId(id);
      openPath(id);
    },
    toggle: (id: string, forceExpand?: boolean) => {
      setExpanded(prev => {
        const next = new Set(prev);
        if (forceExpand === true) {
          next.add(id);
        } else if (forceExpand === false) {
          next.delete(id);
        } else {
          if (next.has(id)) next.delete(id);
          else next.add(id);
        }
        return next;
      });
    }
  };

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      Object.keys(nodeMap).forEach(id => {
        if (hasTerm(nodeMap[id], term)) {
          openPath(id);
        }
      });
    }
  }, [searchTerm, nodeMap]);

  const handleExpandAll = () => setExpanded(new Set(Object.keys(nodeMap)));
  const handleCollapseAll = () => {
    setExpanded(new Set(['root']));
    setSelectedId('root');
  };

  const selectedNode = nodeMap[selectedId] || treeData;

  const breadcrumbs = useMemo(() => {
    const chain: TreeNode[] = [];
    let curr: string | undefined = selectedNode.id;
    while (curr) {
      chain.unshift(nodeMap[curr]);
      curr = parentMap[curr];
    }
    return chain;
  }, [selectedNode, nodeMap, parentMap]);

  return (
    <div className={`min-h-screen font-sans bg-[#050505] text-neutral-200 selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-300 flex flex-col`}>
      <div className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 text-black">
              <Network size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Nexus Capability OS</h1>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Sistem Aktif</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72 lg:flex-none">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search capabilities, tags..."
                className="w-full pl-10 pr-4 py-2 bg-[#0e0e0e] border border-white/5 rounded-md text-sm text-neutral-300 focus:border-cyan-500/50 outline-none transition-all placeholder:text-neutral-500"
              />
            </div>
            <button
              onClick={handleExpandAll}
              className="px-4 py-2 border border-white/10 text-white text-xs font-bold rounded-md hover:bg-white/5 transition flex items-center gap-2"
            >
              <Maximize2 size={16} /> <span className="hidden sm:inline">Tümünü Aç</span>
            </button>
            <button
              onClick={handleCollapseAll}
              className="px-4 py-2 border border-white/10 text-white text-xs font-bold rounded-md hover:bg-white/5 transition flex items-center gap-2"
            >
              <Minimize2 size={16} /> <span className="hidden sm:inline">Kapat</span>
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 bg-[#0e0e0e] border border-white/10 rounded-md text-neutral-400 hover:text-white transition"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 bg-[#0e0e0e] border border-white/10 rounded-md transition ${isSidebarOpen ? 'text-cyan-400 border-cyan-500/30' : 'text-neutral-400 hover:text-white'}`}
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <PanelRightClose size={18} /> : <PanelRight size={18} />}
            </button>
          </div>
        </header>

        {/* Main Layout Area */}
        <div className="flex-1 relative flex overflow-hidden min-h-0 bg-[#0a0a0a] border border-white/5 rounded-xl shadow-2xl">
          
          {/* Chart Area */}
          <main className="flex-1 relative w-full h-full overflow-hidden">
            
            {/* Overlay Map Indicators */}
            <div className="absolute top-4 left-4 z-10 hidden sm:flex flex-col gap-3 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-2 rounded-md border border-white/5">
                <MapIcon size={16} className="text-cyan-400" /> 
                <span className="text-sm font-semibold text-white">Organizational Map</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border border-white/5 bg-black/50 backdrop-blur-md text-neutral-400">Root</span>
                <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border border-white/5 bg-black/50 backdrop-blur-md text-neutral-400">Macro</span>
                <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border border-white/5 bg-black/50 backdrop-blur-md text-neutral-400">Micro</span>
                <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border border-white/5 bg-black/50 backdrop-blur-md text-neutral-400">Profile</span>
                <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border border-white/5 bg-black/50 backdrop-blur-md text-neutral-400">Layer</span>
              </div>
            </div>

            <TransformWrapper
              initialScale={1}
              minScale={0.1}
              maxScale={3}
              centerOnInit={true}
              wheel={{ step: 0.05, smoothStep: 0.005 }}
              pinch={{ step: 1 }}
              doubleClick={{ disabled: true }}
              limitToBounds={false}
              panning={{ velocityDisabled: true }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* Zoom Controls */}
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/5">
                    <button onClick={() => zoomIn()} className="p-2 hover:bg-white/10 rounded-md text-neutral-300 transition" aria-label="Zoom In">
                      <ZoomIn size={18} />
                    </button>
                    <button onClick={() => zoomOut()} className="p-2 hover:bg-white/10 rounded-md text-neutral-300 transition" aria-label="Zoom Out">
                      <ZoomOut size={18} />
                    </button>
                    <button onClick={() => resetTransform()} className="p-2 hover:bg-white/10 rounded-md text-neutral-300 transition" aria-label="Reset View">
                      <Maximize size={18} />
                    </button>
                  </div>

                  <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "80px" }}>
                    <div id="org-tree-root" className="w-max min-w-full flex justify-center pb-32 px-10">
                      <OrgBranch 
                        node={treeData} 
                        term={searchTerm.trim().toLowerCase()} 
                        state={{ expanded, selectedId }} 
                        actions={actions}
                        isRoot={true}
                      />
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </main>

          {/* Sidebar / Inspector (Absolute Overlay or Side Panel) */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.aside 
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-full max-w-[400px] bg-[#050505]/95 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto z-20 shadow-2xl flex flex-col"
              >
                <div className="flex justify-between items-center mb-5">
                  {/* Breadcrumbs */}
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-neutral-500 overflow-hidden">
                    {breadcrumbs.map((bc, idx) => (
                      <div key={bc.id} className="flex items-center gap-1.5 whitespace-nowrap">
                        {idx > 0 && <ChevronRight size={10} className="opacity-50" />}
                        <button 
                          onClick={() => actions.select(bc.id)}
                          className="hover:text-cyan-400 transition-colors truncate max-w-[80px]"
                        >
                          {bc.title}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-md text-neutral-400 transition"
                  >
                    <PanelRightClose size={16} />
                  </button>
                </div>

                <div className="text-[10px] uppercase tracking-widest font-bold text-cyan-500 mb-2">
                  {selectedNode.type}
                </div>
                <h2 className="text-2xl font-light text-white mb-3">
                  {selectedNode.title}
                </h2>
                <p className="text-[14px] leading-relaxed text-neutral-400 mb-6">
                  {selectedNode.desc || selectedNode.mini}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#0e0e0e] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2 font-bold">Direct Children</div>
                    <div className="text-3xl font-light text-white">
                      {(selectedNode.children || []).length}
                    </div>
                  </div>
                  <div className="bg-[#0e0e0e] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2 font-bold">Subtree Depth</div>
                    <div className="text-3xl font-light text-white">
                      {getDepth(selectedNode) - 1}
                    </div>
                  </div>
                </div>

                {/* Key Points */}
                {(selectedNode.bullets && selectedNode.bullets.length > 0) && (
                  <div className="mb-8">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-4 px-2 flex items-center gap-2">
                      <Layers size={14} className="text-cyan-500/70" /> Key Details
                    </p>
                    <div className="space-y-1">
                      {selectedNode.bullets.map((b, i) => (
                        <div key={i} className="flex items-start space-x-3 bg-white/5 text-neutral-300 px-3 py-2.5 rounded-md">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span className="text-sm leading-relaxed">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {(selectedNode.tags && selectedNode.tags.length > 0) && (
                  <div className="mb-8">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-4 px-2 flex items-center gap-2">
                      <Boxes size={14} className="text-cyan-500/70" /> Taxonomy Tags
                    </p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {selectedNode.tags.map(t => (
                        <div key={t} className="px-3 py-1.5 text-xs text-neutral-400 bg-[#0e0e0e] rounded-md border border-white/5">
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gates */}
                {(selectedNode.gates && selectedNode.gates.length > 0) && (
                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-4 px-2 flex items-center gap-2">
                      <Info size={14} className="text-emerald-500/70" /> Quality Gates
                    </p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {selectedNode.gates.map(g => (
                        <div key={g} className="px-3 py-1.5 text-xs text-emerald-500/80 bg-emerald-950/20 rounded-md border border-emerald-500/20">
                          → {g}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <CapabilityRuntimePanel />
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}