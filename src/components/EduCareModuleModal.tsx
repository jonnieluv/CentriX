import React, { useState } from "react";
import { BookOpen, X, CheckCircle, Clock, User, Calendar } from "lucide-react";
import { Ticket } from "../types";

interface EduCareModuleModalProps {
  onClose: () => void;
  onAssign: (moduleData: any) => void;
  tickets: Ticket[];
}

export default function EduCareModuleModal({ onClose, onAssign, tickets }: EduCareModuleModalProps) {
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedClient, setSelectedClient] = useState("");

  const modules = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Month ${i + 1}: Financial Module ${i + 1}`
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/5">
      <div className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-black">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Assign Edu-Care Module
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Select Client</label>
            <select 
              value={selectedClient} 
              onChange={(e) => setSelectedClient(e.target.value)} 
              className="w-full p-2 border border-slate-300 rounded text-xs"
            >
              <option value="">Select a Client</option>
              {tickets.map(t => <option key={t.id} value={t.id}>{t.clientInfo.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Select Module</label>
            <select 
              value={selectedModule} 
              onChange={(e) => setSelectedModule(e.target.value)} 
              className="w-full p-2 border border-slate-300 rounded text-xs"
            >
              <option value="">Select a Module</option>
              {modules.map(m => <option key={m.id} value={m.title}>{m.title}</option>)}
            </select>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3 text-blue-800">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-[10px]">
              * 20-30 questions, Multiple Choice. 80% pass benchmark required. Submission must be by the 25th each month.
            </p>
          </div>
          <button 
            onClick={() => onAssign({ client: selectedClient, module: selectedModule, assignedDate: new Date().toISOString() })}
            disabled={!selectedClient || !selectedModule}
            className="bg-blue-600 text-white w-full py-2 rounded-lg text-xs font-bold disabled:opacity-50"
          >
            Assign Module
          </button>
        </div>
      </div>
    </div>
  );
}
