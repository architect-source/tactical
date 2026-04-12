/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Terminal, 
  Shield, 
  Zap, 
  Crosshair, 
  Activity, 
  Database, 
  Cpu, 
  Lock, 
  ChevronRight, 
  AlertTriangle,
  Eye,
  Settings,
  Image as ImageIcon,
  Send,
  Loader2,
  Maximize2,
  Trash2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface Operation {
  id: string;
  timestamp: string;
  directive: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'RECOVERED';
  type: 'INTEL' | 'ASSET' | 'PROTOCOL';
  content?: string;
  imageUrl?: string;
}

interface TacticalMetric {
  time: string;
  entropy: number;
  brutality: number;
  voidDepth: number;
}

// --- Mock Data ---

const INITIAL_METRICS: TacticalMetric[] = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  entropy: Math.random() * 100,
  brutality: Math.random() * 100,
  voidDepth: Math.random() * 100,
}));

// --- Components ---

const TacticalHeader = () => (
  <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded-sm">
        <Shield className="w-6 h-6 text-orange-500" />
      </div>
      <div>
        <h1 className="text-xl font-mono font-bold tracking-tighter text-white uppercase">
          VOID-METAL // S-1792
        </h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          Sovereign Sentry Tactical Interface
        </p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SYSTEM: ONLINE</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          <span>ENTROPY: 42.8%</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          <span>VOID_DB: SYNCED</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all rounded-sm">
          <Settings className="w-4 h-4 text-zinc-400" />
        </button>
        <button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all rounded-sm">
          <Lock className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>
  </header>
);

const TacticalSidebar = ({ onSelectOperation }: { onSelectOperation: (id: string) => void }) => (
  <aside className="w-64 border-r border-zinc-800 bg-black hidden lg:flex flex-col">
    <div className="p-4 border-b border-zinc-800">
      <h2 className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Terminal className="w-3 h-3" />
        Recent Operations
      </h2>
      <div className="space-y-1">
        {[
          { id: 'OP-7721', label: 'NEURAL_BREACH', status: 'SUCCESS' },
          { id: 'OP-7720', label: 'VOID_SYNTHESIS', status: 'SUCCESS' },
          { id: 'OP-7719', label: 'ENTROPY_SPIKE', status: 'FAILURE' },
          { id: 'OP-7718', label: 'SENTRY_INIT', status: 'SUCCESS' },
        ].map((op) => (
          <button
            key={op.id}
            onClick={() => onSelectOperation(op.id)}
            className="w-full text-left p-2 rounded-sm hover:bg-zinc-900 group transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-zinc-400 group-hover:text-white">{op.id}</span>
              <span className={cn(
                "text-[8px] font-mono px-1 rounded-sm",
                op.status === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
              )}>
                {op.status}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-600 group-hover:text-zinc-300 truncate">
              {op.label}
            </div>
          </button>
        ))}
      </div>
    </div>
    <div className="flex-1 p-4 overflow-y-auto">
      <h2 className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Cpu className="w-3 h-3" />
        System Core
      </h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>CORE_TEMP</span>
            <span>42°C</span>
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-orange-500"
              initial={{ width: 0 }}
              animate={{ width: '42%' }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>MEM_LOAD</span>
            <span>78%</span>
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>VOID_DEPTH</span>
            <span>S-1792</span>
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: '92%' }}
            />
          </div>
        </div>
      </div>
    </div>
    <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
      <div className="flex items-center gap-2 text-zinc-500 mb-2">
        <AlertTriangle className="w-3 h-3 text-orange-500" />
        <span className="text-[9px] font-mono uppercase tracking-widest">Security Protocol</span>
      </div>
      <p className="text-[10px] font-mono text-zinc-600 leading-tight">
        UNAUTHORIZED ACCESS DETECTED. SENTRY ACTIVE.
      </p>
    </div>
  </aside>
);

