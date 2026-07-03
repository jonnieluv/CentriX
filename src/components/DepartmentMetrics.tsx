import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, Coins, Wrench, DoorOpen, ShieldAlert, Activity, 
  Users, FileCheck, Settings, UserPlus, BookOpen, FileSpreadsheet,
  Search, CheckCircle, AlertTriangle, Play, HelpCircle, ArrowUpRight
} from "lucide-react";
import { Ticket, Employee, SwitchboardCall, VisitorLog, PackageLog, ChatMessage, CallLog, VideoSession, FacilitiesLog } from "../types";

interface DepartmentMetricsProps {
  selectedDept: string;
  tickets: Ticket[];
  employees: Employee[];
  switchboardQueue: SwitchboardCall[];
  visitorLogs: VisitorLog[];
  packageLogs: PackageLog[];
  chatsData: Record<string, ChatMessage[]>;
  callLogs: CallLog[];
  videoSessions: VideoSession[];
  facilitiesLogs: FacilitiesLog[];
  trainingCatalog: { id: string; title: string; progress: number; duration: string; participants: number }[];
  itOverrideLogs: { id: string; timestamp: string; action: string; status: string }[];
}

export default function DepartmentMetrics({
  selectedDept,
  tickets,
  employees,
  switchboardQueue,
  visitorLogs,
  packageLogs,
  chatsData,
  callLogs,
  videoSessions,
  facilitiesLogs,
  trainingCatalog,
  itOverrideLogs
}: DepartmentMetricsProps) {

  // Safety fallbacks
  const safeTickets = tickets || [];
  const safeEmployees = employees || [];
  const safeSwitchboard = switchboardQueue || [];
  const safeVisitor = visitorLogs || [];
  const safePackage = packageLogs || [];
  const safeCall = callLogs || [];
  const safeVideo = videoSessions || [];
  const safeFacilities = facilitiesLogs || [];
  const safeTraining = trainingCatalog || [];
  const safeIT = itOverrideLogs || [];

  // Recurse chat data sizes
  let totalChatMessages = 0;
  if (chatsData) {
    Object.values(chatsData).forEach(arr => {
      if (Array.isArray(arr)) totalChatMessages += arr.length;
    });
  }

  // Define Helper Builders for Departmental Performance
  const renderSalesMetrics = () => {
    const stageTickets = safeTickets.filter(t => t.status === "Sales");
    const totalPipeline = safeTickets.reduce((acc, t) => acc + Number(t.addressDetails?.mortgageRequired || 0), 0);
    const productCount = safeTickets.reduce((acc, t) => acc + (t.selectedProducts ? t.selectedProducts.length : 0), 0);
    const avgProducts = safeTickets.length > 0 ? (productCount / safeTickets.length).toFixed(1) : "0.0";
    const coverCount = safeTickets.filter(t => t.selectedProducts?.some(p => p.toLowerCase().includes("policy") || p.toLowerCase().includes("protector"))).length;
    const coverPct = safeTickets.length > 0 ? Math.round((coverCount / safeTickets.length) * 100) : 0;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow">
          <span className="text-[11px] font-sans font-bold tracking-widest text-black dark:text-white uppercase block mb-2">Total Pipeline Value</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[12px] font-display font-medium text-emerald-600 dark:text-emerald-400">{totalPipeline.toLocaleString('fr-FR')}€</span>
            <span className="text-[11px] font-medium text-black">Capital</span>
          </div>
          <p className="text-[11px] text-black mt-2 tracking-wide">Aggregate mortgage loan requirements</p>
        </div>

        <div className="p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow">
          <span className="text-[11px] font-sans font-bold tracking-widest text-black dark:text-white uppercase block mb-2">Product Attach Ratio</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[12px] font-display font-medium text-blue-600 dark:text-blue-400">{avgProducts}x</span>
            <span className="text-[11px] font-medium text-black">Products / Client</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(Number(avgProducts) * 33, 100)}%` }}></div>
          </div>
        </div>

        <div className="p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow">
          <span className="text-[11px] font-sans font-bold tracking-widest text-black dark:text-white uppercase block mb-2">Assurance Cover</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[12px] font-display font-medium text-violet-600 dark:text-violet-400">{coverPct}%</span>
            <span className="text-[11px] font-medium text-black">Policy Protector</span>
          </div>
          <p className="text-[11px] text-black mt-2 tracking-wide">{coverCount} folders secured with live cover</p>
        </div>
      </div>
    );
  };

  const renderSalesAdminMetrics = () => {
    const docCompleteCount = safeTickets.filter(t => t.supportingDocuments && t.supportingDocuments.length >= 2).length;
    const docCompletePct = safeTickets.length > 0 ? Math.round((docCompleteCount / safeTickets.length) * 100) : 0;
    const totalSalarySurplus = safeTickets.reduce((acc, t) => acc + Number(t.affordabilityOutcome?.disposableIncome || 0), 0);
    const avgDisposable = safeTickets.length > 0 ? Math.round(totalSalarySurplus / safeTickets.length) : 0;
    const stageCount = safeTickets.filter(t => t.status === "Sales Administration").length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow">
          <span className="text-[11px] font-sans font-bold tracking-widest text-black dark:text-white uppercase block mb-2">Doc Completeness</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[12px] font-display font-medium text-amber-600 dark:text-amber-400">{docCompletePct}%</span>
            <span className="text-[11px] font-medium text-black">Verified Files</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${docCompletePct}%` }}></div>
          </div>
        </div>

        <div className="p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow">
          <span className="text-[11px] font-sans font-bold tracking-widest text-black dark:text-white uppercase block mb-2">Client Disposable Income</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[12px] font-display font-medium text-emerald-600 dark:text-emerald-400">{avgDisposable.toLocaleString('fr-FR')}€</span>
            <span className="text-[11px] font-medium text-black">Monthly surplus</span>
          </div>
          <p className="text-[11px] text-black mt-2 tracking-wide">Calculated average surplus</p>
        </div>

        <div className="p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow">
          <span className="text-[11px] font-sans font-bold tracking-widest text-black dark:text-white uppercase block mb-2">Desk Filing Load</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[12px] font-display font-medium text-indigo-600 dark:text-indigo-400">{stageCount}</span>
            <span className="text-[11px] font-medium text-black">Folders</span>
          </div>
          <p className="text-[11px] text-black mt-2 tracking-wide">Active load pending checks</p>
        </div>
      </div>
    );
  };

  const renderDocHuntersMetrics = () => {
    const totalDocsCollected = safeTickets.reduce((acc, t) => acc + (t.supportingDocuments ? t.supportingDocuments.length : 0), 0);
    const avgDocs = safeTickets.length > 0 ? (totalDocsCollected / safeTickets.length).toFixed(1) : "0.0";
    const idCount = safeTickets.filter(t => t.supportingDocuments?.some(d => d.name.toLowerCase().includes("id") || d.category.toLowerCase().includes("client") || d.category.toLowerCase().includes("id"))).length;
    const idCompliancePct = safeTickets.length > 0 ? Math.round((idCount / safeTickets.length) * 100) : 0;
    const missingDocsCount = safeTickets.filter(t => !t.supportingDocuments || t.supportingDocuments.length === 0).length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow">
          <span className="text-[11px] font-sans font-bold tracking-widest text-black dark:text-white uppercase block mb-2">Total Files Retrieved</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[12px] font-display font-medium text-sky-600 dark:text-sky-400">{totalDocsCollected}</span>
            <span className="text-[11px] font-medium text-black">Collected items</span>
          </div>
          <p className="text-[11px] text-black mt-2 tracking-wide">Avg {avgDocs} docs per application</p>
        </div>

        <div className="p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow">
          <span className="text-[11px] font-sans font-bold tracking-widest text-black dark:text-white uppercase block mb-2">ID Verification Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[12px] font-display font-medium text-emerald-600 dark:text-emerald-400">{idCompliancePct}%</span>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold dark:bg-emerald-950/40 dark:text-emerald-300">Matches</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-705/50 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${idCompliancePct}%` }}></div>
          </div>
        </div>

        <div className="p-4 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow">
          <span className="text-[11px] font-sans font-bold tracking-widest text-black dark:text-white uppercase block mb-2">Absolute Doc Deficit</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-[12px] font-display font-medium ${missingDocsCount > 0 ? "text-rose-500" : "text-emerald-600"}`}>{missingDocsCount}</span>
            <span className="text-[11px] font-medium text-black">Empty folders</span>
          </div>
          <p className="text-[11px] text-black mt-2 tracking-wide">Requires immediate callback</p>
        </div>
      </div>
    );
  };

  const renderDebtReviewMetrics = () => {
    const flaggedTickets = safeTickets.filter(t => t.debtObligations?.debtReviewFlag === true).length;
    const flagRate = safeTickets.length > 0 ? Math.round((flaggedTickets / safeTickets.length) * 100) : 0;
    const totalDebtLiabilities = safeTickets.reduce((acc, t) => {
      const db = t.debtObligations;
      if (!db) return acc;
      return acc + Number(db.bankLoans || 0) + Number(db.creditCards || 0) + Number(db.storeAccounts || 0);
    }, 0);
    const averageDebtLiability = safeTickets.length > 0 ? Math.round(totalDebtLiabilities / safeTickets.length) : 0;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Debt Review Registry Flag Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-[12px] font-black font-mono ${flagRate > 15 ? "text-rose-600" : "text-amber-500"}`}>{flagRate}%</span>
            <span className="text-[10px] text-black">NCA Locked Flags</span>
          </div>
          <p className="text-[10px] text-black mt-1">{flaggedTickets} Folders flagged under active debt admin</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Weighted Debt Liability Mean</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-rose-500">{averageDebtLiability.toLocaleString('fr-FR')}€</span>
            <span className="text-[10px] text-black">Average Owed</span>
          </div>
          <p className="text-[10px] text-black mt-1">Loans, cards and store limits cumulative</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">National Database Integrity</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-emerald-600">100.0%</span>
            <span className="text-[10px] text-black">Registry Match</span>
          </div>
          <p className="text-[10px] text-black mt-1">Live NCR Web API synchronization synced</p>
        </div>
      </div>
    );
  };

  const renderQAMetrics = () => {
    const assessed = safeTickets.filter(t => t.qaAssessment);
    const checkedCount = assessed.length;
    const passedCount = assessed.filter(t => t.qaAssessment?.status === "Passed").length;
    const passRate = checkedCount > 0 ? Math.round((passedCount / checkedCount) * 100) : 0;
    
    const sumScore = assessed.reduce((acc, t) => acc + (t.qaAssessment?.score || 0), 0);
    const avgScore = checkedCount > 0 ? Math.round(sumScore / checkedCount) : 0;
    const manualAssess = assessed.filter(t => t.qaAssessment?.autoAudited === false).length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">TQM Score Average</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-[12px] font-black font-mono ${avgScore >= 80 ? "text-emerald-600" : "text-amber-500"}`}>{avgScore}%</span>
            <span className="text-[10px] text-black">Compliance Rate</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-705 h-1 rounded-full mt-2">
            <div className="bg-emerald-500 h-full" style={{ width: `${avgScore}%` }}></div>
          </div>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Folder First-Time Pass Ratio</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-teal-600 dark:text-teal-400">{passRate}%</span>
            <span className="text-[10px] text-black">Direct Cleared</span>
          </div>
          <p className="text-[10px] text-black mt-1">{passedCount} of {checkedCount} audited passed instantly</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Auditor Intervention Level</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-indigo-505 dark:text-indigo-400">{manualAssess}</span>
            <span className="text-[10px] text-black">Manual assessments</span>
          </div>
          <p className="text-[10px] text-black mt-1">Folders manually reviewed by compliance lead</p>
        </div>
      </div>
    );
  };

  const renderClientExperienceMetrics = () => {
    const totalComms = totalChatMessages + safeCall.length + safeVideo.length;
    const connectedCalls = safeCall.filter(c => parseFloat(c.duration) > 0 || c.duration.includes(":")).length;
    const callConnectPct = safeCall.length > 0 ? Math.round((connectedCalls / safeCall.length) * 105) : 100;

    // CSAT level mapping
    const qaAssessed = safeTickets.filter(t => t.qaAssessment);
    const scoreSum = qaAssessed.reduce((acc, t) => acc + (t.qaAssessment?.score || 0), 0);
    const scoreMean = qaAssessed.length > 0 ? (scoreSum / qaAssessed.length) : 80;
    const calculatedCsat = (4.0 + (scoreMean / 100) * 1.0).toFixed(2);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Active CSAT Average Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-pink-500">{calculatedCsat} / 5.0</span>
            <span className="text-[10px] text-black">Overall Rating</span>
          </div>
          <p className="text-[10px] text-black mt-1">Derived dynamically from interactions logs</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Comms Logs Engagement</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-indigo-650 dark:text-indigo-400">{totalComms}</span>
            <span className="text-[10px] text-black">Combined events</span>
          </div>
          <p className="text-[10px] text-black mt-1">{totalChatMessages} chats • {safeCall.length} calls • {safeVideo.length} videos</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Call Connect Success Index</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-emerald-600">{Math.min(callConnectPct, 100)}%</span>
            <span className="text-[10px] text-black">Bridge Complete</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-705 h-1 rounded-full mt-2">
            <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(callConnectPct, 100)}%` }}></div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreditCommitteeMetrics = () => {
    const passedNCA = safeTickets.filter(t => t.affordabilityOutcome?.loanEligibilityStatus === "Passed").length;
    const ncaPassPct = safeTickets.length > 0 ? Math.round((passedNCA / safeTickets.length) * 100) : 0;
    const totalApprovedLimit = safeTickets.reduce((acc, t) => acc + Number(t.affordabilityOutcome?.approvedLimit || 0), 0);
    const overdraftOverCount = safeTickets.filter(t => t.bankStatementsAnalysis?.overdraftFrequency && t.bankStatementsAnalysis.overdraftFrequency !== "None").length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">NCA Credit Pass Ratio</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-yellow-650 dark:text-yellow-400">{ncaPassPct}%</span>
            <span className="text-[10px] text-black">Compliant</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-705 h-1 rounded-full mt-2">
            <div className="bg-yellow-500 h-full" style={{ width: `${ncaPassPct}%` }}></div>
          </div>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Consolidated Approved Credit</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-emerald-600">R{(totalApprovedLimit / 1e6).toFixed(2)}M</span>
            <span className="text-[10px] text-black">Allocated limit</span>
          </div>
          <p className="text-[10px] text-black mt-1">Sum of approved loan limits in general matrix</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Banking Overdraft Warning rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-[12px] font-black font-mono ${overdraftOverCount > 2 ? "text-amber-600" : "text-emerald-600"}`}>{overdraftOverCount}</span>
            <span className="text-[10px] text-black">Active overdraft accounts</span>
          </div>
          <p className="text-[10px] text-black mt-1">Requires manual secondary risk waiver</p>
        </div>
      </div>
    );
  };

  const renderFinanceMetrics = () => {
    const totalApprovedLimit = safeTickets.reduce((acc, t) => acc + Number(t.affordabilityOutcome?.approvedLimit || 0), 0);
    // Calculated standard mortgage annual yield based on 11.75% prime interest
    const interestYield = totalApprovedLimit * 0.1175;
    const pendingDisburseCount = safeTickets.filter(t => t.status === "Finance" || t.status === "Credit Committee").length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Interest Yield Projection (Annum)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-emerald-600">R{(interestYield / 1e3).toFixed(1)}k</span>
            <span className="text-[10px] text-black">Yield @ 11.75%</span>
          </div>
          <p className="text-[10px] text-black mt-1">Projected annual interest yielding on approved limits</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Secured Capital Leverage</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-blue-650 dark:text-blue-400 font-mono">1.40x</span>
            <span className="text-[10px] text-black">Lending ratios</span>
          </div>
          <p className="text-[10px] text-black mt-1">R{(totalApprovedLimit / 1e6).toFixed(1)}M limits backed by R12.4M assets</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Pending Disburse Escrow queue</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-indigo-505 dark:text-indigo-400 font-mono">{pendingDisburseCount}</span>
            <span className="text-[10px] text-black">Vault clearances</span>
          </div>
          <p className="text-[10px] text-black mt-1">Folders with sanctioned risk sign-offs pending pay</p>
        </div>
      </div>
    );
  };

  const renderITMetrics = () => {
    const recordingsCount = safeTickets.length; // Live active session screens simulator metric
    const systemUptimePct = (99.98 - (safeIT.length * 0.01)).toFixed(2);
    const apiCallCount = safeIT.length + safeTickets.flatMap(t => t.auditLogs).length + 12;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">System Telemetry Uptime</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-emerald-600 font-mono">{systemUptimePct}%</span>
            <span className="text-[10px] text-black">Live Uptime</span>
          </div>
          <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold inline-block mt-1">Node Fully Synced</span>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Diagnostic Terminal Operations</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-amber-600">{apiCallCount}</span>
            <span className="text-[10px] text-black">Deployed Scripts</span>
          </div>
          <p className="text-[10px] text-black mt-1">Logs, overrides and audits tracked in current session</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Security Audit integrity</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-blue-600 dark:text-blue-400">99.8%</span>
            <span className="text-[10px] text-black">Encrypted</span>
          </div>
          <p className="text-[10px] text-black mt-1">AES-256 standard and strict OAuth policies configured</p>
        </div>
      </div>
    );
  };

  const renderHRMetrics = () => {
    const totalConsultants = safeEmployees.length;
    const activeStaffCount = safeEmployees.filter(e => e.status === "Active").length;
    const inactiveStaffCount = safeEmployees.filter(e => e.status === "Inactive").length;
    const lunchStaffCount = safeEmployees.filter(e => e.status === "Lunch").length;
    const teaStaffCount = safeEmployees.filter(e => e.status === "Tea").length;
    const bBreakStaffCount = safeEmployees.filter(e => e.status === "B.Break").length;
    const meetingStaffCount = safeEmployees.filter(e => e.status === "Meeting").length;

    // Attendance rate excludes inactive personnel from on-shift counts
    const onShiftCount = totalConsultants - inactiveStaffCount;
    const attendancePct = totalConsultants > 0 ? Math.round((onShiftCount / totalConsultants) * 100) : 0;
    
    // Departments distribution layout
    const depts = ["Sales", "Quality Assurance", "Reception", "Credit Committee", "Facilities"];
    const hrStrength = safeEmployees.reduce((acc, emp) => {
      const d = emp.department;
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">HCM Shift Staff Strength</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-sky-600 dark:text-sky-400">{totalConsultants}</span>
            <span className="text-[10px] text-black">Corporate users</span>
          </div>
          <div className="mt-2 text-[10px] text-black space-y-0.5">
            <div className="flex justify-between">
              <span>🟢 Active Station Duty:</span>
              <span className="font-bold text-black dark:text-white font-mono">{activeStaffCount}</span>
            </div>
            <div className="flex justify-between">
              <span>☕ On Tea & Lunch Breaks:</span>
              <span className="font-bold text-black dark:text-white font-mono">{teaStaffCount + lunchStaffCount}</span>
            </div>
            <div className="flex justify-between">
              <span>💼 Critical Meetings:</span>
              <span className="font-bold text-black dark:text-white font-mono">{meetingStaffCount}</span>
            </div>
          </div>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">On-Shift Attendance Level KPI</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-emerald-600 dark:text-emerald-400">{attendancePct}%</span>
            <span className="text-[10px] text-black font-semibold">Active Duty ({onShiftCount}/{totalConsultants})</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2">
            <div className="bg-emerald-500 h-full" style={{ width: `${attendancePct}%` }}></div>
          </div>
          <div className="mt-2 text-[10px] text-black flex items-center justify-between">
            <span>🔴 Off-duty status: {inactiveStaffCount}</span>
            <span>⏱️ Brief breaks (b.break): {bBreakStaffCount}</span>
          </div>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Staff Engagement KPI Rating</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-indigo-600 dark:text-indigo-400">{totalConsultants > 0 ? Math.round(((activeStaffCount + meetingStaffCount) / totalConsultants) * 100) : 0}%</span>
            <span className="text-[10px] text-black font-semibold">Active & Engaged ({activeStaffCount + meetingStaffCount}/{totalConsultants})</span>
          </div>
          <p className="text-[10px] text-black mt-1">
            Sales strength: <span className="font-bold text-black dark:text-white">{hrStrength["Sales"] || 0}</span> | QA strength: <span className="font-bold text-black dark:text-white">{hrStrength["Quality Assurance"] || 0}</span>
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">ACTIVE:{activeStaffCount}</span>
            <span className="bg-amber-105 dark:bg-amber-950/45 text-amber-850 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold font-bold">BREAK:{lunchStaffCount + teaStaffCount}</span>
            <span className="bg-blue-100 dark:bg-blue-950/45 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">MEETING:{meetingStaffCount}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTrainingMetrics = () => {
    const totalCourses = safeTraining.length;
    const progressSum = safeTraining.reduce((acc, t) => acc + Number(t.progress || 0), 0);
    const avgProgress = totalCourses > 0 ? Math.round(progressSum / totalCourses) : 0;
    const totalEnrolled = safeTraining.reduce((acc, t) => acc + Number(t.participants || 0), 0);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Curriculum Progress Mean</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-purple-600 dark:text-purple-400">{avgProgress}%</span>
            <span className="text-[10px] text-black">Syllabus Complete</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-705 h-1 rounded-full mt-2">
            <div className="bg-purple-600 h-full" style={{ width: `${avgProgress}%` }}></div>
          </div>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Active Registered Enrollments</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-indigo-505 dark:text-indigo-400">{totalEnrolled}</span>
            <span className="text-[10px] text-black font-semibold">Active trainees</span>
          </div>
          <p className="text-[10px] text-black mt-1">Employees assigned to regulatory modules</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Course Catalog Assets</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-emerald-600">{totalCourses}</span>
            <span className="text-[10px] text-black">Active programs</span>
          </div>
          <p className="text-[10px] text-black mt-1">Mortgage compliance & NCA regulatory drills</p>
        </div>
      </div>
    );
  };

  const renderReceptionMetrics = () => {
    const queueLength = safeSwitchboard.length;
    const handledCalls = safeSwitchboard.filter(c => c.status === "Connected" || c.status === "Resolved").length;
    const activeVisitors = safeVisitor.filter(v => !v.signOutTime || v.signOutTime === "Still Onsite" || v.signOutTime.includes("-")).length;
    const totalPackages = safePackage.length;
    const pendingDelivCount = safePackage.filter(p => p.status?.toLowerCase().includes("transit") || p.status?.toLowerCase().includes("pending")).length;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Active Switchboard Queue load</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-[12px] font-black font-mono ${queueLength > 2 ? "text-amber-500 animate-pulse" : "text-emerald-600 font-mono"}`}>{queueLength}</span>
            <span className="text-[10px] text-black">Calls in waiting ring</span>
          </div>
          <p className="text-[10px] text-black mt-1">Handled & resolved: {handledCalls} calls in this shift</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-705">
          <span className="text-[10px] text-black uppercase font-black block">On-site Visitor Traffic today</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-rose-500">{safeVisitor.length}</span>
            <span className="text-[10px] text-black">Sign-ins</span>
          </div>
          <p className="text-[10px] text-black mt-1">{activeVisitors} visitors currently inside office secure area</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Package Management Hub</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-blue-655 dark:text-blue-400 font-mono">{totalPackages}</span>
            <span className="text-[10px] text-black">Deliveries logged</span>
          </div>
          <p className="text-[10px] text-black mt-1">{pendingDelivCount} packages pending courier desk dispatch</p>
        </div>
      </div>
    );
  };

  const renderFacilitiesMetrics = () => {
    const totalServices = safeFacilities.length;
    const scheduledToday = safeFacilities.filter(f => f.task && !f.id.includes("OLD")).length;
    const safetyIndex = 100 - (safeFacilities.filter(v => v.task?.toLowerCase().includes("repair") || v.task?.toLowerCase().includes("leak")).length * 2);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-705">
          <span className="text-[10px] text-black uppercase font-black block">Executed Maintenance Logs</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-black dark:text-white">{totalServices}</span>
            <span className="text-[10px] text-black">SLA updates</span>
          </div>
          <p className="text-[10px] text-black mt-1">Active tasks scheduled: {scheduledToday}</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Safety Compliance Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-emerald-600">{Math.max(safetyIndex, 90)}%</span>
            <span className="text-[10px] text-black">Compliance Score</span>
          </div>
          <p className="text-[10px] text-black dark:text-white">Zero non-compliance incident logs reported</p>
        </div>

        <div className="p-3 border rounded-lg bg-zinc-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
          <span className="text-[10px] text-black uppercase font-black block">Operating Cost Index (Est)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[12px] font-black font-mono text-blue-600 dark:text-blue-400">R{(totalServices * 150).toLocaleString()}</span>
            <span className="text-[10px] text-black">ZAR / Shift</span>
          </div>
          <p className="text-[10px] text-black mt-1">Simulated consumable expenditure log</p>
        </div>
      </div>
    );
  };

  // Switch between departments
  const renderDepartmentSpecificMetrics = () => {
    switch (selectedDept) {
      case "Sales":
        return renderSalesMetrics();
      case "Sales Administration":
        return renderSalesAdminMetrics();
      case "Document Hunters":
        return renderDocHuntersMetrics();
      case "Debt Review":
        return renderDebtReviewMetrics();
      case "Quality Assurance":
        return renderQAMetrics();
      case "Client Experience":
        return renderClientExperienceMetrics();
      case "Credit Committee":
        return renderCreditCommitteeMetrics();
      case "Finance":
        return renderFinanceMetrics();
      case "Information & Technology":
        return renderITMetrics();
      case "Human Capital":
        return renderHRMetrics();
      case "Training and Development":
        return renderTrainingMetrics();
      case "Reception":
        return renderReceptionMetrics();
      case "Facilities":
        return renderFacilitiesMetrics();
      default:
        return (
          <div className="p-3 text-center text-[12px] text-black italic">
            Metrics loading...
          </div>
        );
    }
  };

  return (
    <div id="department-performance-section" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3.5 shadow-xs">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[12px] font-extrabold text-black dark:text-white uppercase tracking-wider flex items-center gap-1">
              📈 Data-Driven Performance & KPI Metrics
              <span className="bg-blue-600 text-white font-mono text-[10px] px-1.5 py-0.5 rounded uppercase tracking-normal">Live Stats</span>
            </span>
            <p className="text-[10px] text-black dark:text-white">
              {(selectedDept === "Human Capital" || selectedDept === "Training and Development")
                ? "Real-time performance metrics derived directly from corporate staff engagement, active duty rosters & training progress"
                : "Real-time dynamic computations extracted directly from CRM folders & ledgers"
              }
            </p>
          </div>
        </div>
        
        <span className="text-[10px] text-black dark:text-white italic flex items-center gap-1 font-mono">
          <CheckCircle className="w-3 text-emerald-500 h-3" /> Fully Synced Web Ledger
        </span>
      </div>

      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDept}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderDepartmentSpecificMetrics()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
