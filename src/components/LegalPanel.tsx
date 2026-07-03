import React, { useState } from "react";
import { 
  Briefcase, Scale, Shield, FileText, Gavel, 
  Users, AlertTriangle, Building, FileCheck 
} from "lucide-react";
import { Ticket } from "../types";

interface LegalPanelProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

export default function LegalPanel({ tickets, setTickets }: LegalPanelProps) {
  const [activeTab, setActiveTab] = useState("Governance");
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Filter tickets that might be relevant to legal
  const legalTickets = tickets.filter(t => t.clientInfo.notes.includes("Legal") || t.status === "Legal");

  const sections = [
    { name: "Governance", icon: Building },
    { name: "Contracts", icon: FileText },
    { name: "IP Protection", icon: Shield },
    { name: "Employment", icon: Users },
    { name: "Litigation", icon: Gavel },
    { name: "Risk Management", icon: AlertTriangle },
  ];

  const contentMap: Record<string, string> = {
    Governance: "Board Support, Regulatory Compliance, Policy Drafting, Entity Management.",
    Contracts: "Contract Drafting, Negotiation, Contract Lifecycle Management.",
    "IP Protection": "Trademark & Patent Filing, IP Enforcement, Portfolio Management.",
    Employment: "HR Consultation, Dispute Resolution, Safety Compliance.",
    Litigation: "Lawsuit Management, Outside Counsel Selection, E-Discovery.",
    "Risk Management": "Risk Assessment, Crisis Management, Insurance Coordination."
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-xs border border-slate-200">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.name}
              onClick={() => setActiveTab(section.name)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg w-24 transition ${
                activeTab === section.name 
                  ? "bg-indigo-100 text-indigo-700" 
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] uppercase font-bold tracking-tight">{section.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <h3 className="font-bold text-slate-800 text-[14px] flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-indigo-600" />
            {activeTab} Overview
          </h3>
          <p className="text-slate-600 text-[12px] leading-relaxed">{contentMap[activeTab]}</p>
          <div className="mt-6 flex gap-3">
             <button onClick={() => setShowNewDoc(!showNewDoc)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold">
               {showNewDoc ? "Close New Document" : "New Document"}
             </button>
             <button onClick={() => setShowHistory(!showHistory)} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-[11px] font-bold">
               {showHistory ? "Close History" : "View History"}
             </button>
          </div>
        </div>
        
        {showNewDoc && (
          <div className="bg-white p-6 rounded-xl shadow-xs border border-indigo-200">
            <h3 className="font-bold text-slate-800 text-[14px] mb-4">Create New Document</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Document Name" className="w-full p-2 border border-slate-300 rounded text-xs" />
              <textarea placeholder="Document Content" className="w-full p-2 border border-slate-300 rounded text-xs h-24" />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold">Save Document</button>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
            <h3 className="font-bold text-slate-800 text-[14px] mb-4">History & Notes</h3>
            <div className="space-y-3">
              <div className="p-3 border border-slate-100 rounded-lg bg-slate-50 text-[11px]">
                 <p className="font-medium">Governance Policy v1.0</p>
                 <p className="text-slate-500">Last reviewed 2026-06-15</p>
              </div>
              <div className="p-3 border border-slate-100 rounded-lg bg-slate-50 text-[11px]">
                 <p className="font-medium">Trademark Filing IP-2026-001</p>
                 <p className="text-slate-500">Status: Filed - 2026-06-10</p>
              </div>
            </div>
          </div>
        )}
        
        {!showNewDoc && !showHistory && (
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <h3 className="font-bold text-slate-800 text-[14px] mb-4">Active Legal Tickets ({legalTickets.length})</h3>
          <div className="space-y-3">
             {legalTickets.length === 0 ? (
               <p className="text-slate-500 text-[11px]">No active legal tickets found.</p>
             ) : (
               legalTickets.map(t => (
                 <div key={t.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-between text-[11px]">
                   <span className="font-medium text-slate-700">{t.clientInfo.name}</span>
                   <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded uppercase font-mono">{t.ticketStatus}</span>
                 </div>
               ))
             )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
