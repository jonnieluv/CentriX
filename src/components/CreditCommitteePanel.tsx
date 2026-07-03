import React, { useState } from "react";
import { 
  FileCheck, ShieldAlert, FileSpreadsheet, Gavel, Scale, 
  Settings, ChevronRight, Activity, TrendingUp, AlertTriangle,
  FileText
} from "lucide-react";
import { Ticket } from "../types";

// Note: Modals would be imported here once created
// import UnderwritingModal from "./CreditCommitteeUnderwritingModal";

interface CreditCommitteePanelProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

export default function CreditCommitteePanel({ tickets, setTickets }: CreditCommitteePanelProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const categories = [
    { title: "Underwriting & Transaction Approval", icon: FileCheck, description: "High-Value Loan Approvals & Policy Exceptions" },
    { title: "Risk Management & Portfolio Protection", icon: ShieldAlert, description: "Concentration Limits & Stress Testing" },
    { title: "Asset Quality, Auditing & Accounting", icon: FileSpreadsheet, description: "Loan Risk Grading & Delinquency Oversight" },
    { title: "Distressed Asset Workout & Recovery", icon: Gavel, description: "Foreclosure & Debt Write-Offs" },
    { title: "Corporate Governance & Compliance", icon: Scale, description: "Fair Lending, AML Auditing & Charter Maintenance" },
  ];

  const renderModalContent = () => {
    switch (activeModal) {
      case "Underwriting & Transaction Approval":
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-slate-900 border-b pb-2">High-Value Loan Approvals</h4>
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 uppercase border-b">
                  <tr><th className="py-2">Loan ID</th><th className="py-2">Type</th><th className="py-2">Amount</th><th className="py-2">Action</th></tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">#L-9001</td><td>Commercial</td><td>$12.5M</td><td><button className="bg-blue-600 text-white px-3 py-1 rounded text-[10px]">Vote</button></td>
                  </tr>
                  <tr>
                    <td className="py-3">#L-9005</td><td>Residential</td><td>$6.2M</td><td><button className="bg-blue-600 text-white px-3 py-1 rounded text-[10px]">Vote</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-slate-900 border-b pb-2">Policy Exception Management</h4>
              <div className="space-y-2 text-sm text-slate-700">
                <label className="flex items-center gap-3"><input type="checkbox" className="w-4 h-4" /> Approve exception for Loan #1024 (LTV Deviation)</label>
                <label className="flex items-center gap-3"><input type="checkbox" className="w-4 h-4" /> Approve exception for Loan #1026 (Income Verification)</label>
              </div>
            </div>
          </div>
        );
      case "Risk Management & Portfolio Protection":
        return (
          <div className="space-y-8">
            <h4 className="font-semibold text-lg text-slate-900 border-b pb-2">Concentration Limit Enforcement</h4>
            <div className="space-y-6">
              {[ {label: "Residential Portfolio", value: 82}, {label: "Commercial Real Estate", value: 45}, {label: "Zip Code 10001 Exposure", value: 95} ].map(item => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold"><span>{item.label}</span><span>{item.value}%</span></div>
                  <div className={`w-full h-3 rounded-full ${item.value > 90 ? 'bg-red-100' : 'bg-slate-200'}`}>
                    <div className={`h-full rounded-full ${item.value > 90 ? 'bg-red-600' : 'bg-blue-600'}`} style={{width: `${item.value}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "Asset Quality, Auditing & Accounting":
        return (
          <div className="space-y-6">
             <h4 className="font-semibold text-lg text-slate-900 border-b pb-2">Loan Risk Grading Audit</h4>
             <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
               <div className="bg-slate-100 p-4 rounded-lg">Pass: <span className="font-bold text-slate-900">850</span></div>
               <div className="bg-slate-100 p-4 rounded-lg">Substandard: <span className="font-bold text-slate-900">12</span></div>
               <div className="bg-slate-100 p-4 rounded-lg">Doubtful: <span className="font-bold text-slate-900">3</span></div>
               <div className="bg-slate-100 p-4 rounded-lg">Loss: <span className="font-bold text-slate-900">1</span></div>
             </div>
          </div>
        );
      case "Distressed Asset Workout & Recovery":
        return (
           <div className="space-y-6">
             <h4 className="font-semibold text-lg text-slate-900 border-b pb-2">Modification & Foreclosure Requests</h4>
             {[ {id: "#D-1", borrower: "Acme Corp", type: "Foreclosure"}, {id: "#D-2", borrower: "Janet Doe", type: "Mod"} ].map(req => (
               <div key={req.id} className="border p-4 rounded-lg flex justify-between items-center text-sm">
                 <div><p className="font-bold">{req.borrower}</p><p className="text-slate-500">{req.type}</p></div>
                 <button className="bg-slate-900 text-white px-4 py-2 rounded-lg">Review</button>
               </div>
             ))}
           </div>
        );
      case "Corporate Governance & Compliance":
        return (
           <div className="space-y-6">
             <h4 className="font-semibold text-lg text-slate-900 border-b pb-2">Compliance Monitoring</h4>
             <table className="w-full text-sm text-left">
               <thead className="text-slate-500 uppercase border-b"><tr><th>Area</th><th>Status</th></tr></thead>
               <tbody>
                  <tr><td className="py-2">Fair Lending</td><td className="py-2 text-green-600 font-bold">Compliant</td></tr>
                  <tr><td className="py-2">AML Auditing</td><td className="py-2 text-amber-600 font-bold">In Progress</td></tr>
               </tbody>
             </table>
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Credit Committee Central</h2>
        <p className="text-slate-500 mt-2 text-lg">Comprehensive financial oversight and governance modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.title} 
            onClick={() => setActiveModal(cat.title)}
            className="group bg-white rounded-2xl border border-slate-200 p-8 flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-blue-400 hover:scale-[1.02]"
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <cat.icon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-slate-900 mb-3">{cat.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed flex-grow mb-6">{cat.description}</p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
              Launch Module <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>
      
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/5 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold">{activeModal}</h3>
               <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-900">Close</button>
             </div>
             {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
}
