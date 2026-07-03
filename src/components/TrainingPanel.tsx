import React, { useState } from "react";
import { 
  BookOpen, Play, CheckCircle, Clock, Users, Plus, 
  Search, Download, FileText, Award, Layers, Sparkles,
  BarChart3, Video, FileQuestion, Trash2, Send, X, UserPlus,
  ArrowRight, Settings, Trash, Edit3
} from "lucide-react";
import { TrainingCourse, TrainingAssignment, Employee } from "../types";

interface TrainingPanelProps {
  trainingCatalog: TrainingCourse[];
  trainingAssignments: TrainingAssignment[];
  employees: Employee[];
  onAddCourse: (course: { title: string; duration: string }) => void;
  onAssignTraining: (employeeId: string, courseId: string) => void;
  onUpdateProgress: (assignmentId: string, progress: number, status?: string, feedback?: string) => void;
  onUpdateCourse: (id: string, updates: any) => void;
  onDeleteCourse: (id: string) => void;
}

export default function TrainingPanel({
  trainingCatalog,
  trainingAssignments,
  employees,
  onAddCourse,
  onAssignTraining,
  onUpdateProgress,
  onUpdateCourse,
  onDeleteCourse
}: TrainingPanelProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "builder" | "analytics" | "assignments">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Interactive assignment states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  
  // Learner oversight modal
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewProgress, setReviewProgress] = useState(0);
  
  // Builder/Edit state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDuration, setNewCourseDuration] = useState("3 hours");
  const [buildSuccess, setBuildSuccess] = useState(false);

  const handleBuild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    if (editingCourseId) {
      onUpdateCourse(editingCourseId, { title: newCourseTitle, duration: newCourseDuration });
      setEditingCourseId(null);
    } else {
      onAddCourse({ title: newCourseTitle, duration: newCourseDuration });
    }
    setNewCourseTitle("");
    setBuildSuccess(true);
    setTimeout(() => setBuildSuccess(false), 3000);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployeeId && selectedCourseId) {
      onAssignTraining(selectedEmployeeId, selectedCourseId);
      setIsAssignModalOpen(false);
      setSelectedEmployeeId("");
      setSelectedCourseId("");
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssignmentId) {
      onUpdateProgress(selectedAssignmentId, reviewProgress, undefined, reviewFeedback);
      setIsReviewModalOpen(false);
      setReviewFeedback("");
    }
  };

  const filteredCatalog = trainingCatalog.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalEmployees = employees.length;
  const completedAssignments = trainingAssignments.filter(a => a.status === "Completed").length;
  const inProgressAssignments = trainingAssignments.filter(a => a.status === "In-Progress").length;
  const avgProgress = trainingAssignments.length > 0 
    ? Math.round(trainingAssignments.reduce((acc, a) => acc + a.progress, 0) / trainingAssignments.length)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Upper Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-2 flex flex-wrap gap-2 shadow-sm">
        {[
          { id: "catalog", label: "Learning Catalog", icon: BookOpen },
          { id: "assignments", label: "Staff Assignments", icon: Users },
          { id: "builder", label: "Curriculum Builder", icon: Layers },
          { id: "analytics", label: "L&D Analytics", icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-2xl transition ${
              activeTab === tab.id
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Workspace (Left 8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "catalog" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-850 p-4 rounded-3xl">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search curriculums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition shadow-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        setEditingCourseId(null);
                        setNewCourseTitle("");
                        setActiveTab("builder");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-900 dark:text-white hover:scale-105 transition text-xs font-black uppercase tracking-widest border dark:border-slate-800"
                  >
                    <Plus className="w-4 h-4" /> Create Course
                  </button>
                  <button className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-600 dark:text-slate-400 hover:scale-105 transition"><Download className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCatalog.map(course => (
                  <div key={course.id} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-5 hover:shadow-lg transition cursor-pointer group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-blue-600 uppercase mb-1">{course.id}</span>
                        <div className="flex gap-1.5">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCourseId(course.id);
                                    setNewCourseTitle(course.title);
                                    setNewCourseDuration(course.duration);
                                    setActiveTab("builder");
                                }}
                                className="p-1 text-slate-400 hover:text-blue-500 transition"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteCourse(course.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight group-hover:text-blue-600 transition">{course.title}</h4>
                    
                    <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1.5 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1.5 uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5" />
                        {course.participants} Enrolled
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <button 
                        onClick={() => {
                            setSelectedCourseId(course.id);
                            setIsAssignModalOpen(true);
                        }}
                        className="flex-1 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition shadow-md flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Assign to staff
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white">Active Staff Learning Paths</h3>
                            <p className="text-xs text-slate-500 mt-1">Live monitoring of employee curriculum progression and assessment performance.</p>
                        </div>
                        <button 
                             onClick={() => setIsAssignModalOpen(true)}
                             className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> New Assignment
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-855 text-left text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Curriculum Path</th>
                                    <th className="px-6 py-4">Progress</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-slate-800">
                                {trainingAssignments.map(asgn => {
                                    const employee = employees.find(e => e.id === asgn.employeeId);
                                    const course = trainingCatalog.find(c => c.id === asgn.courseId);
                                    return (
                                        <tr key={asgn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[10px]">
                                                        {employee?.name.split(" ").map(n => n[0]).join("") || "?"}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 dark:text-white">{employee?.name || "Unknown"}</div>
                                                        <div className="text-[10px] text-slate-500">{employee?.department}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{course?.title || "Unknown Curriculum"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-32">
                                                    <div className="flex justify-between text-[10px] font-bold mb-1">
                                                        <span>{asgn.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${asgn.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                    asgn.status === "Completed" ? "bg-emerald-50 text-emerald-600" : 
                                                    asgn.status === "In-Progress" ? "bg-blue-50 text-blue-600" :
                                                    "bg-slate-100 text-slate-600"
                                                }`}>
                                                    {asgn.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedAssignmentId(asgn.id);
                                                        setReviewProgress(asgn.progress);
                                                        setReviewFeedback(asgn.feedback || "");
                                                        setIsReviewModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-blue-600"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {trainingAssignments.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold italic">
                                            No active staff learning assignments detected.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          )}

          {activeTab === "builder" && (
            <div className="space-y-6">
               <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{editingCourseId ? "Update Training Strategy" : "Compose Training Material"}</h3>
                    <p className="text-slate-500 text-sm max-w-md">Design structured learning paths and automatically publish to the corporate catalog.</p>
                  </div>
                  <Layers className="absolute -right-8 -bottom-8 w-48 h-48 text-slate-50 dark:text-slate-850" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1: Core details */}
                  <div className="md:col-span-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 space-y-6">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs">1</div>
                         <h4 className="font-black text-sm uppercase tracking-tight">Curriculum Parameters</h4>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-1">Curriculum Headline</label>
                            <input
                              type="text"
                              placeholder="e.g. National Credit Act RSA Regulatory Framework"
                              value={newCourseTitle}
                              onChange={(e) => setNewCourseTitle(e.target.value)}
                              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-2xl transition font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Estimate Duration</label>
                              <select
                                value={newCourseDuration}
                                onChange={(e) => setNewCourseDuration(e.target.value)}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-2xl transition font-bold"
                              >
                                <option value="1 hour">1 hour</option>
                                <option value="3 hours">3 hours</option>
                                <option value="5 hours">5 hours</option>
                                <option value="Whole day">Whole day</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Target Audience</label>
                              <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-900 dark:focus:border-white rounded-2xl transition font-bold">
                                <option>All Staff</option>
                                <option>Sales Only</option>
                                <option>QA/Compliance</option>
                                <option>Executive Board</option>
                              </select>
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs">2</div>
                         <h4 className="font-black text-sm uppercase tracking-tight">Supportive Media Assets</h4>
                       </div>
                       
                       <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Instructional Video", icon: Video, color: "text-rose-500", bg: "bg-rose-50" },
                            { label: "Assessment Quiz", icon: FileQuestion, color: "text-amber-500", bg: "bg-amber-50" },
                            { label: "Policy Whitepaper", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" }
                          ].map((asset, i) => (
                            <button key={i} className={`p-4 ${asset.bg} dark:bg-slate-800 rounded-2xl border-2 border-transparent hover:border-slate-300 transition flex flex-col items-center text-center gap-2`}>
                               <asset.icon className={`w-5 h-5 ${asset.color}`} />
                               <span className="text-[10px] font-black uppercase leading-tight text-slate-700 dark:text-slate-300">{asset.label}</span>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                          onClick={handleBuild}
                          className="flex-1 p-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-3"
                        >
                          <Sparkles className="w-5 h-5" />
                          {editingCourseId ? "Update Curriculum Meta" : "Publish to General Catalog"}
                        </button>
                        {editingCourseId && (
                           <button 
                                onClick={() => {
                                    setEditingCourseId(null);
                                    setNewCourseTitle("");
                                }}
                                className="px-6 p-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl"
                           >
                            Cancel
                           </button>
                        )}
                    </div>
                  </div>

                  {/* Step Summary (Right Side of builder) */}
                  <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-6 shadow-2xl">
                    <h4 className="font-black text-[10px] uppercase text-slate-500 tracking-widest">Live Metadata Preview</h4>
                    <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-1">
                        <BookOpen className="w-6 h-6 text-blue-500" />
                      </div>
                      <h5 className="font-black text-lg leading-tight uppercase tracking-tighter">{newCourseTitle || "Untitled Course Strategy"}</h5>
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase">
                        <span>{newCourseDuration}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span>0 Participants</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <span className="text-[10px] uppercase font-black text-slate-500 block tracking-widest">Compliance Protocol Status</span>
                       <ul className="space-y-3">
                         {[
                           "Mobile-first responsive layout",
                           "Auto-graded assessments enabled",
                           "SCORM compliant manifest",
                           "GDPR data isolation included"
                         ].map((check, i) => (
                           <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-300">
                             <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                             </div>
                             {check}
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="font-black text-sm uppercase tracking-tight">Popular Curriculums</h4>
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-4">
                            {trainingCatalog.slice(0, 3).map(course => (
                                <div key={course.id} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-900 dark:text-white truncate">{course.title}</span>
                                        <span className="text-slate-500">{course.participants} Staff</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full" style={{ width: `${(course.participants / 30) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="font-black text-sm uppercase tracking-tight">Staff Learning Trends</h4>
                            <Sparkles className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex items-end gap-2 h-32">
                           {[45, 62, 85, 34, 91, 55, 78].map((val, i) => (
                               <div key={i} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group">
                                   <div 
                                      className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-500" 
                                      style={{ height: `${val}%` }}
                                   ></div>
                                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-[9px] font-black bg-slate-900 text-white px-1 rounded">
                                       {val}%
                                   </div>
                               </div>
                           ))}
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                            <span>Sun</span>
                        </div>
                    </div>
                </div>

                <div className="p-12 text-center bg-slate-900 dark:bg-white rounded-3xl space-y-6">
                    <Award className="w-16 h-16 text-blue-500 mx-auto" />
                    <div>
                        <h4 className="font-black text-2xl text-white dark:text-slate-900 uppercase">Workforce Intelligence Engine</h4>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-3 max-w-sm mx-auto font-medium">Deep-dive assessment of corporate IQ growth and workforce skill optimization metrics.</p>
                    </div>
                    <button className="px-8 py-3 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition shadow-xl">Detailed Intelligence Report</button>
                </div>
            </div>
          )}
        </div>

        {/* Sidebar Info/Stats (Right 4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-2xl">
            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12" />
            <h4 className="text-[10px] uppercase font-black text-blue-400 mb-4 tracking-widest">Corporate L&D Health Index</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-4xl font-black block leading-none">{avgProgress}%</span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Aggregate Goal Score</span>
                </div>
                <div className="text-emerald-400 flex items-center gap-1 font-black text-sm">
                  +3.1%
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Target Progression</span>
                    <span>92% SLA</span>
                 </div>
                 <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-1000" style={{ width: `${avgProgress}%` }}></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
                <h4 className="font-black text-sm uppercase tracking-tight">Active Learning Pulse</h4>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-[10px] font-black uppercase text-emerald-600">LIVE SESSIONS</span>
                </div>
            </div>
            <div className="space-y-4">
              {trainingAssignments.filter(a => a.status === "In-Progress").slice(0, 4).map((asgn) => {
                const emp = employees.find(e => e.id === asgn.employeeId);
                const course = trainingCatalog.find(c => c.id === asgn.courseId);
                return (
                    <div 
                        key={asgn.id} 
                        onClick={() => {
                            setSelectedAssignmentId(asgn.id);
                            setReviewProgress(asgn.progress);
                            setReviewFeedback(asgn.feedback || "");
                            setIsReviewModalOpen(true);
                        }}
                        className="flex items-center gap-3 p-3 group hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 uppercase text-[11px]">
                            {emp?.name.split(" ").map(n => n[0]).join("") || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-black block text-slate-900 dark:text-white leading-tight truncate">{emp?.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold truncate block">{course?.title}</span>
                        </div>
                        <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{asgn.progress}%</div>
                    </div>
                );
              })}
              {trainingAssignments.filter(a => a.status === "In-Progress").length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs font-bold italic">No active live sessions detected.</div>
              )}
            </div>
            <button 
                onClick={() => setActiveTab("assignments")}
                className="w-full py-3 bg-slate-50 dark:bg-slate-855 border dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
                View full staff roster
            </button>
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl space-y-5 shadow-xl text-white relative overflow-hidden">
             <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
             <div className="space-y-2 relative z-10">
               <h4 className="font-black text-sm uppercase tracking-widest">Cx-Verified Assets</h4>
               <p className="text-[11px] text-white/70 font-medium leading-relaxed">
                 Blockchain-backed digital credentials are automatically issued upon curriculum finalization and successful assessment scoring.
               </p>
             </div>
             <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
                    <div className="text-xl font-black">{completedAssignments}</div>
                    <div className="text-[9px] font-black uppercase text-white/50">Issued</div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
                    <div className="text-xl font-black">{inProgressAssignments}</div>
                    <div className="text-[9px] font-black uppercase text-white/50">Pending</div>
                </div>
             </div>
             <button className="w-full py-3 bg-white text-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition shadow-lg">Manage Credentials</button>
          </div>
        </div>
      </div>

    {/* Assign Training Modal */}
    {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border dark:border-slate-800">
                <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-855">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-slate-900 dark:text-white">Assign Training Module</h3>
                            <p className="text-xs text-slate-500">Deploy specific curriculum to individual staff members.</p>
                        </div>
                    </div>
                    <button onClick={() => setIsAssignModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleAssignSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-1">Target Employee</label>
                        <select 
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-sm"
                            required
                        >
                            <option value="">Select Employee...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-1">Curriculum Module</label>
                        <select 
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-sm"
                            required
                        >
                            <option value="">Select Course...</option>
                            {trainingCatalog.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                            <Sparkles className="w-4 h-4 inline-block mr-2" />
                            Note: Assigning this training will trigger an automated SIP notification and dynamic CRM portal update for the selected staff member.
                        </p>
                    </div>
                    <button type="submit" className="w-full p-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-3">
                        Deploy Assignment <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    )}

    {/* Review/Progress Modal */}
    {isReviewModalOpen && selectedAssignmentId && (() => {
        const asgn = trainingAssignments.find(a => a.id === selectedAssignmentId);
        const emp = employees.find(e => e.id === asgn?.employeeId);
        const course = trainingCatalog.find(c => c.id === asgn?.courseId);

        return (
            <div className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-[60] animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border dark:border-slate-800">
                    <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-855">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                                {emp?.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white">Review Learning Progress</h3>
                                <p className="text-xs text-slate-500">Evaluating: {emp?.name}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-855 rounded-2xl space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Curriculum Path</span>
                                <span className="text-xs font-black text-blue-600">{course?.title}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Manual Progress Override</span>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{reviewProgress}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    step="5"
                                    value={reviewProgress} 
                                    onChange={(e) => setReviewProgress(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 px-1 tracking-widest">Trainer Feedback / Review Notes</label>
                            <textarea 
                                value={reviewFeedback}
                                onChange={(e) => setReviewFeedback(e.target.value)}
                                placeholder="Add professional feedback regarding curriculum performance or assessment results..."
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-sm min-h-[120px] outline-none"
                            ></textarea>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => {
                                    onUpdateProgress(selectedAssignmentId, 0, "Assigned", "");
                                    setIsReviewModalOpen(false);
                                }}
                                className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-widest rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                                Reset Path
                            </button>
                            <button type="submit" className="flex-[2] p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition shadow-lg">
                                Save Review Data
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    })()}

    </div>
  );
}
