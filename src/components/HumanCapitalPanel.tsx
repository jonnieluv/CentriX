import React, { useState } from "react";
import { 
  Users, UserPlus, ShieldCheck, Clock, Calendar, 
  MapPin, CheckCircle, AlertCircle, FileText, Briefcase,
  Search, Filter, MoreHorizontal, UserCheck, UserX, 
  Download, Mail, Phone, MessageSquare, X, Heart, TrendingUp, Plus, Trash2
} from "lucide-react";
import { Employee, HealthSafetyCheck, GrowthGoal } from "../types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface HumanCapitalPanelProps {
  employees: Employee[];
  onUpdateEmployeeStatus: (id: string, status: string) => void;
  onUpdateEmployeeRole: (id: string, role: string) => void;
  onAddEmployee: (name: string, email: string, department: string, role: string) => void;
}

export default function HumanCapitalPanel({
  employees,
  onUpdateEmployeeStatus,
  onUpdateEmployeeRole,
  onAddEmployee
}: HumanCapitalPanelProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "onboarding" | "compliance" | "attendance">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const [hsChecks, setHsChecks] = useState<HealthSafetyCheck[]>([
      { id: "1", description: "Mandatory ergonomics assessment", status: "Pending" },
      { id: "2", description: "Bi-annual vision screening", status: "Completed" }
  ]);
  const [growthGoals, setGrowthGoals] = useState<GrowthGoal[]>([
      { id: "1", employeeId: "1", title: "CRM Certification", progress: 45, status: "In Progress" }
  ]);
  const [hcTasks, setHcTasks] = useState([
    { id: "1", task: "Quarterly Performance Audit", target: "Sales Department", priority: "High" },
    { id: "2", task: "Health & Safety Registry Update", target: "All Facilities", priority: "Medium" },
    { id: "3", task: "Employment Equity Submission", target: "Executive Board", priority: "Critical" }
  ]);
  const [newHcTask, setNewHcTask] = useState({ task: "", target: "", priority: "Medium" });
  const [newCheckDesc, setNewCheckDesc] = useState("");

  // HCM Interactive Compliance Ticket Modals
  const [selectedHcTicket, setSelectedHcTicket] = useState<any | null>(null);
  const [isHcTicketModalOpen, setIsHcTicketModalOpen] = useState(false);
  const [hcFeedback, setHcFeedback] = useState("");

  // Onboarding form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDept, setNewDept] = useState("Sales");
  const [newRole, setNewRole] = useState("Sales Consultant");
  const [onboardSuccess, setOnboardSuccess] = useState(false);

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    onAddEmployee(newName, newEmail, newDept, newRole);
    setNewName("");
    setNewEmail("");
    setOnboardSuccess(true);
    setTimeout(() => setOnboardSuccess(false), 3000);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "Active").length,
    onLeave: employees.filter(e => ["Lunch", "Tea", "B.Break"].includes(e.status)).length,
    inactive: employees.filter(e => e.status === "Inactive").length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Asset Registry", value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Connections", value: stats.active, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Break Intervals", value: stats.onLeave, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Inactive / Offline", value: stats.inactive, icon: UserX, color: "text-slate-600", bg: "bg-slate-50" }
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.bg} dark:bg-slate-900 border dark:border-slate-800 p-4 rounded-2xl`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">{stat.label}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{stat.value}</span>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="border-b dark:border-slate-800">
          <div className="flex flex-wrap gap-2 p-2">
            {[
              { id: "directory", label: "Staff Directory", icon: Users },
              { id: "onboarding", label: "Talent Acquisition", icon: UserPlus },
              { id: "compliance", label: "HCM Compliance", icon: ShieldCheck },
              { id: "attendance", label: "Time & Attendance", icon: Clock },
              { id: "wellness", label: "Staff Health & Growth", icon: Heart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition ${
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
        </div>

        <div className="p-6">
          {activeTab === "directory" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search human assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200"
                  >
                    <option value="All">All Departments</option>
                    <option value="Sales">Sales</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Finance">Finance</option>
                    <option value="Information & Technology">IT</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm hover:bg-slate-200 transition">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map(emp => (
                  <div 
                    key={emp.id} 
                    onClick={() => {
                      setSelectedHcTicket({
                        task: `Review Employee Record: ${emp.name}`,
                        target: emp.department,
                        priority: emp.status === "Active" ? "High" : "Low",
                        isEmployeeDetails: true,
                        employee: emp
                      });
                      setIsHcTicketModalOpen(true);
                    }}
                    className="p-4 border dark:border-slate-800 rounded-2xl hover:border-blue-600 dark:hover:border-blue-400 cursor-pointer transition group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 uppercase">
                          {emp.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</h4>
                          <span className="text-[10px] uppercase font-bold text-slate-500">{emp.id}</span>
                        </div>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        emp.status === "Active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                        emp.status === "Inactive" ? "bg-slate-300" : "bg-amber-500 animate-pulse"
                      }`}></span>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{emp.role}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{emp.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{emp.email}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t dark:border-slate-800 flex gap-2 invisible group-hover:visible transition-all">
                      <button className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-100 transition">View Profile</button>
                      <button className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold uppercase hover:bg-slate-100 transition">Adjust Role</button>
                      <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-rose-500 hover:bg-rose-50 transition"><UserX className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "onboarding" && (
            <div className="max-w-2xl mx-auto py-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Talent Acquisition Portal</h3>
                <p className="text-sm text-slate-500 mt-2">Provision new CRM consultants and assign corporate security clearances.</p>
              </div>

              {onboardSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-3">
                  <CheckCircle className="w-5 h-5" />
                  New human asset provisioned successfully. Credential token dispatched to internal email.
                </div>
              )}

              <form onSubmit={handleOnboard} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 px-1">Consultant Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marcus Aurelius"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-xl transition font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 px-1">Corporate Email Identifier</label>
                    <input
                      type="email"
                      required
                      placeholder="m.aurelius@centrix.co.za"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-xl transition font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 px-1">Department Assignment</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-xl transition font-bold"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="Client Experience">Client Experience</option>
                      <option value="Finance">Finance</option>
                      <option value="Human Capital">Human Capital</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 px-1">RBAC Role Clearance</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-xl transition font-bold"
                    >
                      <option value="Sales Consultant">Sales Consultant</option>
                      <option value="QA Auditor">QA Auditor</option>
                      <option value="Senior Manager">Senior Manager</option>
                      <option value="System Administrator">System Administrator</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:scale-[1.01] active:scale-[0.98] transition shadow-lg flex items-center justify-center gap-3"
                >
                  <UserPlus className="w-5 h-5" />
                  Finalize Onboarding Procedure
                </button>
              </form>
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="space-y-6">
               <div className="p-6 bg-slate-900 rounded-3xl text-white">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight">HCM Compliance & Policy Guard</h4>
                      <p className="text-slate-400 text-xs mt-1">Real-time monitoring of employment equity and corporate behavioral metrics.</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-800/50 rounded-2xl space-y-2 border border-slate-700/50">
                      <span className="text-[10px] font-black uppercase text-slate-500">Equity Ratio Index</span>
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-black">94%</span>
                        <span className="text-emerald-400 text-[10px] font-bold">EXCELLENT</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[94%]"></div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-2xl space-y-2 border border-slate-700/50">
                      <span className="text-[10px] font-black uppercase text-slate-500">Training Compliance</span>
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-black">82%</span>
                        <span className="text-amber-400 text-[10px] font-bold">ATTENTION</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[82%]"></div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-2xl space-y-2 border border-slate-700/50">
                      <span className="text-[10px] font-black uppercase text-slate-500">Policy Attestations</span>
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-black">100%</span>
                        <span className="text-emerald-400 text-[10px] font-bold">VERIFIED</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-full"></div>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 border dark:border-slate-800 rounded-3xl space-y-4">
                   <h4 className="font-black text-sm uppercase flex items-center gap-2">
                     <AlertCircle className="w-4 h-4 text-amber-500" />
                     Pending Compliance Reviews
                   </h4>
                   <div className="space-y-3">
                     {[
                       { task: "Quarterly Performance Audit", target: "Sales Department", priority: "High" },
                       { task: "Health & Safety Registry Update", target: "All Facilities", priority: "Medium" },
                       { task: "Employment Equity Submission", target: "Executive Board", priority: "Critical" }
                     ].map((item, i) => (
                       <div key={i} onClick={() => { setSelectedHcTicket(item); setIsHcTicketModalOpen(true); }} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-zinc-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-300 transition rounded-2xl w-full">
                         <div>
                           <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.task}</span>
                           <span className="text-[10px] text-slate-500">{item.target}</span>
                         </div>
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                           item.priority === "Critical" ? "bg-rose-500 text-white" :
                           item.priority === "High" ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700"
                         }`}>{item.priority}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="p-6 border dark:border-slate-800 rounded-3xl space-y-4">
                   <h4 className="font-black text-sm uppercase flex items-center gap-2">
                     <FileText className="w-4 h-4 text-blue-500" />
                     Legislative Documentation
                   </h4>
                   <div className="space-y-3">
                     {[
                       { doc: "Standard Employment Contract v24", type: "PDF", size: "3.2MB" },
                       { doc: "Internal Disciplinary Framework", type: "DOCX", size: "1.5MB" },
                       { doc: "Code of Corporate Conduct", type: "PDF", size: "4.8MB" }
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition rounded-2xl cursor-pointer group">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                             <FileText className="w-4 h-4 text-blue-500" />
                           </div>
                           <div>
                             <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.doc}</span>
                             <span className="text-[10px] text-slate-500">{item.type} • {item.size}</span>
                           </div>
                         </div>
                         <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-lg uppercase tracking-tight">Universal Punch Register</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase transition">Generate Payroll Export</button>
                </div>
              </div>

              <div className="border dark:border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase text-slate-500">
                    <tr>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Clock In</th>
                      <th className="p-4">Current Status</th>
                      <th className="p-4">Compliance Status</th>
                      <th className="p-4 text-right">Duty Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {employees.map(emp => (
                      <tr key={emp.id} className="text-xs hover:bg-white/5 transition">
                        <td className="p-4">
                           <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                             <span className="font-bold text-slate-900 dark:text-white">{emp.name}</span>
                           </div>
                        </td>
                        <td className="p-4 font-mono text-slate-500">08:00:15 AM</td>
                        <td className="p-4">
                          <select 
                            value={emp.status} 
                            onChange={(e) => onUpdateEmployeeStatus(emp.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase ${
                              emp.status === "Active" ? "bg-emerald-50 text-emerald-600" :
                              emp.status === "Inactive" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"
                            }`}
                          >
                             <option value="Active">Active</option>
                             <option value="Inactive">Inactive</option>
                             <option value="Lunch">Lunch</option>
                             <option value="Tea">Tea</option>
                          </select>
                        </td>
                        <td className="p-4">
                            <button onClick={() => {}} className="text-emerald-500 font-bold uppercase text-[10px] hover:underline">✓ Toggle Compliance</button>
                        </td>
                        <td className="p-4 text-right">
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "wellness" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                    <h4 className="font-black text-sm uppercase flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Staff Wellness Trend (Last 5 Days)
                    </h4>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{day: 'Mon', val: 75}, {day: 'Tue', val: 78}, {day: 'Wed', val: 82}, {day: 'Thu', val: 80}, {day: 'Fri', val: 88}]}>
                          <Area type="monotone" dataKey="val" stroke="#10b981" fill="#064e3b" />
                          <XAxis dataKey="day" hide />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 border dark:border-slate-800 rounded-3xl space-y-4">
                    <h4 className="font-black text-sm uppercase flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        Health & Safety Checks
                    </h4>
                    <div className="flex gap-2">
                        <input className="text-xs p-2 rounded grow border dark:border-slate-700" value={newCheckDesc} onChange={(e) => setNewCheckDesc(e.target.value)} placeholder="New check..." />
                        <button onClick={() => {
                            if(!newCheckDesc) return;
                            setHsChecks([...hsChecks, { id: Date.now().toString(), description: newCheckDesc, status: "Pending" }]);
                            setNewCheckDesc("");
                        }} className="p-2 bg-slate-900 rounded-lg text-white"><Plus className="w-4 h-4"/></button>
                    </div>
                    {hsChecks.map(check => (
                        <div key={check.id} className="flex items-center gap-2 p-2 border dark:border-slate-800 rounded-lg text-xs">
                          <button onClick={() => setHsChecks(hsChecks.map(c => c.id === check.id ? {...c, status: c.status === "Pending" ? "Completed" : "Pending"} : c))} className={`w-4 h-4 rounded ${check.status === "Completed" ? "bg-emerald-500" : "bg-slate-200"}`}/>
                          <span className={check.status === "Completed" ? "line-through text-slate-500" : ""}>{check.description}</span>
                          <button onClick={() => setHsChecks(hsChecks.filter(c => c.id !== check.id))} className="ml-auto text-rose-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
              </div>

              <div className="p-6 border dark:border-slate-800 rounded-3xl space-y-4">
                    <h4 className="font-black text-sm uppercase flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-purple-500" />
                        Staff Growth Goals
                    </h4>
                    {growthGoals.map(goal => (
                        <div key={goal.id} className="flex items-center gap-4 p-3 border dark:border-slate-800 rounded-lg text-xs">
                            <span className="font-bold flex-grow">{goal.title}</span>
                            <div className="w-32 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full" style={{ width: `${goal.progress}%` }}></div>
                            </div>
                            <span className="font-mono">{goal.progress}%</span>
                            <button onClick={() => setGrowthGoals(growthGoals.map(g => g.id === goal.id ? {...g, progress: Math.min(100, g.progress + 10)} : g))} className="text-xs bg-slate-100 dark:bg-slate-800 p-1 px-2 rounded">
                                +10%
                            </button>
                        </div>
                    ))}
              </div>
            </div>
          )}
        </div>
      </div>

    {/* Interactive HCM Operational Ticket & Profile Modal */}
    {isHcTicketModalOpen && selectedHcTicket && (() => {
      const ticket = selectedHcTicket;
      const isEmployee = !!ticket.isEmployeeDetails;
      const emp = ticket.employee;

      return (
        <div id="hcmSupportModal" className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200 text-left">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col hover:border-transparent">
            
            {/* Modal Header */}
            <div className="p-6 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-855 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-105 dark:bg-rose-950 text-rose-650 rounded-xl">
                   {isEmployee ? <Users className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 animate-pulse" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-black text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded uppercase">HCM-SLA-VERIFICATION</span>
                    <span className="text-xs text-slate-400 font-bold">{isEmployee ? "Employee Clearance File" : "HCM Audit Task Case"}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">{ticket.task}</h3>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setIsHcTicketModalOpen(false); setSelectedHcTicket(null); setHcFeedback(""); }}
                className="p-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
              
              {/* Meta Details */}
              <div className="p-4 bg-slate-50 dark:bg-slate-855 rounded-2xl flex flex-wrap gap-4 justify-between items-center text-xs text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-black">Target Department</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{ticket.target}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-black">Risk Severity Level</span>
                  <span className="font-mono">{ticket.priority} Severity</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-black">Authentication Status</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">PoPIA Secure</span>
                </div>
              </div>

              {/* Dynamic Employee Controls OR General Audit Exception */}
              {isEmployee && emp ? (
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border dark:border-slate-800 rounded-xl space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultant Profile & Action controls</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800 dark:text-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Identifier Email</span>
                        <strong className="text-slate-900 dark:text-white font-sans font-bold select-all">{emp.email}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Current Assigned Role</span>
                        <strong className="text-slate-900 dark:text-white font-sans font-bold">{emp.role}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-400 block">Update Working Status</label>
                        <select
                          value={emp.status}
                          onChange={(e) => {
                            onUpdateEmployeeStatus(emp.id, e.target.value);
                            setHcFeedback(`Updated ${emp.name} working status to "${e.target.value}".`);
                          }}
                          className="w-full text-xs p-1.5 border dark:border-slate-800 dark:bg-slate-850 rounded-lg text-slate-900 dark:text-white font-bold"
                        >
                          <option value="Active">Active Consulting</option>
                          <option value="Lunch">Lunch Interval</option>
                          <option value="Tea">Tea Interval</option>
                          <option value="Inactive">Inactive / Suspended</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-400 block">Re-grade RBAC Role</label>
                        <select
                          value={emp.role}
                          onChange={(e) => {
                            onUpdateEmployeeRole(emp.id, e.target.value);
                            setHcFeedback(`Regraded ${emp.name} clearance role to "${e.target.value}".`);
                          }}
                          className="w-full text-xs p-1.5 border dark:border-slate-800 dark:bg-slate-850 rounded-lg text-slate-900 dark:text-white font-bold"
                        >
                          <option value="Sales Consultant">Sales Consultant</option>
                          <option value="QA Auditor">QA Auditor</option>
                          <option value="Senior Manager">Senior Manager</option>
                          <option value="System Administrator">System Administrator</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">HCM Audit Subtask Details</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 font-mono text-xs rounded-xl border dark:border-slate-800 text-slate-805 leading-relaxed">
                    This compliance file governs general performance reviews and legislative PopIA checklist status validation for {ticket.target}.
                  </div>
                </div>
              )}

              {/* Feedback box */}
              {hcFeedback && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-sans font-mono text-[11px] font-bold rounded-xl border border-emerald-100">
                  ✓ ACTION LOGGED: {hcFeedback}
                </div>
              )}

              {/* Operations Action Commands */}
              <div className="space-y-2 pt-2 border-t dark:border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider font-sans">Interactive Staff & Compliance Actions</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHcFeedback(`Successfully filed and signed compliance authorization report POPOA-0219 for ${ticket.target}.`);
                    }}
                    className="p-3 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                     Approve and Sign Compliance
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHcFeedback(`Successfully generated secure login bypass credential token and dispatched to consultant.`);
                    }}
                    className="p-3 bg-slate-900 hover:bg-black dark:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                     Reset Access Token
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHcFeedback(`Instructed supervisor to schedule human capital review session inside CRM Calendar logs.`);
                    }}
                    className="p-3 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                     Schedule Review Session
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHcFeedback(`Compliance checklist flagged as Complete. Transmitting data packages to secure vault archives.`);
                    }}
                    className="p-3 border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                     Transmit Vault Files
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
