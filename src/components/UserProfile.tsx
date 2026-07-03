import React, { useState } from "react";
import { 
  User, Mail, Phone, MapPin, Shield, Bell, 
  Key, Globe, Camera, Save, CheckCircle, 
  AlertCircle, Briefcase, Calendar, Lock
} from "lucide-react";

interface UserProfileProps {
  userEmail: string;
  department: string;
  onClose: () => void;
}

export default function UserProfile({ userEmail, department, onClose }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "notifications">("personal");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl">
              <img src="https://i.pravatar.cc/150?img=47" className="w-full h-full object-cover" alt="User" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition cursor-pointer">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {userEmail.split('@')[0] || "Phyllis Yang"}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-3 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
                {department} Consultant
              </span>
              <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Johannesburg, South Africa
              </span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex gap-2">
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: "personal", label: "Identity & Info", icon: User },
            { id: "security", label: "Cryptographic Security", icon: Shield },
            { id: "notifications", label: "Trunk Notifications", icon: Bell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}

          <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-3xl mt-6">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Account Verification</span>
            </div>
            <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
              Your corporate profile is 85% complete. Please verify your phone number to enable two-factor authentication.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          {activeTab === "personal" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" /> Personal Taxonomy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-1">Legal Full Name</label>
                    <input type="text" defaultValue="Phyllis Yang" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-1">Desk Identifier</label>
                    <input type="text" defaultValue={userEmail} readOnly className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold opacity-70 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-1">Corporate Mobile</label>
                    <input type="text" defaultValue="+27 72 455 1290" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-1">Office Location</label>
                    <input type="text" defaultValue="Floor 12, CentriX Towers" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 transition" />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" /> Organizational Role
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Department</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">{department}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Employment Date</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">Jan 12, 2024</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Manager</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">David Miller</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-600" /> Access Credentials
                </h3>
                <div className="space-y-4 mt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 dark:bg-slate-850 rounded-3xl border-2 border-dashed dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                        <Lock className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Trunk Encryption Password</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Last updated 45 days ago</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition mt-4 md:mt-0">
                      Update Passkey
                    </button>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 dark:bg-slate-850 rounded-3xl border-2 border-dashed dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                        <Globe className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                        <p className="text-[10px] text-amber-600 font-bold uppercase mt-0.5 animate-pulse">Recommended for Compliance</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition mt-4 md:mt-0">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" /> Dispatch Preferences
              </h3>
              <div className="space-y-3 mt-6">
                {[
                  { label: "New Application Envelope", desc: "Notify when a buyer submits a mortgage application." },
                  { label: "System Service Alerts", desc: "Critical maintenance updates to the vault core." },
                  { label: "Customer Chat Interaction", desc: "Live switchboard rings from the customer experience desk." },
                  { label: "Departmental Directives", desc: "Daily bulletins from the executive board." }
                ].map((pref, i) => (
                  <label key={i} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800/50 border dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer group">
                    <div className="flex-1 pr-6">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition">{pref.label}</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">{pref.desc}</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isSaved && (
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-black uppercase tracking-widest">Profile Configuration Synchronized</span>
        </div>
      )}
    </div>
  );
}
