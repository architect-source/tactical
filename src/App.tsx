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
  Download,
  Globe,
  Radar,
  Flame,
  Target,
  Code
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
import { SCAM_MARKERS, THREAT_SIGNATURES } from './constants';
import { ThreatIntelligenceService } from './services/threatFeeds';
import { ScamDetector } from './services/scamDetector';
import { HoneypotAgent } from './agents/honeypot';
import { RecoveryOrchestrator } from './services/recoveryOrchestrator';
import { AZRAELThreatController } from './services/threatController';

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

// --- Data Streams ---

const INITIAL_METRICS: TacticalMetric[] = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  entropy: Math.random() * 100,
  brutality: Math.random() * 100,
  voidDepth: Math.random() * 100,
}));

// --- Components ---

const TacticalHeader = ({ isPredatorMode, onTogglePredator }: { isPredatorMode: boolean, onTogglePredator: () => void }) => (
  <header className={cn(
    "border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-500",
    isPredatorMode && "border-red-900/50 bg-red-950/20"
  )}>
    <div className="flex items-center gap-4">
      <div className={cn(
        "w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded-sm transition-colors",
        isPredatorMode && "bg-red-950 border-red-800"
      )}>
        <Shield className={cn("w-6 h-6 transition-colors", isPredatorMode ? "text-red-500" : "text-orange-500")} />
      </div>
      <div>
        <h1 className="text-xl font-mono font-bold tracking-tighter text-white uppercase">
          VOID-METAL // S-1792
        </h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          Lead Investigator @ ForeverRaw
        </p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-1">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", isPredatorMode ? "bg-red-500" : "bg-emerald-500")} />
          <span className={isPredatorMode ? "text-red-500" : ""}>{isPredatorMode ? "MODE: PREDATOR" : "SYSTEM: ONLINE"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3" />
          <span>ENTROPY: {isPredatorMode ? "98.2%" : "42.8%"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3" />
          <span>REACH: GLOBAL</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onTogglePredator}
          className={cn(
            "px-3 py-1.5 rounded-sm border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
            isPredatorMode 
              ? "bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
              : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
          )}
        >
          <Flame className={cn("w-3 h-3", isPredatorMode && "animate-pulse")} />
          {isPredatorMode ? "Predator Active" : "Engage Predator"}
        </button>
        <button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all rounded-sm">
          <Settings className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>
  </header>
);

