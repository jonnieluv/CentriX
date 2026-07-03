import React from "react";
import { X, Play, Download, Search } from "lucide-react";
import { Ticket, CallLog, VideoSession } from "../types";

interface ConversationsModalProps {
  tickets: Ticket[];
  onClose: () => void;
}

export default function ConversationsModal({ tickets, onClose }: ConversationsModalProps) {
  // Simulate aggregated conversation data from tickets
  const allConversations = tickets.flatMap(t => [
      ...t.auditLogs.map(log => ({ id: log.id, type: "Audit Log", agent: log.auditor, content: log.comment, date: log.timestamp })),
      ...(t.notesHistory || []).map(note => ({ id: note.id, type: "Note", agent: note.author, content: note.text, date: note.timestamp }))
  ]);

  return (
    <div className="fixed inset-0 z-50 bg-black/5 flex items-start justify-center p-4">
      <div className="bg-white dark:bg-slate-850 w-full max-w-4xl max-h-[80vh] rounded-lg border border-slate-200 dark:border-slate-750 p-6 shadow-2xl flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[12px] text-black dark:text-white">All Conversations</h3>
          <button onClick={onClose} className="text-black hover:text-black"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-slate-50 dark:bg-slate-800 text-black uppercase">
              <tr>
                <th className="p-2 text-left">Agent</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Content</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allConversations.map(conv => (
                <tr key={conv.id} className="border-b dark:border-slate-700">
                  <td className="p-2">{conv.agent}</td>
                  <td className="p-2">{conv.type}</td>
                  <td className="p-2 italic text-black dark:text-white">"{conv.content}"</td>
                  <td className="p-2">{conv.date}</td>
                  <td className="p-2 flex gap-2">
                    <button className="p-1 hover:text-blue-600"><Play className="w-4 h-4" /></button>
                    <button className="p-1 hover:text-blue-600"><Download className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
