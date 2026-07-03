import React, { useState, useEffect } from "react";
import { 
  Phone, Video, Send, Check, AlertCircle, Sparkles, MessageSquare, 
  Clock, X, Volume2, Mic, PhoneOff, VideoOff, Wifi, Play, HelpCircle
} from "lucide-react";
import { ChatMessage, CallLog, VideoSession } from "../types";

interface BlanketCommsProps {
  ticketsList: any[];
  employeesList?: any[];
  selectedDept?: string;
  onTriggerRefresh: () => void;
  chatsData: Record<string, ChatMessage[]>;
  callLogs: CallLog[];
  videoSessions: VideoSession[];
  defaultChannel?: "calls" | "video" | "chats";
}

export default function BlanketComms({
  ticketsList,
  employeesList = [],
  selectedDept = "Sales",
  onTriggerRefresh,
  chatsData,
  callLogs,
  videoSessions,
  defaultChannel = "chats"
}: BlanketCommsProps) {
  const [activeChannel, setActiveChannel] = useState<"calls" | "video" | "chats">(defaultChannel);
  
  useEffect(() => {
    setActiveChannel(previousChannel => defaultChannel || previousChannel);
  }, [defaultChannel]);
  const [activeChatNetwork, setActiveChatNetwork] = useState<"whatsapp" | "telegram" | "facebook" | "instagram" | "twitter">("whatsapp");
  const [selectedContact, setSelectedContact] = useState<string>("Dumisani Khumalo");
  const [chatInput, setChatInput] = useState("");
  
  // Simulated Phone Call State
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [dialNumber, setDialNumber] = useState("+27 72 345 6789");

  // Simulated Video consultation State
  const [isVideoConnected, setIsVideoConnected] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  // AI Audit State for communications
  const [aiAuditing, setAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<{ sentiment: string; score: number; comment: string } | null>(null);

  const isStaffOnlyDept = selectedDept === "Human Capital" || selectedDept === "Training and Development" || selectedDept === "Information & Technology" || selectedDept === "Systems Administration" || selectedDept === "Quality Assurance";

  // Create a normalized contact representation - STRICTLY CENTRIX USERS ONLY (No Client Interaction)
  const contacts = employeesList.map((emp, idx) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    phone: "+27 11 555 " + (2000 + idx),
    isStaff: true,
    role: emp.role,
    department: emp.department
  }));

  // Synchronize contact selection if contact lists change
  useEffect(() => {
    if (contacts.length > 0) {
      const exists = contacts.some(c => c.name === selectedContact);
      if (!exists) {
        setSelectedContact(contacts[0].name);
      }
    }
  }, [selectedDept, employeesList]);

  // Synchronize contact details if selected contact changed
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      const match = contacts.find(c => c.name === selectedContact);
      if (match) {
        setDialNumber(match.phone);
      }
    }
  }, [selectedContact, employeesList, selectedDept]);

  // Call simulation Timer
  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  // Video simulation Timer
  useEffect(() => {
    let interval: any;
    if (isVideoConnected) {
      interval = setInterval(() => {
        setVideoDuration(prev => prev + 1);
      }, 1000);
    } else {
      setVideoDuration(0);
    }
    return () => clearInterval(interval);
  }, [isVideoConnected]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      await fetch("/api/crm/chats/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: selectedContact,
          sender: "agent",
          message: `${activeChatNetwork.toUpperCase()}: ${chatInput}`
        })
      });

      // Simple simulated automatic client reply after 1.5s
      const currentInput = chatInput;
      setChatInput("");
      onTriggerRefresh();

      setTimeout(async () => {
        const contactObj = contacts.find(c => c.name === selectedContact);
        const role = contactObj?.role || "Staff User";
        const dept = contactObj?.department || "HR";
        let responseMessage = `Acknowledged. I'm checking my current workload and will get back to you shortly. Respectfully, ${contactObj?.name} (${role})`;

        if (selectedDept === "Training and Development") {
          responseMessage = `Acknowledged. I'm updating my active curriculum and complete percentage rate now. Respectfully, ${contactObj?.name} (${role})`;
        } else if (selectedDept === "Quality Assurance") {
           responseMessage = `Received. I am uploading the recorded logs and compliance review files to the TQM portal. Respectfully, ${contactObj?.name} (${role})`;
        }

        await fetch("/api/crm/chats/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: selectedContact,
            sender: "client",
            message: responseMessage,
          })
        });
        onTriggerRefresh();
      }, 1500);

    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestAiAudit = async () => {
    setAiAuditing(true);
    setAiAuditResult(null);
    try {
      const msgs = chatsData[selectedContact] || [];
      const res = await fetch("/api/crm/ai-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: activeChannel === "chats" ? activeChatNetwork : "Voice Phone Line",
          messageLog: msgs,
          contextValue: activeChannel === "chats" ? 45000 : 1200000
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiAuditResult(data.audit);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAiAuditing(false);
    }
  };

  const startPhoneCall = () => {
    setIsCalling(true);
    setAiAuditResult(null);
  };

  const endPhoneCall = async () => {
    setIsCalling(false);
    try {
      await fetch("/api/crm/calls/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: "Outbound",
          contactName: selectedContact,
          duration: formatTime(callDuration),
          rate: Math.random() > 0.3 ? "Passed" : "Needs Review",
          auditReport: `Voice call session on extension ${selectedContact.replace(/ /g, "")}. Compliance and security verified.`
        })
      });
    } catch (err) {
      console.error(err);
    }
    onTriggerRefresh();
  };

  const endVideoSession = async () => {
    setIsVideoConnected(false);
    try {
      await fetch("/api/crm/video/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: "Room-Alpha-Sync",
          clientName: selectedContact,
          duration: formatTime(videoDuration),
          status: "Saved in Storage Drive"
        })
      });
    } catch (err) {
      console.error(err);
    }
    onTriggerRefresh();
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-[520px]">
      {/* Header with quick tabs */}
      <div className="bg-slate-50/50 dark:bg-slate-900/30 px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-display font-medium text-black dark:text-white text-[12px]">Internal Comms Suite</h3>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest block bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-sm mt-1 border border-indigo-100 dark:border-indigo-800/50">
              CentriX Staff Directory Only (No Client Action)
            </span>
          </div>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-[12px] font-bold border border-slate-200 dark:border-slate-700">
          <button 
            type="button"
            onClick={() => { setActiveChannel("chats"); setAiAuditResult(null); }}
            className={`px-4 py-1.5 rounded-md transition-colors ${activeChannel === "chats" ? "bg-white dark:bg-slate-705 text-blue-600 dark:text-blue-400 shadow-sm" : "text-black dark:text-white hover:text-black dark:hover:text-slate-200"}`}
          >
            Chats
          </button>
          <button 
            type="button"
            onClick={() => { setActiveChannel("calls"); setAiAuditResult(null); }}
            className={`px-4 py-1.5 rounded-md transition-colors ${activeChannel === "calls" ? "bg-white dark:bg-slate-705 text-blue-600 dark:text-blue-400 shadow-sm" : "text-black dark:text-white hover:text-black dark:hover:text-slate-200"}`}
          >
            Calls
          </button>
          <button 
            type="button"
            onClick={() => { setActiveChannel("video"); setAiAuditResult(null); }}
            className={`px-4 py-1.5 rounded-md transition-colors ${activeChannel === "video" ? "bg-white dark:bg-slate-705 text-blue-600 dark:text-blue-400 shadow-sm" : "text-black dark:text-white hover:text-black dark:hover:text-slate-200"}`}
          >
            Video
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 flex-1 divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {/* Contact list side column */}
        <div className="col-span-3 bg-slate-50/30 dark:bg-slate-900/20 p-4 overflow-y-auto">
          <span className="text-[10px] uppercase tracking-widest text-black dark:text-white font-bold block mb-3">
            Active Staff Directory
          </span>
          <div className="space-y-1">
            {contacts.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedContact(c.name);
                  setAiAuditResult(null);
                }}
                className={`w-full text-left p-2 rounded-lg text-[12px] transition duration-150 block truncate ${selectedContact === c.name ? "bg-indigo-50 dark:bg-indigo-900/40 border-l-4 border-indigo-600 dark:border-indigo-400 font-medium text-indigo-900 dark:text-indigo-200" : "text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"}`}
              >
                <div className="font-semibold flex items-center gap-1">
                  {isStaffOnlyDept && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>}
                  {c.name}
                </div>
                <div className="text-[10px] text-black dark:text-white mt-0.5 truncate uppercase font-bold">
                  {isStaffOnlyDept ? `${c.role} (${c.department})` : c.email}
                </div>
              </button>
            ))}
          </div>

          {/* Quick Stats Panel */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-3">
            {isStaffOnlyDept ? (
              <div className="bg-slate-100 dark:bg-indigo-950/35 border border-indigo-200/40 dark:border-indigo-900/40 rounded-lg p-2 text-[10px] text-black dark:text-white space-y-1">
                <div className="font-bold text-[10px] uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping inline-block"></span>
                  Staff Security Active
                </div>
                <p className="text-[10px] leading-relaxed text-black dark:text-white">
                  Client files & contacts are restricted under active corporate HCM and staff safety firewall rules.
                </p>
              </div>
            ) : (
              <>
                <span className="text-[10px] uppercase font-bold text-black dark:text-white block mb-2">CRM Phone Diagnostics</span>
                <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg p-2 text-[10px] text-black dark:text-white space-y-1">
                  <div className="flex justify-between"><span>SIP Client Status:</span> <span className="text-emerald-500 font-semibold flex items-center gap-0.5"><Wifi className="w-2.5 h-2.5"/> Online</span></div>
                  <div className="flex justify-between"><span>Active Calls Logs:</span> <span>{callLogs.length} today</span></div>
                  <div className="flex justify-between"><span>Switchboard Route:</span> <span>Interactive</span></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Communication Workspace Area */}
        <div className="col-span-9 flex flex-col h-full bg-white dark:bg-slate-800">
          
          {/* Social network selection header if network chats active */}
          {activeChannel === "chats" && (
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-3 py-1.5 bg-slate-50 dark:bg-slate-750">
              <div className="flex gap-1.5 overflow-x-auto py-0.5">
                {[
                  { id: "whatsapp", label: "WhatsApp", color: "bg-emerald-500" },
                  { id: "telegram", label: "Telegram", color: "bg-sky-500" },
                  { id: "facebook", label: "Facebook", color: "bg-blue-600" },
                  { id: "instagram", label: "Instagram", color: "bg-pink-500" },
                  { id: "twitter", label: "Twitter / X", color: "bg-slate-900" }
                ].map(net => (
                  <button
                    key={net.id}
                    onClick={() => setActiveChatNetwork(net.id as any)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition flex items-center gap-1.5 border ${activeChatNetwork === net.id ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-700 text-black dark:text-white border-slate-200 dark:border-slate-600 hover:bg-slate-100"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${net.color}`}></span>
                    {net.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRequestAiAudit}
                disabled={aiAuditing}
                className="text-[10px] flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-medium px-2 py-1 rounded-md shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-white animate-pulse" />
                {aiAuditing ? "Auditing Contact..." : "AI Client Audit"}
              </button>
            </div>
          )}

          {/* DYNAMIC VIEW */}
          {/* CHATS CONTENT VIEW */}
          {activeChannel === "chats" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiAuditResult && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-750 dark:to-slate-700 border border-amber-200 dark:border-slate-600 rounded-lg p-3 relative shadow-xs">
                    <button onClick={() => setAiAuditResult(null)} className="absolute top-2 right-2 text-black hover:text-black dark:hover:text-slate-200">
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-[12px] mb-1">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      CentriX AI Background Auditor (TQM Audit)
                    </div>
                    <div className="grid grid-cols-12 gap-2 mt-1.5">
                      <div className="col-span-8 text-[11px] text-black dark:text-slate-200">
                        {aiAuditResult.comment}
                      </div>
                      <div className="col-span-4 border-l border-amber-200 dark:border-slate-600 pl-2 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-black uppercase font-semibold">Risk Score</span>
                        <span className={`text-[12px] font-black ${aiAuditResult.score > 70 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                          {aiAuditResult.score}/100
                        </span>
                        <span className="text-[10px] text-black italic mt-0.5">{aiAuditResult.sentiment}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages stream rendered dynamically */}
                {(chatsData[selectedContact] || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-black dark:text-white text-[12px]">
                    <MessageSquare className="w-8 h-8 opacity-25 mb-1.5" />
                    No previous chats. Send an outbound message to initiate sync.
                  </div>
                ) : (
                  (chatsData[selectedContact] || []).map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 text-[12px] relative ${msg.sender === "agent" ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-105 dark:bg-slate-700 dark:text-slate-100 text-black rounded-bl-none"}`}>
                        <p className="leading-relaxed">{msg.message}</p>
                        <span className="text-[10px] block text-right mt-1 opacity-60">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Send Input Box */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={isStaffOnlyDept 
                    ? `Type a secure corporate staff message to ${selectedContact}...` 
                    : `Type a message to route to client's ${activeChatNetwork.toUpperCase()}...`
                  }
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendChatMessage(); }}
                  className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-[12px] text-black dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendChatMessage}
                  className={`p-1.5 ${isStaffOnlyDept ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg transition duration-150`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CALLS/SWITCHBOARD SIMULATOR VIEW */}
          {activeChannel === "calls" && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              {!isCalling ? (
                <div className="text-center max-w-sm space-y-4">
                  <div className={`w-16 h-16 ${isStaffOnlyDept ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"} rounded-full flex items-center justify-center mx-auto`}>
                    <Phone className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-black dark:text-white text-[12px]">
                      {isStaffOnlyDept ? "Internal Staff Intercom Trunk" : "Outbound Digital Telephone Switch"}
                    </h4>
                    <p className="text-[12px] text-black dark:text-white mt-1">
                      {isStaffOnlyDept 
                        ? `Secure internal intercom line to ${selectedContact}'s active corporate CRM terminal extension.` 
                        : "Initiate a VoIP routing line directly from the CRM local disk drive network call-stack."
                      }
                    </p>
                  </div>

                  <div className="space-y-2 bg-slate-50 dark:bg-slate-700/40 p-3 rounded-lg border border-slate-200 dark:border-slate-650">
                    <label className="text-[10px] font-bold text-black dark:text-white uppercase block text-left">Recipient Destination</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={dialNumber}
                        onChange={(e) => setDialNumber(e.target.value)}
                        className="bg-white dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1.5 text-[12px] text-black dark:text-white flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={startPhoneCall}
                    className={`w-full py-2.5 ${isStaffOnlyDept ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white rounded-lg font-semibold text-[12px] flex items-center justify-center gap-2 shadow-xs transition`}
                  >
                    <Phone className="w-4 h-4" /> {isStaffOnlyDept ? "Connect Staff Extension" : "Dial Outbound Trunk"}
                  </button>
                </div>
              ) : (
                <div className="text-center w-full max-w-md space-y-6">
                  <div className="space-y-2">
                    <div className={`w-20 h-20 ${isStaffOnlyDept ? "bg-indigo-500/10 text-indigo-500 border-indigo-500" : "bg-emerald-500/10 text-emerald-500 border-emerald-500"} rounded-full flex items-center justify-center mx-auto border-4 animate-pulse`}>
                      <Phone className="w-10 h-10" />
                    </div>
                    <div className="text-[12px] font-bold text-black dark:text-white">{selectedContact}</div>
                    <div className="text-[12px] text-black dark:text-white font-mono">{dialNumber}</div>
                    <div className={`text-[12px] font-semibold px-2 py-0.5 ${isStaffOnlyDept ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300" : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"} rounded-full inline-block mt-1`}>
                      {isStaffOnlyDept ? "Staff Intercom Connected" : "SIP Trunk Connected"} — {formatTime(callDuration)}
                    </div>
                  </div>

                  {/* Active call controls */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 rounded-full border transition ${isMuted ? "bg-amber-100 dark:bg-amber-950 text-amber-600 border-amber-400" : "bg-white dark:bg-slate-700 text-black dark:text-white border-slate-300"}`}
                      title="Mute Call"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsSpeaker(!isSpeaker)}
                      className={`p-3 rounded-full border transition ${isSpeaker ? "bg-blue-100 dark:bg-blue-950 text-blue-600 border-blue-400" : "bg-white dark:bg-slate-700 text-black dark:text-white border-slate-300"}`}
                      title="Route Speakerphone"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={endPhoneCall}
                      className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white"
                      title="Hang Up"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>
                  </div>

                  {/* AI call recording & real-time sentiment assist option */}
                  <div className="bg-slate-50 dark:bg-slate-750 p-3 rounded-lg border border-slate-200 dark:border-slate-600 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-black dark:text-slate-200 flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" /> {isStaffOnlyDept ? "Realtime Staff Performance & Audit Assist" : "Realtime AI Transcription & Sentiment"}
                      </span>
                      <button 
                        onClick={handleRequestAiAudit}
                        disabled={aiAuditing}
                        className={`text-[10px] ${isStaffOnlyDept ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"} text-white font-medium px-2 py-0.5 rounded-sm`}
                      >
                        {aiAuditing ? "Processing..." : "Generate Call Audit"}
                      </button>
                    </div>
 
                     {aiAuditResult ? (
                       <div className="mt-2 space-y-1">
                         <div className="text-[10px] text-black dark:text-white">
                           <span className="font-semibold text-black dark:text-white">Call Sentiment:</span> {aiAuditResult.sentiment} (Score: {aiAuditResult.score}/100)
                         </div>
                         <p className="text-[10px] italic text-black dark:text-white bg-white dark:bg-slate-800 p-1.5 rounded-sm border">
                           "{aiAuditResult.comment}"
                         </p>
                       </div>
                     ) : (
                       <p className="text-[10px] text-black dark:text-white mt-1">
                         {isStaffOnlyDept 
                           ? "Audit internal communication tapes to ensure adherence to corporate policy & service levels."
                           : "CentriX AI assists with real-time call reviews. Press \"Generate Call Audit\" to run background TQM evaluation."
                         }
                       </p>
                     )}
                   </div>
                 </div>
               )}
             </div>
           )}
 
           {/* VIDEO CONSULTATION SIMULATION VIEW */}
           {activeChannel === "video" && (
             <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
               {!isVideoConnected ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                   <div className={`w-16 h-16 ${isStaffOnlyDept ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"} rounded-full flex items-center justify-center`}>
                     <Video className="w-8 h-8" />
                   </div>
                   <div>
                     <h4 className="font-bold text-black dark:text-white text-[12px]">
                       {isStaffOnlyDept ? "Corporate Virtual Consultation Meet" : "Local Drive Video Room Router"}
                     </h4>
                     <p className="text-[12px] text-black dark:text-white mt-1">
                       {isStaffOnlyDept
                         ? "Secure virtual video link to sync on internal training materials, audit reports and recruitment steps."
                         : "Launch a secure client face-to-face inspection check. Captured videos will be streamed directly to the CRM storage drive."
                       }
                     </p>
                   </div>
                   <button
                     onClick={() => setIsVideoConnected(true)}
                     className={`w-full py-2 ${isStaffOnlyDept ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg font-semibold text-[12px] transition shadow-xs`}
                   >
                     {isStaffOnlyDept ? "Start Staff Scrum Video Link" : "Start Valuations Video Link"}
                   </button>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col justify-between">
                   {/* Simulated split screens for consultant and client */}
                   <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
                     {/* Client Canvas split screen */}
                     <div className="bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center border border-slate-700 shadow-sm">
                       {isVideoMuted ? (
                         <div className="text-center text-black text-[12px]">
                           <VideoOff className="w-8 h-8 mx-auto opacity-30 mb-1" />
                           Camera inactive
                         </div>
                       ) : (
                         <div className="w-full h-full relative">
                           <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-sm text-[10px] text-white">
                             {isStaffOnlyDept ? `Staff Colleague: ${selectedContact}` : `Client: ${selectedContact}`}
                           </div>
                           {/* Simulated elegant dashboard client camera */}
                           <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center">
                             <div className={`w-14 h-14 rounded-full ${isStaffOnlyDept ? "bg-indigo-500/25 border-indigo-400 text-indigo-300" : "bg-blue-500/25 border-blue-400 text-blue-300"} flex items-center justify-center border-2 font-bold mb-1.5 animate-pulse text-[12px]`}>
                               {selectedContact.substring(0,2).toUpperCase()}
                             </div>
                             <span className="text-[10px] text-black font-medium tracking-wide">Secure Stream Live...</span>
                           </div>
                         </div>
                       )}
                     </div>
 
                     {/* Consultant split screen */}
                     <div className="bg-slate-800 rounded-lg relative overflow-hidden flex items-center justify-center border border-slate-700 shadow-sm">
                       <div className="w-full h-full relative">
                         <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-sm text-[10px] text-white">
                           You (Consultant Desk)
                         </div>
                         <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center">
                           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border text-slate-200 text-[12px]">
                             SYS
                           </div>
                           <span className="text-[10px] text-black mt-1.5">CentriX Camera active</span>
                         </div>
                       </div>
                     </div>
                   </div>
 
                   {/* Video details & controllers */}
                   <div className="mt-3 bg-slate-100 dark:bg-slate-900 p-3 rounded-lg border flex items-center justify-between">
                     <div className="text-[12px]">
                       <span className="font-bold text-black dark:text-white">Storage Drive Link: </span>
                       <span className={`${isStaffOnlyDept ? "text-indigo-600 dark:text-indigo-400" : "text-blue-600 dark:text-blue-400"} text-[10px] font-mono block truncate max-w-[240px]`}>
                         {isStaffOnlyDept 
                           ? `/drive/staff/SECURE-MEET-${selectedContact.replace(/ /g, "_")}.avi`
                           : `/drive/calls/VID-${selectedContact.replace(/ /g, "_")}.avi5`
                         }
                       </span>
                       <span className="block text-[10px] text-black mt-0.5">Duration: {formatTime(videoDuration)}</span>
                     </div>
 
                     <div className="flex gap-2">
                       <button
                         onClick={() => setIsAudioMuted(!isAudioMuted)}
                         className={`p-2 rounded-lg text-[12px] font-semibold ${isAudioMuted ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600" : "bg-white dark:bg-slate-800 text-black dark:text-white border"}`}
                       >
                         {isAudioMuted ? "Unmute Mic" : "Mute Mic"}
                       </button>
                       <button
                         onClick={() => setIsVideoMuted(!isVideoMuted)}
                         className={`p-2 rounded-lg text-[12px] font-semibold ${isVideoMuted ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600" : "bg-white dark:bg-slate-800 text-black dark:text-white border"}`}
                       >
                         {isVideoMuted ? "Enable Cam" : "Disable Cam"}
                       </button>
                       <button
                         onClick={endVideoSession}
                         className="py-1 px-3 bg-rose-600 text-white rounded-lg text-[12px] hover:bg-rose-700"
                       >
                         Disconnect Link
                       </button>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           )}

        </div>
      </div>
      
    </div>
  );
}