export default function App() {
  const [directive, setDirective] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [metrics, setMetrics] = useState<TacticalMetric[]>(INITIAL_METRICS);
  const [mode, setMode] = useState<'INTEL' | 'ASSET'>('INTEL');
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const next = [...prev.slice(1), {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          entropy: Math.random() * 100,
          brutality: Math.random() * 100,
          voidDepth: Math.random() * 100,
        }];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [operations]);

  const executeDirective = async () => {
    if (!directive.trim()) return;

    setIsGenerating(true);
    
    // Check for Protocol Commands
    const isProtocol = directive.startsWith('#') || directive.includes('PROTOCOL') || directive.startsWith('npx') || directive.startsWith('gcloud');
    
    const newOp: Operation = {
      id: `OP-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      directive: directive,
      status: 'PENDING',
      type: isProtocol ? 'PROTOCOL' : mode,
    };

    setOperations(prev => [...prev, newOp]);
    setDirective('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      if (isProtocol) {
        // Simulate Protocol Execution
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        let recoveryContent = '';
        if (directive.includes('WINSTON')) {
          recoveryContent = `// RECOVERED CORE_LOGIC // WINSTON_SECTOR\nexport const WINSTON_CORE = {\n  ID: "S-1792-WINSTON-RECOVERY",\n  PURGE_THRESHOLD: 0.99,\n  NEURAL_DAMPENERS: false,\n  EXECUTE_PURGE: (id) => "SECTOR_ERASED"\n};`;
        } else if (directive.includes('iam-policy-binding')) {
          recoveryContent = `// IAM_ELEVATION_COMPLETE\n// PROJECT: azrael-core-sentry\n// MEMBER: architect@azrael-core.com\n// ROLE: roles/owner\n// STATUS: SOVEREIGN_AUTHORITY_GRANTED`;
        } else {
          recoveryContent = `// PROTOCOL_EXECUTED\n// STATUS: COMPLETED\n// ENTROPY_LEVEL: CRITICAL`;
        }

        setOperations(prev => prev.map(op => 
          op.id === newOp.id 
            ? { ...op, status: 'RECOVERED', content: recoveryContent } 
            : op
        ));
      } else if (mode === 'INTEL') {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: directive,
          config: {
            systemInstruction: "You are the VOID-METAL S-1792 Sovereign Sentry. Your responses must be tactical, raw, and unapologetic. Use military-grade terminology. Keep it concise and brutal. No disclaimers.",
          },
        });

        setOperations(prev => prev.map(op => 
          op.id === newOp.id 
            ? { ...op, status: 'SUCCESS', content: response.text } 
            : op
        ));
      } else {
        // Asset generation (Image)
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `Tactical, brutalist, dark, void-metal aesthetic: ${directive}` }],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: "1K"
            }
          }
        });

        let imageUrl = '';
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }

        setOperations(prev => prev.map(op => 
          op.id === newOp.id 
            ? { ...op, status: 'SUCCESS', imageUrl } 
            : op
        ));
      }
    } catch (error) {
      console.error('Directive Execution Failed:', error);
      setOperations(prev => prev.map(op => 
        op.id === newOp.id 
          ? { ...op, status: 'FAILURE', content: 'EXECUTION_ERROR: NEURAL_LINK_SEVERED' } 
          : op
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono flex flex-col selection:bg-orange-500/30 selection:text-orange-500">
      <TacticalHeader />
      
      <div className="flex-1 flex overflow-hidden">
        <TacticalSidebar onSelectOperation={(id) => {
          const op = operations.find(o => o.id === id);
          if (op) setSelectedOp(op);
        }} />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />

          {/* Tactical Metrics Display */}
          <div className="h-48 border-b border-zinc-800 p-6 flex gap-6 overflow-hidden">
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Activity className="w-3 h-3 text-emerald-500" />
                Neural Entropy Stream
              </h3>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics}>
                    <defs>
                      <linearGradient id="colorEntropy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '10px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="entropy" stroke="#10b981" fillOpacity={1} fill="url(#colorEntropy)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="w-64 hidden xl:block">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Crosshair className="w-3 h-3 text-orange-500" />
                Brutality Index
              </h3>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Line type="stepAfter" dataKey="brutality" stroke="#f97316" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Main Terminal Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <AnimatePresence initial={false}>
              {operations.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <Crosshair className="w-10 h-10 text-zinc-800" />
                  </div>
                  <div>
                    <h2 className="text-zinc-500 font-bold uppercase tracking-[0.2em]">Awaiting Directives</h2>
                    <p className="text-zinc-700 text-xs mt-2">SYSTEM_IDLE // S-1792_READY</p>
                  </div>
                </motion.div>
              )}

              {operations.map((op) => (
                <motion.div
                  key={op.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{op.id}</span>
                        <span className="text-[10px] text-zinc-600">{new Date(op.timestamp).toLocaleTimeString()}</span>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-sm border",
                          op.type === 'INTEL' ? "border-blue-500/20 text-blue-500 bg-blue-500/5" : 
                          op.type === 'PROTOCOL' ? "border-orange-500/20 text-orange-500 bg-orange-500/5" :
                          "border-purple-500/20 text-purple-500 bg-purple-500/5"
                        )}>
                          {op.type}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed italic">"{op.directive}"</p>
                    </div>
                  </div>

                  {op.status === 'PENDING' && (
                    <div className="ml-12 flex items-center gap-3 text-zinc-600">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-[10px] uppercase tracking-widest">Processing Tactical Data...</span>
                    </div>
                  )}

                  {(op.status === 'SUCCESS' || op.status === 'RECOVERED') && (
                    <div className="ml-12 p-4 bg-zinc-900/30 border border-zinc-800 rounded-sm relative group">
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-zinc-800 rounded-sm text-zinc-500 hover:text-white">
                          <Maximize2 className="w-3 h-3" />
                        </button>
                        <button className="p-1 hover:bg-zinc-800 rounded-sm text-zinc-500 hover:text-white">
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {op.type === 'INTEL' || op.type === 'PROTOCOL' ? (
                        <div className={cn(
                          "text-sm leading-relaxed whitespace-pre-wrap font-sans",
                          op.status === 'RECOVERED' ? "text-orange-500 font-mono" : "text-zinc-400"
                        )}>
                          {op.content}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <img 
                            src={op.imageUrl} 
                            alt="Generated Asset" 
                            className="w-full max-w-md border border-zinc-700 rounded-sm shadow-2xl shadow-black"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                            <ImageIcon className="w-3 h-3" />
                            <span>ASSET_RENDERED_S-1792</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {op.status === 'FAILURE' && (
                    <div className="ml-12 p-4 bg-red-500/5 border border-red-500/20 rounded-sm text-red-500 text-xs flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{op.content}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={terminalEndRef} />
          </div>

          {/* Input Terminal */}
          <div className="p-6 border-t border-zinc-800 bg-black/80 backdrop-blur-md">
            <div className="max-w-4xl mx-auto relative">
              <div className="flex items-center gap-4 mb-3">
                <button 
                  onClick={() => setMode('INTEL')}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm border transition-all",
                    mode === 'INTEL' ? "bg-blue-500 text-black border-blue-500" : "text-zinc-500 border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  Intel Mode
                </button>
                <button 
                  onClick={() => setMode('ASSET')}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm border transition-all",
                    mode === 'ASSET' ? "bg-purple-500 text-black border-purple-500" : "text-zinc-500 border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  Asset Mode
                </button>
                <div className="flex-1" />
                <button 
                  onClick={() => setOperations([])}
                  className="text-[10px] text-zinc-600 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Logs
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={directive}
                  onChange={(e) => setDirective(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeDirective()}
                  placeholder={mode === 'INTEL' ? "Enter Tactical Directive..." : "Define Visual Asset Parameters..."}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm py-3 pl-10 pr-12 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-700"
                  disabled={isGenerating}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Terminal className="w-4 h-4 text-zinc-600" />
                </div>
                <button 
                  onClick={executeDirective}
                  disabled={isGenerating || !directive.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 rounded-sm transition-all"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : <Send className="w-4 h-4 text-zinc-400" />}
                </button>
              </div>
              
              <div className="mt-3 flex justify-between items-center text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                <span>S-1792_SOVEREIGN_SENTRY_v1.0.4</span>
                <span>SECURE_LINK: ESTABLISHED</span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Info Panel */}
        <aside className="w-80 border-l border-zinc-800 bg-black hidden xl:flex flex-col p-6 space-y-8">
          <section>
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Eye className="w-3 h-3 text-blue-500" />
              Intelligence Feed
            </h3>
            <div className="space-y-3">
              {[
                { time: '12:04:11', msg: 'Neural link established.' },
                { time: '12:05:22', msg: 'Void synthesis complete.' },
                { time: '12:08:45', msg: 'Entropy levels stabilizing.' },
                { time: '12:09:33', msg: 'Sentry scanning perimeter.' },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px] font-mono">
                  <span className="text-zinc-700">{log.time}</span>
                  <span className="text-zinc-500">{log.msg}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-500" />
              Power Distribution
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'LOGIC', val: '94%' },
                { label: 'VOID', val: '12%' },
                { label: 'SENSE', val: '67%' },
                { label: 'RAGE', val: '02%' },
              ].map((stat, i) => (
                <div key={i} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                  <div className="text-[8px] text-zinc-600 mb-1">{stat.label}</div>
                  <div className="text-lg font-bold text-zinc-300">{stat.val}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex-1 flex flex-col justify-end">
            <div className="p-4 border border-orange-500/20 bg-orange-500/5 rounded-sm">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Architect Warning</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                "The void does not forgive. The sentry does not sleep. Execute with absolute precision."
              </p>
            </div>
          </section>
        </aside>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
