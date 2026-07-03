import React, { useState } from "react";
import { X, Search, Volume2, Video, MessageSquare } from "lucide-react";
import { Employee } from "../types";

interface LiveMonitoringProps {
  employeesList: Employee[];
  onClose: () => void;
}

export default function LiveMonitoring({ employeesList, onClose }: LiveMonitoringProps) {
  const [selectedMonitoringAgent, setSelectedMonitoringAgent] = useState<any>(null);
  const [isAgentControlModalOpen, setIsAgentControlModalOpen] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("2026");
  
  // Real-time tracking state
  const [session, setSession] = useState<{
    intervention: "None" | "Whisper" | "Barge" | "Takeover";
    isRecording: boolean;
    duration: number;
    connected: boolean;
  } | null>(null);

  React.useEffect(() => {
    if (session && session.connected) {
      const timer = setInterval(() => setSession(prev => prev ? {...prev, duration: prev.duration + 1} : null), 1000);
      return () => clearInterval(timer);
    }
  }, [session]);

  const startSession = (emp: any) => {
    setSelectedMonitoringAgent(emp);
    setIsAgentControlModalOpen(true);
    setSession({ intervention: "None", isRecording: false, duration: 0, connected: true });
  };

  const endSession = () => {
    setSession(null);
    setIsAgentControlModalOpen(false);
  };

  const filteredAgents = employeesList.filter((e) =>
    e.name.toLowerCase().includes(agentSearchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-850 rounded-2xl flex flex-col h-[500px] w-full">
      <div className="bg-slate-50/80 dark:bg-slate-900/40 px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-slate-500 hover:text-rose-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <span className="flex items-center gap-2 font-display font-medium text-black dark:text-white text-[12px]">
              <Volume2 className="w-5 h-5 text-rose-500" /> Live CentriX Agent Terminal Monitoring
            </span>
            <span className="text-[11px] text-black mt-1 block">Supervisory mode active. Select an agent to listen or intervene.</span>
          </div>
        </div>
        {session?.connected && (
           <span className="text-[11px] bg-rose-100 text-rose-800 px-3 py-1 rounded-full font-bold animate-pulse shadow-sm border border-rose-200">
             Monitoring: {selectedMonitoringAgent?.name} ({Math.floor(session.duration/60)}:{String(session.duration%60).padStart(2,'0')})
           </span>
        )}
      </div>
      <div className="flex-1 flex flex-col p-5 overflow-hidden">
        <div className="grid grid-cols-3 gap-3 mb-5">
           <div className="relative">
             <Search className="w-4 h-4 text-black absolute left-3 top-2.5" />
             <input
               type="text"
               placeholder="Search..."
               value={agentSearchTerm}
               onChange={(e) => setAgentSearchTerm(e.target.value)}
               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-[12px] outline-none"
             />
           </div>
           <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-lg px-3 py-2 text-[12px] outline-none" />
           <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-lg px-3 py-2 text-[12px] outline-none">
             <option value="2026">2026</option>
             <option value="2025">2025</option>
           </select>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredAgents.map((emp) => (
            <div
              key={emp.id}
              className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all ${
                session?.connected && selectedMonitoringAgent?.id === emp.id 
                  ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-300 shadow-sm" 
                  : "bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm"
              }`}
              onClick={() => startSession(emp)}
            >
              <div>
                <div className="font-display font-medium text-[12px] text-black dark:text-white">{emp.name}</div>
                <div className="text-[11px] text-black mt-0.5">{emp.role}</div>
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md border ${
                session?.connected && selectedMonitoringAgent?.id === emp.id 
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200 animate-pulse" 
                  : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50"
              }`}>
                {session?.connected && selectedMonitoringAgent?.id === emp.id ? "Connected" : "Online"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isAgentControlModalOpen && selectedMonitoringAgent && session && (
        <div className="fixed inset-0 z-[70] bg-black/5 flex items-start justify-center p-4">
          <div className="bg-white dark:bg-slate-850 w-full max-w-lg rounded-2xl border border-slate-200/50 dark:border-slate-750 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                 <h3 className="font-display font-medium text-[12px] text-black dark:text-white">Active Session Intercept</h3>
                 <span className="text-[12px] text-black mt-1 block">Agent target: {selectedMonitoringAgent.name}</span>
              </div>
              <button title="Disconnect" onClick={endSession} className="text-black hover:text-black p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                 <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button onClick={() => setSession(s => s ? {...s, intervention: "Whisper"} : null)} className={`text-[12px] py-2.5 rounded-xl font-bold transition-all border ${session.intervention === "Whisper" ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm" : "bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-amber-50"}`}>
                    Whisper
                  </button>
                  <button onClick={() => setSession(s => s ? {...s, intervention: "Barge"} : null)} className={`text-[12px] py-2.5 rounded-xl font-bold transition-all border ${session.intervention === "Barge" ? "bg-orange-100 text-orange-800 border-orange-300 shadow-sm" : "bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-orange-50"}`}>
                    Barge
                  </button>
                  <button onClick={() => setSession(s => s ? {...s, intervention: "Takeover"} : null)} className={`text-[12px] py-2.5 rounded-xl font-bold transition-all border ${session.intervention === "Takeover" ? "bg-rose-100 text-rose-800 border-rose-300 shadow-sm" : "bg-white dark:bg-slate-800 text-black dark:text-white border-slate-200 dark:border-slate-700 hover:bg-rose-50"}`}>
                    Takeover
                  </button>
                  <button onClick={() => setSession(s => s ? {...s, isRecording: !s.isRecording} : null)} className={`text-[12px] py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 border ${session.isRecording ? "bg-red-600 text-white border-red-700 shadow-sm animate-pulse" : "bg-white dark:bg-slate-800 text-rose-600 border-rose-200 dark:border-rose-900/50 hover:bg-red-50"}`}>
                    <span className={`w-2 h-2 rounded-full ${session.isRecording ? 'bg-white' : 'bg-rose-600'}`}></span>
                    {session.isRecording ? "Recording" : "Record"}
                  </button>
                </div>

                {/* Simulated Feeds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="aspect-video bg-slate-900 rounded-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 animate-pulse">
                            <Video className="w-8 h-8" />
                         </div>
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                         Live Desk View
                      </div>
                      <div className="absolute bottom-3 right-3 text-[9px] text-white/40 font-mono">CAM_04_DESK</div>
                   </div>
                   <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-2xl flex flex-col overflow-hidden border dark:border-slate-800">
                      <div className="p-3 border-b dark:border-slate-800 bg-white/50 dark:bg-slate-855 text-[10px] font-black uppercase tracking-widest text-slate-500 flex justify-between items-center">
                        Active Lead Chat
                        <MessageSquare className="w-3 h-3" />
                      </div>
                      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                         <div className="space-y-1">
                            <div className="text-[9px] font-black text-blue-600 uppercase">Lead</div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 font-medium">Hello, I'm interested in the home loan product mentioned in the campaign.</div>
                         </div>
                         <div className="space-y-1 text-right">
                            <div className="text-[9px] font-black text-emerald-600 uppercase">Agent</div>
                            <div className="bg-blue-600 text-white p-2 rounded-xl text-[11px] font-medium inline-block">Excellent! I can certainly help you with that. Are you looking for a new purchase or refinancing?</div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[11px] font-bold uppercase tracking-wide text-black dark:text-white block">Supervisor Notes</label>
                   <textarea placeholder="Write live coaching notes during intercept..." className="w-full bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-[12px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" rows={4} />
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Agent Performance</h4>
                  <div className="space-y-3">
                    {[
                      { l: "Tone Quality", v: "88%" },
                      { l: "Compliance", v: "100%" },
                      { l: "UX Delivery", v: "Guest" }
                    ].map((s, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{s.l}</span>
                        <span className="text-[11px] font-black text-slate-900 dark:text-white">{s.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 mb-2">Live Sentiment</h4>
                  <div className="text-2xl font-black text-emerald-600">POSITIVE</div>
                  <p className="text-[10px] text-emerald-600/70 font-bold mt-1 uppercase">Lead shows high intent to convert.</p>
                </div>

                <button className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[12px] py-4 rounded-2xl font-black tracking-widest uppercase transition-all shadow-lg active:scale-95" onClick={endSession}>
                  Disconnect & Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
