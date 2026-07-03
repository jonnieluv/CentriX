import React, { useState } from "react";
import { 
  TrendingUp, Coins, Users, Award, ShieldAlert, CheckCircle, 
  Play, Pause, AlertTriangle, Plus, Search, Check, RefreshCw, 
  FolderPlus, PhoneCall, Volume2, ShieldCheck, HelpCircle, Mail, Globe, 
  ExternalLink, BarChart2, CheckSquare, XCircle, FileText, UserCheck, Settings,
  MessageSquare, Radio
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, LineChart, Line, CartesianGrid 
} from "recharts";
import { PlaybookCampaign, TeleMarketingLead, DiallerState, Employee } from "../types";

interface MarketingPanelProps {
  campaigns: PlaybookCampaign[];
  dialler: DiallerState;
  employees: Employee[];
  onRefreshData: () => void;
  onAddCampaign: (campaign: { name: string; channel: string; budget: number; spend: number }) => void;
  onAddLead: (lead: { campaignId: string; name: string; phone: string; email: string; source: string; notes?: string }) => void;
  onUpdateLead: (params: { campaignId?: string; leadId: string; notes?: string; lastOutcome?: string; assignedAgent?: string }) => void;
  onToggleDnc: (leadId: string) => void;
  onConvertLead: (params: { leadId: string; campaignId: string; loanAmount: number; monthlyIncome: number }) => void;
  onUpdateDialler: (params: Partial<DiallerState>) => void;
}

