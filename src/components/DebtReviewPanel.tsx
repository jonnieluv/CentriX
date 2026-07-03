import React, { useState } from "react";
import { 
  ShieldAlert, FileText, Gavel, 
  Banknote, TrendingDown, ChevronRight 
} from "lucide-react";
import { Ticket } from "../types";

interface DebtReviewPanelProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

export default function DebtReviewPanel({ tickets, setTickets }: DebtReviewPanelProps) {
  const functions = [
    { title: "Statutory Compliance & Legal Processing", icon: ShieldAlert, description: "Notices, Suspension & Credit Flagging" },
    { title: "Proposal Evaluation & Debt Restructuring", icon: FileText, description: "Repayment Plans & Consent Orders" },
    { title: "Litigation & Court Representation", icon: Gavel, description: "Court Tracking & Legal Opposition" },
    { title: "Account Admin & Financial Tracking", icon: Banknote, description: "PDA Reconciliation & Fee Adjustments" },
    { title: "Risk Portfolio & Provisioning", icon: TrendingDown, description: "Re-classification & Impairment" },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Debt Review Operations</h2>
        <p className="text-slate-500 mt-2 text-lg">Statutory compliance, legal processing, and portfolio management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {functions.map((func) => (
          <div 
            key={func.title} 
            className="group bg-white rounded-2xl border border-slate-200 p-8 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-rose-400 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <func.icon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-3">{func.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed flex-grow mb-6">{func.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
