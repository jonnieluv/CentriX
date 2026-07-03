import React from "react";
import { 
  BarChart3, TrendingUp, Users, Target, Clock, 
  Award, Zap, CheckCircle, Activity, ArrowUpRight,
  TrendingDown, Star, MessageSquare, Briefcase
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, Cell, PieChart, Pie
} from "recharts";

interface UserStatsProps {
  userEmail: string;
}

export default function UserStats({ userEmail }: UserStatsProps) {
  const performanceData = [
    { day: "Mon", apps: 24, quality: 92 },
    { day: "Tue", apps: 32, quality: 88 },
    { day: "Wed", apps: 28, quality: 95 },
    { day: "Thu", apps: 45, quality: 84 },
    { day: "Fri", apps: 38, quality: 91 },
    { day: "Sat", apps: 12, quality: 98 },
    { day: "Sun", apps: 8, quality: 96 },
  ];

  const distributionData = [
    { name: "Approved", value: 400, color: "#10b981" },
    { name: "Pending", value: 300, color: "#3b82f6" },
    { name: "Audit", value: 100, color: "#f59e0b" },
    { name: "Rejected", value: 50, color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Application Velocity", value: "187", sub: "+12.5%", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "TQM Quality Index", value: "94.2%", sub: "+2.1%", icon: Award, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Conversion Yield", value: "68%", sub: "-0.5%", icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Desk Connection", value: "142h", sub: "Active Duty", icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" }
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-start">
              <div className={`${kpi.bg} dark:bg-slate-800 p-3 rounded-2xl`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${kpi.sub.includes('+') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-50'}`}>
                {kpi.sub}
              </span>
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{kpi.label}</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Performance Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Duty Performance</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Application volume & quality metrics (7-Day period)</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 capitalize">Volume</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 capitalize">Quality</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="apps" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-6 shadow-sm text-white relative overflow-hidden">
          <Activity className="absolute -right-4 -top-4 w-32 h-32 text-white/5 rotate-12" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 relative z-10">Folder Distribution</h3>
          <div className="h-[200px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-2xl font-black">850</span>
              <span className="text-[10px] font-black text-slate-500 uppercase">Folders</span>
            </div>
          </div>
          <div className="space-y-3 mt-6 relative z-10">
            {distributionData.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-black uppercase tracking-tight">{item.name}</span>
                </div>
                <span className="text-xs font-mono font-bold">{item.value} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Activity Log */}
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-blue-600" /> Interaction Log
          </h3>
          <div className="space-y-4">
            {[
              { type: "Approval", client: "M. Theron", time: "12m ago", icon: CheckCircle, color: "text-emerald-500" },
              { type: "Interaction", client: "D. Jacobs", time: "45m ago", icon: MessageSquare, color: "text-blue-500" },
              { type: "Review", client: "S. Khumalo", time: "2h ago", icon: Briefcase, color: "text-indigo-500" },
              { type: "Approval", client: "L. Van Wyk", time: "5h ago", icon: CheckCircle, color: "text-emerald-500" }
            ].map((log, i) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition rounded-2xl cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-900 transition">
                    <log.icon className={`w-3.5 h-3.5 ${log.color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-black block text-slate-900 dark:text-white">{log.client}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{log.type} Processed</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Board */}
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-6">
            <Star className="w-4 h-4 text-amber-500" /> Badge Trunk
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Closer", icon: Target, color: "bg-emerald-50 text-emerald-600" },
              { label: "Night Owl", icon: Clock, color: "bg-indigo-50 text-indigo-600" },
              { label: "MVP", icon: Award, color: "bg-blue-50 text-blue-600" },
              { label: "Speed", icon: Zap, color: "bg-amber-50 text-amber-600" },
              { label: "Scale", icon: TrendingUp, color: "bg-rose-50 text-rose-600" },
              { label: "Shield", icon: Zap, color: "bg-slate-50 text-slate-600" }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 group">
                <div className={`w-12 h-12 ${badge.color} rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6`}>
                  <badge.icon className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black uppercase text-slate-400">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Efficiency Index */}
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <TrendingUp className="absolute -left-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12" />
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-200 mb-6">Efficiency Forecast</h3>
          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase text-blue-200">Daily Target Completion</span>
                <span className="text-2xl font-black">92%</span>
              </div>
              <div className="w-full bg-blue-900/30 h-3 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[92%]"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <span className="text-[9px] font-black uppercase text-blue-200 block">SLA Response</span>
                <span className="text-sm font-black">{"<"} 4.5m</span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <span className="text-[9px] font-black uppercase text-blue-200 block">Net Reach</span>
                <span className="text-sm font-black">2.4k clients</span>
              </div>
            </div>

            <button className="w-full py-3 bg-white text-blue-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-50 transition shadow-lg mt-2">
              Optimize Workspace Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
