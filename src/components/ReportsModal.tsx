import React from "react";
import { X, TrendingUp, AlertTriangle, User, BarChart } from "lucide-react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Ticket } from "../types";

interface ReportsModalProps {
  tickets: Ticket[];
  onClose: () => void;
}

export default function ReportsModal({ tickets, onClose }: ReportsModalProps) {
  // Aggregate data
  const qaTickets = tickets.filter(t => t.status === "Quality Assurance");
  const flaggedCount = qaTickets.filter(t => t.qaAssessment?.status === "Failed").length;
  
  // Per-agent data
  const agentPerformance = qaTickets.reduce((acc, t) => {
    const agent = t.assignedQaAgent || "Unassigned";
    if (!acc[agent]) acc[agent] = { name: agent, pass: 0, fail: 0 };
    if (t.qaAssessment?.status === "Passed") acc[agent].pass++;
    else acc[agent].fail++;
    return acc;
  }, {} as Record<string, { name: string, pass: number, fail: number }>);

  const chartData = Object.values(agentPerformance);

  return (
    <div className="fixed inset-0 z-50 bg-black/5 flex items-start justify-center p-4">
      <div className="bg-white dark:bg-slate-850 w-full max-w-4xl max-h-[80vh] rounded-xl border border-slate-200 dark:border-slate-750 p-6 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-[12px] text-black dark:text-white flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-500" />
            Reporting & Analytics
          </h3>
          <button onClick={onClose} className="text-black hover:text-black"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex flex-col items-center border border-slate-100 dark:border-slate-800">
              <AlertTriangle className="w-6 h-6 text-rose-500 mb-2" />
              <span className="text-[12px] font-bold">{flaggedCount}</span>
              <span className="text-[10px] text-black uppercase tracking-wider">Incidents Flagged</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex flex-col items-center border border-slate-100 dark:border-slate-800">
              <TrendingUp className="w-6 h-6 text-emerald-500 mb-2" />
              <span className="text-[12px] font-bold">{qaTickets.length}</span>
              <span className="text-[10px] text-black uppercase tracking-wider">Total QA Tickets</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex flex-col items-center border border-slate-100 dark:border-slate-800">
              <User className="w-6 h-6 text-blue-500 mb-2" />
              <span className="text-[12px] font-bold">{Object.keys(agentPerformance).length}</span>
              <span className="text-[10px] text-black uppercase tracking-wider">Active Agents</span>
            </div>
          </div>

          <div className="h-64 border border-slate-100 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
            <h4 className="text-[12px] font-semibold mb-4 text-black dark:text-slate-200">Agent Performance (Pass vs Fail)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={chartData}>
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="pass" fill="#10b981" radius={[4, 4, 0, 0]} name="Passed" />
                <Bar dataKey="fail" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Failed" />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-4">
              <h4 className="text-[12px] font-semibold mb-4 text-black dark:text-slate-200">Recent Assessments</h4>
              <div className="space-y-2">
                  {qaTickets.slice(0, 5).map(t => (
                      <div key={t.id} className="flex justify-between text-[12px] border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span>{t.clientInfo.name} ({t.assignedQaAgent || "Unassigned"})</span>
                          <span className={`font-bold ${t.qaAssessment?.status === "Passed" ? "text-emerald-600" : "text-rose-500"}`}>{t.qaAssessment?.status || "Pending"}</span>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