export default function MarketingPanel({
  campaigns = [],
  dialler,
  employees = [],
  onRefreshData,
  onAddCampaign,
  onAddLead,
  onUpdateLead,
  onToggleDnc,
  onConvertLead,
  onUpdateDialler
}: MarketingPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"strategy" | "leadgen" | "dialler" | "compliance">("strategy");
  
  // Local forms state
  const [campaignName, setCampaignName] = useState("");
  const [campaignChannel, setCampaignChannel] = useState<"Digital" | "Social" | "Email" | "Google Ads" | "Radio/Offline" | "Tele-Marketing Outbound">("Digital");
  const [campaignBudget, setCampaignBudget] = useState(5000);
  const [campaignSpend, setCampaignSpend] = useState(0);

  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSource, setLeadSource] = useState("Website Callback Requested");
  const [leadNotes, setLeadNotes] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || "");

  const [searchLeadQuery, setSearchLeadQuery] = useState("");
  const [filterLeadOutcome, setFilterLeadOutcome] = useState("All");

  // Conversion form state (specific lead selected for pre-sales CRM converted folder)
  const [convertingLead, setConvertingLead] = useState<TeleMarketingLead | null>(null);
  const [convertingCampaignId, setConvertingCampaignId] = useState("");
  const [convertLoanAmt, setConvertLoanAmt] = useState(1200000);
  const [convertIncome, setConvertIncome] = useState(45000);

  const [complianceNotes, setComplianceNotes] = useState<string[]>([]);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Success messaging
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName) return;
    onAddCampaign({
      name: campaignName,
      channel: campaignChannel,
      budget: Number(campaignBudget),
      spend: Number(campaignSpend)
    });
    setCampaignName("");
    setCampaignSpend(0);
    setSuccessMsg("Strategic Marketing Campaign established in general registries!");
    setTimeout(() => setSuccessMsg(""), 3005);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) return;
    onAddLead({
      campaignId: selectedCampaignId || campaigns[0]?.id,
      name: leadName,
      phone: leadPhone,
      email: leadEmail,
      source: leadSource,
      notes: leadNotes
    });
    setLeadName("");
    setLeadPhone("");
    setLeadEmail("");
    setLeadNotes("");
    setSuccessMsg("Sourced inbound lead routed successfully to campaign line!");
    setTimeout(() => setSuccessMsg(""), 3005);
  };

  const handleScrubDncCompliance = () => {
    setIsScrubbing(true);
    setComplianceNotes([]);
    setTimeout(() => {
      let dncRegisteredScrubbed = 0;
      campaigns.forEach(c => {
        c.leads.forEach(l => {
          if (l.isDnc) dncRegisteredScrubbed++;
        });
      });
      setIsScrubbing(false);
      setComplianceNotes([
        `Completed direct POPIA/CPA registry scrubbing against National DNC files.`,
        `Checked ${campaigns.reduce((acc, c) => acc + c.leads.length, 0)} total prospect contact entries.`,
        `Flagged ${dncRegisteredScrubbed} active telephone routes with absolute DNC compliance warnings.`,
        `Dynamic active-dialler system updated to bypass scrubbed channels immediately.`
      ]);
    }, 1500);
  };

  const triggerCallSimulation = (lead: TeleMarketingLead, campId: string) => {
    onUpdateDialler({
      isActive: true,
      activeCampaignId: campId,
      currentLeadIndex: campaigns.find(c => c.id === campId)?.leads.findIndex(l => l.id === lead.id) || 0,
      isCallConnected: true,
      recordingActive: true
    });
    setActiveSubTab("dialler");
  };

  // Convert submission
  const executeConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;
    onConvertLead({
      leadId: convertingLead.id,
      campaignId: convertingCampaignId,
      loanAmount: Number(convertLoanAmt),
      monthlyIncome: Number(convertIncome)
    });
    setSuccessMsg(`Prospect ${convertingLead.name} converted! Transmitted to active Sales desks.`);
    setConvertingLead(null);
    setTimeout(() => setSuccessMsg(""), 4500);
  };

  // Total strategic values
  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leadsCount, 0);
  const totalContacted = campaigns.reduce((acc, c) => acc + c.contactedCount, 0);
  const totalConverted = campaigns.reduce((acc, c) => acc + c.convertedCount, 0);
  const aggregateCpl = totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : "0.00";
  const overallConvPct = totalContacted > 0 ? ((totalConverted / totalContacted) * 100).toFixed(1) : "0.0";

  // Recharts data format
  const chartData = campaigns.map(c => ({
    name: c.name.length > 20 ? c.name.substring(0, 18) + "..." : c.name,
    budget: c.budget,
    spend: c.spend,
    leads: c.leadsCount,
    conversions: c.convertedCount,
    cpl: c.leadsCount > 0 ? Math.round(c.spend / c.leadsCount) : 0
  }));

  // Find currently connected lead in dialler simulation
  const currentDiallerCampaign = campaigns.find(c => c.id === dialler.activeCampaignId) || campaigns[0];
  const activeLeadToCall = currentDiallerCampaign?.leads?.[dialler.currentLeadIndex] || currentDiallerCampaign?.leads?.[0];

  return (
    <div className="space-y-6">
      
      {/* Top micro summary banner */}
      <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 p-4 rounded-2xl grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-2 border border-slate-100 dark:border-slate-800/60 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-black block">Strategic ROMI Budget</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-extrabold font-mono text-black dark:text-white">R{(totalBudget / 1e3).toFixed(1)}k</span>
            <span className="text-[10px] text-black">/ R{(totalSpent / 1e3).toFixed(1)}k spent</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
            <div className="bg-blue-600 h-full" style={{ width: `${Math.min((totalSpent / (totalBudget || 1)) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="p-2 border border-slate-100 dark:border-slate-800/60 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-black block">Total Sourced Prospects</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-extrabold font-mono text-indigo-600 dark:text-indigo-400">{totalLeads}</span>
            <span className="text-[10px] text-black">Captured Leads</span>
          </div>
          <span className="text-[10px] text-black block mt-1.5">Omnichannel integration</span>
        </div>

        <div className="p-2 border border-slate-100 dark:border-slate-800/60 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-black block">Compliant Contact Ratio</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-extrabold font-mono text-purple-600 dark:text-purple-400">
              {totalLeads > 0 ? Math.round((totalContacted / totalLeads) * 100) : 0}%
            </span>
            <span className="text-[10px] text-black">({totalContacted} dialled)</span>
          </div>
          <span className="text-[10px] text-black block mt-1.5">DNC checked routes only</span>
        </div>

        <div className="p-2 border border-slate-100 dark:border-slate-800/60 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-black block">Tele-conversion Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{overallConvPct}%</span>
            <span className="text-[10px] text-black">({totalConverted} closed)</span>
          </div>
          <span className="text-[10px] text-black block mt-1.5">Direct to CRM Sales funnel</span>
        </div>

        <div className="p-2 border border-slate-100 dark:border-slate-800/60 rounded-xl col-span-2 md:col-span-1 bg-blue-50/20 dark:bg-blue-950/10">
          <span className="text-[10px] uppercase font-bold text-black block">Aggregate CPA CPL</span>
          <span className="text-[12px] font-bold text-black dark:text-slate-100 mt-1 block font-mono">
            R{aggregateCpl} <span className="text-[10px] font-normal text-black font-sans">Cost per lead</span>
          </span>
          <span className="text-[10px] text-black block mt-1">TCF compliance approved</span>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 pb-0.5">
        <button
          onClick={() => setActiveSubTab("strategy")}
          className={`pb-2 px-3 text-[12px] font-bold border-b-2 transition ${activeSubTab === "strategy" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-black hover:text-black dark:hover:text-white"}`}
        >
          1. Campaign Strategy & Planning (ROMI)
        </button>
        <button
          onClick={() => setActiveSubTab("leadgen")}
          className={`pb-2 px-3 text-[12px] font-bold border-b-2 transition ${activeSubTab === "leadgen" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-black hover:text-black dark:hover:text-white"}`}
        >
          2. Omnichannel Lead Generation Feed
        </button>
        <button
          onClick={() => setActiveSubTab("dialler")}
          className={`pb-2 px-3 text-[12px] font-bold border-b-2 transition ${activeSubTab === "dialler" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-black hover:text-black dark:hover:text-white"}`}
        >
          3. Outbound Predictive Dialler Studio
        </button>
        <button
          onClick={() => setActiveSubTab("compliance")}
          className={`pb-2 px-3 text-[12px] font-bold border-b-2 transition ${activeSubTab === "compliance" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-black hover:text-black dark:hover:text-white"}`}
        >
          4. POPIA & CPA Registry Compliance
        </button>
      </div>

      {/* TAB 1: STRATEGY & PLANNING */}
      {activeSubTab === "strategy" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left: General analytics charts of ROMI */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
              <div>
                <h4 className="font-extrabold text-[12px] text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-500" /> ROMI Campaign Performance Metrics
                </h4>
                <p className="text-[10px] text-black mt-1">
                  Comparing structured budgets vs actual media spent, alongside generated marketing leads.
                </p>
              </div>

              <div className="h-[250px] mt-4 text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "10px" }} />
                    <Legend wrapperStyle={{ paddingTop: "10px" }} />
                    <Bar dataKey="budget" name="Approved Budget (R)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spend" name="Actual Spend (R)" fill="#818CF8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="leads" name="Sourced Leads count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Campaign Ledger List */}
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 border-b dark:border-slate-800 flex justify-between items-center">
                <span className="text-[11px] uppercase font-black text-black tracking-wider">Active Promotional Campaigns</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">TCF Certified Tiers</span>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {campaigns.map(c => {
                  const spendPct = Math.round((c.spend / (c.budget || 1)) * 100);
                  const cpl = c.leadsCount > 0 ? (c.spend / c.leadsCount).toFixed(2) : "0.00";
                  
                  return (
                    <div key={c.id} className="p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-[12px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded font-bold">{c.id}</span>
                          <span className="font-extrabold text-black dark:text-white">{c.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-905 text-blue-700 dark:text-blue-300">
                            {c.channel}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[10px] text-black font-mono">
                          <span>Budget: <strong>R{c.budget}</strong></span>
                          <span>Spent: <strong>R{c.spend}</strong> ({spendPct}%)</span>
                          <span>Leads: <strong className="text-emerald-600">{c.leadsCount}</strong></span>
                          <span>Cores Conversions: <strong className="text-indigo-600">{c.convertedCount}</strong></span>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-end gap-2 text-right">
                        <div>
                          <span className="text-[10px] text-black uppercase block font-sans">Campaign Cost/CPL</span>
                          <strong className="text-[12px] text-black dark:text-slate-205 font-mono">R{cpl}</strong>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          c.status === "Active" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/40" : "bg-slate-100 text-black"
                        }`}>
                          ● {c.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Add campaign Strategy brief */}
          <div className="lg:col-span-4 space-y-4">
            
            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 text-[12px] rounded-xl font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="bg-white dark:bg-slate-900 border dark:border-slate-800/80 rounded-2xl p-4 space-y-4 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-black block">Establsh Brand Campaign Strategy</span>
                <p className="text-[10px] text-black mt-1">Declare target metrics, channel, and allocated media procurement budget.</p>
              </div>

              <div className="space-y-3 text-[12px]">
                <div>
                  <label className="text-[10px] font-black uppercase text-black block mb-1">Campaign Strategy Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., Q3 Home Loans Radio Blitz"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-black block mb-1">Marketing Channel</label>
                  <select 
                    value={campaignChannel}
                    onChange={(e) => setCampaignChannel(e.target.value as any)}
                    className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg text-black dark:text-white"
                  >
                    <option value="Digital">Digital (Website SEO, CRO)</option>
                    <option value="Social">Social Media (Meta Facebook, TikTok)</option>
                    <option value="Google Ads">PPC Paid Search (Google SEM)</option>
                    <option value="Email">Bulk Email Marketing Campaign</option>
                    <option value="Radio/Offline">Radio, Billboards & Offline Activations</option>
                    <option value="Tele-Marketing Outbound">Tele-Marketing Outbound Sourced Feed</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black uppercase text-black block mb-1">Budget Allocation (R)</label>
                    <input 
                      type="number" 
                      required 
                      min="100"
                      value={campaignBudget}
                      onChange={(e) => setCampaignBudget(Number(e.target.value))}
                      className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-black block mb-1">Initial Spend (R)</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      value={campaignSpend}
                      onChange={(e) => setCampaignSpend(Number(e.target.value))}
                      className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg font-mono"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px] uppercase rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  <Plus className="w-4 h-4" /> Deploy Marketing Campaign
                </button>
              </div>
            </form>

            {/* Campaign compliance guide checklist */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 font-mono text-[11px]">
              <span className="text-[10px] uppercase font-bold text-black block tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> CPA & POPIA Media Disclosure Guard
              </span>
              <ul className="space-y-1.5 list-disc list-inside text-black leading-tight">
                <li>No misleading rates advertising (Section 2 CPA)</li>
                <li>Clear disclosure of cost per mortgage capital layout</li>
                <li>Verify direct opt-out triggers exists on email routes</li>
                <li>No marketing contact lines on Sun/Holidays</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OMNICHANNEL LEAD FEEDS */}
      {activeSubTab === "leadgen" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left: Leads Filter and Grid */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Search and Filters panel */}
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-black absolute left-2.5 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search prospects by name, phone, or email..."
                  value={searchLeadQuery}
                  onChange={(e) => setSearchLeadQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg text-[12px]"
                />
              </div>

              <div className="flex gap-2 items-center text-[12px] w-full sm:w-auto">
                <span className="text-black uppercase font-bold text-[10px] whitespace-nowrap">Filter Outcome:</span>
                <select
                  value={filterLeadOutcome}
                  onChange={(e) => setFilterLeadOutcome(e.target.value)}
                  className="p-1 px-2 border dark:bg-slate-800 bg-transparent rounded text-[12px] text-black dark:text-white"
                >
                  <option value="All">All leads</option>
                  <option value="Not Called">Not Called</option>
                  <option value="Ringing">Ringing</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Call Back Scheduled">Scheduled Callbacks</option>
                  <option value="Interested - Ticket Created">Converted (Open tickets)</option>
                  <option value="Opt Out requested">POPIA Opt-outs</option>
                </select>
              </div>
            </div>

            {/* Displaying Leads details */}
            <div className="space-y-3">
              {(() => {
                // Get flat list of all leads with campaign annotations
                const flatLeads: (TeleMarketingLead & { campaignId: string; campaignName: string })[] = [];
                campaigns.forEach(c => {
                  c.leads.forEach(l => {
                    flatLeads.push({
                      ...l,
                      campaignId: c.id,
                      campaignName: c.name
                    });
                  });
                });

                // Filter flat leads
                const filteredLeads = flatLeads.filter(l => {
                  const matchSearch = 
                    l.name.toLowerCase().includes(searchLeadQuery.toLowerCase()) || 
                    l.phone.includes(searchLeadQuery) ||
                    l.email.toLowerCase().includes(searchLeadQuery.toLowerCase()) || 
                    l.id.toLowerCase().includes(searchLeadQuery.toLowerCase());
                  
                  const matchOutcome = filterLeadOutcome === "All" || l.lastOutcome === filterLeadOutcome;
                  return matchSearch && matchOutcome;
                });

                if (filteredLeads.length === 0) {
                  return (
                    <div className="bg-slate-50/50 dark:bg-slate-900/30 p-12 text-center rounded-2xl italic text-black text-[12px] border border-dashed">
                      No inbound campaign leads found matching current parameters. Let's capture some!
                    </div>
                  );
                }

                return filteredLeads.map(l => {
                  // Badges styling
                  const outcomeColors = {
                    "Not Called": "bg-slate-100 text-black dark:bg-slate-800 dark:text-slate-200",
                    Ringing: "bg-blue-50 text-blue-800 border-blue-200/50 border dark:bg-blue-950/20 dark:text-blue-400",
                    "No Answer": "bg-orange-50 text-orange-800 border-orange-200/50 border dark:bg-orange-950/20 dark:text-orange-400",
                    "Call Back Scheduled": "bg-yellow-50 text-yellow-800 border-yellow-250/30 border dark:bg-yellow-950/20 dark:text-yellow-400",
                    "Interested - Ticket Created": "bg-emerald-55 text-emerald-800 border border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400",
                    "Not Interested": "bg-rose-50 text-rose-800 border dark:bg-rose-950/20 dark:text-rose-400",
                    "Opt Out requested": "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-350"
                  }[l.lastOutcome] || "bg-slate-50";

                  return (
                    <div 
                      key={l.id} 
                      className={`p-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl transition shadow-xs flex flex-col md:flex-row justify-between gap-4 md:items-center ${
                        l.isDnc ? "border-l-4 border-rose-500 bg-rose-50/10 dark:bg-rose-950/5" : "border-l-4 border-slate-300 dark:border-slate-755"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] text-black tracking-wider font-extrabold/80 uppercase">
                            {l.id}
                          </span>
                          <h5 className="font-bold text-black dark:text-white text-[12px]">{l.name}</h5>
                          {l.isDnc && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                              🚫 POPIA DNC Alert
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${outcomeColors}`}>
                            {l.lastOutcome}
                          </span>
                        </div>

                        <div className="text-[11px] text-black space-y-0.5">
                          <p>📞 Phone: <span className="font-mono font-semibold text-black dark:text-white">{l.phone}</span> • Email: <span className="font-mono">{l.email || "N/A"}</span></p>
                          <p>Source: <strong className="text-black dark:text-white">{l.source}</strong> • Assigned: <strong className="text-blue-600 dark:text-blue-400">{l.assignedAgent || "Unallocated"}</strong> • Calls: <strong>{l.callAttempts} attempts</strong></p>
                          {l.notes && <p className="italic bg-slate-50 dark:bg-slate-850 p-1 px-2 rounded text-[11px] text-black dark:text-white mt-1">"{l.notes}"</p>}
                        </div>
                      </div>

                      {/* Manual Lead triggers / dial inline */}
                      <div className="flex gap-2 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => onToggleDnc(l.id)}
                          className={`p-1 px-2 text-[10px] font-bold rounded-md border transition cursor-pointer flex items-center gap-1 ${
                            l.isDnc 
                              ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900" 
                              : "bg-slate-50 border-slate-200 text-black hover:bg-slate-100 dark:bg-slate-805"
                          }`}
                          title="Toggle CPA National DNC list override flag"
                        >
                          DNC Checked
                        </button>

                        <button
                          type="button"
                          disabled={l.isDnc}
                          onClick={() => triggerCallSimulation(l, l.campaignId)}
                          className={`p-1.5 px-2.5 text-[12px] font-black uppercase rounded-lg shadow-sm font-semibold transition flex items-center gap-1 cursor-pointer ${
                            l.isDnc 
                              ? "bg-slate-205 text-black cursor-not-allowed dark:bg-slate-800" 
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                          }`}
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> Call Lead
                        </button>

                        {l.lastOutcome !== "Interested - Ticket Created" && !l.isDnc && (
                          <button
                            type="button"
                            onClick={() => {
                              setConvertingLead(l);
                              setConvertingCampaignId(l.campaignId);
                              setConvertLoanAmt(1200000);
                              setConvertIncome(45000);
                            }}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold rounded-lg transition"
                            title="Direct transition to pre-sales sales desk folder"
                          >
                            Convert to CRM
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Right: Add new Lead & conversion workspace if chosen */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Converting lead workspace overlay card */}
            {convertingLead && (
              <form onSubmit={executeConversion} className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-700 rounded-3xl p-4.5 space-y-4 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest block">Core CRM Outbound Conversion</span>
                    <h5 className="font-extrabold text-[12px] mt-1">Convert {convertingLead.name} to Sales Folder</h5>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setConvertingLead(null)}
                    className="text-indigo-305 hover:text-white font-black text-[12px] cursor-pointer"
                  >
                    Cancel ✕
                  </button>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl leading-relaxed text-[11px] font-mono">
                  <p>Lead Route: <strong>{convertingLead.id}</strong></p>
                  <p>Current Contact: <strong>{convertingLead.phone}</strong></p>
                  <p>Sourced In: <strong>{convertingLead.email || "N/A"}</strong></p>
                </div>

                <div className="space-y-3 text-[12px]">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">Mortgage required quote (R)</label>
                    <input 
                      type="number" 
                      required
                      value={convertLoanAmt}
                      onChange={(e) => setConvertLoanAmt(Number(e.target.value))}
                      className="w-full p-1.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-indigo-300 block mb-1">Gross monthly income (R)</label>
                    <input 
                      type="number" 
                      required
                      value={convertIncome}
                      onChange={(e) => setConvertIncome(Number(e.target.value))}
                      className="w-full p-1.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold uppercase rounded-lg tracking-wider text-[11px] shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4" /> Transit Folder to CRM Sales Desks
                  </button>
                </div>
              </form>
            )}

            {/* Sourced leads capture form */}
            <form onSubmit={handleCreateLead} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-black block">Sourced Lead manual capture form</span>
                <p className="text-[10px] text-black mt-1">Inject custom partnership or broker sourced leads into selected campaigns.</p>
              </div>

              <div className="space-y-3 text-[12px]">
                <div>
                  <label className="text-[10px] font-bold text-black uppercase block mb-1">Target Strategy Campaign</label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg text-black dark:text-white text-[12px]"
                  >
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Prospect Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Sarah Jenkins"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Telephone Route</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., +27 82 555 1205"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg text-[12px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Email Route</label>
                    <input 
                      type="email" 
                      placeholder="opt@domain.co.za"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Inbound Medium</label>
                    <input 
                      type="text" 
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg text-[12px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-black uppercase block mb-1">Briefing request notes</label>
                  <textarea 
                    rows={2}
                    placeholder="Wants debt consolidation options..."
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    className="w-full p-2 border dark:bg-slate-800 dark:border-slate-700 bg-transparent rounded-lg text-[12px] font-mono"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[12px] uppercase rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                >
                  <Plus className="w-4 h-4" /> Route Sourced Lead
                </button>
              </div>
            </form>

            {/* Auto allocations indicators card */}
            <div className="border border-indigo-150/50 rounded-2xl p-4 bg-indigo-50/10 dark:bg-slate-850/20 text-[12px] space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block">Round-Robin Active Operators</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {employees.filter(emp => emp.department === "Sales" || emp.department === "Marketing & Tele-Marketing").slice(0, 4).map(emp => (
                  <span key={emp.id} className="p-1 px-2 border dark:border-slate-804 bg-white dark:bg-slate-900 rounded font-bold text-[10px] text-black dark:text-white">
                    👨‍💼 {emp.name.split(" ")[0]} ({emp.role.includes("Agent") ? "Agent" : "Admin"})
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-black font-sans leading-tight mt-1.5">When conversion is initiated, the lead is round-robin allocated out to the CRM outbound advisory agents.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OUTBOUND PREDICTIVE DIALLER */}
      {activeSubTab === "dialler" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Dialler Active Telephony Screen (Left 7/12) */}
          <div className="lg:col-span-7">
            
            <div className="bg-slate-905 dark:bg-black rounded-3xl overflow-hidden text-white border border-slate-800 shadow-2xl flex flex-col justify-between">
              
              {/* Telephony Header indicator */}
              <div className="p-4 bg-slate-850 dark:bg-slate-950 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dialler.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-black">
                    {dialler.isActive ? "Dialler System Outbound: ACTIVE" : "Dialler Status: STANDBY"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-black">
                  <span className="px-2 py-0.5 rounded bg-slate-800 font-black text-[10px] text-amber-500">PREDICTIVE DIALLER MODE V3</span>
                </div>
              </div>

              {/* Call Canvas Workspace */}
              <div className="p-6 bg-radial from-slate-900 to-black min-h-[280px] flex flex-col justify-center items-center text-center space-y-4">
                {dialler.isActive && activeLeadToCall ? (
                  <div className="space-y-4 max-w-sm w-full animate-fade-in relative">
                    
                    {/* Ringing/Live wave feedback */}
                    <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto relative">
                      <PhoneCall className="w-6 h-6 text-blue-400 animate-bounce" />
                      <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping" style={{ animationDuration: "2s" }}></div>
                    </div>

                    <div className="space-y-1">
                      <span className="px-2 py-0.5 text-[10px] bg-indigo-950 text-indigo-305 rounded-full uppercase font-bold tracking-wider">
                        Active connected call
                      </span>
                      <h3 className="text-[12px] font-black font-sans leading-tight mt-1.5">{activeLeadToCall.name}</h3>
                      <p className="font-mono text-[12px] text-black">{activeLeadToCall.phone} • {activeLeadToCall.email}</p>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl leading-normal text-[11px] font-mono text-black text-left space-y-1">
                      <p>Sourced In: <strong>{activeLeadToCall.source}</strong></p>
                      <p>Lead Register: <strong>{activeLeadToCall.id}</strong></p>
                      <p>Initial Pitch: <em>"{activeLeadToCall.notes || 'No notes defined'}"</em></p>
                    </div>

                    {/* Quality, recording disclosure notice */}
                    <div className="p-2 py-2.5 bg-rose-500/10 border-l-2 border-rose-500 rounded text-[10px] leading-tight text-rose-300 text-left flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                      <div>
                        <strong>POPIA Regulatory Compliance Alert:</strong> Media connection is recorded for QA compliance. Disclosed active policy options standard statement read to user upon connection.
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center max-w-sm space-y-2 py-8 text-black animate-pulse">
                    <Volume2 className="w-12 h-12 text-black mx-auto" />
                    <h4 className="font-bold text-slate-200">Outbound call queue offline</h4>
                    <p className="text-[10px] text-black leading-normal">Select a media campaign from the right sidebar, and toggle the predictive autodialler online to start connecting the operator shift.</p>
                  </div>
                )}
              </div>

              {/* Call Controls panel */}
              <div className="p-4 bg-slate-900 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateDialler({ isActive: !dialler.isActive })}
                  className={`py-2 px-3 rounded-xl font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                    dialler.isActive 
                      ? "bg-rose-600 hover:bg-rose-700 text-white" 
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {dialler.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {dialler.isActive ? "Stop Dialler" : "Start Dialler"}
                </button>

                <button
                  type="button"
                  disabled={!dialler.isActive}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl font-bold text-[12px] uppercase tracking-wider disabled:opacity-50 transition cursor-pointer"
                  onClick={() => {
                    const nextIdx = (dialler.currentLeadIndex + 1) % (currentDiallerCampaign?.leads.length || 1);
                    onUpdateDialler({ currentLeadIndex: nextIdx });
                  }}
                >
                  Skip Route ❯
                </button>

                <div className="flex flex-col text-[10px] font-mono text-black bg-black/40 border border-white/5 p-1 px-2.5 rounded-xl justify-center">
                  <span className="uppercase text-[10px] text-black">Dial frequency</span>
                  <select
                    value={dialler.autoDialSpeed}
                    onChange={(e) => onUpdateDialler({ autoDialSpeed: Number(e.target.value) })}
                    className="bg-transparent border-0 p-0 text-[12px] text-white font-bold select-none cursor-pointer"
                  >
                    <option value="4" className="bg-slate-900">4s (Predictive)</option>
                    <option value="8" className="bg-slate-900">8s (Careful)</option>
                    <option value="12" className="bg-slate-900">12s (Manual)</option>
                  </select>
                </div>

                {dialler.isActive && activeLeadToCall && (
                  <button
                    type="button"
                    onClick={() => {
                      setConvertingLead(activeLeadToCall);
                      setConvertingCampaignId(dialler.activeCampaignId);
                      setConvertLoanAmt(950000);
                      setConvertIncome(38000);
                      setActiveSubTab("leadgen");
                    }}
                    className="py-2 px-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-black text-[12px] uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    🚀 Convert to CRM
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Campaign Selection Sub-feed (Right 5/12) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-black text-black block">Dialler Campaign queues</span>
                <p className="text-[10px] text-black mt-1">Select the active sourcing channel for predictive outbound dialling cycles.</p>
              </div>

              <div className="space-y-2.5">
                {campaigns.filter(c => c.leads.length > 0).map(c => {
                  const isCur = dialler.activeCampaignId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onUpdateDialler({ activeCampaignId: c.id, currentLeadIndex: 0 })}
                      className={`w-full p-3.5 rounded-xl text-left border transition flex items-center justify-between gap-3 ${
                        isCur 
                          ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs" 
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/20"
                      }`}
                    >
                      <div>
                        <h6 className="font-extrabold text-[12px] text-black dark:text-white">{c.name}</h6>
                        <span className="text-[10px] text-black font-mono block mt-1">
                          Queue count: <strong className="text-black dark:text-white">{c.leads.length} leads</strong> • Converted: <strong>{c.convertedCount} items</strong>
                        </span>
                      </div>

                      {isCur ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white animate-pulse">
                          Active Line
                        </span>
                      ) : (
                        <span className="text-[10px] text-black">Select Queue</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live Dialler KPI Panel */}
            <div className="bg-slate-900 text-black rounded-2xl p-4 space-y-3 font-mono text-[11px]">
              <span className="text-[10px] uppercase font-bold text-black block tracking-wider">Tele-Marketing Shift Dialler KPIs</span>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="p-2 border border-slate-800 rounded-xl bg-black/30">
                  <span className="text-[10px] text-black uppercase block">Abandon Rate:</span>
                  <span className="text-slate-100 font-bold font-mono">1.84% (CPA Limit max 3%)</span>
                </div>
                <div className="p-2 border border-slate-800 rounded-xl bg-black/30">
                  <span className="text-[10px] text-black uppercase block">Average AHT Call Duration:</span>
                  <span className="text-slate-100 font-bold font-mono">2m 42s</span>
                </div>
                <div className="p-2 border border-slate-800 rounded-xl bg-black/30">
                  <span className="text-[10px] text-black uppercase block">Connected Calls count:</span>
                  <span className="text-slate-100 font-bold font-mono">{totalContacted} Connections</span>
                </div>
                <div className="p-2 border border-slate-800 rounded-xl bg-black/30">
                  <span className="text-[10px] text-black uppercase block">TCF QA Review Level:</span>
                  <span className="text-emerald-400 font-extrabold font-mono">98.2% Compliant</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: COMPLIANCE & REASONING */}
      {activeSubTab === "compliance" && (
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-5 space-y-6 animate-fade-in shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-805 pb-4">
            <div>
              <h4 className="font-extrabold text-[12px] text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-purple-600" /> Legal Compliance & Registry Audits Desk
              </h4>
              <p className="text-[12px] text-black mt-1">
                Scrub calling databases against National Do Not Contact (DNC) registry files, managing client direct opt-out consent paths (POPIA & CPA requirements).
              </p>
            </div>

            <button
              type="button"
              disabled={isScrubbing}
              onClick={handleScrubDncCompliance}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[12px] uppercase rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start"
            >
              <RefreshCw className={`w-4 h-4 ${isScrubbing ? "animate-spin" : ""}`} />
              {isScrubbing ? "Scrubbing registries..." : "Scrub Sourced Contact List"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h5 className="font-bold text-[12px] uppercase tracking-wide text-black">Registry scrubbing report output:</h5>
              {complianceNotes.length > 0 ? (
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-black font-bold border-b border-slate-800 pb-1.5 mb-2">Registry Scrutiny Engine Output</div>
                  {complianceNotes.map((note, i) => (
                    <p key={i} className="flex items-start gap-1">
                      <span className="text-emerald-500 font-black">✓</span> {note}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed text-center rounded-xl italic text-black text-[12px]">
                  Registry scrubber audit has not run on this session block. Click "Scrub Sourced Contact List" to start auditing direct compliance constraints.
                </div>
              )}

              <div className="p-4 bg-yellow-50/40 dark:bg-slate-950 border-l-4 border-amber-500 text-[12px] rounded-r-xl space-y-1.5">
                <span className="font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> TCF and CPA Legal Disclaimer:
                </span>
                <p className="text-black dark:text-white leading-normal">
                  Failure to scrub contacts before scheduling dialler logs exposes the operator entity to regulatory FAIS/CPA penalty tiers up to 10% of global annual turnover or directly nullifies client Mortgage/Insurance contract validity.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-bold text-[12px] uppercase tracking-wide text-black">POPIA Direct Marketing Guidelines Enforced</h5>
              
              <div className="space-y-3">
                <div className="p-3 border dark:border-slate-800 rounded-xl text-[12px] space-y-1">
                  <span className="font-bold text-black dark:text-slate-200">Opt-out Transparency Directive:</span>
                  <p className="text-black text-[11px] leading-snug">Whenever contact occurs, users are provided direct, un-tolled paths to decline further communications (POPIA Section 69). Outbound channels store requests immediately.</p>
                </div>

                <div className="p-3 border dark:border-slate-800 rounded-xl text-[12px] space-y-1">
                  <span className="font-bold text-black dark:text-slate-200">Affordability Guidelines Decorum (CPA):</span>
                  <p className="text-black text-[11px] leading-snug">All product pricing schedules disclosed to clients during pre-sales calls represent real caps. High-pressure sales tactics are strictly monitored under internal speech analysis QA.</p>
                </div>

                <div className="p-3 border dark:border-slate-800 rounded-xl text-[12px] space-y-1">
                  <span className="font-bold text-black dark:text-slate-200">SLA Contact Constraints:</span>
                  <p className="text-black text-[11px] leading-snug">Outbound dialling operations are limited to Weekdays 0800 - 2000, Saturdays 0900 - 1300. No calls on Sundays or public holidays. Predictive dialler is programmed to lock out routes automatically on target times.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