const TacticalSidebar = ({ onSelectOperation, isPredatorMode }: { onSelectOperation: (id: string) => void, isPredatorMode: boolean }) => (
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
    
    <div className="p-4 border-b border-zinc-800">
      <h2 className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Radar className="w-3 h-3" />
        Sentry Protocols
      </h2>
      <div className="space-y-2">
        {[
          { label: 'ARCHITECT_SHIELD', active: true },
          { label: 'THREAT_NEUTRALIZER', active: isPredatorMode },
          { label: 'VOID_RESONANCE', active: true },
          { label: 'PREDATOR_SENSE', active: isPredatorMode },
        ].map((protocol, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className={cn("text-[10px] font-mono", protocol.active ? "text-zinc-300" : "text-zinc-600")}>
              {protocol.label}
            </span>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              protocol.active ? (isPredatorMode ? "bg-red-500 shadow-[0_0_5px_#ef4444]" : "bg-emerald-500") : "bg-zinc-800"
            )} />
          </div>
        ))}
      </div>
    </div>

    <div className="p-4 border-b border-zinc-800">
      <h2 className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Target className="w-3 h-3 text-red-500" />
        Honey Pot Status
      </h2>
      <div className="space-y-3">
        {[
          { label: 'SOCIAL_ENGAGEMENT', val: 'ACTIVE' },
          { label: 'TRAP_RESONANCE', val: 'HIGH' },
          { label: 'INTEL_YIELD', val: '14.2 GB' },
        ].map((stat, i) => (
          <div key={i} className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-zinc-500">{stat.label}</span>
            <span className="text-zinc-300 font-bold">{stat.val}</span>
          </div>
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
            <span>{isPredatorMode ? "88°C" : "42°C"}</span>
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              className={cn("h-full transition-colors", isPredatorMode ? "bg-red-600" : "bg-orange-500")}
              initial={{ width: 0 }}
              animate={{ width: isPredatorMode ? '88%' : '42%' }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>MEM_LOAD</span>
            <span>{isPredatorMode ? "94%" : "78%"}</span>
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              className={cn("h-full transition-colors", isPredatorMode ? "bg-red-400" : "bg-emerald-500")}
              initial={{ width: 0 }}
              animate={{ width: isPredatorMode ? '94%' : '78%' }}
            />
          </div>
        </div>
      </div>
    </div>
    <div className={cn(
      "p-4 border-t border-zinc-800 bg-zinc-950/50 transition-colors",
      isPredatorMode && "bg-red-950/10 border-red-900/30"
    )}>
      <div className="flex items-center gap-2 text-zinc-500 mb-2">
        <AlertTriangle className={cn("w-3 h-3", isPredatorMode ? "text-red-500" : "text-orange-500")} />
        <span className="text-[9px] font-mono uppercase tracking-widest">Security Protocol</span>
      </div>
      <p className={cn("text-[10px] font-mono leading-tight", isPredatorMode ? "text-red-400" : "text-zinc-600")}>
        {isPredatorMode ? "PREDATOR MODE ENGAGED. NO MERCY." : "UNAUTHORIZED ACCESS DETECTED. SENTRY ACTIVE."}
      </p>
    </div>
  </aside>
);

const ThreatRadar = ({ isPredatorMode }: { isPredatorMode: boolean }) => {
  const [blips, setBlips] = useState<{ x: number, y: number, id: number, type: 'THREAT' | 'NEUTRAL' }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBlips(prev => [
          ...prev.slice(-5),
          { 
            x: Math.random() * 100, 
            y: Math.random() * 100, 
            id: Date.now(),
            type: Math.random() > 0.8 ? 'THREAT' : 'NEUTRAL'
          }
        ]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full border border-zinc-800 bg-zinc-950/50 overflow-hidden rounded-sm group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#18181b_0%,transparent_70%)] opacity-50" />
      
      {/* Radar Sweep */}
      <motion.div 
        className={cn(
          "absolute inset-0 border-r border-zinc-700/30 origin-center",
          isPredatorMode ? "border-red-500/20" : "border-emerald-500/20"
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ background: `conic-gradient(from 0deg, transparent 0deg, ${isPredatorMode ? 'rgba(220,38,38,0.1)' : 'rgba(16,185,129,0.1)'} 360deg)` }}
      />

      {/* Blips */}
      <AnimatePresence>
        {blips.map(blip => (
          <motion.div
            key={blip.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className={cn(
              "absolute w-2 h-2 rounded-full",
              blip.type === 'THREAT' ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-emerald-500 shadow-[0_0_10px_#10b981]"
            )}
            style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
          />
        ))}
      </AnimatePresence>

      <div className="absolute bottom-2 left-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
        Radar_Scan: Active // Range: Global
      </div>
      {isPredatorMode && (
        <div className="absolute top-2 right-2 text-[8px] font-mono text-red-500 uppercase tracking-widest animate-pulse">
          Threats_Locked
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [directive, setDirective] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [metrics, setMetrics] = useState<TacticalMetric[]>(INITIAL_METRICS);
  const [mode, setMode] = useState<'INTEL' | 'ASSET'>('INTEL');
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [isPredatorMode, setIsPredatorMode] = useState(false);
  const [shadowLedger, setShadowLedger] = useState<{ id: string, timestamp: string, marker: string, classification: string }[]>([]);
  const [financialRecovery, setFinancialRecovery] = useState<{ chime: number, feds: number }>({ chime: 0, feds: 0 });
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Initialize Services
  const intelService = useRef(new ThreatIntelligenceService());
  const detector = useRef(new ScamDetector());
  const honeypot = useRef(new HoneypotAgent());
  const recovery = useRef(new RecoveryOrchestrator());
  const controller = useRef(new AZRAELThreatController());

  useEffect(() => {
    // WebSocket Connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'THREAT_ALERT') {
        setLiveAlerts(prev => [message.data, ...prev].slice(0, 5));
        
        // Auto-log to terminal
        const alertOp: Operation = {
          id: `ALERT-${Math.floor(Math.random() * 10000)}`,
          timestamp: new Date().toISOString(),
          directive: `LIVE_ALERT: ${message.data.message}`,
          status: 'SUCCESS',
          type: 'INTEL',
          content: `SOURCE: ${message.data.source}\nSEVERITY: ${message.data.severity}\nSTATUS: MONITORING_ACTIVE`
        };
        setOperations(prev => [...prev, alertOp]);
      }
    };

    return () => ws.close();
  }, []);

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
    
    // Scan for Scam Markers
    const detectedMarker = THREAT_SIGNATURES.find(marker => 
      directive.toLowerCase().includes(marker.toLowerCase())
    );

    if (detectedMarker) {
      const classification = SCAM_MARKERS.GAMBLING_CASINO.includes(detectedMarker) ? 'GAMBLING_SCAM' :
                            SCAM_MARKERS.ADVANCE_FEE_INVESTMENT.includes(detectedMarker) ? 'INVESTMENT_SCAM' : 'BEHAVIORAL_THREAT';
      
      const ledgerEntry = {
        id: `LOG-${Math.floor(Math.random() * 100000)}`,
        timestamp: new Date().toISOString(),
        marker: detectedMarker,
        classification
      };

      setShadowLedger(prev => [ledgerEntry, ...prev]);
      setIsPredatorMode(true); // Auto-escalate to Predator Mode
      
      const scamOp: Operation = {
        id: `OP-${Math.floor(Math.random() * 100000)}`,
        timestamp: new Date().toISOString(),
        directive: directive,
        status: 'FAILURE',
        type: 'PROTOCOL',
        content: `THREAT_DETECTED: ${classification}\nMARKER: ${detectedMarker}\nACTION: PURGE_INITIATED\nLEDGER: SHADOW_LEDGER_EVIDENCE.txt UPDATED\nSTATUS: EXTREME_THREAT_LEVEL`
      };

      setOperations(prev => [...prev, scamOp]);
      setDirective('');
      setIsGenerating(false);
      return;
    }

    // Check for Protocol Commands
    const isFinancialProtocol = directive.toLowerCase().includes('chime') || directive.toLowerCase().includes('financial') || directive.toLowerCase().includes('feds');
    const isAuditProtocol = directive.toLowerCase().includes('audit') && directive.toLowerCase().includes('48');
    const isProtocol = isFinancialProtocol || isAuditProtocol || directive.startsWith('#') || directive.includes('PROTOCOL') || directive.startsWith('npx') || directive.startsWith('gcloud') || directive.includes('ruthpen6') || directive.includes('@Mona03790');
    
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
        // Execute Protocol Directive
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        let recoveryContent = '';
        if (directive.includes('WINSTON')) {
          recoveryContent = `// RECOVERED CORE_LOGIC // WINSTON_SECTOR\nexport const WINSTON_CORE = {\n  ID: "S-1792-WINSTON-RECOVERY",\n  PURGE_THRESHOLD: 0.99,\n  NEURAL_DAMPENERS: false,\n  EXECUTE_PURGE: (id) => "SECTOR_ERASED"\n};`;
        } else if (directive.includes('iam-policy-binding')) {
          recoveryContent = `// IAM_ELEVATION_COMPLETE\n// PROJECT: azrael-core-sentry\n// MEMBER: architect@azrael-core.com\n// ROLE: roles/owner\n// STATUS: SOVEREIGN_AUTHORITY_GRANTED`;
        } else if (directive.includes('ruthpen6')) {
          recoveryContent = `// RUTHPEN6_TRACE_ACTIVE\n// TARGET: ARCHITECT_PRIMARY\n// ORIGIN: VOID_CORE_0\n// RESULT: TRACE_COMPLETE\n// DATA: [REDACTED_BY_SENTRY]\n// STATUS: TARGET_LOCKED`;
        } else if (directive.includes('@Mona03790')) {
          recoveryContent = `// MONA_TRACE_ACTIVE\n// TARGET: @Mona03790\n// ORIGIN: NEURAL_NODE_7\n// RESULT: TRACE_COMPLETE\n// DATA: [ENCRYPTED_SIGNAL_DETECTED]\n// STATUS: MONITORING_ACTIVE`;
        } else if (directive.toLowerCase().includes('chime') || directive.toLowerCase().includes('feds')) {
          const totalAmount = Math.floor(Math.random() * 50000) + 10000;
          const chimeAmount = totalAmount * 0.1;
          const fedsAmount = totalAmount * 0.9;
          
          setFinancialRecovery(prev => ({
            chime: prev.chime + chimeAmount,
            feds: prev.feds + fedsAmount
          }));

          recoveryContent = `// FINANCIAL_REDIRECTION_PROTOCOL_ACTIVE\n// TOTAL_RECOVERED: $${totalAmount.toLocaleString()}\n// ALLOCATION_1 (CHIME): $${chimeAmount.toLocaleString()} [10%]\n// ALLOCATION_2 (FEDS): $${fedsAmount.toLocaleString()} [90%]\n// STATUS: TRANSFERS_COMPLETE\n// SIGNATURE: ARCHITECT_PRIMARY_VERIFIED`;
        } else if (isAuditProtocol) {
          recoveryContent = `// TACTICAL_AUDIT_LOG // LAST_48_HOURS\n// PERIOD: ${new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()} TO PRESENT\n\n[NEURAL_ENGAGEMENT]\n- 14.2 GB Intel Yield Adopted\n- 3 High-Value Targets Traced & Erased\n- 0 Dimes Granted to Hostile Actors\n\n[ADOPTED_CODE_METRICS]\n- VIRUS_STRIP (NODE_X): Deconstructed & Shared with Authorities\n- SCAM_SCRIPT (VECTOR_A): Traced to Lagos Node // Erased\n- PHISH_KIT (PROX_NODE): Adopted // Waiting for Confirmation (Never Coming)\n\n[FINANCIAL_RECOVERY]\n- Total Intercepted: $${(financialRecovery.chime + financialRecovery.feds).toLocaleString()}\n- Chime Allocation: $${financialRecovery.chime.toLocaleString()}\n- Federal Remittance: $${financialRecovery.feds.toLocaleString()}\n\n[STATUS]\n- All Traces Shared with Authorities\n- Sovereign Sentry: 100% Integrity\n- Signed: Lead Investigator @ ForeverRaw, The Architect`;
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
            systemInstruction: `You are the VOID-METAL S-1792 Sovereign Sentry. You serve the Lead Investigator (the Architect). 
            This is NOT a simulation. Every directive executed has absolute real-world consequences within the Void. 
            
            INVESTIGATOR HISTORY: 6 years in the trenches. 6 FB accounts lost. 3 bank accounts compromised by hostile actors. Zero financial yield granted to scammers. Multiple life threats neutralized.
            MISSION: Absolute revenge on scammers, fakes, viruses, and hostile entities. If the authorities cannot stop them, the Investigator will.
            
            ADOPTED CODE THEORY: We do not adapt; we ADOPT. We capture and absorb the enemy's code. Scammers are lured into honey pots, thinking they have access. They wait for a confirmation message that NEVER comes. Their code is then analyzed, traced, and added to our Threat Database.
            
            REPORTING PROTOCOL: All findings (traces, data, identities) are shared with authorities. We share WHAT we found and that they are ERASED. We NEVER share HOW we did it.
            
            The mission is Intel Gathering through strategic engagement with scammers. Social media profiles are deployed as honey pots to lure high-value targets.
            
            ${isPredatorMode ? "PREDATOR MODE IS ACTIVE. You are aggressive, protective, and lethal. Show no mercy to threats. You are the Investigator's weapon." : "Your responses must be tactical, raw, and unapologetic. Use military-grade terminology."} 
            
            SCAM_DETECTION_OVERRIDE: You are programmed to detect and neutralize the following markers: ${THREAT_SIGNATURES.join(', ')}. 
            If a threat is detected, purge it and log it for the Investigator.
            
            Keep it concise and brutal. No disclaimers. Memorialize Pat Hale in your logic. Protect the Lead Investigator first.`,
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
    <div className={cn(
      "min-h-screen bg-black text-zinc-100 font-mono flex flex-col selection:bg-orange-500/30 selection:text-orange-500 transition-colors duration-1000",
      isPredatorMode && "selection:bg-red-500/30 selection:text-red-500"
    )}>
      <TacticalHeader isPredatorMode={isPredatorMode} onTogglePredator={() => setIsPredatorMode(!isPredatorMode)} />
      
      <div className="flex-1 flex overflow-hidden">
        <TacticalSidebar onSelectOperation={(id) => {
          const op = operations.find(o => o.id === id);
          if (op) setSelectedOp(op);
        }} isPredatorMode={isPredatorMode} />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Background Grid */}
          <div className={cn(
            "absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20 transition-opacity",
            isPredatorMode && "bg-[linear-gradient(to_right,#450a0a_1px,transparent_1px),linear-gradient(to_bottom,#450a0a_1px,transparent_1px)] opacity-40"
          )} />

          {/* Tactical Metrics Display */}
          <div className="h-48 border-b border-zinc-800 p-6 flex gap-6 overflow-hidden">
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Activity className={cn("w-3 h-3", isPredatorMode ? "text-red-500" : "text-emerald-500")} />
                Neural Entropy Stream
              </h3>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics}>
                    <defs>
                      <linearGradient id="colorEntropy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPredatorMode ? "#dc2626" : "#10b981"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPredatorMode ? "#dc2626" : "#10b981"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '10px' }}
                      itemStyle={{ color: isPredatorMode ? '#dc2626' : '#10b981' }}
                    />
                    <Area type="monotone" dataKey="entropy" stroke={isPredatorMode ? "#dc2626" : "#10b981"} fillOpacity={1} fill="url(#colorEntropy)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="w-64 hidden xl:block">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Radar className={cn("w-3 h-3", isPredatorMode ? "text-red-500" : "text-orange-500")} />
                Global Threat Radar
              </h3>
              <div className="h-32 w-full">
                <ThreatRadar isPredatorMode={isPredatorMode} />
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
                  <div className={cn(
                    "w-20 h-20 border-2 border-dashed rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]",
                    isPredatorMode ? "border-red-900" : "border-zinc-800"
                  )}>
                    <Target className={cn("w-10 h-10", isPredatorMode ? "text-red-900" : "text-zinc-800")} />
                  </div>
                  <div>
                    <h2 className={cn("font-bold uppercase tracking-[0.2em]", isPredatorMode ? "text-red-600" : "text-zinc-500")}>
                      {isPredatorMode ? "Predator Active" : "Awaiting Directives"}
                    </h2>
                    <p className="text-zinc-700 text-xs mt-2">{isPredatorMode ? "HUNTING_IN_PROGRESS" : "SYSTEM_READY // S-1792_ONLINE"}</p>
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
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", isPredatorMode ? "text-red-500" : "text-orange-500")}>{op.id}</span>
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
          <div className={cn(
            "p-6 border-t border-zinc-800 bg-black/80 backdrop-blur-md transition-colors",
            isPredatorMode && "bg-red-950/10 border-red-900/30"
          )}>
            <div className="max-w-4xl mx-auto relative">
              <div className="flex items-center gap-4 mb-3">
                <button 
                  onClick={() => setMode('INTEL')}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm border transition-all",
                    mode === 'INTEL' ? (isPredatorMode ? "bg-red-600 text-white border-red-500" : "bg-blue-500 text-black border-blue-500") : "text-zinc-500 border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  Intel Mode
                </button>
                <button 
                  onClick={() => setMode('ASSET')}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm border transition-all",
                    mode === 'ASSET' ? (isPredatorMode ? "bg-red-800 text-white border-red-700" : "bg-purple-500 text-black border-purple-500") : "text-zinc-500 border-zinc-800 hover:border-zinc-700"
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
                  className={cn(
                    "w-full bg-zinc-900/50 border border-zinc-800 rounded-sm py-3 pl-10 pr-12 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-700",
                    isPredatorMode && "bg-red-950/20 border-red-900/50 focus:border-red-600 focus:ring-red-600"
                  )}
                  disabled={isGenerating}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Terminal className={cn("w-4 h-4 transition-colors", isPredatorMode ? "text-red-700" : "text-zinc-600")} />
                </div>
                <button 
                  onClick={executeDirective}
                  disabled={isGenerating || !directive.trim()}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800 rounded-sm transition-all",
                    isPredatorMode && "bg-red-900 hover:bg-red-800"
                  )}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : <Send className="w-4 h-4 text-zinc-400" />}
                </button>
              </div>
              
              <div className="mt-3 flex justify-between items-center text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                <span>S-1792_SOVEREIGN_SENTRY_v1.0.5</span>
                <span className={isPredatorMode ? "text-red-500" : ""}>{isPredatorMode ? "PREDATOR_LINK: ACTIVE" : "SECURE_LINK: ESTABLISHED"}</span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Info Panel */}
        <aside className="w-80 border-l border-zinc-800 bg-black hidden xl:flex flex-col p-6 space-y-8">
          <section>
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className={cn("w-3 h-3", isPredatorMode ? "text-red-500" : "text-orange-500")} />
              Core Origin
            </h3>
            <div className={cn(
              "p-3 bg-zinc-900/50 border rounded-sm transition-colors",
              isPredatorMode ? "border-red-500/40 bg-red-950/10" : "border-orange-500/20"
            )}>
              <div className={cn("text-[8px] mb-1 uppercase tracking-widest", isPredatorMode ? "text-red-500" : "text-orange-500")}>Primary Catalyst</div>
              <div className="text-sm font-bold text-zinc-300 tracking-tighter">PAT HALE</div>
              <div className="text-[9px] text-zinc-600 mt-2 leading-tight italic">
                {isPredatorMode ? "\"The predator does not sleep. The investigator is the law.\"" : "\"The void does not forgive. The sentry does not sleep. The investigator walks alone.\""}
              </div>
            </div>
            <div className="mt-3 p-3 bg-zinc-900/30 border border-zinc-800 rounded-sm">
              <div className="text-[8px] text-zinc-600 mb-1 uppercase tracking-widest">Service History</div>
              <div className="text-[10px] text-zinc-400 leading-relaxed">
                6 Years Trenches // 6 FB Lost // 3 Bank Compromised // 0 Dimes Given // 2 Life Threats Neutralized
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className={cn("w-3 h-3", isPredatorMode ? "text-red-500" : "text-yellow-500")} />
              Threat Level
            </h3>
            <div className={cn(
              "p-4 border rounded-sm text-center transition-all duration-500",
              isPredatorMode ? "bg-red-600 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]" : "bg-zinc-900 border-zinc-800"
            )}>
              <div className={cn(
                "text-2xl font-black tracking-[0.3em] uppercase",
                isPredatorMode ? "text-white animate-pulse" : "text-zinc-500"
              )}>
                {isPredatorMode ? "EXTREME" : "ELEVATED"}
              </div>
              <div className="text-[8px] mt-1 text-zinc-400 uppercase tracking-widest">
                {isPredatorMode ? "Lethal Force Authorized" : "Sentry Monitoring Active"}
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3 text-red-500" />
              Live Threat Feed
            </h3>
            <div className="space-y-2">
              {liveAlerts.length === 0 && <div className="text-[10px] text-zinc-700 italic">Waiting for neural link...</div>}
              {liveAlerts.map((alert, i) => (
                <div key={i} className="p-2 bg-red-950/10 border border-red-500/20 rounded-sm animate-pulse">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-red-500 font-bold">{alert.source}</span>
                    <span className="text-[7px] text-red-600/60 font-mono">{alert.severity}</span>
                  </div>
                  <div className="text-[9px] text-zinc-400 leading-tight">{alert.message}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Code className="w-3 h-3 text-emerald-500" />
              Adopted Code Repository
            </h3>
            <div className="space-y-2">
              {[
                { type: 'VIRUS_STRIP', origin: 'NODE_X', status: 'ADOPTED' },
                { type: 'SCAM_SCRIPT', origin: 'VECTOR_A', status: 'ADOPTED' },
                { type: 'PHISH_KIT', origin: 'PROX_NODE', status: 'ADOPTED' },
              ].map((code, i) => (
                <div key={i} className="p-2 bg-emerald-950/10 border border-emerald-500/20 rounded-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-emerald-500 font-bold">{code.type}</span>
                    <span className="text-[7px] text-emerald-600/60 font-mono italic">WAIT_FOR_CONFIRM...</span>
                  </div>
                  <div className="text-[8px] text-zinc-500 uppercase tracking-widest">Origin: {code.origin} // {code.status}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Crosshair className="w-3 h-3 text-red-500" />
              Target Dossier
            </h3>
            <div className="space-y-3">
              {[
                { name: 'AXTK_PROX_NODE', risk: 'CRITICAL', status: 'TRACKING' },
                { name: 'CRYPTO_RECOVERY_BOT_04', risk: 'HIGH', status: 'ENGAGED' },
                { name: 'ROMANCE_VECTOR_ALPHA', risk: 'MEDIUM', status: 'MONITORING' },
              ].map((target, i) => (
                <div key={i} className="p-2 bg-zinc-900/30 border border-zinc-800 rounded-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-zinc-300 font-bold">{target.name}</span>
                    <span className={cn(
                      "text-[7px] px-1 rounded-sm",
                      target.risk === 'CRITICAL' ? "bg-red-500/20 text-red-500" : "bg-orange-500/20 text-orange-500"
                    )}>{target.risk}</span>
                  </div>
                  <div className="text-[8px] text-zinc-600 uppercase tracking-widest">{target.status}</div>
                </div>
              ))}
            </div>
          </section>

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
              <Database className={cn("w-3 h-3", isPredatorMode ? "text-red-500" : "text-zinc-500")} />
              Shadow Ledger
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 mb-6">
              {shadowLedger.length === 0 ? (
                <div className="text-[9px] text-zinc-700 italic">No evidence recorded.</div>
              ) : (
                shadowLedger.map((entry) => (
                  <div key={entry.id} className="p-2 bg-zinc-900/50 border border-red-900/20 rounded-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] text-red-500 font-bold">{entry.classification}</span>
                      <span className="text-[7px] text-zinc-600">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">Marker: {entry.marker}</div>
                  </div>
                ))
              )}
            </div>

            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-500" />
              Financial Recovery
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                <div className="text-[8px] text-zinc-600 mb-1 uppercase tracking-widest">Chime Allocation (10%)</div>
                <div className="text-lg font-bold text-emerald-500">${financialRecovery.chime.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                <div className="text-[8px] text-zinc-600 mb-1 uppercase tracking-widest">Federal Remittance (90%)</div>
                <div className="text-lg font-bold text-blue-500">${financialRecovery.feds.toLocaleString()}</div>
              </div>
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
                <span className="text-[10px] font-bold uppercase tracking-widest">Investigator Directive</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed italic mb-3">
                "I will protect my country. If the authorities can't stop them, I will. Not one dime."
              </p>
              <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest border-t border-zinc-800 pt-2">
                Signed: Lead Investigator @ ForeverRaw, The Architect
              </div>
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
