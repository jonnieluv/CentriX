import React, { useState } from "react";
import { 
  Phone, UserCheck, Package, Clock, Shield, Search, 
  Plus, MoreHorizontal, PhoneForwarded, PhoneOff, 
  MapPin, Calendar, CheckCircle, AlertTriangle, 
  Users, MessageSquare, ExternalLink, Printer, Trash2,
  Scale, CreditCard, Cpu, GraduationCap, UserPlus, Wrench
} from "lucide-react";
import { SwitchboardCall, VisitorLog, PackageLog } from "../types";

interface ReceptionPanelProps {
  switchboardQueue: SwitchboardCall[];
  visitorLogs: VisitorLog[];
  packageLogs: PackageLog[];
  onSwitchboardRedirect: (callId: string, targetDept: string) => void;
  onAddVisitor: (visitor: { name: string; company: string }) => void;
  onUpdateVisitor: (id: string, visitor: Partial<VisitorLog>) => void;
  onDeleteVisitor: (id: string) => void;
  onAddPackage: (pkg: { recipient: string; description: string }) => void;
  onUpdatePackage: (id: string, pkg: Partial<PackageLog>) => void;
  onDeletePackage: (id: string) => void;
}

export default function ReceptionPanel({
  switchboardQueue,
  visitorLogs,
  packageLogs,
  onSwitchboardRedirect,
  onAddVisitor,
  onUpdateVisitor,
  onDeleteVisitor,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage
}: ReceptionPanelProps) {
  const [activeTab, setActiveTab] = useState<"switchboard" | "visitors" | "courier" | "intercom">("switchboard");
  
  // Forms state
  const [newVisitorName, setNewVisitorName] = useState("");
  const [newVisitorCompany, setNewVisitorCompany] = useState("");
  const [newPkgRecipient, setNewPkgRecipient] = useState("");
  const [newPkgDesc, setNewPkgDesc] = useState("");
  const [intercomConnection, setIntercomConnection] = useState(false);

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitorName) return;
    onAddVisitor({ name: newVisitorName, company: newVisitorCompany });
    setNewVisitorName("");
    setNewVisitorCompany("");
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgRecipient) return;
    onAddPackage({ recipient: newPkgRecipient, description: newPkgDesc });
    setNewPkgRecipient("");
    setNewPkgDesc("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Controls */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Phone className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Front Desk Operations</h3>
            <p className="text-slate-400 text-sm mt-1">Managing trunk rings, guest access, and courier registry feeds.</p>
          </div>
        </div>

        <div className="flex gap-2 relative z-10">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${intercomConnection ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
             <span className="text-[10px] font-black uppercase tracking-widest">{intercomConnection ? "SIP STATUS: ACTIVE" : "SIP STATUS: DISCONNECTED"}</span>
          </div>
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition"><Printer className="w-5 h-5" /></button>
        </div>

        <Shield className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar (Left 3/12) */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: "switchboard" as const, label: "Switchboard Queue", icon: Phone, count: switchboardQueue.length },
            { id: "visitors" as const, label: "Guest Registry", icon: UserCheck, count: visitorLogs.length },
            { id: "courier" as const, label: "Package Ledger", icon: Package, count: packageLogs.length },
            { id: "intercom" as const, label: "Staff Intercom", icon: MessageSquare, count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                  : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
              {tab.count > 0 && <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id ? "bg-white text-slate-900" : "bg-blue-50 text-blue-600"}`}>{tab.count}</span>}
            </button>
          ))}

          <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-3xl space-y-4">
             <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest block">Reception SLA</span>
             <div className="space-y-1">
               <div className="flex justify-between text-xs font-black text-blue-900 dark:text-blue-100">
                 <span>Call Response</span>
                 <span>{"<"} 4s</span>
               </div>
               <div className="w-full bg-blue-200 dark:bg-blue-800 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-blue-600 h-full w-[94%]"></div>
               </div>
             </div>
          </div>
        </div>

        {/* Main Workspace (Right 9/12) */}
        <div className="lg:col-span-9 space-y-6">
           {activeTab === "switchboard" && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {switchboardQueue.length === 0 ? (
                 <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 border-2 border-dashed dark:border-slate-800 rounded-3xl space-y-4">
                   <PhoneOff className="w-12 h-12 text-slate-200 mx-auto" />
                   <p className="text-slate-400 font-bold text-sm">SIP Central Line is clear. No incoming trunk rings.</p>
                 </div>
               ) : (
                 switchboardQueue.map(call => (
                   <div key={call.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-5 hover:shadow-lg transition space-y-4">
                    <div key={call.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-5 hover:shadow-lg transition space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center animate-pulse">
                          <Phone className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 font-mono tracking-tighter">{call.id}</span>
                      </div>
                      
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">{call.caller}</h4>
                        <span className="text-xs font-bold text-slate-500 block mt-1">{call.source}</span>
                      </div>

                      <div className="pt-4 border-t dark:border-slate-800 grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => onSwitchboardRedirect(call.id, "Sales")}
                          className="flex items-center justify-center gap-1.5 p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition"
                        >
                          <PhoneForwarded className="w-3.5 h-3.5" /> Sales
                        </button>
                        <button 
                          onClick={() => onSwitchboardRedirect(call.id, "Debt Review")}
                          className="flex items-center justify-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition"
                        >
                           Debt
                        </button>
                      </div>
                   </div>
                   </div>
                 ))
               )}
             </div>
           )}

           {activeTab === "visitors" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                   <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl overflow-hidden">
                      <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b dark:border-slate-800 flex justify-between items-center">
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-900 dark:text-white">Active Guest Registry</h4>
                        <Calendar className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black uppercase text-slate-500">
                             <tr>
                               <th className="p-4">Guest Name</th>
                               <th className="p-4">Organization</th>
                               <th className="p-4">In Time</th>
                               <th className="p-4 text-right">Scope</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-slate-800">
                             {visitorLogs.map(vis => (
                               <tr key={vis.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                                 <td className="p-4 font-bold text-slate-900 dark:text-white text-sm">
                                    <input value={vis.name} onChange={(e) => onUpdateVisitor(vis.id, { name: e.target.value })} className="bg-transparent w-full" />
                                 </td>
                                 <td className="p-4 text-xs text-slate-500">
                                    <input value={vis.company} onChange={(e) => onUpdateVisitor(vis.id, { company: e.target.value })} className="bg-transparent w-full" />
                                 </td>
                                 <td className="p-4 text-xs font-mono text-emerald-600">{vis.signInTime}</td>
                                 <td className="p-4 text-right flex items-center justify-end">
                                   <button onClick={() => onDeleteVisitor(vis.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-rose-500">
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-4">
                   <form onSubmit={handleVisitorSubmit} className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
                      <div className="mb-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase">Guest Check-in</h4>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Register on-site visitor access</p>
                      </div>

                      <div className="space-y-3">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-1">Visitor Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Full Name"
                              value={newVisitorName}
                              onChange={(e) => setNewVisitorName(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border-none rounded-xl text-xs font-bold"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-1">Company / Entity</label>
                            <input
                              type="text"
                              placeholder="Organization name"
                              value={newVisitorCompany}
                              onChange={(e) => setNewVisitorCompany(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border-none rounded-xl text-xs font-bold"
                            />
                         </div>
                      </div>

                      <button className="w-full p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition">
                        Register Engagement
                      </button>
                   </form>
                </div>
              </div>
           )}

           {activeTab === "courier" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {packageLogs.map(pkg => (
                        <div key={pkg.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-5 rounded-3xl flex items-start gap-4 hover:shadow-lg transition">
                           <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center shrink-0">
                             <Package className="w-6 h-6 text-amber-600" />
                           </div>
                           <div className="space-y-1 flex-1">
                              <div className="flex justify-between items-start">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                  pkg.status === "Delivered" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                }`}>{pkg.status}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => onUpdatePackage(pkg.id, { status: pkg.status === "Delivered" ? "Pending" : "Delivered" })} className="p-1 hover:bg-slate-100 rounded-lg">
                                       <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    </button>
                                    <button onClick={() => onDeletePackage(pkg.id)} className="p-1 hover:bg-slate-100 rounded-lg text-rose-500">
                                       <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                              </div>
                              <h4 className="font-black text-slate-900 dark:text-white text-sm">
                                <input value={pkg.recipient} onChange={(e) => onUpdatePackage(pkg.id, { recipient: e.target.value })} className="bg-transparent w-full" />
                              </h4>
                              <p className="text-[11px] text-slate-500 leading-tight">
                                <input value={pkg.description} onChange={(e) => onUpdatePackage(pkg.id, { description: e.target.value })} className="bg-transparent w-full" />
                              </p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="lg:col-span-4">
                   <form onSubmit={handlePackageSubmit} className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
                      <div className="mb-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase">Courier Drop-off</h4>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Log incoming parcels & mail</p>
                      </div>

                      <div className="space-y-3">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-1">Recipient Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Internal Staff Name"
                              value={newPkgRecipient}
                              onChange={(e) => setNewPkgRecipient(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border-none rounded-xl text-xs font-bold"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-1">Parcel Contents / Note</label>
                            <input
                              type="text"
                              placeholder="e.g. Legal documents bundle"
                              value={newPkgDesc}
                              onChange={(e) => setNewPkgDesc(e.target.value)}
                              className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border-none rounded-xl text-xs font-bold"
                            />
                         </div>
                      </div>

                      <button className="w-full p-3 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition">
                        Log Deployment Attachment
                      </button>
                   </form>
                </div>
              </div>
           )}

           {activeTab === "intercom" && (
             <div className="space-y-6">
                <div className="p-8 text-center bg-white dark:bg-slate-900 border-2 border-dashed dark:border-slate-800 rounded-3xl space-y-4">
                    <MessageSquare className={`w-12 h-12 ${intercomConnection ? 'text-emerald-500 animate-pulse' : 'text-slate-200'} mx-auto`} />
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">{intercomConnection ? "SIP Intercom Bridge Active" : "Internal Intercom Console"}</h4>
                      <p className="text-slate-500 text-sm mt-2">{intercomConnection ? "Bridging Front Desk to secure internal departmental lines..." : "Establish a secure audio/data bridge to specific branch departments."}</p>
                    </div>
                </div>

                {intercomConnection ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    {[
                      { name: "Sales & Pre-sales", ext: "101", icon: Users },
                      { name: "Debt Review Ops", ext: "105", icon: Shield },
                      { name: "Legal & Compliance", ext: "108", icon: Scale },
                      { name: "Finance & Payroll", ext: "110", icon: CreditCard },
                      { name: "Systems IT Admin", ext: "911", icon: Cpu },
                      { name: "Training & L&D", ext: "404", icon: GraduationCap },
                      { name: "Human Capital", ext: "202", icon: UserPlus },
                      { name: "Facilities Mgt", ext: "303", icon: Wrench }
                    ].map((dept, i) => (
                      <button key={i} className="p-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl hover:border-emerald-500 hover:shadow-lg transition group text-left space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition">
                            <dept.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                          </div>
                          <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-tighter">EXT:{dept.ext}</span>
                        </div>
                        <div className="font-black text-slate-900 dark:text-white text-[11px] leading-tight uppercase tracking-tight">{dept.name}</div>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                           <span className="text-[9px] font-bold text-emerald-600 uppercase">LINE READY</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="flex justify-center">
                  <button 
                    onClick={() => setIntercomConnection(!intercomConnection)}
                    className={`px-10 py-4 ${intercomConnection ? 'bg-rose-600 shadow-rose-500/20' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20'} font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition shadow-2xl flex items-center gap-3`}>
                      {intercomConnection ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                      {intercomConnection ? "Terminate Intercom Bridge" : "Initialize Intercom Bridge"}
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
