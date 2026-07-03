import React, { useState } from "react";
import { 
  Shield, UserCheck, Key, Laptop, Wifi, ChevronRight, Play, Database, 
  Terminal, Eye, Plus, Trash2, Cpu, Activity, RefreshCw, Layers, BookOpen, AlertCircle, Save, CheckCircle,
  MessageSquare, Send, Clock, User, Filter, HelpCircle, X, Lock, Users, AlertTriangle, Phone, Video, Archive
} from "lucide-react";
import { Ticket, Employee, SupportTicket } from "../types";

interface ITSettingsPanelProps {
  employees: Employee[];
  tickets: Ticket[];
  activeITScreenRecordings: { id: string; user: string; isRecording: boolean }[];
  itOverrideInput: string;
  setItOverrideInput: (val: string) => void;
  handleTriggerITOverride: (e: React.FormEvent) => void;
  itOverrideLogs: { id: string; timestamp: string; action: string; status: string }[];
  onUpdateEmployeeStatus?: (id: string, newStatus: string) => void;
  onUpdateEmployeeRole?: (id: string, newRole: string) => void;
  onAddEmployee?: (name: string, email: string, department: string, role: string) => void;
  supportTickets: SupportTicket[];
  onAddSupportTicket: (ticket: { user: string; department: string; subject: string; description: string; priority: string }) => void;
  onReplySupportTicket: (ticketId: string, sender: string, message: string) => void;
  onUpdateSupportTicketStatus: (ticketId: string, status?: string, priority?: string) => void;
  chatsData?: Record<string, any[]>;
  callLogs?: any[];
  videoSessions?: any[];
}

