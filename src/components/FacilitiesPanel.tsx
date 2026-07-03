import React, { useState, useEffect } from "react";
import { 
  Wrench, ShieldCheck, Thermometer, Zap, Droplets, 
  Clock, MapPin, AlertCircle, Plus, CheckCircle, 
  Trash2, Mail, ExternalLink, Activity, Info, 
  Calendar, Hammer, Wind, Lock, PenTool, X, Sparkles,
  ChevronDown
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FacilitiesLog, HealthSafetyCheck } from "../types";

interface FacilitiesPanelProps {
  facilitiesLogs: FacilitiesLog[];
  onUpdateFacilityTask: (id: string, newStatus: string) => void;
}

export default function FacilitiesPanel({
  facilitiesLogs,
  onUpdateFacilityTask
}: FacilitiesPanelProps) {
  const [activeTab, setActiveTab] = useState<"maintenance" | "hvac" | "security" | "assets">("maintenance");
  
  // Custom interactive tickets states
  const [selectedTask, setSelectedTask] = useState<FacilitiesLog | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskUrgency, setTaskUrgency] = useState<Record<string, "Standard" | "Emergency" | "Critical">>({});
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});
  const [assignedStaff, setAssignedStaff] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };
  
  // New State for Facilities
  const [hvacSettings, setHvacSettings] = useState({
      "Server Room A": { temp: 18.5, humidity: 42 },
      "Executive Floor": { temp: 22.2, humidity: 45 },
      "Main Sales Floor": { temp: 21.0, humidity: 48 }
  });
  const [hsChecks, setHsChecks] = useState<HealthSafetyCheck[]>([
      { id: "1", description: "Daily egress path inspection", status: "Pending" },
      { id: "2", description: "Fire extinguisher pressure audit", status: "Completed" },
      { id: "3", description: "Emergency lighting testing", status: "Pending" },
      { id: "4", description: "Hazardous waste clearance", status: "Completed" }
  ]);
  const [newCheckDesc, setNewCheckDesc] = useState("");
  const [accessLogs, setAccessLogs] = useState([
    { id: 1, desc: "Server vault door secured", time: "2 mins ago" },
    { id: 2, desc: "Main entrance bio-override", time: "14 mins ago" },
    { id: 3, desc: "Loading bay sensors active", time: "1 hour ago" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
        setAccessLogs(prev => {
            const newLog = { id: Date.now(), desc: ["Ventilation alarm active", "Access granted: Roof", "Login attempt: Admin"][Math.floor(Math.random()*3)], time: "Just now" };
            return [newLog, ...prev.slice(0, 2)];
        });
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const stats = {
    total: facilitiesLogs.length,
    pending: facilitiesLogs.filter(l => l.status === "Pending").length,
    completed: facilitiesLogs.filter(l => l.status === "Completed").length,
    highUrgency: facilitiesLogs.filter(l => l.status === "Pending").length // Simulating high urgency
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Asset Maintenance Load", value: stats.total, icon: Wrench, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Work Orders", value: stats.pending, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Resolved Schedules", value: stats.completed, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Regulatory Compliance", value: "100%", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} dark:bg-slate-900 border dark:border-slate-800 p-4 rounded-3xl shadow-sm`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{stat.label}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block leading-none">{stat.value}</span>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content (Left 8/12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
             <div className="flex border-b dark:border-slate-800 p-2 gap-1 uppercase text-[10px] font-black tracking-widest">
                {[
                  { id: "maintenance" as const, label: "Work Orders", icon: Wrench },
                  { id: "hvac" as const, label: "HVAC & Climate", icon: Wind },
                  { id: "security" as const, label: "Physical Security", icon: Lock },
                  { id: "assets" as const, label: "Hardware Assets", icon: PenTool }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition ${
                      activeTab === tab.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
             </div>

             <div className="p-6">
                {activeTab === "maintenance" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-3 px-5 rounded-2xl">
                       <span className="text-xs font-black uppercase tracking-tight">Active Maintenance Lifecycle Log</span>
                       <button className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition">
                         <Plus className="w-3.5 h-3.5" /> Log Issue
                       </button>
                    </div>

                    {feedback && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center justify-between mb-4">
                        <span>{feedback}</span>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}

                    <div className="space-y-3">
                      {facilitiesLogs.map(log => {
                        const currentUrgency = taskUrgency[log.id] || "Standard";
                        return (
                          <div 
                            key={log.id} 
                            onClick={() => {
                              setSelectedTask(log);
                              setShowTaskModal(true);
                            }}
                            className="p-5 border dark:border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-blue-500 transition shadow-xs bg-white dark:bg-slate-900 cursor-pointer"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                log.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                              }`}>
                                {log.task.toLowerCase().includes("hvac") ? <Wind className="w-6 h-6" /> : <Hammer className="w-6 h-6" />}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-blue-600 font-mono tracking-widest">{log.id}</span>
                                  <h4 className="font-black text-slate-900 dark:text-white text-sm">{log.area}</h4>
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                                    currentUrgency === "Critical" ? "bg-rose-100 text-rose-700 font-black animate-pulse" :
                                    currentUrgency === "Emergency" ? "bg-amber-105 text-amber-800 font-bold" : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {currentUrgency}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-bold">{log.task}</p>
                                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Scheduled: {log.scheduledDate}</span>
                                  <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Assigned: {assignedStaff[log.id] || log.assignedTo}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={log.status}
                                onChange={(e) => {
                                  onUpdateFacilityTask(log.id, e.target.value);
                                  triggerFeedback(`Task ${log.id} updated to status: ${e.target.value}`);
                                }}
                                className={`p-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition cursor-pointer border-none shadow-sm focus:ring-0 ${
                                  log.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                <option value="Pending">🚧 In-Progress</option>
                                <option value="Completed">✅ Fixed</option>
                              </select>
                              <button 
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  triggerFeedback(`Disaster/Incident report logged for deletion: ${log.id}`);
                                }}
                                className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "hvac" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {(Object.entries(hvacSettings) as [string, {temp: number, humidity: number}][]).map(([room, settings], i) => (
                       <div key={i} className="p-6 bg-slate-50 dark:bg-slate-850 rounded-3xl border dark:border-slate-800 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">{room}</h4>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                               <span className="text-[10px] font-black text-slate-500 uppercase">Temp (°C)</span>
                               <input 
                                  type="number" 
                                  value={settings.temp}
                                  onChange={(e) => setHvacSettings({...hvacSettings, [room]: {...settings, temp: parseFloat(e.target.value)}})}
                                  className="text-xl font-black block w-full p-1 rounded" 
                               />
                             </div>
                             <div className="space-y-1">
                               <span className="text-[10px] font-black text-slate-500 uppercase">Humid (%)</span>
                               <input 
                                  type="number" 
                                  value={settings.humidity}
                                  onChange={(e) => setHvacSettings({...hvacSettings, [room]: {...settings, humidity: parseInt(e.target.value)}})}
                                  className="text-xl font-black block w-full p-1 rounded" 
                               />
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                       <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Facility Security Perimeter</h3>
                       <p className="text-slate-400 text-sm max-w-sm">Monitoring biometric access points, CCTV trunk lines, and emergency egress protocols.</p>
                       <Lock className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-5 border dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 space-y-4">
                          <h4 className="font-black text-xs uppercase flex items-center gap-2">
                             <Activity className="w-4 h-4 text-blue-500" />
                             Access Point Feed
                          </h4>
                          <div className="space-y-3">
                             {[
                               { desc: "Server vault door secured", time: "2 mins ago" },
                               { desc: "Main entrance bio-override", time: "14 mins ago" },
                               { desc: "Loading bay sensors active", time: "1 hour ago" }
                             ].map((log, i) => (
                               <div key={i} className="flex justify-between items-center text-[11px] font-bold">
                                 <span className="text-slate-600 dark:text-slate-400">● {log.desc}</span>
                                 <span className="text-slate-400 font-mono">{log.time}</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="p-5 border dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 space-y-4">
                          <h4 className="font-black text-xs uppercase flex items-center gap-2">
                             <AlertCircle className="w-4 h-4 text-amber-500" />
                             Health & Safety Checks
                          </h4>
                          <div className="space-y-2">
                             <div className="flex gap-2">
                                <input className="text-xs p-1 rounded grow border dark:border-slate-800" value={newCheckDesc} onChange={(e) => setNewCheckDesc(e.target.value)} placeholder="New check..." />
                                <button onClick={() => {
                                    if(!newCheckDesc) return;
                                    setHsChecks([...hsChecks, { id: Date.now().toString(), description: newCheckDesc, status: "Pending" }]);
                                    setNewCheckDesc("");
                                }} className="p-1 px-2 bg-blue-600 rounded text-white"><Plus className="w-4 h-4"/></button>
                             </div>
                             {hsChecks.map((check) => (
                               <div key={check.id} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                 <button onClick={() => setHsChecks(hsChecks.map(c => c.id === check.id ? {...c, status: c.status === "Pending" ? "Completed" : "Pending"} : c))} className="w-4 h-4 rounded bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                   <CheckCircle className={`w-3 h-3 ${check.status === "Completed" ? "text-emerald-500" : "text-slate-300"}`} />
                                 </button>
                                 <span className={check.status === "Completed" ? "line-through text-slate-400" : ""}>{check.description}</span>
                                 <button onClick={() => setHsChecks(hsChecks.filter(c => c.id !== check.id))} className="ml-auto text-rose-500"><Trash2 className="w-3 h-3" /></button>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Info Sidebar (Right 4/12) */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <h4 className="font-black text-sm uppercase tracking-tight flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Infrastructure Insights
              </h4>

              <div className="space-y-6">
                 <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{name: 'Mon', val: 70}, {name: 'Tue', val: 75}, {name: 'Wed', val: 80}, {name: 'Thu', val: 92}, {name: 'Fri', val: 88}]}>
                        <Area type="monotone" dataKey="val" stroke="#2563eb" fill="#dbeafe" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase text-slate-500">Resource Efficiency</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">92%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                       <div className="bg-blue-600 h-full w-[92%]"></div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <span className="text-[10px] uppercase font-black text-slate-500 block">Energy Consumption Hub</span>
                    <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3">
                       <div className="flex justify-between items-center">
                         <Zap className="w-5 h-5 text-amber-400" />
                         <span className="text-xl font-black">1.24 <span className="text-[10px] text-slate-500">MWh</span></span>
                       </div>
                       <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">Total platform electricity usage across active workstations & server racks.</p>
                    </div>
                 </div>

                 <div className="pt-4 border-t dark:border-slate-800">
                    <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      View Regulatory Reports
                    </button>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h4 className="font-black text-sm uppercase tracking-tight text-emerald-900 dark:text-emerald-100">Health & Safety</h4>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                CentriX Facilities adhere strictly to international OHASA standards, maintaining disaster recovery readiness and climate stabilization protocols. (Certified Compliance)
              </p>
            </div>
         </div>
       </div>

       {/* Interactive Facilities Task Ticket Modal */}
       {showTaskModal && selectedTask && (() => {
         const log = selectedTask;
         const currentNotes = taskNotes[log.id] || "";
         const currentUrgency = taskUrgency[log.id] || "Standard";
         const currentAssigned = assignedStaff[log.id] || log.assignedTo;

         return (
           <div id="facilitiesTaskModal" className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col hover:border-transparent">
               
               {/* Modal Header */}
               <div className="p-6 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-855 flex items-center justify-between text-left">
                 <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-blue-105 dark:bg-blue-950 text-blue-600 rounded-xl">
                     <Wrench className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="flex items-center gap-1.5">
                       <span className="text-[10px] font-mono font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded uppercase">{log.id}</span>
                       <span className="text-xs text-slate-400 font-bold">Facilities Desk Ticket</span>
                     </div>
                     <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">{log.area}</h3>
                   </div>
                 </div>
                 <button 
                   type="button"
                   onClick={() => { setShowTaskModal(false); setSelectedTask(null); }}
                   className="p-1.5 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               {/* Modal Body */}
               <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] text-left">
                 
                 {/* Ticket Status Summary */}
                 <div className="p-4 bg-slate-50 dark:bg-slate-855 rounded-2xl flex flex-wrap gap-4 justify-between items-center text-xs text-slate-700 dark:text-slate-300">
                   <div>
                     <span className="text-slate-400 font-bold block uppercase text-[10px]">Current Task Action</span>
                     <span className="font-semibold text-slate-900 dark:text-white">{log.task}</span>
                   </div>
                   <div>
                     <span className="text-slate-400 font-bold block uppercase text-[10px]">Scheduled Target</span>
                     <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {log.scheduledDate}</span>
                   </div>
                 </div>

                 {/* Interactive Form Controls */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   
                   {/* Urgency Trigger */}
                   <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase text-slate-500 block">Urgency Escalation Tier</label>
                     <div className="grid grid-cols-3 gap-1">
                       {(["Standard", "Emergency", "Critical"] as const).map(tier => (
                         <button
                           key={tier}
                           type="button"
                           onClick={() => {
                             setTaskUrgency(prev => ({ ...prev, [log.id]: tier }));
                             triggerFeedback(`Escalated urgency target for ${log.id} to ${tier}`);
                           }}
                           className={`p-1.5 py-2 text-[10px] font-bold uppercase rounded-lg border text-center transition cursor-pointer ${
                             currentUrgency === tier
                               ? tier === "Critical" ? "bg-rose-600 text-white border-rose-600 shadow-sm" :
                                 tier === "Emergency" ? "bg-amber-500 text-white border-amber-500 shadow-sm" :
                                 "bg-blue-600 text-white border-blue-600 shadow-sm"
                               : "bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-705 dark:text-slate-300 dark:border-slate-800"
                           }`}
                         >
                           {tier}
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Dispatch Personnel */}
                   <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase text-slate-400 block">Reassign Technician</label>
                     <select
                       value={currentAssigned}
                       onChange={(e) => {
                         setAssignedStaff(prev => ({ ...prev, [log.id]: e.target.value }));
                         triggerFeedback(`Reassigned maintenance task ${log.id} to ${e.target.value}`);
                       }}
                       className="w-full text-xs p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white"
                     >
                       <option value="Marcus Aurelius">Marcus Aurelius (L1 Systems Engineer)</option>
                       <option value="Amos Burton">Amos Burton (On-Call HVAC Tech)</option>
                       <option value="Lucius Fox">Lucius Fox (Building Safety Inspector)</option>
                       <option value="Hiram McDaniels">Hiram McDaniels (Contract Operator)</option>
                     </select>
                   </div>

                 </div>

                 {/* Custom Comments and Logs */}
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-400 block">Add Diagnostic Notes / Action Log</label>
                   <textarea
                     rows={3}
                     value={currentNotes}
                     onChange={(e) => setTaskNotes(prev => ({ ...prev, [log.id]: e.target.value }))}
                     placeholder="Enter details on diagnostic outputs, replaced hardware modules, lock inspections, refrigerant refills..."
                     className="w-full text-xs p-3 border dark:border-slate-800 dark:bg-slate-850 rounded-2xl text-slate-900 dark:text-white font-mono"
                   />
                 </div>

                 {/* Interactive Action Commands Section */}
                 <div className="space-y-2 pt-2 border-t dark:border-slate-800">
                   <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider font-sans">Fast Action Commands (Interactive)</span>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                     <button
                       type="button"
                       onClick={() => {
                         onUpdateFacilityTask(log.id, "Completed");
                         triggerFeedback(`Success: Marked Work Order ${log.id} fully Fixed & Resolved!`);
                         setShowTaskModal(false);
                       }}
                       className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                     >
                       <CheckCircle className="w-3.5 h-3.5" /> Resolve and Close Ticket
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         triggerFeedback(`Dispatched automated SMS & Radio Alert to Amos Burton with building access tokens.`);
                       }}
                       className="p-2.5 bg-slate-905 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                     >
                       <Zap className="w-3.5 h-3.5 text-amber-400" /> Dispatch Radio Page Alert
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         triggerFeedback(`Generated invoice PO-04212 for replacement parts ($240.00). Approved under Facilities contingency credit line.`);
                       }}
                       className="p-2.5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-205 hover:bg-slate-50 dark:hover:bg-slate-850 text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                     >
                       <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Buy Replacement Parts ($)
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         triggerFeedback(`Incident Logged: Lockout tagout tags verified. Compliance certificate loaded.`);
                       }}
                       className="p-2.5 border border-slate-200 dark:border-slate-805 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                     >
                       <Lock className="w-3.5 h-3.5 text-rose-500" /> Log Compliance Safety Tag
                     </button>
                   </div>
                 </div>

               </div>

             </div>
           </div>
         );
       })()}
    </div>
  );
}