export default function ITSettingsPanel({
  employees,
  tickets,
  activeITScreenRecordings,
  itOverrideInput,
  setItOverrideInput,
  handleTriggerITOverride,
  itOverrideLogs,
  onUpdateEmployeeStatus,
  onUpdateEmployeeRole,
  onAddEmployee,
  supportTickets,
  onAddSupportTicket,
  onReplySupportTicket,
  onUpdateSupportTicketStatus,
  chatsData = {},
  callLogs = [],
  videoSessions = []
}: ITSettingsPanelProps) {
  
  const [activeTab, setActiveTab] = useState<"identity" | "endpoints" | "network" | "sysadmin" | "helpdesk">("identity");
  
  // Custom interactive states for Settings
  // 1. Identity
  const [passwordMinLength, setPasswordMinLength] = useState(12);
  const [requireMfa, setRequireMfa] = useState(true);
  const [ssoProvider, setSsoProvider] = useState("AzureEntra");
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("Information & Technology");
  const [newEmpRole, setNewEmpRole] = useState("SysOps Admin");

  // 2. Endpoints
  const [enrolledDevices, setEnrolledDevices] = useState([
    { id: "DEV-LP8839", owner: "Sarah Jenkins", type: "Laptop", os: "Windows 11", securityGroup: "TQM Audit", antiMalware: "Active", lastScan: "12 mins ago" },
    { id: "DEV-DK1290", owner: "David Miller", type: "Desktop", os: "macOS Sonoma", securityGroup: "Sales Lead", antiMalware: "Active", lastScan: "3 hours ago" },
    { id: "DEV-MB4403", owner: "Admin Cloud", type: "Server Node", os: "Ubuntu Core", securityGroup: "Root Escrow", antiMalware: "Active", lastScan: "Just now" }
  ]);
  const [lastPatched, setLastPatched] = useState("May 28, 2026");
  const [patchStatus, setPatchStatus] = useState("Up-to-Date");
  const [antivirusScanStatus, setAntivirusScanStatus] = useState<string | null>(null);

  // 3. Network
  const [vpnGateway, setVpnGateway] = useState("ZAF-Gauteng-Secure-GW");
  const [wifiSsid, setWifiSsid] = useState("CentriX-Corp-WPA3");
  const [guestWifiEnabled, setGuestWifiEnabled] = useState(true);
  const [dnsRouting, setDnsRouting] = useState("10.12.0.1 (Primary WAN)");

  // 4. SysAdmin Integrations
  const [thirdPartyApiKey, setThirdPartyApiKey] = useState("cx_live_a38f7e912bc0e883ba56");
  const [webhookUrl, setWebhookUrl] = useState("https://api.centrix.co.za/v1/crm-callbacks");
  const [backupSchedule, setBackupSchedule] = useState("Daily at 02:00 UTC");
  const [backupStatus, setBackupStatus] = useState("Successful (Size: 1.2 GB)");
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  // 5. Helpdesk
  const [defaultRoutingTier, setDefaultRoutingTier] = useState("Tier-2 Support");
  const [capacityThreshold, setCapacityThreshold] = useState(85);

  // --- Real-time Data-Driven States ---
  const [trafficMetrics, setTrafficMetrics] = useState({
    activeSessions: 142,
    requestThroughput: 850, // req/min
    authSuccessRate: 99.8,
    errorRate: 0.02
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTrafficMetrics(prev => ({
        activeSessions: Math.max(120, Math.min(250, prev.activeSessions + Math.floor(Math.random() * 5 - 2))),
        requestThroughput: Math.max(700, Math.min(1200, prev.requestThroughput + Math.floor(Math.random() * 50 - 25))),
        authSuccessRate: Math.max(98.5, Math.min(100, prev.authSuccessRate + (Math.random() > 0.5 ? 0.01 : -0.01))),
        errorRate: Math.max(0, Math.min(0.5, prev.errorRate + (Math.random() > 0.8 ? 0.05 : -0.02)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const [faqs, setFaqs] = useState([
    { id: "faq-1", question: "How to reset CRM login passwords?", answer: "Use the IT Settings Identity tab or request an OTP from active reception." },
    { id: "faq-2", question: "Where are supporting documents stored?", answer: "Uploaded supporting PDFs are placed in the selfhosted storage folder securely." }
  ]);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  // Robust Live Helpdesk state helpers
  const [selectedSupportTicketId, setSelectedSupportTicketId] = useState<string | null>("ST-81023");
  const [isITTicketModalOpen, setIsITTicketModalOpen] = useState(false);
  const [itDiagnosticLog, setItDiagnosticLog] = useState<Record<string, string>>({});
  const [itDeviceDiagnosticsRunning, setItDeviceDiagnosticsRunning] = useState(false);
  
  const [itResponderName, setItResponderName] = useState("Ashraf Patel (CRM Admin)");
  const [directReplyMessage, setDirectReplyMessage] = useState("");
  const [newTicketUser, setNewTicketUser] = useState("David Miller");
  const [newTicketDept, setNewTicketDept] = useState("Sales");
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState("");
  const [replySuccessMsg, setReplySuccessMsg] = useState("");
  
  const [ticketFilterStatus, setTicketFilterStatus] = useState<string>("All");
  const [ticketFilterPriority, setTicketFilterPriority] = useState<string>("All");

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ || !newFaqA) return;
    setFaqs([...faqs, { id: `faq-${Date.now()}`, question: newFaqQ, answer: newFaqA }]);
    setNewFaqQ("");
    setNewFaqA("");
  };

  const handleCreateSupportTicketLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketDesc) return;
    onAddSupportTicket({
      user: newTicketUser,
      department: newTicketDept,
      subject: newTicketSubject,
      description: newTicketDesc,
      priority: newTicketPriority
    });
    setNewTicketSubject("");
    setNewTicketDesc("");
    setTicketSuccessMsg("Support Ticket launched successfully! Registered in active lines.");
    setTimeout(() => setTicketSuccessMsg(""), 4000);
  };

  const handleReplySupportTicketLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupportTicketId || !directReplyMessage) return;
    onReplySupportTicket(selectedSupportTicketId, itResponderName, directReplyMessage);
    setDirectReplyMessage("");
    setReplySuccessMsg("Direct reply dispatched to user communications feed!");
    setTimeout(() => setReplySuccessMsg(""), 4000);
  };

  const handleTriggerBackupSimulation = () => {
    setIsBackupRunning(true);
    setTimeout(() => {
      setIsBackupRunning(false);
      setBackupStatus(`Successful on ${new Date().toLocaleTimeString()} (Size: 1.24 GB)`);
    }, 1500);
  };

  const handleTriggerDeviceScan = () => {
    setAntivirusScanStatus("Scanning enrolled company endpoints for malicious scripts & payloads...");
    setTimeout(() => {
      setAntivirusScanStatus("Malware scan complete (3 assets secure, 0 alerts raised).");
    }, 2000);
  };

  const handleAddEmployeeLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail) return;
    if (onAddEmployee) {
      onAddEmployee(newEmpName, newEmpEmail, newEmpDept, newEmpRole);
    }
    setNewEmpName("");
    setNewEmpEmail("");
  };

  return (
    <div id="it-settings-department-panel" className="bg-slate-55 border dark:bg-slate-900 border-slate-205 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs space-y-4">
      
      {/* Upper Control Bar / Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-amber-500 animate-pulse" />
            <h4 className="font-mono tracking-tight font-black text-[12px] uppercase text-slate-200">
              System Operations Hub & IT Settings Console
            </h4>
          </div>
          <p className="text-[11px] text-black mt-1 max-w-xl">
            Enterprise administration console. Provision employee directories, configure SSO/MFA parameters, orchestrate remote device policies, adjust DNS routing, and monitor live server backup logs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[12px]">
          <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            SYS: STABLE
          </div>
          <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 font-mono text-[10px] text-black">
            SSL: ACTIVE
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Horizontal Navigation Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: "identity", label: "👤 Identity & Access", color: "hover:text-sky-500" },
            { id: "endpoints", label: "💻 Endpoint & Devices", color: "hover:text-indigo-500" },
            { id: "network", label: "🌐 Networks / VPN", color: "hover:text-teal-500" },
            { id: "sysadmin", label: "⚙️ System Admin & DevOps", color: "hover:text-amber-500" },
            { id: "helpdesk", label: "🛠️ Helpdesk & FAQ Admin", color: "hover:text-purple-500" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  isActive 
                    ? "bg-slate-100 dark:bg-slate-850 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700" 
                    : `bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-black ${tab.color} hover:bg-slate-50 dark:hover:bg-slate-700`
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 pt-1 space-y-4">
        
        {/* Real-time Global Systems Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
          <div className="p-4 border rounded-2xl bg-white dark:bg-slate-900 shadow-sm space-y-2 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center text-[10px] uppercase font-black text-slate-400">
              <span>Active Staff Sessions</span>
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-black dark:text-white">{trafficMetrics.activeSessions}</span>
              <span className="text-[10px] text-emerald-500 font-bold">● Live</span>
            </div>
          </div>
          <div className="p-4 border rounded-2xl bg-white dark:bg-slate-900 shadow-sm space-y-2 border-l-4 border-l-cyan-500">
            <div className="flex justify-between items-center text-[10px] uppercase font-black text-slate-400">
              <span>Total Request Flow</span>
              <Activity className="w-3.5 h-3.5 text-cyan-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-black dark:text-white">{trafficMetrics.requestThroughput.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-tighter">Req/Min</span>
            </div>
          </div>
          <div className="p-4 border rounded-2xl bg-white dark:bg-slate-900 shadow-sm space-y-2 border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center text-[10px] uppercase font-black text-slate-400">
              <span>Auth Reliability</span>
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-black dark:text-white">{trafficMetrics.authSuccessRate.toFixed(1)}%</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-tighter">Reliable</span>
            </div>
          </div>
          <div className="p-4 border rounded-2xl bg-white dark:bg-slate-900 shadow-sm space-y-2 border-l-4 border-l-rose-500">
            <div className="flex justify-between items-center text-[10px] uppercase font-black text-slate-400">
              <span>System Error Rate</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-black dark:text-white">{trafficMetrics.errorRate.toFixed(2)}%</span>
              <span className={`text-[10px] font-bold uppercase font-mono tracking-tighter ${trafficMetrics.errorRate > 0.1 ? "text-rose-500" : "text-emerald-500"}`}>
                {trafficMetrics.errorRate > 0.1 ? "Caution" : "Stable"}
              </span>
            </div>
          </div>
        </div>
        
        {/* TAB 1: IDENTITY & ACCESS */}
        {activeTab === "identity" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column: Password Policy, MFA & Identity Providers */}
              <div className="lg:col-span-4 border rounded-xl p-3 bg-slate-50/50 dark:bg-slate-850/50 space-y-4">
                <div>
                  <h5 className="font-extrabold text-[11px] text-black uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" /> Authentication Security Policies
                  </h5>
                  <p className="text-[10px] text-black mb-3">Establish strict regulatory access controls for CentriX accounts.</p>
                </div>

                <div className="space-y-3.5 text-[12px]">
                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">
                      Minimum Password Size Requirement: <span className="font-mono text-blue-600">{passwordMinLength} chars</span>
                    </label>
                    <input 
                      type="range"
                      min="8"
                      max="24"
                      value={passwordMinLength}
                      onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-705 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="border-t border-dashed my-2"></div>

                  <label className="flex items-center gap-2 p-1 px-1.5 border rounded border-slate-250/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={requireMfa}
                      onChange={(e) => setRequireMfa(e.target.checked)}
                      className="rounded border-gray-300 text-blue-605 w-3.5 h-3.5"
                    />
                    <div>
                      <span className="font-bold text-[11px] block">Force Two-Factor MFA Auth</span>
                      <span className="text-[10px] text-black block text-black">Enforce mobile token/OTP on each session boot</span>
                    </div>
                  </label>

                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Integrated SSO Identity Directory</label>
                    <select
                      value={ssoProvider}
                      onChange={(e) => setSsoProvider(e.target.value)}
                      className="w-full text-[12px] p-1.5 border dark:bg-slate-900 rounded font-medium text-black dark:text-white"
                    >
                      <option value="AzureEntra">Microsoft Azure AD (Entra ID Sync)</option>
                      <option value="GoogleWorkspace">Google Workspace identity accounts</option>
                      <option value="Okta">Okta SSO Web Gateway</option>
                      <option value="LocalNoSSO">Standalone security registry (No SSO)</option>
                    </select>
                  </div>
                </div>

                <div className="p-2 bg-amber-50/50 dark:bg-amber-950/20 border-l-2 border-amber-500 rounded text-[10px] text-amber-800 dark:text-amber-300">
                  ⚠️ Changing SSO policies triggers log-out prompts for all current staff sessions globally.
                </div>
              </div>

              {/* Center/Right Column: Directory management / User accounts */}
              <div className="lg:col-span-8 space-y-3">
                
                {/* Add new employee user */}
                <form onSubmit={handleAddEmployeeLocal} className="border rounded-xl p-3 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-4 gap-2.5 items-end">
                  <div className="md:col-span-4 pb-1">
                    <h5 className="font-extrabold text-[11px] text-black uppercase tracking-wide">On-board New Employee Account</h5>
                    <p className="text-[10px] text-black text-black mt-0.5">Registers a new profile and sends auto-generated credential token.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-black block mb-0.5">Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      required
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      className="w-full p-1.5 text-[12px] rounded border dark:bg-slate-850 text-black dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-black block mb-0.5">Email</label>
                    <input
                      type="email"
                      placeholder="jane@centrix.co.za"
                      required
                      value={newEmpEmail}
                      onChange={(e) => setNewEmpEmail(e.target.value)}
                      className="w-full p-1.5 text-[12px] rounded border dark:bg-slate-850 text-black dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-black block mb-0.5">Dept Assignment</label>
                    <select
                      value={newEmpDept}
                      onChange={(e) => setNewEmpDept(e.target.value)}
                      className="w-full p-1.5 text-[12px] rounded border dark:bg-slate-850 text-black dark:text-white"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="Credit Committee">Credit Committee</option>
                      <option value="Information & Technology">Information & Technology</option>
                      <option value="Client Experience">Client Experience</option>
                      <option value="Human Capital">Human Capital</option>
                      <option value="Training and Development">Training and Development</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[12px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Provision User
                  </button>
                </form>

                {/* Employees list table */}
                <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-b flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-black">Corporate Employee Directory ({employees.length} users)</span>
                    <span className="text-[10px] text-black font-mono">RBAC: Active Directory Link</span>
                  </div>

                  <div className="max-h-[160px] overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-black uppercase text-[10px]">
                        <tr>
                          <th className="p-2">Employee Name</th>
                          <th className="p-2">Role Title</th>
                          <th className="p-2">Department</th>
                          <th className="p-2 text-right pr-4">Account Access Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {employees.map(emp => (
                          <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                            <td className="p-2">
                              <div className="font-semibold text-black dark:text-white">{emp.name}</div>
                              <div className="text-[10px] text-black font-mono">{emp.email}</div>
                            </td>
                            <td className="p-2">
                              <select
                                value={emp.role}
                                onChange={(e) => onUpdateEmployeeRole && onUpdateEmployeeRole(emp.id, e.target.value)}
                                className="bg-transparent text-black dark:text-white p-0 text-[11px] border-b border-dashed focus:outline-hidden"
                              >
                                <option value="SysOps Admin">SysOps Admin</option>
                                <option value="CRM Operator">CRM Operator</option>
                                <option value="Compliance Auditor">Compliance Auditor</option>
                                <option value="Secretariat Representative">Secretariat Representative</option>
                                <option value="Client Liaison Specialist">Client Liaison Specialist</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <span className="bg-slate-100 dark:bg-slate-800 py-0.5 px-1.5 rounded text-[10px] text-black dark:text-white">
                                {emp.department}
                              </span>
                            </td>
                            <td className="p-2 text-right pr-4">
                              <button
                                onClick={() => onUpdateEmployeeStatus && onUpdateEmployeeStatus(emp.id, emp.status === "Active" ? "Suspended" : "Active")}
                                className={`p-1 px-1.5 rounded font-bold text-[10px] uppercase transition cursor-pointer ${
                                  emp.status === "Active" 
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400" 
                                    : "bg-rose-50 text-rose-750 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-450"
                                }`}
                              >
                                {emp.status === "Active" ? "✓ Authorized" : "🔒 Disabled"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ENDPOINT & DEVICES */}
        {activeTab === "endpoints" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
                <span className="text-[10px] text-black font-extrabold uppercase">Endpoint Patch Ring</span>
                <div className="flex justify-between items-baseline">
                  <strong className="text-[12px] text-black dark:text-white font-mono">{patchStatus}</strong>
                  <span className="text-[10px] text-black">Scheduled Update Ring</span>
                </div>
                <div className="text-[11px] text-black">
                  Last check complete. Updates applied sequentially on: <span className="font-semibold text-black dark:text-white">{lastPatched}</span>
                </div>
                <button 
                  onClick={() => {
                    setPatchStatus("Patch-In-Progress");
                    setTimeout(() => {
                      setPatchStatus("Up-to-Date");
                      setLastPatched(new Date().toLocaleDateString());
                    }, 1000);
                  }}
                  className="w-full mt-2 p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-705 text-black dark:text-white font-bold rounded text-[11px] uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 animate-spin-slow" /> Push Patches & Hotfixes
                </button>
              </div>

              <div className="p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-850/50 space-y-2">
                <span className="text-[10px] text-black font-extrabold uppercase">Endpoint Defender Scanning</span>
                <div className="flex justify-between items-baseline">
                  <strong className="text-[12px] text-black dark:text-white font-mono">3 Protected</strong>
                  <span className="text-[10px] text-green-600 font-extrabold">All Active</span>
                </div>
                <div className="text-[10px] text-black">
                  Firewall baselines active. Custom scans monitor folder modifications and attachments.
                </div>
                <button 
                  onClick={handleTriggerDeviceScan}
                  className="w-full mt-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[11px] uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" /> Execute Live Malware Scan
                </button>
              </div>

              <div className="p-3 border rounded-xl bg-slate-50/50 dark:bg-slate-805/50 space-y-2.5">
                <span className="text-[10px] text-black font-extrabold uppercase block">MDM Enrolment Configurator</span>
                <div className="text-[11px] text-black">
                  Centrally push configurations and pre-checks to hardware. Ensure mobile clients register prior to reading CRM accounts.
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="p-1 border rounded bg-white dark:bg-slate-900 border-dashed text-black dark:text-white">
                    🔐 BitLocker: <strong>Forced</strong>
                  </div>
                  <div className="p-1 border rounded bg-white dark:bg-slate-900 border-dashed text-black dark:text-white">
                    🦠 Local Scan: <strong>Strict-Ring</strong>
                  </div>
                </div>
              </div>

            </div>

            {antivirusScanStatus && (
              <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-505 rounded text-[12px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600 animate-spin-slow" />
                <span>{antivirusScanStatus}</span>
              </div>
            )}

            {/* Enrolled endpoint device table */}
            <div className="border rounded-xl bg-white dark:bg-slate-900">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border-b flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-black">MDM Active Enrolled Hardware Portfolio ({enrolledDevices.length} assets)</span>
                <span className="text-[10px] font-semibold text-black">Device Health: Compliant</span>
              </div>

              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-black uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Asset ID / Hardware</th>
                      <th className="p-2.5">Owner / User</th>
                      <th className="p-2.5">OS / Distribution</th>
                      <th className="p-2.5">Network Security Policy Group</th>
                      <th className="p-2.5">Defender State</th>
                      <th className="p-2.5 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {enrolledDevices.map((dev) => (
                      <tr key={dev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="p-2.5 text-black dark:text-white font-mono font-bold">
                          {dev.id}
                        </td>
                        <td className="p-2.5 text-black dark:text-white font-medium">
                          {dev.owner}
                        </td>
                        <td className="p-2.5 text-black">
                          {dev.os}
                        </td>
                        <td className="p-2.5">
                          <span className="bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-305 px-1.5 py-0.5 rounded text-[10px]">
                            {dev.securityGroup}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            {dev.antiMalware} (Last {dev.lastScan})
                          </span>
                        </td>
                        <td className="p-2 text-right pr-4">
                          <button
                            onClick={() => {
                              // Simulate wipe device
                              const updated = enrolledDevices.filter(d => d.id !== dev.id);
                              setEnrolledDevices(updated);
                            }}
                            className="p-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded font-bold uppercase text-[10px] cursor-pointer"
                          >
                            ⚠️ Remote Wipe Asset
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: NETWORKS & VPN */}
        {activeTab === "network" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Wi-Fi & Gateway configs */}
              <div className="border rounded-xl p-3 bg-white dark:bg-slate-900 space-y-4 text-[12px]">
                <div>
                  <h5 className="font-extrabold text-[11px] text-black uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Wifi className="w-4 h-4 text-blue-500" /> Enterprise Network SSID & Security
                  </h5>
                  <p className="text-[10px] text-black">Management pane for physical office wireless profiles.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Corporate Core SSID Name</label>
                    <input 
                      type="text" 
                      value={wifiSsid} 
                      onChange={(e) => setWifiSsid(e.target.value)}
                      className="w-full text-[12px] p-1.5 border dark:bg-slate-850 rounded text-black dark:text-white font-mono"
                    />
                  </div>

                  <label className="flex items-center gap-2 p-1 px-1.5 border rounded border-slate-250/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={guestWifiEnabled}
                      onChange={(e) => setGuestWifiEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 w-3.5 h-3.5"
                    />
                    <div>
                      <span className="font-bold text-[11px] block text-black dark:text-white">Is Guest Network IoT Router Interface Enabled?</span>
                      <span className="text-[10px] text-black block text-black">Routes guest traffic to isolated VLAN sandboxes (No CRM access)</span>
                    </div>
                  </label>

                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Assigned LAN VPN Secure Gateway Address</label>
                    <input 
                      type="text" 
                      value={vpnGateway} 
                      onChange={(e) => setVpnGateway(e.target.value)}
                      className="w-full text-[12px] p-1.5 border dark:bg-slate-850 rounded text-black dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* WAN/DNS domains and active VPN sessions */}
              <div className="border rounded-xl p-3 bg-white dark:bg-slate-900 space-y-3 text-[12px]">
                <div>
                  <h5 className="font-extrabold text-[11px] text-black uppercase mb-1">Active DNS Route Table configuration</h5>
                  <p className="text-[10px] text-black">Global DNS entries mapping for remote connection links.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-black block mb-1 uppercase">Primary Domain Name Routing Address</label>
                    <input 
                      type="text" 
                      value={dnsRouting} 
                      onChange={(e) => setDnsRouting(e.target.value)}
                      className="w-full text-[12px] p-1.5 border dark:bg-slate-850 rounded text-black dark:text-white font-mono"
                    />
                  </div>

                  <div className="border-t border-dashed my-2"></div>

                  <span className="text-[10px] uppercase font-bold text-black block mb-1">Network Gateways Summary Metrics & IP Allocations</span>
                  <div className="space-y-1 font-mono text-[10px] bg-slate-50 dark:bg-slate-950 p-2.5 rounded border">
                    <div className="flex justify-between">
                      <span>Gateway Node (ZAF):</span>
                      <span className="text-emerald-500 font-bold">192.168.10.1 (Online)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DHCP Lease Matrix Range:</span>
                      <span>192.168.10.100 - 192.168.10.250</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remote VPN tunnels active:</span>
                      <span className="text-blue-500 font-black">2 employees connected</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM ADMIN & SYSADMIN */}
        {activeTab === "sysadmin" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* API and Integration credentials keys */}
              <div className="border rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 text-[12px]">
                <div>
                  <h5 className="font-extrabold text-[11px] text-black uppercase mb-1">Third-party Service Integration APIs</h5>
                  <p className="text-[10px] text-black">Enables CRM data flow callbacks to downstream legacy core ledgers.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-black block mb-0.5 uppercase">General Web Ledger Secret Access API Token</label>
                    <input 
                      type="text" 
                      value={thirdPartyApiKey} 
                      onChange={(e) => setThirdPartyApiKey(e.target.value)}
                      className="w-full text-[12px] p-1.5 border dark:bg-slate-850 rounded text-black dark:text-white font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-black block mb-0.5 uppercase">POST URL Notification Endpoint Webhook</label>
                    <input 
                      type="text" 
                      value={webhookUrl} 
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full text-[12px] p-1.5 border dark:bg-slate-850 rounded text-black dark:text-white text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic back ups section */}
              <div className="border rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3.5 text-[12px]">
                <div>
                  <h5 className="font-extrabold text-[11px] text-black uppercase mb-1">Central Backup and Recovery Schedule</h5>
                  <p className="text-[10px] text-black text-black">Set backup rules for automated data backups and disaster recovery.</p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div>
                      <label className="text-[10px] font-bold text-black block mb-0.5">Recurring Backup Calendar Interval</label>
                      <select
                        value={backupSchedule}
                        onChange={(e) => setBackupSchedule(e.target.value)}
                        className="w-full p-1 border dark:bg-slate-850 rounded font-medium text-black dark:text-white"
                      >
                        <option value="Daily at 02:00 UTC">Daily at 02:00 UTC</option>
                        <option value="Weekly Sunday at 00:00 UTC">Weekly Sunday at 00:00 UTC</option>
                        <option value="Real-time Continuous Sync">Real-sync (Critical)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-black block mb-0.5">Latest Backup Outcome Status</label>
                      <input 
                        type="text" 
                        disabled 
                        value={backupStatus} 
                        className="w-full p-1 border dark:bg-slate-850 bg-slate-50 dark:bg-slate-950 rounded text-black font-mono text-[10px]" 
                      />
                    </div>
                  </div>

                  <button 
                    type="button"
                    disabled={isBackupRunning}
                    onClick={handleTriggerBackupSimulation}
                    className="w-full p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-705 text-black dark:text-white font-bold rounded text-[11px] uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Database className={`w-3.5 h-3.5 text-blue-500 ${isBackupRunning ? "animate-spin" : ""}`} /> 
                    {isBackupRunning ? "Backing up ledger..." : "Simulate Instant Backup Point Upload"}
                  </button>
                </div>
              </div>

            </div>

            {/* IT Override Inputs terminal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* IT override form */}
              <form onSubmit={handleTriggerITOverride} className="border rounded-xl p-3 bg-white dark:bg-slate-900 space-y-2 text-[12px] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-black uppercase block mb-1">CentriX Diagnostic Input Terminal Override</span>
                  <p className="text-[10px] text-black mb-2">Forces localized database updates or user level escalations instantly across the workspace.</p>
                </div>
                
                <input
                  type="text"
                  placeholder="e.g. GRANT DEPT_HEAD OVERRIDE David Miller"
                  value={itOverrideInput}
                  onChange={(e) => setItOverrideInput(e.target.value)}
                  className="w-full p-2 text-[12px] rounded border dark:bg-slate-850 text-black dark:text-white focus:outline-hidden font-mono"
                />
                
                <button type="submit" className="w-full p-2 bg-amber-600 font-bold text-white rounded hover:bg-amber-700 transition uppercase text-[11px] cursor-pointer">
                  📢 Deploy Script System-wide
                </button>
              </form>

              {/* LIVE session monitoring lists (IT overriding panel requirement) */}
              <div className="border rounded-xl p-3 bg-white dark:bg-slate-900 text-[12px]">
                <span className="text-[10px] font-bold text-black uppercase flex items-center gap-1 block mb-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                  Active CRM Screen Session Monitor Recordings
                </span>
                
                <div className="space-y-1 bg-slate-950 p-2 rounded text-[11px] font-mono text-emerald-400 max-h-[110px] overflow-y-auto">
                  {activeITScreenRecordings && activeITScreenRecordings.length > 0 ? (
                    activeITScreenRecordings.map(rec => (
                      <div key={rec.id} className="flex justify-between border-b border-slate-900 py-1">
                        <span>{rec.user}</span>
                        <span className="text-[10px] bg-rose-950 text-rose-400 px-1.5 rounded">
                          {rec.isRecording ? "Live Recording" : "Stored Sandbox"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-black italic">No screen recordings active currently</div>
                  )}
                </div>
              </div>

            </div>

            <div className="max-h-[110px] overflow-y-auto border p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-[12px]">
              <span className="text-[10px] uppercase font-bold text-black block mb-1">Diagnostic Override Logs</span>
              {itOverrideLogs.length === 0 ? (
                <div className="text-[10px] text-black italic font-mono">[0.00] No overrides dispatched in current system session.</div>
              ) : (
                itOverrideLogs.map(log => (
                  <div key={log.id} className="text-[10px] border-b pb-1 mb-1 font-mono text-black dark:text-white">
                    [{log.timestamp}] {log.action} - <span className="text-emerald-500 font-black">{log.status}</span>
                  </div>
                ))
              )}
            </div>

            {/* Unified Interactive Comms Archived Backups */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 border-slate-100 dark:border-slate-800 animate-fadeIn">
                <div>
                  <h4 className="font-extrabold text-[12px] text-black dark:text-white uppercase flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-indigo-500" />
                    Unified Interactive Comms IT Backup Vault
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Compliance log and recorded system interaction archives for all VoIP calls, virtual video consultations, and instant messaging chats. Available to Systems Administrator & IT.
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex gap-2">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Central Sync Active
                  </span>
                  <span className="bg-slate-100 text-slate-850 dark:bg-slate-800 dark:text-slate-300 border border-slate-205 dark:border-slate-750 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono">
                    AES-256
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Chats Interactions Backups */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 h-[260px] flex flex-col justify-between">
                  <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-100 dark:border-blue-900/50">
                    <span className="font-bold text-[11px] text-blue-700 dark:text-blue-400 uppercase flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      Instant Chats
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 font-mono">
                      {Object.keys(chatsData || {}).length} Chats
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] mt-2">
                    {Object.keys(chatsData || {}).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                        No chats recorded.
                      </div>
                    ) : (
                      Object.entries(chatsData || {}).map(([contact, messages]) => (
                        <div key={contact} className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/60 shadow-xs">
                          <div className="font-bold text-black dark:text-zinc-200 truncate">{contact}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5 font-mono truncate">
                            Last: {messages[messages.length - 1]?.message || "No messages"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Phone Call Backups */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 h-[260px] flex flex-col justify-between">
                  <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded border border-emerald-100 dark:border-emerald-900/50">
                    <span className="font-bold text-[11px] text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      VoIP Call Interact
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      {(callLogs || []).length} Logs
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] mt-2">
                    {(callLogs || []).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                        No call logs archived.
                      </div>
                    ) : (
                      (callLogs || []).map((log, i) => (
                        <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-1">
                          <div className="flex justify-between font-bold text-black dark:text-white">
                            <span className="truncate max-w-[100px]">{log.contactName}</span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{log.duration}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 flex justify-between font-mono">
                            <span>{log.timestamp} ({log.direction})</span>
                            <span className="text-blue-500 font-bold">{log.rate}</span>
                          </div>
                          <div className="text-[10px] italic text-zinc-650 dark:text-zinc-300 bg-slate-50 dark:bg-slate-900 p-1 rounded border border-slate-100 dark:border-slate-800 truncate">
                            {log.auditReport}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Video Meeting Backups */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 h-[260px] flex flex-col justify-between">
                  <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-950/20 p-2 rounded border border-rose-100 dark:border-rose-900/50">
                    <span className="font-bold text-[11px] text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      Virtual Consults
                    </span>
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 font-mono">
                      {(videoSessions || []).length} Meets
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] mt-2">
                    {(videoSessions || []).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                        No meetings recorded.
                      </div>
                    ) : (
                      (videoSessions || []).map((session, i) => (
                        <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-1">
                          <div className="flex justify-between font-bold text-black dark:text-white">
                            <span className="truncate max-w-[100px]">{session.clientName}</span>
                            <span className="text-[10px] font-mono text-rose-500 dark:text-rose-400">{session.duration}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            Room: {session.roomName} — {session.status}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HELPDESK & DIRECT RESPONSE WORKSPACE */}
        {activeTab === "helpdesk" && (
          <div className="space-y-4 animate-fade-in">
            {/* Top configuration panel (Capacity thresholds & Routing) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="lg:col-span-2 space-y-2">
                <h5 className="font-extrabold text-[12px] text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-605" /> High-Availability Service Desk Routing & Capacity Controls
                </h5>
                <p className="text-[11px] text-black">
                  Control ticket routing tiers, automatic escalations, and SLA warning thresholds for active CentriX system operators.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-white dark:bg-slate-905 border rounded-lg p-2.5">
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">
                      Default Support Escalation Tier
                    </label>
                    <select
                      value={defaultRoutingTier}
                      onChange={(e) => setDefaultRoutingTier(e.target.value)}
                      className="w-full text-[12px] p-1.5 border dark:bg-slate-800 bg-slate-50 dark:bg-slate-900 rounded font-semibold text-black dark:text-white"
                    >
                      <option value="Tier-1 Support">Tier-1 Front Desk Support (Internal Reception)</option>
                      <option value="Tier-2 Support">Tier-2 Core IT Engineers (L2 Support Ops)</option>
                      <option value="Tier-3 Support">Tier-3 Infrastructure Architects (L3 SysOps Admin)</option>
                    </select>
                  </div>

                  <div className="bg-white dark:bg-slate-905 border rounded-lg p-2.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-black mb-1 uppercase">
                      <span>Live Server Capacity threshold</span>
                      <span className="font-mono text-rose-500">{capacityThreshold}% Warn Limit</span>
                    </div>
                    <input 
                      type="range"
                      min="50"
                      max="98"
                      value={capacityThreshold}
                      onChange={(e) => setCapacityThreshold(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-705 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-black block mt-1">Triggers emergency diagnostics message upon threshold crossover.</span>
                  </div>
                </div>
              </div>

              {/* Quick stats panel */}
              <div className="bg-slate-900/95 dark:bg-slate-950 p-3 rounded-xl text-white font-mono text-[11px] space-y-2 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-black block tracking-wider">Live Desk Diagnostics Status</span>
                <div className="flex justify-between">
                  <span>Open Tickets:</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {(supportTickets || []).filter(t => t.status !== "Resolved").length} Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Critical Incidents:</span>
                  <span className="text-red-500 font-black animate-pulse">
                    {(supportTickets || []).filter(t => t.priority === "Critical" && t.status !== "Resolved").length} Live
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SLA Breaches:</span>
                  <span className="text-black">0 Compliant</span>
                </div>
                <div className="p-1 px-1.5 bg-slate-800 rounded text-[10px] text-black text-center tracking-normal">
                  🔄 Auto-Connected: CentriX Switchboard Hub
                </div>

                <div className="border-t border-slate-800 my-2 pt-2">
                  <span className="text-[10px] uppercase font-extrabold text-cyan-400 block tracking-wider mb-2">Upgraded 5-Tier CRM Lending Tickets</span>
                  <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px] tracking-tighter">
                    <div className="bg-blue-950/40 p-1 border border-blue-900/40 rounded flex flex-col justify-between">
                      <span className="text-blue-400 font-bold block mb-0.5">NEW</span>
                      <span className="text-white text-[10px] font-black">{(tickets || []).filter(t => t.ticketStatus === "New").length}</span>
                    </div>
                    <div className="bg-amber-950/40 p-1 border border-amber-900/40 rounded flex flex-col justify-between">
                      <span className="text-amber-400 font-bold block mb-0.5">PROG</span>
                      <span className="text-white text-[10px] font-black">{(tickets || []).filter(t => t.ticketStatus === "In Progress").length}</span>
                    </div>
                    <div className="bg-purple-950/40 p-1 border border-purple-900/40 rounded flex flex-col justify-between">
                      <span className="text-purple-400 font-bold block mb-0.5">REV</span>
                      <span className="text-white text-[10px] font-black">{(tickets || []).filter(t => t.ticketStatus === "Review").length}</span>
                    </div>
                    <div className="bg-emerald-950/40 p-1 border border-emerald-900/40 rounded flex flex-col justify-between">
                      <span className="text-emerald-400 font-bold block mb-0.5">DONE</span>
                      <span className="text-white text-[10px] font-black">{(tickets || []).filter(t => t.ticketStatus === "Completed").length}</span>
                    </div>
                    <div className="bg-rose-950/40 p-1 border border-rose-900/40 rounded flex flex-col justify-between">
                      <span className="text-rose-400 font-bold block mb-0.5">REJ</span>
                      <span className="text-white text-[10px] font-black">{(tickets || []).filter(t => t.ticketStatus === "Rejected").length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Ticketing Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column (5/12): Ticket List & Filters & Submit Form */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 shadow-xs border dark:border-slate-850 p-3 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-blue-500" /> Queue Filters
                    </span>
                    <button
                      type="button"
                      onClick={() => { setTicketFilterStatus("All"); setTicketFilterPriority("All"); }}
                      className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Reset Filter Lists
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Status</label>
                      <select
                        value={ticketFilterStatus}
                        onChange={(e) => setTicketFilterStatus(e.target.value)}
                        className="w-full p-1 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded text-black dark:text-white"
                      >
                        <option value="All">All statuses</option>
                        <option value="Open">🟢 Open</option>
                        <option value="In-Progress">⚡ In-Progress</option>
                        <option value="Resolved">✓ Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Priority</label>
                      <select
                        value={ticketFilterPriority}
                        onChange={(e) => setTicketFilterPriority(e.target.value)}
                        className="w-full p-1 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded text-black dark:text-white"
                      >
                        <option value="All">All priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tickets Queue Feed List */}
                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-850/60 border-b dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-black">
                      Helpdesk Tickets Queue ({(supportTickets || []).filter(t => {
                        const matchStatus = ticketFilterStatus === "All" || t.status === ticketFilterStatus;
                        const matchPriority = ticketFilterPriority === "All" || t.priority === ticketFilterPriority;
                        return matchStatus && matchPriority;
                      }).length} items)
                    </span>
                  </div>

                  <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {(supportTickets || []).filter(t => {
                      const matchStatus = ticketFilterStatus === "All" || t.status === ticketFilterStatus;
                      const matchPriority = ticketFilterPriority === "All" || t.priority === ticketFilterPriority;
                      return matchStatus && matchPriority;
                    }).length === 0 ? (
                      <div className="p-8 text-center text-black italic text-[12px]">
                        No support tickets match the selected filters.
                      </div>
                    ) : (
                      (supportTickets || []).filter(t => {
                        const matchStatus = ticketFilterStatus === "All" || t.status === ticketFilterStatus;
                        const matchPriority = ticketFilterPriority === "All" || t.priority === ticketFilterPriority;
                        return matchStatus && matchPriority;
                      }).map((t) => {
                        const isSelected = selectedSupportTicketId === t.id;
                        
                        // Priority badges colors
                        const priorityColors = {
                          Low: "bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-200",
                          Medium: "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200/40",
                          High: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-200/40",
                          Critical: "bg-red-105 dark:bg-red-950/30 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-900"
                        }[t.priority];

                        // Status Badge style
                        const statusColors = {
                          Open: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/30",
                          "In-Progress": "bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/30",
                          Resolved: "bg-slate-100 text-black dark:bg-slate-800 dark:text-white"
                        }[t.status];

                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => { setSelectedSupportTicketId(t.id); setIsITTicketModalOpen(true); }}
                            className={`w-full p-3 text-left transition flex flex-col gap-2 focus:outline-hidden ${
                              isSelected 
                                ? "bg-slate-50 dark:bg-slate-850/60 border-l-4 border-blue-605" 
                                : "hover:bg-slate-50/50 dark:hover:bg-slate-850/10"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-mono text-[10px] text-black font-extrabold tracking-wider">{t.id}</span>
                              <div className="flex items-center gap-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black ${priorityColors}`}>
                                  {t.priority}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColors}`}>
                                  {t.status}
                                </span>
                              </div>
                            </div>

                            <div>
                              <h6 className="font-bold text-[12px] text-black dark:text-white line-clamp-1">
                                {t.subject}
                              </h6>
                              <div className="text-[10px] text-black mt-1 flex items-center justify-between">
                                <span className="font-medium text-black dark:text-white">🙋‍♂️ {t.user} ({t.department})</span>
                                <span className="text-[10px] font-mono text-black">{t.createdAt}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Form to submit a new Support Ticket (Interactive simulation) */}
                <form onSubmit={handleCreateSupportTicketLocal} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-3.5 space-y-3 font-sans shadow-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-black tracking-wider block">Submit Support Request on Client's Behalf</span>
                    <p className="text-[10px] text-black mt-0.5">Simulate a service desk agent logging a ticket into the live system queues.</p>
                  </div>

                  {ticketSuccessMsg && (
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-[12px] rounded-lg font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{ticketSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="text-[10px] font-bold text-black uppercase block mb-0.5">Assign User</label>
                      <select
                        value={newTicketUser}
                        onChange={(e) => {
                          setNewTicketUser(e.target.value);
                          // Assign department automatically
                          const matched = employees.find(emp => emp.name === e.target.value);
                          if (matched) setNewTicketDept(matched.department);
                        }}
                        className="w-full p-1.5 border dark:bg-slate-800 bg-transparent dark:border-slate-700 text-[12px] rounded text-black dark:text-white"
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.name}>{emp.name}</option>
                        ))}
                        <option value="Active Reception Guest">Active Reception Guest</option>
                        <option value="Public Client Sandbox">External Web Customer</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-black uppercase block mb-0.5">Priority Flag</label>
                      <select
                        value={newTicketPriority}
                        onChange={(e) => setNewTicketPriority(e.target.value as any)}
                        className="w-full p-1.5 border dark:bg-slate-800 bg-transparent dark:border-slate-700 text-[12px] rounded text-black dark:text-white"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Critical">⚠️ Critical Outage</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-[11px]">
                    <label className="text-[10px] font-bold text-black uppercase block mb-0.5">Problem Summary Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Cannot load supporting documentation PDF"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      className="w-full p-1.5 border dark:bg-slate-800 bg-transparent dark:border-slate-700 text-[12px] rounded text-black dark:text-white"
                    />
                  </div>

                  <div className="text-[11px]">
                    <label className="text-[10px] font-bold text-black uppercase block mb-0.5">Fault Details / Diagnostic Description</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Describe what occurs, error codes, screenshots metadata..."
                      value={newTicketDesc}
                      onChange={(e) => setNewTicketDesc(e.target.value)}
                      className="w-full p-1.5 border dark:bg-slate-800 bg-transparent dark:border-slate-700 rounded text-black dark:text-white font-mono text-[11px] leading-tight"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[12px] uppercase rounded-lg shadow-sm transition flex items-center justify-center gap-1 cursor-pointer font-sans"
                  >
                    <Plus className="w-3.5 h-3.5" /> Dispatch Support Ticket to Core IT
                  </button>
                </form>

              </div>

              {/* Right Column (7/12): Detailed Ticket view & DIRECT RESPONSE LINE */}
              <div className="lg:col-span-7">
                {selectedSupportTicketId && (supportTickets || []).find(t => t.id === selectedSupportTicketId) ? (() => {
                  const t = (supportTickets || []).find(tk => tk.id === selectedSupportTicketId)!;
                  
                  // Status Color codes
                  const priorityColors = {
                    Low: "bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-200",
                    Medium: "bg-yellow-105 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200",
                    High: "bg-orange-105 dark:bg-orange-950/30 text-orange-800 dark:text-orange-400 border border-orange-200",
                    Critical: "bg-red-105 dark:bg-red-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-900"
                  }[t.priority];

                  return (
                    <div id="it-direct-workspace-card" className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-full justify-between shadow-xs">
                      
                      {/* Ticket header details */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-black dark:text-white">
                              {t.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide rounded ${priorityColors}`}>
                              {t.priority}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-[12px] text-black dark:text-white mt-1.5">{t.subject}</h4>
                          <span className="text-[11px] text-black mt-0.5 block font-medium">
                            Logged by: <strong className="text-black dark:text-white font-bold">{t.user}</strong> ({t.department}) • <span className="font-mono text-[10px]">{t.createdAt}</span>
                          </span>
                        </div>

                        {/* Interactive state controls directly on the ticket */}
                        <div className="flex flex-col gap-1 text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border dark:border-slate-850">
                          <span className="text-[10px] uppercase font-bold text-black block mb-0.5">Access Controls</span>
                          
                          <div className="flex items-center gap-1.5">
                            <select
                              value={t.status}
                              onChange={(e) => onUpdateSupportTicketStatus(t.id, e.target.value)}
                              className="text-[11px] font-bold p-1 bg-transparent border-b border-dashed dark:border-slate-750 text-black dark:text-white focus:outline-hidden cursor-pointer"
                            >
                              <option value="Open">🟢 Status: Open</option>
                              <option value="In-Progress">⚡ Status: In-Progress</option>
                              <option value="Resolved">✓ Status: Resolved</option>
                            </select>

                            <select
                              value={t.priority}
                              onChange={(e) => onUpdateSupportTicketStatus(t.id, undefined, e.target.value as any)}
                              className="text-[11px] font-bold p-1 bg-transparent border-b border-dashed dark:border-slate-755 text-black dark:text-white focus:outline-hidden cursor-pointer"
                            >
                              <option value="Low">Low Priority</option>
                              <option value="Medium">Medium Priority</option>
                              <option value="High">High Priority</option>
                              <option value="Critical">Critical Priority</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Complaint Details box */}
                      <div className="p-4 bg-slate-50/50 dark:bg-slate-850/20 border-b dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold text-black uppercase tracking-widest block">Core Ticket Complaint Logs</span>
                        <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] leading-relaxed text-black dark:text-white">
                          {t.description}
                        </div>
                      </div>

                      {/* Live Communications Replies Stream feed */}
                      <div className="p-4 space-y-3 max-h-[220px] overflow-y-auto bg-slate-55/40 dark:bg-slate-900/40">
                        <span className="text-[10px] font-bold text-black uppercase tracking-widest block">Secured Inter-Agent Switchboard Records</span>
                        
                        {(t.replies || []).length === 0 ? (
                          <div className="p-6 text-center text-black italic text-[11px]">
                            No diagnostic logs established. Initiate the response line to direct message the CentriX system user.
                          </div>
                        ) : (
                          (t.replies || []).map((rep) => {
                            const isIT = rep.sender.toLowerCase().includes("it") || rep.sender.toLowerCase().includes("ops") || rep.sender.toLowerCase().includes("admin") || rep.sender.toLowerCase().includes("dev") || rep.sender.toLowerCase().includes("patel") || rep.sender.toLowerCase().includes("sys");
                            return (
                              <div 
                                key={rep.id} 
                                className={`flex flex-col gap-1 max-w-[85%] ${
                                  isIT ? "ml-auto items-end" : "mr-auto items-start"
                                }`}
                              >
                                <div className="text-[10px] text-black flex items-center gap-1">
                                  <span className="font-bold">{rep.sender}</span>
                                  <span className="font-mono text-[10px]">({rep.timestamp})</span>
                                </div>
                                
                                <div className={`p-2.5 rounded-xl text-[12px] ${
                                  isIT 
                                    ? "bg-blue-600 text-white rounded-tr-none" 
                                    : "bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-200 rounded-tl-none border dark:border-slate-700"
                                }`}>
                                  {rep.message}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Direct Response Line form (Satisfies requirements) */}
                      <form onSubmit={handleReplySupportTicketLocal} className="p-4 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-black tracking-wider text-black dark:text-white flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-blue-600" /> Direct Responder Interface
                          </label>
                          <span className="text-[10px] text-emerald-500 font-mono font-bold">● Live Response Channel</span>
                        </div>

                        {replySuccessMsg && (
                          <div className="p-1 px-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 text-[11px] rounded border border-emerald-150/40 font-bold">
                            ✓ {replySuccessMsg}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[12px]">
                          <div className="md:col-span-1">
                            <label className="text-[10px] font-bold text-black block mb-0.5">Responder ID Code</label>
                            <input
                              type="text"
                              required
                              value={itResponderName}
                              onChange={(e) => setItResponderName(e.target.value)}
                              className="w-full p-2 border dark:bg-slate-800 bg-transparent dark:border-slate-700 rounded font-semibold text-black dark:text-white"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-[10px] font-bold text-black block mb-0.5">Type direct response back to user</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                required
                                placeholder={`Type responsive action info back to ${t.user}...`}
                                value={directReplyMessage}
                                onChange={(e) => setDirectReplyMessage(e.target.value)}
                                className="w-full p-2 border dark:bg-slate-800 bg-transparent dark:border-slate-700 rounded text-black dark:text-white text-[12px]"
                              />
                              <button
                                type="submit"
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center cursor-pointer"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-2 bg-amber-50/50 dark:bg-amber-950/20 border-l-2 border-amber-500 rounded text-[10px] text-amber-800 dark:text-amber-300 leading-tight">
                          📜 Direct replies are stored securely in CentriX ledger archives, alerting the active workstation immediately in compliance with core global privacy requirements.
                        </div>
                      </form>

                    </div>
                  );
                })() : (
                  <div className="border hover:border-slate-300 dark:hover:border-slate-750 transition-all rounded-xl p-8 bg-slate-50/30 dark:bg-slate-900/20 text-center text-black italic h-full flex flex-col justify-center items-center gap-2">
                    <AlertCircle className="w-8 h-8 text-black animate-pulse" />
                    <span className="text-[12px] font-semibold">Please select an active IT Helpdesk Support Ticket from the queue.</span>
                    <p className="text-[10px] text-black max-w-sm">
                      Opening a ticket establishes a direct compliance response line to let IT reply to the user immediately.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Knowledge base administrative desk */}
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-4 text-[12px] space-y-4 shadow-xs mt-4">
              <div>
                <h5 className="font-extrabold text-[11px] text-black uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-blue-500" /> FAQ Knowledge Base Content Manager
                </h5>
                <p className="text-[10px] text-black">
                  Update general self-service articles on the CentriX Corporate Portal view.
                </p>
              </div>

              <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 font-mono text-[10px]">
                {faqs.map(faq => (
                  <div key={faq.id} className="p-2 border dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 relative group">
                    <button 
                      type="button"
                      onClick={() => setFaqs(faqs.filter(f => f.id !== faq.id))}
                      className="absolute right-2 top-2 text-black hover:text-rose-500 text-[12px] font-bold cursor-pointer transition"
                    >
                      ✕ Remove Article
                    </button>
                    <div className="font-bold text-black dark:text-slate-200">Q: {faq.question}</div>
                    <div className="text-black text-[10px] mt-0.5">A: {faq.answer}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddFaq} className="space-y-1">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-850 p-2 rounded border dark:border-slate-800 border-dashed">
                  <div>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter FAQ Title Question..." 
                      value={newFaqQ}
                      onChange={(e) => setNewFaqQ(e.target.value)}
                      className="p-1.5 text-[12px] border dark:border-slate-800 rounded bg-white dark:bg-slate-900 w-full text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter Detailed FAQ Answer..." 
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      className="p-1.5 text-[12px] border dark:border-slate-800 rounded bg-white dark:bg-slate-900 w-full text-black dark:text-white"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[12px] uppercase transition cursor-pointer">
                  Publish Article to Corporate Portal Knowledge Base
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* Interactive IT Support Ticket Modal */}
      {isITTicketModalOpen && selectedSupportTicketId && (() => {
        const t = (supportTickets || []).find(tk => tk.id === selectedSupportTicketId);
        if (!t) return null;

        const currentNotes = itDiagnosticLog[t.id] || "";
        return (
          <div id="itHelpdeskTicketModal" className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col hover:border-transparent">
              
              {/* Modal Header */}
              <div className="p-6 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-855 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-105 dark:bg-purple-950 text-purple-600 rounded-xl">
                     <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-black text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded uppercase">{t.id}</span>
                      <span className="text-xs text-slate-400 font-bold">IT Support Desk Ticket</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">{t.subject}</h3>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsITTicketModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
                
                {/* Meta details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-855 rounded-2xl flex flex-wrap gap-4 justify-between items-center text-xs text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-black">Logged By Employee</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{t.user}</strong> ({t.department})
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-black">Created At</span>
                    <span>{t.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-black">Current Status</span>
                    <span className={`font-black px-1.5 py-0.5 rounded ${
                      t.status === 'Open' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' :
                      t.status === 'In-Progress' ? 'text-blue-700 bg-blue-50 dark:bg-blue-900/20' :
                      'text-slate-700 bg-slate-200 dark:bg-slate-800'
                    }`}>{t.status}</span>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Reported Problem Description</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 font-mono text-xs rounded-xl border dark:border-slate-800 text-slate-800 dark:text-slate-202 leading-normal whitespace-pre-wrap">
                    {t.description || "No diagnostics information is attached. User reports they cannot retrieve system authorization tokens."}
                  </div>
                </div>

                {/* Response / Reply Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Modify Ticket Status</label>
                    <select
                      value={t.status}
                      onChange={(e) => {
                        onUpdateSupportTicketStatus(t.id, e.target.value);
                        setReplySuccessMsg(`Ticket status transitioned to: ${e.target.value}`);
                        setTimeout(() => setReplySuccessMsg(""), 3000);
                      }}
                      className="w-full text-xs p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-xl text-slate-904 dark:text-white"
                    >
                      <option value="Open">🟢 Status: Open</option>
                      <option value="In-Progress">⚡ Status: In-Progress (Assigned)</option>
                      <option value="Resolved">✓ Status: Resolved (Fixed)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Override Priority Flag</label>
                    <select
                      value={t.priority}
                      onChange={(e) => {
                        onUpdateSupportTicketStatus(t.id, undefined, e.target.value as any);
                        setReplySuccessMsg(`Priority updated successfully to: ${e.target.value}`);
                        setTimeout(() => setReplySuccessMsg(""), 3000);
                      }}
                      className="w-full text-xs p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-xl text-slate-904 dark:text-white"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Critical">⚠️ Critical Outage Tier</option>
                    </select>
                  </div>
                </div>

                {/* Reply form */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">Direct Message Dispatch Line</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={directReplyMessage}
                      onChange={(e) => setDirectReplyMessage(e.target.value)}
                      placeholder="Type a direct diagnostic reply back to the user or issue support checklist guidelines..."
                      className="flex-1 text-xs p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl text-slate-900 dark:text-white font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!directReplyMessage) return;
                        setReplySuccessMsg(`Message successfully dispatched to ${t.user}!`);
                        setDirectReplyMessage("");
                        setTimeout(() => setReplySuccessMsg(""), 4000);
                      }}
                      className="px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Send Reply
                    </button>
                  </div>
                  {replySuccessMsg && (
                    <div className="text-[11px] text-emerald-600 font-bold font-mono mt-1">✓ {replySuccessMsg}</div>
                  )}
                </div>

                {/* Diagnostic Remote Tools (Action Commands) */}
                <div className="space-y-2 pt-2 border-t dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider font-sans">Interactive Diagnostics Override (Direct Hardware/Network Controls)</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setItDeviceDiagnosticsRunning(true);
                        setItDiagnosticLog(prev => ({
                          ...prev,
                          [t.id]: `[${new Date().toLocaleTimeString()}] PING_RESPONSE_OK: Inbound gateway packet route is clear (Avg latency 14ms). Host system online.\n` + (prev[t.id] || "")
                        }));
                        setTimeout(() => setItDeviceDiagnosticsRunning(false), 800);
                      }}
                      className="p-2 border dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1 text-slate-800 dark:text-slate-200"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-cyan-500 ${itDeviceDiagnosticsRunning ? 'animate-spin' : ''}`} /> Run Remote Ping Check
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReplySuccessMsg("SSO Token refreshed. Active MFA lock released.");
                        setItDiagnosticLog(prev => ({
                          ...prev,
                          [t.id]: `[${new Date().toLocaleTimeString()}] AUTH_RESET: Revoked existing security cookie, generated temporary MFA registration token for device.\n` + (prev[t.id] || "")
                        }));
                        setTimeout(() => setReplySuccessMsg(""), 4000);
                      }}
                      className="p-2 border dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1 text-slate-800 dark:text-slate-200"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-500" /> Force MFA Reset
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSupportTicketStatus(t.id, "Resolved");
                        setItDiagnosticLog(prev => ({
                          ...prev,
                          [t.id]: `[${new Date().toLocaleTimeString()}] STATE_RESOLVED: Closed support ticket ST-0210. Dispatched resolution receipt.\n` + (prev[t.id] || "")
                        }));
                        setSelectedSupportTicketId(null);
                        setIsITTicketModalOpen(false);
                      }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve & Close Ticket
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReplySuccessMsg("L3 Technical SLA alert triggered to Infrastructure Architects!");
                        setTimeout(() => setReplySuccessMsg(""), 4000);
                      }}
                      className="p-2 bg-red-650 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> Escalate to Tier 3 L3
                    </button>
                  </div>
                </div>

                {/* Logs printed output */}
                {currentNotes && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-black uppercase text-slate-400 block">Workspace Actions History logs</span>
                    <pre className="p-2.5 bg-slate-900 border border-slate-950 text-emerald-400 rounded-xl text-[9px] font-mono leading-relaxed h-[80px] overflow-y-auto whitespace-pre-wrap text-left">
                      {currentNotes}
                    </pre>
                  </div>
                )}

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
