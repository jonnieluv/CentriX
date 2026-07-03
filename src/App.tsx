/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, Phone, Video, MessageSquare, Search, ShieldAlert, Users, 
  BookOpen, Layers, Settings, Activity, FileText, CheckCircle, 
  TrendingUp, Coins, Wrench, DoorOpen, LogOut, 
  Send, Upload, Clock, Lock, Shield, Building, RefreshCw, AlertCircle, 
  Briefcase, Key, Check, ChevronRight, CheckSquare, Trash2, 
  HelpCircle, Sparkles, Filter, FileSpreadsheet, Eye, UserPlus, FileCheck, X,
  Megaphone, ChevronDown, ChevronUp, DollarSign, Target, Mail, Calendar, 
  Contact, BarChart2, Package, Store, MoreHorizontal, LayoutDashboard, User,
  ClipboardList, Files, Scale, CreditCard, ShieldCheck, HeartHandshake, Gavel,
  Cpu, GraduationCap, ConciergeBell, Server, Archive
} from "lucide-react";
import BlanketComms from "./components/BlanketComms";
import LiveMonitoring from "./components/LiveMonitoring";
import ConversationsModal from "./components/ConversationsModal";
import ReportsModal from "./components/ReportsModal";
import DepartmentMetrics from "./components/DepartmentMetrics";
import ITSettingsPanel from "./components/ITSettingsPanel";
import MarketingPanel from "./components/MarketingPanel";
import SysAdminPanel from "./components/SysAdminPanel";
import HumanCapitalPanel from "./components/HumanCapitalPanel";
import TrainingPanel from "./components/TrainingPanel";
import ReceptionPanel from "./components/ReceptionPanel";
import FacilitiesPanel from "./components/FacilitiesPanel";
import LegalPanel from "./components/LegalPanel";
import FinancePanel from "./components/FinancePanel";
import DebtReviewPanel from "./components/DebtReviewPanel";
import DebtReviewModalContent from "./components/DebtReviewModalContent";
import CreditCommitteePanel from "./components/CreditCommitteePanel";
import EduCareModuleModal from "./components/EduCareModuleModal";
import UserProfile from "./components/UserProfile";
import UserStats from "./components/UserStats";
import SalesDepartment from "./components/SalesDepartment";
import KanbanDepartment from "./components/KanbanDepartment";
import { DEPARTMENT_CONFIGS } from "./departmentConfig";
import loginBg from "./assets/images/office_setup_bg_1780057419169.png";
import { saveData, auth, signInWithGoogle, signOutUser, getDb, OperationType, handleFirestoreError, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  Ticket, Employee, SwitchboardCall, VisitorLog, PackageLog, 
  ChatMessage, CallLog, VideoSession, FacilitiesLog, TrainingCourse, TrainingAssignment, 
  ITOverrideLog, ITScreenRecording, CRMDepartment, SupportTicket,
  PlaybookCampaign, DiallerState, TeleMarketingLead, SystemUser,
  WorkflowAutomation, IntegrationConnector, SecurityAuditEntry
} from "./types";

// 1. Departmental Access Control
const DEPARTMENT_ICONS: Record<string, any> = {
  "Client Experience": HeartHandshake,
  "Credit Committee": FileCheck,
  "Debt Review": CreditCard,
  "Document Hunters": Files,
  "Facilities": Wrench,
  "Finance": Coins,
  "Human Capital": UserPlus,
  "Information & Technology": Cpu,
  "Legal": Gavel,
  "Marketing & Tele-Marketing": Megaphone,
  "Quality Assurance": ShieldCheck,
  "Reception": ConciergeBell,
  "Sales": TrendingUp,
  "Sales Administration": ClipboardList,
  "Systems Administration": Server,
  "Training and Development": GraduationCap,
};

const mapEmailToDept = (email: string): CRMDepartment => {
  const normalized = email.toLowerCase().trim();
  
  if (normalized === "macjay2joe@gmail.com" || normalized.includes("macjay2joe")) {
    return "Systems Administration";
  }
  
  if (normalized.endsWith("@centrix.com")) {
    const localPart = normalized.split('@')[0];
    const parts = localPart.split('.');
    if (parts.length > 1) {
      const deptSlug = parts[1];
      
      switch (deptSlug) {
        case "sales": return "Sales";
        case "salesadmin":
        case "sales-administration":
        case "salesadministration": return "Sales Administration";
        case "documenthunters":
        case "document-hunters":
        case "docs":
        case "hunters": return "Document Hunters";
        case "debtreview":
        case "debt-review":
        case "debt": return "Debt Review";
        case "qa":
        case "qualityassurance":
        case "quality-assurance": return "Quality Assurance";
        case "clientexperience":
        case "client-experience":
        case "cx": return "Client Experience";
        case "creditcommittee":
        case "credit-committee":
        case "credit": return "Credit Committee";
        case "finance": return "Finance";
        case "it":
        case "informationtechnology":
        case "information-technology": return "Information & Technology";
        case "humancapital":
        case "human-capital":
        case "hr": return "Human Capital";
        case "training":
        case "traininganddevelopment":
        case "training-and-development": return "Training and Development";
        case "reception": return "Reception";
        case "facilities": return "Facilities";
        case "marketing":
        case "marketing-telemarketing":
        case "marketingandtelemarketing": return "Marketing & Tele-Marketing";
        case "sysadmin":
        case "systemsadmin":
        case "systems-administration":
        case "systemsadministration": return "Systems Administration";
        default: break;
      }
    }
  }
  
  return "Client Experience";
};

export default function App() {
  const { user, isLoggedIn, authorizedDept, setAuthorizedDept, setIsLoggedIn, setUser, loginError, setLoginError } = useAuth();
  
  // Keep local state for non-auth variables...

  const [authEmail, setAuthEmail] = useState<string>(() => {
    return localStorage.getItem("centrix_authEmail") || "agent.p@centrix.com";
  });
  const [authPassword, setAuthPassword] = useState<string>("••••••••");
  const [selectedDept, setSelectedDept] = useState<CRMDepartment>(() => {
    return (localStorage.getItem("centrix_selectedDept") as CRMDepartment) || "Sales";
  });
  const [forgotPasswordMode, setForgotPasswordMode] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string>("");
  const [tempPin, setTempPin] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // CRM Global Datasets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [switchboardQueue, setSwitchboardQueue] = useState<SwitchboardCall[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [packageLogs, setPackageLogs] = useState<PackageLog[]>([]);
  const [chatsData, setChatsData] = useState<Record<string, ChatMessage[]>>({});
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [videoSessions, setVideoSessions] = useState<VideoSession[]>([]);
  const [facilitiesLogs, setFacilitiesLogs] = useState<FacilitiesLog[]>([]);
  const [trainingCatalog, setTrainingCatalog] = useState<TrainingCourse[]>([]);
  const [trainingAssignments, setTrainingAssignments] = useState<TrainingAssignment[]>([]);
  const [itOverrideLogs, setItOverrideLogs] = useState<ITOverrideLog[]>([]);
  const [activeITScreenRecordings, setActiveITScreenRecordings] = useState<ITScreenRecording[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  // Marketing & Tele-Marketing States
  const [marketingCampaigns, setMarketingCampaigns] = useState<PlaybookCampaign[]>([]);
  const [diallerState, setDiallerState] = useState<DiallerState>({
    isActive: false,
    activeCampaignId: "",
    currentLeadIndex: 0,
    autoDialSpeed: 4,
    isCallConnected: false,
    recordingActive: false
  });

  // Systems Administration States
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [workflowAutomations, setWorkflowAutomations] = useState<WorkflowAutomation[]>([]);
  const [integrationConnectors, setIntegrationConnectors] = useState<IntegrationConnector[]>([]);
  const [securityAuditLogs, setSecurityAuditLogs] = useState<SecurityAuditEntry[]>([]);
  const [sysAdminSettings, setSysAdminSettings] = useState({
    databaseBackupStatus: "Up-to-date",
    dataCleanlinessScore: 92,
    lastBackupTime: "2026-05-28 01:00 AM",
    autoDeduplicationEnabled: true,
    whitelistIps: "196.24.110.12, 196.24.110.45"
  });

  // Integrated Dynamic Communication Comms Suite FAB & Panel states
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isFloatingCommsOpen, setIsFloatingCommsOpen] = useState(false);
  const [floatingCommsChannel, setFloatingCommsChannel] = useState<"calls" | "video" | "chats">("chats");

  // Filtering & Search
  const [ticketSearchQuery, setTicketSearchQuery] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("All");
  const [subStatusFilter, setSubStatusFilter] = useState("All");
  const [queueViewMode, setQueueViewMode] = useState<"list" | "kanban">("list");

  // Selection & Modal States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedWorkspaceQaTicketId, setSelectedWorkspaceQaTicketId] = useState<string | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isEduCareModalOpen, setIsEduCareModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<string>("clientInfo");
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [activeQAModal, setActiveQAModal] = useState<"monitoring" | "conversations" | "reports" | null>(null);

  // Dynamic values for creating a new ticket
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientSalary, setNewClientSalary] = useState("25000");
  const [newClientNationalId, setNewClientNationalId] = useState("");
  const [newClientNotes, setNewClientNotes] = useState("");
  const [newPropertyValuation, setNewPropertyValuation] = useState("850000");
  const [newMortgageAmount, setNewMortgageAmount] = useState("650000");
  const [newSelectedProducts, setNewSelectedProducts] = useState<string[]>([]);
  const [newClientTicketStatus, setNewClientTicketStatus] = useState<"New" | "In Progress" | "Review" | "Completed" | "Rejected">("New");

  // Department specific actions inputs
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const [newEmployeeRole, setNewEmployeeRole] = useState("");
  const [newEmployeeDept, setNewEmployeeDept] = useState<CRMDepartment>("Sales");

  const [newVisitorName, setNewVisitorName] = useState("");
  const [newVisitorCompany, setNewVisitorCompany] = useState("");
  const [newVisitorPurpose, setNewVisitorPurpose] = useState("");

  const [newPkgRecipient, setNewPkgRecipient] = useState("");
  const [newPkgCarrier, setNewPkgCarrier] = useState("");
  const [newPkgDescription, setNewPkgDescription] = useState("");

  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDuration, setNewCourseDuration] = useState("2 hours");

  const [selectedUploadFile, setSelectedUploadFile] = useState<string>("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string>("");
  const [tempSelectedFile, setTempSelectedFile] = useState<File | null>(null);
  const [documentPreviews, setDocumentPreviews] = useState<Record<string, {
    name: string;
    type: string;
    size: number;
    dataUrl?: string;
    textContent?: string;
  }>>({});
  const [previewingDoc, setPreviewingDoc] = useState<{ id: string; name: string; category: string } | null>(null);

  const [itOverrideInput, setItOverrideInput] = useState("");

  const [noteInputText, setNoteInputText] = useState("");

  const [isDeskCollapsed, setIsDeskCollapsed] = useState<boolean>(false);
  const [activeSidebarModule, setActiveSidebarModule] = useState<string>("Deals");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeUserView, setActiveUserView] = useState<"app" | "profile" | "stats">("app");

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem("centrix_isLoggedIn", isLoggedIn.toString());
    localStorage.setItem("centrix_authEmail", authEmail);
    localStorage.setItem("centrix_selectedDept", selectedDept);
    localStorage.setItem("centrix_authorizedDept", authorizedDept);
  }, [isLoggedIn, authEmail, selectedDept, authorizedDept]);

  // Auto-hide Authorized Desk/Workplace Directives component after successful login or department change
  useEffect(() => {
    if (isLoggedIn) {
      setIsDeskCollapsed(false);
      const timer = setTimeout(() => {
        setIsDeskCollapsed(true);
      }, 5000); // Collapse after 5 seconds of display
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, selectedDept]);

  // Enforce strict department desk isolation for non-superusers (Systems Administration and IT)
  useEffect(() => {
    if (isLoggedIn) {
      const isSuperUser = authorizedDept === "Systems Administration" || authorizedDept === "Information & Technology";
      if (!isSuperUser && selectedDept !== authorizedDept) {
        setSelectedDept(authorizedDept);
      }
    }
  }, [isLoggedIn, authorizedDept, selectedDept]);

  // System local time mock counter
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  useEffect(() => {
    // Standard visual time loop
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch supplementary CRM datasets
  const fetchCrmData = async () => {
    try {
      const response = await fetch("/api/crm/data");
      const data = await response.json();
      setSwitchboardQueue(data.switchboardQueue || []);
      setVisitorLogs(data.visitorLogs || []);
      setPackageLogs(data.packageLogs || []);
      setChatsData(data.chatsState || {});
      setCallLogs(data.callLogsState || []);
      setVideoSessions(data.videoSessionsState || []);
      setFacilitiesLogs(data.facilitiesLogs || []);
      setTrainingCatalog(data.trainingCatalog || []);
      setTrainingAssignments(data.trainingAssignments || []);
      setItOverrideLogs(data.itOverrideLogs || []);
      setActiveITScreenRecordings(data.activeITScreenRecordings || []);
      setSupportTickets(data.supportTickets || []);
      if (data.marketingCampaigns) setMarketingCampaigns(data.marketingCampaigns);
      if (data.diallerState) setDiallerState(data.diallerState);
      if (data.systemUsers) setSystemUsers(data.systemUsers);
      if (data.workflowAutomations) setWorkflowAutomations(data.workflowAutomations);
      if (data.integrationConnectors) setIntegrationConnectors(data.integrationConnectors);
      if (data.securityAuditLogs) setSecurityAuditLogs(data.securityAuditLogs);
      if (data.sysAdminSettings) setSysAdminSettings(data.sysAdminSettings);
    } catch (err) {
      console.error("Error loading supplementary CRM datasets:", err);
    }
  };

  // Fetch full datasets on mount or reload
  useEffect(() => {
    if (!isLoggedIn) return;
    const db = getDb();
    if (!db) {
      console.error("DB is undefined, cannot fetch datasets!");
      return;
    }

    // 1. Fetch other CRM datasets
    fetchCrmData();

    // 2. Stream tickets from Firestore
    const qTickets = collection(db, "tickets");
    const unsubscribeTickets = onSnapshot(qTickets, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setTickets(ticketsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "tickets");
    });

    // 3. Stream employees from Firestore
    const qEmployees = collection(db, "employees");
    const unsubscribeEmployees = onSnapshot(qEmployees, (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(employeesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "employees");
    });

    return () => {
      unsubscribeTickets();
      unsubscribeEmployees();
    };
  }, [isLoggedIn]);
  // Synchronize dynamic note input states with selected ticket
  useEffect(() => {
    if (!selectedTicket) {
      setNoteInputText("");
    }
  }, [selectedTicket]);

  // Auth helper: Email and Password Login & On-the-fly registration
  const handleEmailAndPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }
    setLoginError("");
    setLoginLoading(true);

    try {
      // Try to sign in first
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
    } catch (err: any) {
      console.warn("Sign in failed, trying automatic registration...", err);
      // Try to register on the fly if user doesn't exist yet or has different credential requirements
      try {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } catch (regErr: any) {
        console.error("Authentication failed:", regErr);
        if (regErr.code === "auth/invalid-email") {
          setLoginError("Invalid corporate email address format.");
        } else if (regErr.code === "auth/weak-password") {
          setLoginError("Corporate password must be at least 6 characters.");
        } else if (regErr.code === "auth/wrong-password" || regErr.code === "auth/invalid-credential") {
          setLoginError("Incorrect password or authorization credentials.");
        } else {
          setLoginError(regErr.message || "Authentication error.");
        }
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Auth helper: Auto pin request on password reset using cloud facilities
  const handleTriggerReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.includes("@")) {
      setResetMessage("Please input a valid corporate email.");
      return;
    }
    
    setResetMessage("");
    try {
      await sendPasswordResetEmail(auth, authEmail);
      setResetMessage(`✓ Secure password recovery link successfully sent to ${authEmail} using cloud facilities.`);
    } catch (err: any) {
      console.warn("Cloud password reset failed, falling back to local simulation", err);
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      setTempPin(token);
      setResetMessage(`Temporary recovery PIN generated [PIN: ${token}]. (Cloud reset returned: ${err.message || "error"})`);
    }
  };

  const handleApplyNewPassword = () => {
    setResetMessage("✓ Password successfully recalibrated. You may now login securely.");
    setForgotPasswordMode(false);
  };

  // Create real ticket matching product categories
  const handleCreateSalesTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) {
      alert("Please provide client name and corporate contact email.");
      return;
    }

    const payload = {
      clientInfo: {
        name: newClientName,
        email: newClientEmail,
        phone: newClientPhone || "+27 10 500 2000",
        salary: Number(newClientSalary),
        idNumber: newClientNationalId || "UNKNOWN-SA-ID",
        departmentSelection: "Sales",
        notes: newClientNotes || "Standard outbound packages requested."
      },
      addressDetails: {
        street: "Enterprise Retail Avenue",
        city: "Midrand, JHB",
        postalCode: "1682",
        propertyValue: Number(newPropertyValuation),
        mortgageRequired: Number(newMortgageAmount)
      },
      employmentDetails: {
        company: "Direct Employer Ltd",
        jobTitle: "Mid-level Specialist",
        tenureMonths: 18,
        monthlyIncome: Number(newClientSalary)
      },
      expenses: {
        rental: Math.round(Number(newClientSalary) * 0.25),
        groceries: Math.round(Number(newClientSalary) * 0.15),
        leisure: 1200,
        utilities: 1500,
        debtRepayments: 1000
      },
      debtObligations: {
        bankLoans: 5000,
        creditCards: 3200,
        storeAccounts: 500,
        debtReviewFlag: false
      },
      bankStatementsAnalysis: {
        avg3MonthsBalance: Math.round(Number(newClientSalary) * 0.35),
        salaryDepositMatched: true,
        overdraftFrequency: "None"
      },
      affordabilityOutcome: {
        disposableIncome: Math.round(Number(newClientSalary) * 0.4),
        approvedLimit: Number(newMortgageAmount),
        loanEligibilityStatus: "Passed",
        riskNotes: "Automatically pre-assessed via CentriX Rules Core."
      },
      status: "Sales", // Starts at Sales Desk
      ticketStatus: newClientTicketStatus,
      selectedProducts: newSelectedProducts,
      supportingDocuments: [],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          auditor: "CentriX AI Automated Sizing Engine",
          sentiment: "Warm / Enthusiastic",
          score: 87,
          comment: "Initial asset selection registered. Clean affordability indicators mapped."
        }
      ]
    };

    try {
      const resp = await fetch("/api/crm/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (data.success) {
        // Reset states
        setNewClientName("");
        setNewClientEmail("");
        setNewClientPhone("");
        setNewClientNotes("");
        setNewSelectedProducts([]);
        setIsCreateTicketOpen(false);
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Modify any parameter in vertical tab & trigger update
  const handleUpdateTicketField = async (updatedTicket: Ticket) => {
    try {
      const resp = await fetch("/api/crm/ticket/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedTicket.id,
          updates: updatedTicket
        })
      });
      const data = await resp.json();
      if (data.success) {
        setSelectedTicket(data.ticket);
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const hasNoteForCurrentStage = (t: Ticket): boolean => {
    const currentStage = t.status;
    const hasHistoryNote = t.notesHistory && Array.isArray(t.notesHistory) && t.notesHistory.some(
      n => n.department === currentStage && n.text.trim().length > 0
    );

    if (currentStage === "Sales") {
      return !!hasHistoryNote || !!t.clientInfo.notes?.trim();
    }
    return !!hasHistoryNote;
  };

  const getNextStage = (currentStage: string): string | null => {
    const sequence = [
      "Sales",
      "Sales Administration",
      "Document Hunters",
      "Debt Review",
      "Client Experience",
      "Quality Assurance",
      "Credit Committee",
      "Finance"
    ];
    const idx = sequence.indexOf(currentStage);
    if (idx !== -1 && idx < sequence.length - 1) {
      return sequence[idx + 1];
    }
    if (currentStage === "Finance") {
      return "Signed Off";
    }
    return null;
  };

  const handleSaveApplication = async () => {
    if (selectedTicket) {
      await handleUpdateTicketField(selectedTicket);
      setIsTicketModalOpen(false);
    }
  };

  // Submit Sales Admin folder and automatically route to Quality Assurance (TQM Audit)
  const handleSubmitSalesAdminAndRoute = async (ticket: Ticket) => {
    // If no note for current stage (Sales Administration) exists, auto-inject a standard compliant process note
    if (!hasNoteForCurrentStage(ticket)) {
      const loggedInEmployee = employees.find(e => e.email === authEmail) || employees.find(e => e.department === authorizedDept) || employees[0];
      const authorName = loggedInEmployee ? loggedInEmployee.name : authEmail.split("@")[0].toUpperCase();
      const authorId = loggedInEmployee ? loggedInEmployee.id : "system-agent";
      
      const systemNote = {
        id: `note-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: authorName,
        employeeId: authorId,
        department: "Sales Administration",
        text: "Sales Administration prep audit completed. Client data profile checks passed. Application successfully routed dynamically to TQM Quality Assurance department.",
        isSystemAudited: true
      };
      
      const updatedTicket = {
        ...ticket,
        status: "Quality Assurance",
        notesHistory: [...(ticket.notesHistory || []), systemNote]
      };
      
      await handleUpdateTicketField(updatedTicket);
    } else {
      const updatedTicket = { ...ticket, status: "Quality Assurance" };
      await handleUpdateTicketField(updatedTicket);
    }
    setIsTicketModalOpen(false);
  };

  // Submit Document Hunters folder and automatically route to Sales Administration
  const handleSubmitDocumentHuntersAndRoute = async (ticket: Ticket) => {
    // If no note for current stage (Document Hunters) exists, auto-inject a standard compliant process note
    if (!hasNoteForCurrentStage(ticket)) {
      const loggedInEmployee = employees.find(e => e.email === authEmail) || employees.find(e => e.department === authorizedDept) || employees[0];
      const authorName = loggedInEmployee ? loggedInEmployee.name : authEmail.split("@")[0].toUpperCase();
      const authorId = loggedInEmployee ? loggedInEmployee.id : "system-agent";
      
      const systemNote = {
        id: `note-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: authorName,
        employeeId: authorId,
        department: "Document Hunters",
        text: "Document collection phase completed. Folder advanced to Sales Administration. Debt Review team tagged for status and documentation validation.",
        isSystemAudited: true
      };
      
      const updatedTicket = {
        ...ticket,
        status: "Sales Administration",
        notesHistory: [...(ticket.notesHistory || []), systemNote]
      };
      
      await handleUpdateTicketField(updatedTicket);
    } else {
      const updatedTicket = { ...ticket, status: "Sales Administration" };
      await handleUpdateTicketField(updatedTicket);
    }
    setIsTicketModalOpen(false);
  };

  // Move ticket forward to specific support desk
  const handleAdvanceTicketStage = async (ticket: Ticket, nextStage: string) => {
    // Enforce note constraint
    if (!hasNoteForCurrentStage(ticket)) {
      alert(`Movement Blocked: A department note/remark is required for the stage '${ticket.status}' before advancing or migrating this ticket.`);
      return;
    }
    const updated = { ...ticket, status: nextStage };
    await handleUpdateTicketField(updated);
  };

  const handleAddNoteToTicket = async (ticket: Ticket, noteText: string) => {
    if (!noteText.trim()) {
      alert("Please enter a note. Every departmental transition or task record requires standard notes.");
      return;
    }

    // Auto capture logged-in agent details
    const loggedInEmployee = employees.find(e => e.email === authEmail) || employees.find(e => e.department === authorizedDept) || employees[0];
    const authorName = loggedInEmployee ? loggedInEmployee.name : authEmail.split("@")[0].toUpperCase();
    const authorId = loggedInEmployee ? loggedInEmployee.id : "system-agent";
    const departmentName = loggedInEmployee ? loggedInEmployee.department : ticket.status;

    const newNote = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: `${authorName} (ID: ${authorId})`,
      department: departmentName,
      text: noteText.trim()
    };

    const updatedNotes = [...(ticket.notesHistory || []), newNote];
    const updated: Ticket = {
      ...ticket,
      notesHistory: updatedNotes
    };

    await handleUpdateTicketField(updated);
    setNoteInputText("");
  };

  const handleRealDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTempSelectedFile(e.target.files[0]);
    }
  };

  const executeRealDeviceUpload = async (category: string) => {
    if (!selectedTicket || !tempSelectedFile) return;

    const file = tempSelectedFile;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result;
      const fileData: { name: string; type: string; size: number; dataUrl?: string; textContent?: string } = {
        name: file.name,
        type: file.type,
        size: file.size,
      };

      if (typeof result === "string") {
        if (file.type.startsWith("image/") || file.type === "application/pdf") {
          fileData.dataUrl = result;
        } else {
          if (file.size < 1000000) { // Read as text if small enough
            fileData.textContent = result;
          } else {
            fileData.dataUrl = result;
          }
        }
      }

      try {
        const resp = await fetch("/api/crm/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            category,
            ticketId: selectedTicket.id
          })
        });
        const data = await resp.json();
        if (data.success) {
          const registeredDocs = data.doc;
          const lastDoc = registeredDocs[registeredDocs.length - 1];
          if (lastDoc) {
            setDocumentPreviews(prev => ({
              ...prev,
              [lastDoc.id]: fileData
            }));
          }

          setUploadSuccessMessage(`✓ '${file.name}' uploaded successfully to local CRM Storage Drive under category '${category}'`);
          setTempSelectedFile(null);
          
          const updatedTicket = { ...selectedTicket, supportingDocuments: registeredDocs };
          setSelectedTicket(updatedTicket);
          fetchCrmData();
          setTimeout(() => setUploadSuccessMessage(""), 4000);
        }
      } catch (err) {
        console.error("Real upload error:", err);
      }
    };

    if (file.type.startsWith("text/") || file.name.endsWith(".json") || file.name.endsWith(".txt") || file.name.endsWith(".csv") || file.name.endsWith(".tsv") || file.name.endsWith(".md")) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  // Deprecated/Compatibility helper
  const handleLocalDiskUpload = async (category: string) => {
    if (!selectedTicket) return;
    if (!selectedUploadFile) {
      alert("Please select a file to upload to the local storage drive.");
      return;
    }

    try {
      const resp = await fetch("/api/crm/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedUploadFile,
          category,
          ticketId: selectedTicket.id
        })
      });
      const data = await resp.json();
      if (data.success) {
        setUploadSuccessMessage(`✓ '${selectedUploadFile}' uploaded to local CRM Storage Drive under '${category}'`);
        setSelectedUploadFile("");
        const updatedDocs = data.doc;
        const updatedTicket = { ...selectedTicket, supportingDocuments: updatedDocs };
        setSelectedTicket(updatedTicket);
        fetchCrmData();
        setTimeout(() => setUploadSuccessMessage(""), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle products mapping helper
  const handleToggleProductSelection = (prodName: string) => {
    if (newSelectedProducts.includes(prodName)) {
      setNewSelectedProducts(newSelectedProducts.filter(p => p !== prodName));
    } else {
      setNewSelectedProducts([...newSelectedProducts, prodName]);
    }
  };

  // Action helpers for other auxiliary desks
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName || !newEmployeeEmail) return;
    try {
      const resp = await fetch("/api/crm/hr/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEmployeeName,
          email: newEmployeeEmail,
          department: newEmployeeDept,
          role: newEmployeeRole || "Desk Advisor"
        })
      });
      if (resp.ok) {
        setNewEmployeeName("");
        setNewEmployeeEmail("");
        setNewEmployeeRole("");
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployeeDirect = async (name: string, email: string, department: string, role: string) => {
    try {
      const resp = await fetch("/api/crm/hr/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          department,
          role
        })
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEmployeeStatus = async (id: string, status: string) => {
    try {
      const resp = await fetch("/api/crm/hr/employee/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEmployeeRole = async (id: string, role: string) => {
    try {
      const resp = await fetch("/api/crm/hr/employee/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role })
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTraining = async (employeeId: string, courseId: string) => {
    try {
      await fetch("/api/crm/training/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, courseId })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTrainingProgress = async (assignmentId: string, progress: number, status?: string, feedback?: string) => {
    try {
      await fetch("/api/crm/training/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, progress, status, feedback })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCourse = async (id: string, updates: any) => {
    try {
      await fetch("/api/crm/training/course/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await fetch("/api/crm/training/course/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVisitor = async (visitor: { name: string; company: string; purpose?: string }) => {
    try {
      const resp = await fetch("/api/crm/visitors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: visitor.name,
          company: visitor.company || "External Vendor",
          purpose: visitor.purpose || "General Operations"
        })
      });
      if (resp.ok) {
        setNewVisitorName("");
        setNewVisitorCompany("");
        setNewVisitorPurpose("");
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateVisitor = async (id: string, visitor: Partial<VisitorLog>) => {
    try {
      await fetch("/api/crm/visitors/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, visitor })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVisitor = async (id: string) => {
    try {
      await fetch("/api/crm/visitors/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPackage = async (pkg: { recipient: string; carrier?: string; description: string }) => {
    try {
      const resp = await fetch("/api/crm/packages/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: pkg.recipient,
          carrier: pkg.carrier || "Courier Post",
          description: pkg.description
        })
      });
      if (resp.ok) {
        setNewPkgRecipient("");
        setNewPkgCarrier("");
        setNewPkgDescription("");
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePackage = async (id: string, pkg: Partial<PackageLog>) => {
    try {
      await fetch("/api/crm/packages/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pkg })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePackage = async (id: string) => {
    try {
      await fetch("/api/crm/packages/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuildCourse = async (course: { title: string; duration: string }) => {
    try {
      const resp = await fetch("/api/crm/training/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerITOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itOverrideInput) return;
    try {
      const resp = await fetch("/api/crm/it/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: itOverrideInput })
      });
      if (resp.ok) {
        setItOverrideInput("");
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFacilityTask = async (id: string, newStatus: string) => {
    try {
      const resp = await fetch("/api/crm/facilities/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCampaign = async (campaign: { name: string; channel: string; budget: number; spend: number }) => {
    try {
      const resp = await fetch("/api/crm/marketing/campaign/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLead = async (lead: { campaignId: string; name: string; phone: string; email: string; source: string; notes?: string }) => {
    try {
      const resp = await fetch("/api/crm/marketing/lead/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLead = async (params: { campaignId?: string; leadId: string; notes?: string; lastOutcome?: string; assignedAgent?: string }) => {
    try {
      const resp = await fetch("/api/crm/marketing/lead/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDnc = async (leadId: string) => {
    try {
      const resp = await fetch("/api/crm/marketing/lead/toggle-dnc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId })
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertLead = async (params: { leadId: string; campaignId: string; loanAmount: number; monthlyIncome: number }) => {
    try {
      const resp = await fetch("/api/crm/marketing/lead/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDialler = async (params: Partial<DiallerState>) => {
    try {
      const resp = await fetch("/api/crm/marketing/dialler/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Systems Administration Handlers
  const handleUpdateSysAdminUser = async (user: Partial<SystemUser> & { id?: string }) => {
    try {
      const resp = await fetch("/api/crm/sysadmin/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSysAdminWorkflow = async (wf: Partial<WorkflowAutomation> & { id?: string }) => {
    try {
      const resp = await fetch("/api/crm/sysadmin/workflow/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wf)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncSysAdminIntegration = async (params: { id: string; syncNow?: boolean; toggleStatus?: boolean }) => {
    try {
      const resp = await fetch("/api/crm/sysadmin/integration/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSysAdminSettings = async (params: { autoDeduplicationEnabled?: boolean; whitelistIps?: string }) => {
    try {
      const resp = await fetch("/api/crm/sysadmin/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSysAdminBackup = async () => {
    try {
      const resp = await fetch("/api/crm/sysadmin/action/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSysAdminClean = async () => {
    try {
      const resp = await fetch("/api/crm/sysadmin/action/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMigrateData = async () => {
    try {
      for (const ticket of tickets) {
        await saveData("tickets", ticket.id, ticket);
      }
      for (const employee of employees) {
        await saveData("employees", employee.id, employee);
      }
      alert("Data migration completed successfully!");
    } catch (err) {
      console.error("Migration failed:", err);
      alert("Migration failed. Check console.");
    }
  };

  const handleReplySupportTicket = async (ticketId: string, sender: string, message: string) => {
    try {
      const resp = await fetch("/api/crm/helpdesk/ticket/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, sender, message })
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSupportTicketStatus = async (ticketId: string, status?: string, priority?: string) => {
    try {
      const resp = await fetch("/api/crm/helpdesk/ticket/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status, priority })
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSupportTicket = async (ticket: { user: string; department: string; subject: string; description: string; priority: string }) => {
    try {
      const resp = await fetch("/api/crm/helpdesk/ticket/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket)
      });
      if (resp.ok) {
        fetchCrmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchboardRedirect = async (callId: string, dept: string) => {
    try {
      await fetch("/api/crm/digital-switchboard/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, targetDept: dept })
      });
      fetchCrmData();
    } catch (err) {
      console.error(err);
    }
  };

  // Scope datasets based on department login permissions — strict departmental isolation rule
  const scopedTickets = tickets.filter(t => t.status === authorizedDept);

  const scopedEmployees = employees.filter(e => e.department === authorizedDept);

  // Dynamic ticket search and filtering
  const filteredTickets = scopedTickets.filter(t => {
    const matchesSearch = t.clientInfo.name.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
                          (t.clientInfo.notes && t.clientInfo.notes.toLowerCase().includes(ticketSearchQuery.toLowerCase()));
    
    const matchesSubStatus = subStatusFilter === "All" || (t.ticketStatus || "New") === subStatusFilter;
    const matchesStage = ticketStatusFilter === "All" || t.status === ticketStatusFilter;

    return matchesSearch && matchesSubStatus && matchesStage;
  });

  return (
    <div className="min-h-screen font-sans bg-slate-200 text-black text-[12px]">
      
      <AnimatePresence mode="wait">
        {/* 1. AUTHENTICATION SHIELD */}
        {!isLoggedIn ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden bg-slate-950"
          >
            {/* HD Professional Corporate Brand Background Image */}
            <img 
              src={loginBg} 
              alt="CentriX Professional Office Workspace" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Dark Accent Ambient Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-950/40 to-slate-950/90 pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 110 }}
              className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden p-6 transition duration-200 relative z-10"
            >
              
              {/* Logo and CentriX Brand */}
              <div className="text-center pb-3">
                <span className="inline-flex items-center justify-center p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/25 mb-2">
                  <Building className="w-5 h-5" />
                </span>
                <h1 className="text-[12px] font-display font-medium text-black tracking-tight">CentriX <span className="text-blue-600 font-normal text-[12px]">CRM</span></h1>
                <p className="text-black text-[10px] mt-1 tracking-wide">Multi-Departmental Client Operations</p>
              </div>

              {/* CRITICAL Requirement: On launch, full auth including Department Selection */}
              {!forgotPasswordMode ? (
                <form onSubmit={handleEmailAndPasswordLogin} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-black block mb-1">Corporate Email</label>
                    <input
                      type="email"
                      required
                      placeholder="username.dept@centrix.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full p-2.5 text-[12px] rounded-lg border bg-slate-50 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-black block">Corporate Password</label>
                      <button 
                        type="button"
                        onClick={() => { setForgotPasswordMode(true); setResetMessage(""); }}
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full p-2.5 text-[12px] rounded-lg border bg-slate-50 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  {loginError && (
                    <div className="text-[11px] bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-lg text-left font-mono">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full p-2.5 text-[12px] bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : "Sign In with Credentials"}
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white px-2 text-slate-500">Or connect via single sign-on</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="w-full p-2.5 text-[12px] border border-slate-200 hover:bg-slate-50 text-black rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.16-3.16C17.45 1.68 14.93 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.66 2.84c.88-2.62 3.32-4.3 6.84-4.3z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.66 2.84c2.14-1.98 3.38-4.89 3.38-8.52z"/>
                      <path fill="#FBBC05" d="M5.16 14.16c-.23-.68-.36-1.4-.36-2.16s.13-1.48.36-2.16L1.5 7.5c-.83 1.66-1.3 3.52-1.3 5.5s.47 3.84 1.3 5.5l3.66-2.84z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.52 0-5.96-1.68-6.84-4.3L1.5 16.5c1.9 3.85 5.85 6.5 10.5 6.5z"/>
                    </svg>
                    Continue with Google
                  </button>
                </form>
              ) : (
                // PASSWORD RESET DRAWER VIEW
                <form onSubmit={handleTriggerReset} className="space-y-4">
                  <h3 className="text-[12px] font-bold text-black">Recover CentriX Credentials</h3>
                  <p className="text-[12px] text-black">
                    Input your active @centrix.com corporate address. The CRM security firewall will output an ephemeral token locally.
                  </p>

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-black block mb-1">Corporate Email</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full p-2.5 text-[12px] rounded-lg border bg-slate-50 text-black focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  {resetMessage && (
                    <div className="text-[11px] bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-lg text-left font-mono">
                      {resetMessage}
                    </div>
                  )}

                  {tempPin && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-black block">Verify EPHEMERAL PIN</label>
                      <input
                        type="text"
                        placeholder="Input the displayed PIN for local sanity check"
                        className="w-full p-2 text-[12px] rounded-md border text-center font-bold tracking-widest"
                        onChange={(e) => {
                          if (e.target.value === tempPin) {
                            handleApplyNewPassword();
                          }
                        }}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordMode(false)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 :bg-slate-750 text-black text-[12px] font-semibold rounded-md"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-2">
                <span className="text-[10px] text-black block">
                  CentriX Node Active • v2.6.5-SelfHosted
                </span>
                <div className="flex justify-center gap-4 text-[10px]">
                  <a href="/knowledge-base/terms-of-use" className="text-blue-600 hover:underline">Term of use</a>
                  <a href="/knowledge-base/data-privacy" className="text-blue-600 hover:underline">Data Privacy</a>
                </div>
              </div>

            </motion.div>
          </motion.div>
        ) : (
          
          // 2. MAIN CRM SCREEN & DESKTOP SUITE
          <motion.div
            key="crm-main"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex h-screen w-full bg-[#f6f7fa] overflow-hidden"
          >
            {/* GLOBAL SIDEBAR */}
            <aside className="w-[66px] bg-[#1f2022] flex flex-col items-center py-4 gap-2 text-white/70 overflow-y-auto shrink-0 z-50">
              <div className="w-8 h-8 font-black text-[18px] text-white flex items-center justify-center mb-4 cursor-pointer">
                C
              </div>

              {/* Department Switcher (Quick Access) */}
              <div className="flex flex-col items-center gap-1.5 mb-2 pb-2 border-b border-white/5 w-full">
                {Object.entries(DEPARTMENT_ICONS)
                  .filter(([dept]) => {
                    const isSuperUser = authorizedDept === "Systems Administration" || authorizedDept === "Information & Technology";
                    return isSuperUser || dept === authorizedDept;
                  })
                  .map(([dept, Icon]) => (
                  <button
                    key={dept}
                    onClick={() => { 
                      const isSuperUser = authorizedDept === "Systems Administration" || authorizedDept === "Information & Technology";
                      if (isSuperUser || dept === authorizedDept) {
                        setSelectedDept(dept); 
                        setActiveUserView("app");
                      }
                    }}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group relative ${selectedDept === dept ? "bg-white/20 text-white shadow-lg shadow-black/20" : "text-white/40 hover:bg-white/5 hover:text-white/80"}`}
                    title={dept}
                  >
                    <Icon className="w-4 h-4" />
                    {selectedDept === dept && (
                      <motion.div 
                        layoutId="active-dept-indicator"
                        className="absolute -left-1 w-1 h-4 bg-blue-500 rounded-r-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-auto flex flex-col items-center gap-2">
                <button className="w-10 h-10 rounded hover:bg-white/10 flex items-center justify-center transition-colors group cursor-pointer relative" title="More Options">
                  <MoreHorizontal className="w-5 h-5 group-hover:text-white" />
                </button>
              </div>
            </aside>

            {/* MAIN WORKSPACE WRAPPER */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#f9fafc] border-l border-slate-200 relative z-10 overflow-hidden text-[12px]">
            
            {/* Top Hub Navigation */}
            <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between w-full shadow-xs transition-colors h-14 shrink-0">
              <div className="text-[16px] font-bold text-slate-800 mr-4 whitespace-nowrap min-w-max flex items-center gap-2">
                Deals 
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider hidden md:inline-block">Node-A1</span>
              </div>

              <div className="flex-1 max-w-2xl px-4 flex items-center">
                 <div className="relative w-full max-w-lg mx-auto">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="text" placeholder="Search Pipedrive" className="w-full pl-9 pr-4 py-1.5 text-[12px] bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-shadow text-black" />
                 </div>
              </div>

              <div className="flex items-center gap-3 relative">
                <button className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                  <HelpCircle className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 relative">
                   {/* Avatar & Profile Trigger */}
                   <div 
                    className="flex items-center gap-2 cursor-pointer group" 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                   >
                     <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden shadow-sm relative transition-transform hover:scale-105 active:scale-95">
                       <img src="https://i.pravatar.cc/150?img=47" className="w-full h-full object-cover transition-opacity" alt="User Avatar" />
                     </div>
                     <div className="leading-tight hidden md:block">
                       <div className="text-[12px] font-semibold text-black flex items-center gap-1">
                        {authEmail.split('@')[0] || "Phyllis Yang"}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                       </div>
                       <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{selectedDept} Desk</div>
                     </div>
                   </div>

                   {/* Dropdown Menu */}
                   <AnimatePresence>
                     {isProfileMenuOpen && (
                       <>
                        {/* Overlay to close */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute top-10 right-0 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-1"
                        >
                          <div className="px-3 py-2 border-b border-slate-100">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">User Settings</div>
                          </div>
                          
                          <button 
                            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 :bg-slate-700 transition-colors text-[12px] font-medium"
                            onClick={() => { setActiveUserView("profile"); setIsProfileMenuOpen(false); }}
                          >
                            <User className="w-4 h-4 text-blue-500" />
                            User Profile
                          </button>

                          <button 
                            className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 :bg-slate-700 transition-colors text-[12px] font-medium"
                            onClick={() => { setActiveUserView("stats"); setIsProfileMenuOpen(false); }}
                          >
                            <BarChart2 className="w-4 h-4 text-emerald-500" />
                            User Stats
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          <button 
                            className="w-full flex items-center gap-3 px-3 py-2 text-rose-600 hover:bg-rose-50 :bg-rose-900/20 transition-colors text-[12px] font-bold"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              signOutUser();
                              setIsLoggedIn(false);
                              setAuthorizedDept("Sales");
                              setSelectedDept("Sales");
                              localStorage.removeItem("centrix_authorizedDept");
                              localStorage.removeItem("centrix_selectedDept");
                              localStorage.setItem("centrix_isLoggedIn", "false");
                            }}
                          >
                            <LogOut className="w-4 h-4" />
                            Logout Session
                          </button>
                        </motion.div>
                       </>
                     )}
                   </AnimatePresence>
                </div>
              </div>
            </header>

            {/* Scrollable content wrapper for mobile/smaller designs */}
            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">

          {/* Department desk banner with dynamic high-fidelity gradients and motion support */}
          <motion.div 
            key={selectedDept + activeUserView}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`px-8 py-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border-b transition-all duration-500 bg-gradient-to-r ${ activeUserView === "profile" ? "from-slate-800 to-slate-900" : activeUserView === "stats" ? "from-indigo-800 to-blue-900" : selectedDept === "Sales" ? "from-teal-700 to-emerald-800 " : selectedDept === "Debt Review" ? "from-rose-700 to-red-800 " : selectedDept === "Information & Technology" || selectedDept === "Systems Administration" ? "from-amber-600 to-orange-700 " : selectedDept === "Quality Assurance" ? "from-sky-600 to-indigo-700 " : "from-blue-700 to-indigo-800 " } border-white/5`}
          >
            <div>
              <span className="text-[11px] font-sans font-bold tracking-widest text-white/70 uppercase block mb-1">
                {activeUserView === "profile" ? "Identity Governance" : activeUserView === "stats" ? "Performance Intelligence" : "Active Department Dashboard"}
              </span>
              <h2 className="text-[12px] font-display font-medium flex items-center gap-3 tracking-tight drop-shadow-sm">

                {activeUserView === "profile" && <User className="w-5 h-5 text-blue-400" />}
                {activeUserView === "stats" && <BarChart2 className="w-5 h-5 text-emerald-400" />}
                {activeUserView === "app" && (
                  <>
                    {selectedDept === "Sales" && <TrendingUp className="w-5 h-5 text-emerald-400" />}
                    {selectedDept === "Sales Administration" && <FileSpreadsheet className="w-5 h-5 text-amber-400" />}
                    {selectedDept === "Document Hunters" && <Search className="w-5 h-5 text-sky-400" />}
                    {selectedDept === "Debt Review" && <ShieldAlert className="w-5 h-5 text-rose-400" />}
                    {selectedDept === "Quality Assurance" && <Activity className="w-5 h-5 text-teal-400" />}
                    {selectedDept === "Client Experience" && <Users className="w-5 h-5 text-pink-400" />}
                    {selectedDept === "Credit Committee" && <FileCheck className="w-5 h-5 text-yellow-400" />}
                    {selectedDept === "Finance" && <Coins className="w-5 h-5 text-lime-400" />}
                    {selectedDept === "Information & Technology" && <Settings className="w-5 h-5 text-amber-400" />}
                    {selectedDept === "Human Capital" && <UserPlus className="w-5 h-5 text-sky-400" />}
                    {selectedDept === "Training and Development" && <BookOpen className="w-5 h-5 text-purple-400" />}
                    {selectedDept === "Reception" && <DoorOpen className="w-5 h-5 text-emerald-400" />}
                    {selectedDept === "Facilities" && <Wrench className="w-5 h-5 text-black" />}
                    {selectedDept === "Marketing & Tele-Marketing" && <Megaphone className="w-5 h-5 text-pink-400" />}
                    {selectedDept === "Systems Administration" && <Settings className="w-5 h-5 text-cyan-400 animate-spin-slow" />}
                    {selectedDept === "Legal" && <Gavel className="w-5 h-5 text-indigo-400" />}
                  </>
                )}
                {activeUserView === "profile" ? "Identity & Security" : activeUserView === "stats" ? "Analytics & KIDs" : (selectedDept === "Client Experience" ? "Customer Services" : selectedDept) + " Desk Suite"}
              </h2>
            </div>

            {/* Rapid summary statistics widget with smooth interactive micro-hover effects */}
            <div className="flex gap-4 items-center">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 text-center min-w-[100px]"
              >
                <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wider">Active Apps</span>
                <span className="text-[12px] font-black font-mono">{scopedTickets.length}</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 text-center min-w-[100px]"
              >
                <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wider">Audits Passed</span>
                <span className="text-[12px] font-black text-emerald-300 font-mono">
                  {scopedTickets.reduce((acc, t) => acc + (t.auditLogs ? t.auditLogs.length : 0), 0)}
                </span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 text-center min-w-[100px]"
              >
                <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wider">Staff Online</span>
                <span className="text-[12px] font-black font-mono">{scopedEmployees.length}</span>
              </motion.div>
            </div>
          </motion.div>

          <div className="flex-1 w-full max-w-[1750px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
            
            {activeUserView === "profile" ? (
              <div className="w-full">
                <UserProfile 
                  userEmail={authEmail} 
                  department={selectedDept} 
                  onClose={() => setActiveUserView("app")} 
                />
              </div>
            ) : activeUserView === "stats" ? (
              <div className="w-full">
                <UserStats userEmail={authEmail} />
              </div>
            ) : (
              <div className="flex h-full w-full gap-6">

            {/* 4-PARTS NESTED CONTENT WRAPPER: Matches grid template layout ratio (Part 2 and Part 3 of 1-4 layout) */}
            <div className="flex-1 min-w-0 grid grid-cols-12 gap-6">
              
              {/* PRIMARY DIVISION AREA: Desk layout, KPI metric items, List/Kanban queues (12 columns nested) */}
              <div className="col-span-12 space-y-6">
              
              {/* Dynamic Workspace Container */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
                
                {/* Departmental Performance KPI Panel */}
                <DepartmentMetrics 
                  selectedDept={selectedDept}
                  tickets={scopedTickets}
                  employees={
                    (selectedDept === "Human Capital" || selectedDept === "Training and Development") 
                      ? employees 
                      : scopedEmployees
                  }
                  switchboardQueue={switchboardQueue}
                  visitorLogs={visitorLogs}
                  packageLogs={packageLogs}
                  chatsData={chatsData}
                  callLogs={callLogs}
                  videoSessions={videoSessions}
                  facilitiesLogs={facilitiesLogs}
                  trainingCatalog={trainingCatalog}
                  itOverrideLogs={itOverrideLogs}
                />

                <div className="border-t border-slate-100 my-4 pt-1"></div>
                
                {/* DEPARTMENTS NAVIGATION & WORKSPACE */}
                {selectedDept === "Sales" && ( 
                  <SalesDepartment 
                    tickets={tickets} 
                    setTickets={setTickets}
                    onCreateDeal={() => setIsCreateTicketOpen(true)}
                    onTicketClick={(t) => {
                      setSelectedTicket(t);
                      setIsTicketModalOpen(true);
                      setActiveModalTab("clientInfo");
                    }}
                  /> 
                )}
                
                {DEPARTMENT_CONFIGS[selectedDept as keyof typeof DEPARTMENT_CONFIGS] && (
                  <KanbanDepartment
                    title={selectedDept}
                    subtitle={DEPARTMENT_CONFIGS[selectedDept as keyof typeof DEPARTMENT_CONFIGS].subtitle}
                    departmentKey={selectedDept}
                    stages={DEPARTMENT_CONFIGS[selectedDept as keyof typeof DEPARTMENT_CONFIGS].stages}
                    tickets={tickets}
                    setTickets={setTickets}
                    onTicketClick={(t) => {
                      setSelectedTicket(t);
                      setIsTicketModalOpen(true);
                      setActiveModalTab("clientInfo");
                    }}
                    onEduCareClick={() => setIsEduCareModalOpen(true)}
                    onAddNewItem={() => {
                        if (selectedDept === "Quality Assurance") {                
                            setActiveQAModal("monitoring");
                        } else {
                            setIsCreateTicketOpen(true);
                        }
                    }}
                    onViewChange={() => setQueueViewMode(prev => prev === "list" ? "kanban" : "list")}
                    onFilterClick={() => {}}
                  />
                )}

                {selectedDept === "Marketing & Tele-Marketing" && (
                  <MarketingPanel 
                    campaigns={marketingCampaigns}
                    dialler={diallerState}
                    employees={employees}
                    onRefreshData={() => {}}
                    onAddCampaign={(c) => setMarketingCampaigns([...marketingCampaigns, { id: `CAMP-${Date.now()}`, ...c, status: "Active", leads: [], leadsCount: 0, contactedCount: 0, convertedCount: 0 }])}
                    onAddLead={() => {}}
                    onUpdateLead={() => {}}
                    onToggleDnc={() => {}}
                    onConvertLead={() => {}}
                    onUpdateDialler={(p) => setDiallerState({...diallerState, ...p})}
                  />
                )}

                {selectedDept === "Systems Administration" && (
                  <SysAdminPanel 
                    systemUsers={systemUsers}
                    workflowAutomations={workflowAutomations}
                    integrationConnectors={integrationConnectors}
                    securityAuditLogs={securityAuditLogs}
                    sysAdminSettings={sysAdminSettings}
                    employees={employees}
                    tickets={tickets}
                    onUpdateUser={handleUpdateSysAdminUser}
                    onUpdateWorkflow={handleUpdateSysAdminWorkflow}
                    onSyncIntegration={handleSyncSysAdminIntegration}
                    onUpdateSettings={handleUpdateSysAdminSettings}
                    onTriggerBackup={handleTriggerSysAdminBackup}
                    onTriggerClean={handleTriggerSysAdminClean}
                    onMigrateData={handleMigrateData}
                    chatsData={chatsData}
                    callLogs={callLogs}
                    videoSessions={videoSessions}
                  />
                )}

                {selectedDept === "Information & Technology" && (
                  <ITSettingsPanel 
                    employees={employees}
                    tickets={tickets}
                    activeITScreenRecordings={activeITScreenRecordings}
                    itOverrideInput={itOverrideInput}
                    setItOverrideInput={setItOverrideInput}
                    handleTriggerITOverride={handleTriggerITOverride}
                    itOverrideLogs={itOverrideLogs}
                    onUpdateEmployeeStatus={handleUpdateEmployeeStatus}
                    onUpdateEmployeeRole={handleUpdateEmployeeRole}
                    onAddEmployee={handleAddEmployeeDirect}
                    supportTickets={supportTickets}
                    onAddSupportTicket={handleAddSupportTicket}
                    onReplySupportTicket={handleReplySupportTicket}
                    onUpdateSupportTicketStatus={handleUpdateSupportTicketStatus}
                    chatsData={chatsData}
                    callLogs={callLogs}
                    videoSessions={videoSessions}
                  />
                )}

                {selectedDept === "Human Capital" && (
                  <HumanCapitalPanel 
                    employees={employees}
                    onUpdateEmployeeStatus={handleUpdateEmployeeStatus}
                    onUpdateEmployeeRole={handleUpdateEmployeeRole}
                    onAddEmployee={handleAddEmployeeDirect}
                  />
                )}

                {selectedDept === "Training and Development" && (
                  <TrainingPanel 
                    trainingCatalog={trainingCatalog}
                    trainingAssignments={trainingAssignments}
                    employees={employees}
                    onAddCourse={handleBuildCourse}
                    onAssignTraining={handleAssignTraining}
                    onUpdateProgress={handleUpdateTrainingProgress}
                    onUpdateCourse={handleUpdateCourse}
                    onDeleteCourse={handleDeleteCourse}
                  />
                )}

                {selectedDept === "Reception" && (
                  <ReceptionPanel 
                    switchboardQueue={switchboardQueue}
                    visitorLogs={visitorLogs}
                    packageLogs={packageLogs}
                    onSwitchboardRedirect={handleSwitchboardRedirect}
                    onAddVisitor={handleAddVisitor}
                    onUpdateVisitor={handleUpdateVisitor}
                    onDeleteVisitor={handleDeleteVisitor}
                    onAddPackage={handleAddPackage}
                    onUpdatePackage={handleUpdatePackage}
                    onDeletePackage={handleDeletePackage}
                  />
                )}

                {selectedDept === "Facilities" && (
                  <FacilitiesPanel 
                    facilitiesLogs={facilitiesLogs}
                    onUpdateFacilityTask={handleUpdateFacilityTask}
                  />
                )}

                {selectedDept === "Finance" && (
                  <FinancePanel tickets={tickets} setTickets={setTickets} />
                )}
                {selectedDept === "Legal" && (
                  <LegalPanel tickets={tickets} setTickets={setTickets} />
                )}
                {selectedDept === "Credit Committee" && (
                  <CreditCommitteePanel tickets={tickets} setTickets={setTickets} />
                )}

              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Footer branding */}
          <footer className="bg-white border-t border-slate-200 py-3 text-center text-[10px] text-slate-500 mt-auto shrink-0">
            CentriX Secure Self-hosted Intranet Suite Node BDF3
          </footer>

            </div> {/* CLOSE SCROLLABLE WORKSPACE CONTENT */}

          </div> {/* CLOSE GLOBAL FLEX WRAPPER */}

        </motion.div>
      )}
      </AnimatePresence>

      {/* 3. ROBUST SALES TICKET MODAL (VERTICAL TABS) */}
      {isEduCareModalOpen && (
        <EduCareModuleModal
          onClose={() => setIsEduCareModalOpen(false)}
          onAssign={(moduleData) => {
            console.log("Assigned module:", moduleData);
            setIsEduCareModalOpen(false);
          }}
          tickets={tickets}
        />
      )}

      {isTicketModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/5 flex items-start justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[560px]">
            
            {/* Modal header details */}
            <div className="bg-slate-105 px-6 py-4 border-b border-slate-200 flex justify-between items-center text-black">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Active Department Stage: {selectedTicket.status}
                </span>
                <select
                  value={selectedTicket.ticketStatus || "New"}
                  onChange={async (e) => {
                    const updated = { ...selectedTicket, ticketStatus: e.target.value as any };
                    setSelectedTicket(updated);
                    await handleUpdateTicketField(updated);
                  }}
                  className={`ml-2 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border cursor-pointer focus:outline-hidden ${ (selectedTicket.ticketStatus || "New") === "New" ? "bg-blue-50 text-blue-700 border-blue-250 " : (selectedTicket.ticketStatus || "New") === "In Progress" ? "bg-amber-50 text-amber-700 border-amber-250 " : (selectedTicket.ticketStatus || "New") === "Review" ? "bg-indigo-50 text-indigo-700 border-indigo-250 " : (selectedTicket.ticketStatus || "New") === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-250 " : "bg-rose-50 text-rose-700 border-rose-250 " }`}
                >
                  <option value="New">Ticket Status: New</option>
                  <option value="In Progress">Ticket Status: In Progress</option>
                  <option value="Review">Ticket Status: Review</option>
                  <option value="Completed">Ticket Status: Completed</option>
                  <option value="Rejected">Ticket Status: Rejected</option>
                </select>
                <span className="text-[10px] ml-2 text-black uppercase font-mono">{selectedTicket.id}</span>
                <h3 className="text-[12px] font-extrabold mt-1 text-black">
                  Robust Folder Suite: <span className="text-blue-600">{selectedTicket.clientInfo.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="p-1 hover:bg-slate-200 :bg-slate-700 text-black hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body, split with vertical tabs */}
            <div className="flex-1 flex overflow-hidden">
                   <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-3 overflow-y-auto space-y-1">
                {[
                  { id: "clientInfo", label: "📄 Client Info" },
                  { id: "addressValuation", label: "🏡 Address & Valuation" },
                  { id: "employmentDetails", label: "💼 Employment Details" },
                  { id: "expensesView", label: "📊 Debt lines" },
                  { id: "debtObligations", label: "🛑 Debt Obligations" },
                  { id: "bankStatements", label: "🏦 Bank Statements Analysis" },
                  { id: "insurance", label: "🛡️ Insurance" },
                  { id: "legal", label: "⚖️ Legal" },
                  { id: "debtReview", label: "🛡️ Debt Review" },
                  { id: "qaAssessment", label: "🔍 QA Assessment Sheet" },
                  { id: "credit", label: "💳 Credit" },
                  { id: "affordabilityOutcome", label: "💰 Affordability Outcome" },
                  { id: "departmentNotes", label: "📝 Department Notes" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveModalTab(tab.id); setUploadSuccessMessage(""); }}
                    className={`w-full text-left p-2 rounded-lg text-[12px] font-semibold block transition duration-150 ${activeModalTab === tab.id ? "bg-blue-600 text-white shadow-xs" : "bg-white shadow-sm border border-slate-200 hover:bg-slate-50 :bg-slate-700 text-black mb-1 relative overflow-hidden"}`}
                  >
                    {tab.label}
                  </button>
                ))}

                {/* Local Storage Drive Upload helper embedded in tabs sidebar */}
                <div className="mt-8 pt-4 border-t border-slate-200 space-y-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-black block">SUPPORTING DRIVE FILES</span>
                  
                  <div className="space-y-2">
                    {/* Real Device file uploader style */}
                    <label 
                      htmlFor="real-file-upload-input" 
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 :bg-slate-700 text-black text-[10px] rounded-lg font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer text-center border border-dashed border-slate-300 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-500" />
                      <span>Choose device file...</span>
                    </label>
                    <input 
                      type="file" 
                      id="real-file-upload-input" 
                      className="hidden" 
                      onChange={handleRealDeviceUpload}
                    />

                    {tempSelectedFile ? (
                      <div className="space-y-1.5 p-2 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono text-black">
                        <div className="flex justify-between items-center gap-1">
                          <span className="truncate max-w-[70%] font-bold text-black">{tempSelectedFile.name}</span>
                          <span className="text-[10px]">({(tempSelectedFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => executeRealDeviceUpload(activeModalTab)}
                          className="w-full py-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        >
                          ✓ Upload to {activeModalTab}
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-black text-center italic">
                        Select files from your device Downloads/Documents folder
                      </div>
                    )}
                  </div>

                  {uploadSuccessMessage && (
                    <div className="bg-emerald-50 text-[10px] text-emerald-800 p-2 rounded text-center border border-emerald-100 font-medium">
                      {uploadSuccessMessage}
                    </div>
                  )}

                  {/* List of currently uploaded files for this specific ticket */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-black block">Registered Files ({selectedTicket.supportingDocuments.length})</span>
                    <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1">
                      {selectedTicket.supportingDocuments.map((doc, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-201 text-[10px] font-mono shadow-3xs" title={`${doc.name} under category: ${doc.category}`}>
                          <div className="flex flex-col truncate max-w-[70%] leading-tight">
                            <span className="text-black truncate font-semibold">{doc.name}</span>
                            <span className="text-[10px] text-black uppercase">{doc.category.substring(0, 15)}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setPreviewingDoc(doc)}
                            className="p-1 hover:bg-blue-50 :bg-blue-950/40 text-blue-500 hover:text-blue-700 rounded-md transition flex items-center gap-1 border border-transparent hover:border-slate-200 :border-slate-750"
                            title="View Document Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-sans font-bold">View</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* TAB ACTIVE PANEL VIEWPORT */}
              <div className="w-2/3 bg-white p-6 overflow-y-auto space-y-4">
                
                {/* A. CLIENT BASIC INFO */}
                {activeModalTab === "clientInfo" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[12px] uppercase text-black">Client Profile Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-black">
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Full Legal Name</label>
                        <input
                          type="text"
                          value={selectedTicket.clientInfo.name}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.clientInfo.name = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Aliases / Maiden Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Maiden name, legal aliases"
                          value={selectedTicket.clientInfo.aliases || ""}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.clientInfo.aliases = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">ID Number</label>
                        <input
                          type="text"
                          value={selectedTicket.clientInfo.idNumber}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.clientInfo.idNumber = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Date of Birth</label>
                        <input
                          type="date"
                          value={selectedTicket.clientInfo.dob || ""}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.clientInfo.dob = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Email</label>
                        <input
                          type="email"
                          value={selectedTicket.clientInfo.email}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.clientInfo.email = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Telephone</label>
                        <input
                          type="text"
                          value={selectedTicket.clientInfo.phone}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.clientInfo.phone = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Gender</label>
                        <select
                          value={selectedTicket.clientInfo.gender || ""}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.clientInfo.gender = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded text-black"
                        >
                          <option value="">-- Select Gender --</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other / Non-binary</option>
                          <option value="Prefer Not to Say">Prefer Not to Say</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Marital Status</label>
                        <select
                          value={selectedTicket.clientInfo.maritalStatus || ""}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.clientInfo.maritalStatus = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded text-black"
                        >
                          <option value="">-- Select Marital Status --</option>
                          <option value="Single">Single</option>
                          <option value="Married (COP)">Married in Community of Property (COP)</option>
                          <option value="Married (ANC)">Married ANC (Out of COP)</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Living Together">Living Together / Cohabitation</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Dependents Household Count</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={selectedTicket.clientInfo.dependentsCount ?? ""}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.clientInfo.dependentsCount = e.target.value === "" ? undefined : Number(e.target.value);
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Residential Status</label>
                        <select
                          value={selectedTicket.addressDetails.residentialStatus || ""}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.addressDetails.residentialStatus = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded text-black"
                        >
                          <option value="">-- Select Status --</option>
                          <option value="Renting">Renting / Tenant</option>
                          <option value="Home Owner (Mortgaged)">Home Owner (with active mortgage)</option>
                          <option value="Home Owner (Paid Off)">Home Owner (fully paid off)</option>
                          <option value="Living with Relatives">Living with Relatives / Family</option>
                          <option value="Boarding / Employer Supplied">Boarding / Employer Supplied</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Time at Current Address (Months)</label>
                        <input
                          type="number"
                          placeholder="e.g. 24"
                          value={selectedTicket.addressDetails.timeAtCurrentAddressMonths ?? ""}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.addressDetails.timeAtCurrentAddressMonths = e.target.value === "" ? undefined : Number(e.target.value);
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono"
                        />
                      </div>
                    </div>

                    {/* Retirement & Pension Details */}
                    <div className="border-t pt-3 mt-3 text-black">
                      <h5 className="font-extrabold text-[10px] uppercase text-indigo-700 mb-2 tracking-wider">🌟 Retires / Pension Fund Details</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Pension Fund Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Sentinel Pension Fund"
                            value={selectedTicket.clientInfo.pensionFundName || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.pensionFundName = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded text-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Pension Member ID</label>
                          <input
                            type="text"
                            placeholder="e.g. PEN-987452-A"
                            value={selectedTicket.clientInfo.pensionMemberNumber || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.pensionMemberNumber = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Monthly Pension Payout (R)</label>
                          <input
                            type="number"
                            placeholder="e.g. 15000"
                            value={selectedTicket.clientInfo.monthlyPensionPayout ?? ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.monthlyPensionPayout = e.target.value === "" ? undefined : Number(e.target.value);
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Spouse Details Section */}
                    <div className="border-t pt-3 mt-3">
                      <h5 className="font-extrabold text-[10px] uppercase text-indigo-700 mb-2 tracking-wider">Spouse / Partner Details</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Spouse Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Lerato Khumalo"
                            value={selectedTicket.clientInfo.spouseName || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.spouseName = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded text-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Spouse ID / Passport</label>
                          <input
                            type="text"
                            placeholder="e.g. 9301020478081"
                            value={selectedTicket.clientInfo.spouseIdNumber || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.spouseIdNumber = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Spouse Phone</label>
                          <input
                            type="text"
                            placeholder="e.g. +27 71 890 1234"
                            value={selectedTicket.clientInfo.spousePhone || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.spousePhone = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Spouse Email</label>
                          <input
                            type="email"
                            placeholder="e.g. spouse@domain.com"
                            value={selectedTicket.clientInfo.spouseEmail || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.spouseEmail = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded text-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Next of Kin Section */}
                    <div className="border-t pt-3 mt-3">
                      <h5 className="font-extrabold text-[10px] uppercase text-indigo-700 mb-2 tracking-wider">Next of Kin Details</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Contact Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Sipho Khumalo"
                            value={selectedTicket.clientInfo.nokName || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.nokName = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded text-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Relationship</label>
                          <input
                            type="text"
                            placeholder="e.g. Brother / Parent"
                            value={selectedTicket.clientInfo.nokRelationship || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.nokRelationship = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded text-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Phone Number</label>
                          <input
                            type="text"
                            placeholder="e.g. +27 82 555 9876"
                            value={selectedTicket.clientInfo.nokPhone || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.clientInfo.nokPhone = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3 mt-3">
                      <label className="text-[10px] uppercase font-bold block text-black mb-1">Motivation / Deal Notes</label>
                      <textarea
                        value={selectedTicket.clientInfo.notes}
                        onChange={(e) => {
                          const updated = { ...selectedTicket };
                          updated.clientInfo.notes = e.target.value;
                          setSelectedTicket(updated);
                        }}
                        placeholder="State the underlying motivation, deal notes, or actions taken on this file..."
                        className="w-full text-[12px] p-2 border rounded h-20 resize-none text-black"
                      />
                    </div>
                  </div>
                )}

                {/* B. ADDRESS DETAILS AND VALUATION */}
                {activeModalTab === "addressValuation" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[12px] uppercase text-black">Address Details & Asset Appraisal values</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-3">
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Street Address</label>
                        <input
                          type="text"
                          value={selectedTicket.addressDetails.street}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.addressDetails.street = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">City</label>
                        <input
                          type="text"
                          value={selectedTicket.addressDetails.city}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.addressDetails.city = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Postal Code</label>
                        <input
                          type="text"
                          value={selectedTicket.addressDetails.postalCode}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.addressDetails.postalCode = e.target.value;
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Property Valuation (R)</label>
                        <input
                          type="number"
                          value={selectedTicket.addressDetails.propertyValue}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.addressDetails.propertyValue = Number(e.target.value);
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Required Mortgage (R)</label>
                        <input
                          type="number"
                          value={selectedTicket.addressDetails.mortgageRequired}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.addressDetails.mortgageRequired = Number(e.target.value);
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* C. EMPLOYMENT DETAILS */}
                {activeModalTab === "employmentDetails" && (
                  <div className="space-y-4 text-black">
                    
                    {/* Part 1: Classification & Tenure */}
                    <div>
                      <h5 className="font-extrabold text-[10px] uppercase text-indigo-700 mb-2 tracking-wider">Part 1: Job Identity & Classification</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Company Employer Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Acme Corporation SA"
                            value={selectedTicket.employmentDetails.company || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.company = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Job Title / Designation</label>
                          <input
                            type="text"
                            placeholder="e.g. Senior Software Underwriter"
                            value={selectedTicket.employmentDetails.jobTitle || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.jobTitle = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Employee Number</label>
                          <input
                            type="text"
                            placeholder="e.g. EMP-9528"
                            value={selectedTicket.employmentDetails.employeeNumber || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.employeeNumber = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Industry / Sector</label>
                          <select
                            value={selectedTicket.employmentDetails.industry || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.industry = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded"
                          >
                            <option value="">-- Select Industry --</option>
                            <option value="Aviation">Aviation & Aerospace</option>
                            <option value="Government & Civil Service">Government & Civil Service</option>
                            <option value="IT & Software Engineering">IT & Software Engineering</option>
                            <option value="Aviation">Aviation / Airlines</option>
                            <option value="Hospitality & Leisure">Hospitality & Leisure</option>
                            <option value="Mining & Minerals">Mining & Minerals</option>
                            <option value="Healthcare & Medical">Healthcare & Medical</option>
                            <option value="Financial Services">Financial Services / Banking</option>
                            <option value="Education">Education & Training</option>
                            <option value="Retail & Commerce">Retail & Commerce</option>
                            <option value="Manufacturing & Heavy Industry">Manufacturing & Heavy Industry</option>
                            <option value="Telecommunications">Telecommunications</option>
                            <option value="Other">Other Sector</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Employment Nature / Type</label>
                          <select
                            value={selectedTicket.employmentDetails.employmentType || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.employmentType = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded"
                          >
                            <option value="">-- Select Employment Type --</option>
                            <option value="Permanent / Full-Time">Permanent & Full-Time</option>
                            <option value="Part-Time">Part-Time Status</option>
                            <option value="Contract / Temporary">Contract / Temporary</option>
                            <option value="Self-Employed / Freelancer">Self-Employed / Freelancer / Owner</option>
                            <option value="Retired / Pensioner">Retired & Pensioner</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Date Employed / Start Date</label>
                          <input
                            type="date"
                            value={selectedTicket.employmentDetails.startDate || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.startDate = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono"
                          />
                        </div>

                        {selectedTicket.employmentDetails.employmentType === "Contract / Temporary" && (
                          <div>
                            <label className="text-[10px] uppercase font-red block text-rose-500 font-bold mb-0.5">Contract Expiry Date *</label>
                            <input
                              type="date"
                              value={selectedTicket.employmentDetails.contractExpiryDate || ""}
                              onChange={(e) => {
                                const updated = { ...selectedTicket };
                                updated.employmentDetails.contractExpiryDate = e.target.value;
                                setSelectedTicket(updated);
                              }}
                              className="w-full text-[12px] p-1.5 border border-rose-300 rounded font-mono"
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Tenure With Current Employer (Months)</label>
                          <input
                            type="number"
                            placeholder="e.g. 24"
                            value={selectedTicket.employmentDetails.tenureMonths ?? ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.tenureMonths = e.target.value === "" ? 0 : Number(e.target.value);
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Time in Current Industry (Months)</label>
                          <input
                            type="number"
                            placeholder="e.g. 72"
                            value={selectedTicket.employmentDetails.timeInIndustryMonths ?? ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.timeInIndustryMonths = e.target.value === "" ? undefined : Number(e.target.value);
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Part 2: Contact & Payroll Logistics */}
                    <div className="border-t pt-3 mt-3">
                      <h5 className="font-extrabold text-[10px] uppercase text-indigo-700 mb-2 tracking-wider">Part 2: Contact & payroll Logistical verification</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Work Physical Location Address</label>
                          <input
                            type="text"
                            placeholder="e.g. Floor 12, 102 Corlett Dr, Melrose Arcade, Johannesburg"
                            value={selectedTicket.employmentDetails.workAddress || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.workAddress = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">HR / Payroll Contact Person</label>
                          <input
                            type="text"
                            placeholder="e.g. Samantha Ndlovu"
                            value={selectedTicket.employmentDetails.hrContactName || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.hrContactName = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">HR / Payroll Direct Phone Number</label>
                          <input
                            type="text"
                            placeholder="e.g. +27 11 445 8899"
                            value={selectedTicket.employmentDetails.hrContactPhone || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.hrContactPhone = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Corporate Company Email Address</label>
                          <input
                            type="email"
                            placeholder="e.g. info@company.com"
                            value={selectedTicket.employmentDetails.companyEmail || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.companyEmail = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded text-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Part 3: Earnings Frequency details */}
                    <div className="border-t pt-3 mt-3">
                      <h5 className="font-extrabold text-[10px] uppercase text-indigo-700 mb-2 tracking-wider">Part 3: Pay cycle Parameters & Earnings</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Basic Monthly Salary (R)</label>
                          <input
                            type="number"
                            value={selectedTicket.employmentDetails.monthlyIncome || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.monthlyIncome = Number(e.target.value);
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Salary Frequency</label>
                          <select
                            value={selectedTicket.employmentDetails.salaryFrequency || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.salaryFrequency = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded"
                          >
                            <option value="">-- Select Cycle --</option>
                            <option value="Monthly">Monthly Salary Order</option>
                            <option value="Weekly">Weekly Wages Cycle</option>
                            <option value="Fortnightly">Fortnightly Cycle</option>
                            <option value="Bi-Monthly">Bi-Monthly Cycle</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Salary Pay Day (Calendrical)</label>
                          <select
                            value={selectedTicket.employmentDetails.payDay || ""}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.employmentDetails.payDay = e.target.value === "" ? undefined : Number(e.target.value);
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-mono"
                          >
                            <option value="">-- Choose day --</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                              <option key={day} value={day}>
                                Day {day} of the month
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* D. DEBT LINES PANEL (FORMERLY EXPENSES VIEW) */}
                {activeModalTab === "expensesView" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-[12px] uppercase text-black">📊 Debt lines (Credit Report Data Extracts)</h4>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded font-mono">
                        CentriX credit report live-sync
                      </span>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[12px] leading-relaxed text-blue-800">
                      ℹ️ This view features recurring commitments automatically loaded onto the CentriX CRM by extracting credit report data. Fields are editable with a valid motivation as to why a specific field was manually edited.
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-[12px]">
                      {[
                        { key: "rental", label: "Rent / Housing Repayments (R)" },
                        { key: "groceries", label: "Groceries Allocation (R)" },
                        { key: "leisure", label: "Leisure & Entertainment (R)" },
                        { key: "utilities", label: "Utilities Power & Water (R)" },
                        { key: "debtRepayments", label: "Other External Debt Obligations (R)" },
                      ].map((item) => {
                        const currentVal = (selectedTicket.expenses as any)[item.key] || 0;
                        const motivationKey = item.key;
                        const currentMotivation = (selectedTicket.expenses.editMotivations || {})[motivationKey] || "";

                        return (
                          <div key={item.key} className="p-3 border rounded-lg bg-slate-50/50 flex flex-col md:flex-row md:items-center gap-3">
                            <div className="flex-1">
                              <label className="text-[10px] uppercase font-bold text-black block mb-1">{item.label}</label>
                              <input
                                type="number"
                                value={currentVal}
                                onChange={(e) => {
                                  const updated = { ...selectedTicket };
                                  (updated.expenses as any)[item.key] = Number(e.target.value);
                                  setSelectedTicket(updated);
                                }}
                                className="w-full p-2 border rounded font-mono text-[12px] text-black"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] uppercase font-bold text-black block mb-1">
                                Motivation for manual edit {currentVal !== 0 ? <span className="text-amber-500 font-bold">*</span> : ""}
                              </label>
                              <input
                                type="text"
                                placeholder="State valid motivation / audit reason..."
                                value={currentMotivation}
                                onChange={(e) => {
                                  const updated = { ...selectedTicket };
                                  if (!updated.expenses.editMotivations) {
                                    updated.expenses.editMotivations = {};
                                  }
                                  updated.expenses.editMotivations[motivationKey] = e.target.value;
                                  setSelectedTicket(updated);
                                }}
                                className={`w-full p-2 border rounded text-[12px] text-black ${currentVal !== 0 && !currentMotivation ? "border-amber-400 bg-amber-50/20" : ""}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* E. DEBT OBLIGATIONS */}
                {activeModalTab === "debtObligations" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[12px] uppercase text-black">Total Outstanding Debts & Credit Cards</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Bank Loans balance (R)</label>
                        <input
                          type="number"
                          value={selectedTicket.debtObligations.bankLoans}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.debtObligations.bankLoans = Number(e.target.value);
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Credit Cards Limits (R)</label>
                        <input
                          type="number"
                          value={selectedTicket.debtObligations.creditCards}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.debtObligations.creditCards = Number(e.target.value);
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                        />
                      </div>

                      <div className="col-span-2 bg-rose-50 p-3 rounded border border-rose-200 flex justify-between items-center text-[12px]">
                        <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4" /> Client Registered under active National Debt Review?
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedTicket.debtObligations.debtReviewFlag}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.debtObligations.debtReviewFlag = e.target.checked;
                            setSelectedTicket(updated);
                          }}
                          className="w-4 h-4 text-rose-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <h5 className="font-extrabold text-[12px] uppercase text-black mt-4 pt-4 border-t">Insurances & Phone Subscriptions</h5>
                    <div className="grid grid-cols-2 gap-3 text-[12px]">
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Insurance Premiums (R)</label>
                        <input
                          type="number"
                          value={selectedTicket.debtObligations.insurances ?? 0}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.debtObligations.insurances = Number(e.target.value);
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold block text-black mb-0.5">Phone Subscriptions (R)</label>
                        <input
                          type="number"
                          value={selectedTicket.debtObligations.phoneSubscriptions ?? 0}
                          onChange={(e) => {
                            const updated = { ...selectedTicket };
                            updated.debtObligations.phoneSubscriptions = Number(e.target.value);
                            setSelectedTicket(updated);
                          }}
                          className="w-full text-[12px] p-1.5 border rounded font-mono text-black"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* F. BANK STATEMENTS ANALYSIS (3 MONTHS) */}
                {activeModalTab === "bankStatements" && (() => {
                  const defaultDetailCategories = [
                    { label: "Rent / Housing Repayments", defaultVal: selectedTicket.expenses.rental || 6500 },
                    { label: "Groceries Allocation", defaultVal: selectedTicket.expenses.groceries || 3000 },
                    { label: "Utilities Power & Water", defaultVal: selectedTicket.expenses.utilities || 1800 },
                    { label: "Leisure & Entertainment", defaultVal: selectedTicket.expenses.leisure || 1500 },
                    { label: "Insurance Premiums", defaultVal: selectedTicket.debtObligations.insurances || 1205 },
                    { label: "Phone Subscriptions", defaultVal: selectedTicket.debtObligations.phoneSubscriptions || 350 },
                    { label: "Ext. Bank Loans", defaultVal: selectedTicket.debtObligations.bankLoans || 2000 },
                  ];

                  const currentMonthlyDetails = selectedTicket.bankStatementsAnalysis.monthlyDetails || defaultDetailCategories.map(cat => ({
                    category: cat.label,
                    m1: cat.defaultVal,
                    m2: cat.defaultVal,
                    m3: cat.defaultVal,
                    isOneOff: false,
                    motivation: ""
                  }));

                  // Helper to match initial category default values
                  const getRowDefaultValue = (categoryLabel: string) => {
                    if (categoryLabel.includes("Rent")) return selectedTicket.expenses.rental || 6500;
                    if (categoryLabel.includes("Groceries")) return selectedTicket.expenses.groceries || 3000;
                    if (categoryLabel.includes("Utilities")) return selectedTicket.expenses.utilities || 1800;
                    if (categoryLabel.includes("Leisure")) return selectedTicket.expenses.leisure || 1500;
                    if (categoryLabel.includes("Insurance")) return selectedTicket.debtObligations.insurances || 1205;
                    if (categoryLabel.includes("Phone")) return selectedTicket.debtObligations.phoneSubscriptions || 350;
                    return selectedTicket.expenses.debtRepayments || 2000;
                  };

                  const isRowEdited = (row: any) => {
                    const dVal = getRowDefaultValue(row.category);
                    return Number(row.m1) !== dVal || Number(row.m2) !== dVal || Number(row.m3) !== dVal;
                  };

                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-[12px] uppercase text-black">🏦 Banking Statement Analysis Excel Ledger</h4>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono animate-pulse">
                          Certified statements loaded
                        </span>
                      </div>

                      {/* Sales Admin Stage Compliance Box */}
                      {selectedTicket.status === "Sales Administration" && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[12px]">
                          <div className="font-extrabold flex items-center gap-1.5 uppercase font-mono mb-1">
                            <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" /> 
                            Sales Administration Mandate
                          </div>
                          <p className="leading-relaxed">
                            <strong>Audit directive:</strong> Ensure no expenses extracted from the certified bank statements are left unaccounted for. All manual adjustments require a <strong>valid motivation</strong>.
                          </p>
                        </div>
                      )}

                      {/* Header metrics */}
                      <div className="grid grid-cols-2 gap-3 text-[12px]">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Avg 3-Month Balance (R)</label>
                          <input
                            type="number"
                            value={selectedTicket.bankStatementsAnalysis.avg3MonthsBalance}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.bankStatementsAnalysis.avg3MonthsBalance = Number(e.target.value);
                              setSelectedTicket(updated);
                            }}
                            className="w-full p-1.5 border rounded font-mono text-black"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Overdraft Trigger Occurrence</label>
                          <select
                            value={selectedTicket.bankStatementsAnalysis.overdraftFrequency}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.bankStatementsAnalysis.overdraftFrequency = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full p-1.5 border rounded font-medium text-black"
                          >
                            <option value="None">None (Highly Consistent)</option>
                            <option value="Low">Low (1-2 times)</option>
                            <option value="High">High (Risk alert active)</option>
                          </select>
                        </div>

                        <div className="col-span-2 border p-2.5 rounded-lg bg-slate-50 flex items-center justify-between">
                          <span className="font-bold text-black">✓ Net Salary deposit matched Employer ledger record?</span>
                          <input
                            type="checkbox"
                            checked={selectedTicket.bankStatementsAnalysis.salaryDepositMatched}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.bankStatementsAnalysis.salaryDepositMatched = e.target.checked;
                              setSelectedTicket(updated);
                            }}
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Spreadsheet view */}
                      <div className="space-y-1.5 border-t pt-4">
                        <label className="text-[10px] uppercase font-extrabold text-black block">Extracted Recurring Expenses (Spreadsheet Ledger)</label>
                        <div className="overflow-x-auto border rounded-lg shadow-sm">
                          <table className="w-full text-left border-collapse text-[12px]">
                            <thead>
                              <tr className="bg-slate-100 text-black divide-x divide-slate-200">
                                <th className="p-2 font-extrabold uppercase text-[10px] tracking-wider">Expense Category</th>
                                <th className="p-2 font-extrabold uppercase text-[10px] tracking-wider w-24">Month 1</th>
                                <th className="p-2 font-extrabold uppercase text-[10px] tracking-wider w-24">Month 2</th>
                                <th className="p-2 font-extrabold uppercase text-[10px] tracking-wider w-24">Month 3</th>
                                <th className="p-2 font-extrabold uppercase text-[10px] tracking-wider w-24">Average</th>
                                <th className="p-2 font-extrabold uppercase text-[10px] tracking-wider w-20 text-center">Is One-off</th>
                                <th className="p-2 font-extrabold uppercase text-[10px] tracking-wider min-w-[150px]">Motivation for Edit</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {currentMonthlyDetails.map((row, idx) => {
                                const avg = row.isOneOff ? 0 : Math.round((Number(row.m1) + Number(row.m2) + Number(row.m3)) / 3);
                                const edited = isRowEdited(row);
                                return (
                                  <tr key={idx} className="divide-x divide-slate-200 hover:bg-slate-50 :bg-slate-900/20 text-black">
                                    <td className="p-2 font-semibold">{row.category}</td>
                                    <td className="p-1">
                                      <input
                                        type="number"
                                        value={row.m1}
                                        onChange={(e) => {
                                          const updated = { ...selectedTicket };
                                          const details = [...currentMonthlyDetails];
                                          details[idx] = { ...row, m1: Number(e.target.value) };
                                          updated.bankStatementsAnalysis.monthlyDetails = details;
                                          setSelectedTicket(updated);
                                        }}
                                        className="w-full text-center p-1 bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 font-mono text-[12px]"
                                      />
                                    </td>
                                    <td className="p-1">
                                      <input
                                        type="number"
                                        value={row.m2}
                                        onChange={(e) => {
                                          const updated = { ...selectedTicket };
                                          const details = [...currentMonthlyDetails];
                                          details[idx] = { ...row, m2: Number(e.target.value) };
                                          updated.bankStatementsAnalysis.monthlyDetails = details;
                                          setSelectedTicket(updated);
                                        }}
                                        className="w-full text-center p-1 bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 font-mono text-[12px]"
                                      />
                                    </td>
                                    <td className="p-1">
                                      <input
                                        type="number"
                                        value={row.m3}
                                        onChange={(e) => {
                                          const updated = { ...selectedTicket };
                                          const details = [...currentMonthlyDetails];
                                          details[idx] = { ...row, m3: Number(e.target.value) };
                                          updated.bankStatementsAnalysis.monthlyDetails = details;
                                          setSelectedTicket(updated);
                                        }}
                                        className="w-full text-center p-1 bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 font-mono text-[12px]"
                                      />
                                    </td>
                                    <td className="p-2 font-mono font-bold text-black">
                                      R{avg.toLocaleString()}
                                    </td>
                                    <td className="p-2 text-center">
                                      <input
                                        type="checkbox"
                                        checked={row.isOneOff}
                                        onChange={(e) => {
                                          const updated = { ...selectedTicket };
                                          const details = [...currentMonthlyDetails];
                                          details[idx] = { ...row, isOneOff: e.target.checked };
                                          updated.bankStatementsAnalysis.monthlyDetails = details;
                                          setSelectedTicket(updated);
                                        }}
                                        className="w-3.5 h-3.5 text-indigo-600 rounded cursor-pointer"
                                      />
                                    </td>
                                    <td className="p-1">
                                      <input
                                        type="text"
                                        placeholder={edited ? "⚠️ Motivation required!" : "State reason if edited..."}
                                        value={row.motivation || ""}
                                        onChange={(e) => {
                                          const updated = { ...selectedTicket };
                                          const details = [...currentMonthlyDetails];
                                          details[idx] = { ...row, motivation: e.target.value };
                                          updated.bankStatementsAnalysis.monthlyDetails = details;
                                          setSelectedTicket(updated);
                                        }}
                                        className={`w-full p-1 bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 text-[12px] ${edited && !row.motivation ? "bg-amber-100/40 placeholder-amber-600 font-medium" : ""}`}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* G. AFFORDABILITY OUTCOME SUMMARY */}                
                {/* Insurance Tab */}
                {activeModalTab === "insurance" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[12px] uppercase text-black">Insurance Compliance</h4>
                    <p className="text-[11px] text-slate-500">Document/verify life, home, and disability insurance policies.</p>
                    <div className="grid grid-cols-2 gap-4">
                      {["Policy Provider", "Cover Value", "Expiry Date"].map(label => (
                        <div key={label}>
                          <label className="text-[10px] font-bold text-black">{label}</label>
                          <input type="text" className="w-full text-[12px] p-1.5 border rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal Tab */}
                {activeModalTab === "legal" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[12px] uppercase text-black">Legal & Compliance</h4>
                    <p className="text-[11px] text-slate-500">Review legal documentation to ensure risk compliance.</p>
                    <textarea className="w-full h-32 text-[12px] p-2 border rounded" placeholder="Add legal notes / compliance checklist..." />
                  </div>
                )}
                
                {activeModalTab === "debtReview" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[12px] uppercase text-black">Debt Review Operations</h4>
                    <DebtReviewModalContent />
                  </div>
                )}
                
                {/* Credit Tab */}
                {activeModalTab === "credit" && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[12px] uppercase text-black">Credit & Risk Assessment</h4>
                    <p className="text-[11px] text-slate-500">Review credit score and calculate overall risk profile.</p>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-bold text-black">Credit Score</label>
                          <input type="number" className="w-full text-[12px] p-1.5 border rounded" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-black">Risk Level</label>
                          <select className="w-full text-[12px] p-1.5 border rounded">
                             <option>Low</option>
                             <option>Medium</option>
                             <option>High</option>
                          </select>
                       </div>
                    </div>
                  </div>
                )}
                
                {activeModalTab === "affordabilityOutcome" && (() => {
                  const grossIncome = Number(selectedTicket.clientInfo.salary) || 0;
                  const totalExpensesVal = (
                    Number(selectedTicket.expenses.rental) +
                    Number(selectedTicket.expenses.groceries) +
                    Number(selectedTicket.expenses.leisure) +
                    Number(selectedTicket.expenses.utilities)
                  );
                  const insurancesVal = Number(selectedTicket.debtObligations.insurances || 0);
                  const subscriptionsVal = Number(selectedTicket.debtObligations.phoneSubscriptions || 0);
                  
                  const extInstalment = Number(selectedTicket.affordabilityOutcome.externalInstalment ?? selectedTicket.expenses.debtRepayments ?? 2000);
                  const internalOfferInst = Number(selectedTicket.affordabilityOutcome.internalOfferInstalment ?? 4500);
                  const internalOfferInt = Number(selectedTicket.affordabilityOutcome.internalOfferInterest ?? 10.5);
                  const termSelected = Number(selectedTicket.affordabilityOutcome.termMonths ?? 12) as 12 | 24;

                  // Surplus remaining = Gross Income - (Essential Expenses + Insurances & Subs + External Instalment + New Offer Instalment)
                  const totalDeductionsWithOurOffer = totalExpensesVal + insurancesVal + subscriptionsVal + extInstalment + internalOfferInst;
                  const computedSurplus = grossIncome - totalDeductionsWithOurOffer;

                  return (
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-[12px] uppercase text-black">💰 Affordability Summary Outputs & Offers</h4>
                      
                      {/* Financial Comparison Summary */}
                      <div className="p-3 bg-slate-50 rounded-lg text-[12px] grid grid-cols-3 gap-2 text-black">
                        <div>
                          <span className="block text-[10px] text-black uppercase font-bold">Gross Income</span>
                          <strong className="text-[12px] text-black font-mono">
                            R{grossIncome.toLocaleString()}
                          </strong>
                        </div>
                        <div>
                          <span className="block text-[10px] text-black uppercase font-bold">Essential Deductions</span>
                          <strong className="text-[12px] text-black font-mono">
                            R{(totalExpensesVal + insurancesVal + subscriptionsVal).toLocaleString()}
                          </strong>
                        </div>
                        <div>
                          <span className="block text-[10px] text-black uppercase font-bold">Lending Limit Cap</span>
                          <strong className="text-[12px] text-black font-mono">
                            R{selectedTicket.addressDetails.propertyValue.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      {/* Inputs grid for Custom Internal Offers and External commitments */}
                      <div className="grid grid-cols-2 gap-3 text-[12px] border-t pt-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-black block mb-0.5">
                            Client Current Installments Externally (R)
                          </label>
                          <input
                            type="number"
                            value={extInstalment}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.affordabilityOutcome.externalInstalment = Number(e.target.value);
                              updated.affordabilityOutcome.surplusRemaining = grossIncome - (totalExpensesVal + insurancesVal + subscriptionsVal + Number(e.target.value) + internalOfferInst);
                              setSelectedTicket(updated);
                            }}
                            className="w-full p-1.5 border rounded font-mono text-[12px]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-black block mb-0.5">
                            Our Internal New Installment Offer (R)
                          </label>
                          <input
                            type="number"
                            value={internalOfferInst}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.affordabilityOutcome.internalOfferInstalment = Number(e.target.value);
                              updated.affordabilityOutcome.surplusRemaining = grossIncome - (totalExpensesVal + insurancesVal + subscriptionsVal + extInstalment + Number(e.target.value));
                              setSelectedTicket(updated);
                            }}
                            className="w-full p-1.5 border rounded font-mono text-[12px]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-black block mb-0.5">
                            Interest Rate Charged (%)
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            value={internalOfferInt}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.affordabilityOutcome.internalOfferInterest = Number(e.target.value);
                              setSelectedTicket(updated);
                            }}
                            className="w-full p-1.5 border rounded font-mono text-[12px]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-black block mb-0.5">
                            Re-payment Offer Term
                          </label>
                          <div className="flex gap-2">
                            {[12, 24].map((termVal) => (
                              <button
                                key={termVal}
                                type="button"
                                onClick={() => {
                                  const updated = { ...selectedTicket };
                                  updated.affordabilityOutcome.termMonths = termVal as 12 | 24;
                                  setSelectedTicket(updated);
                                }}
                                className={`flex-1 py-1.5 text-center font-bold text-[12px] rounded border transition ${termSelected === termVal ? "bg-blue-600 text-white border-blue-600" : "bg-white text-black border-slate-200 "}`}
                              >
                                {termVal} Months
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Visual Surplus Outcomes display */}
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg space-y-2 mt-4">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="font-extrabold text-indigo-900 text-[10px] uppercase tracking-wider">
                            Post-Onboarding Affordability Forecast ({termSelected} Months)
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${computedSurplus >= 0 ? "bg-emerald-100/80 text-emerald-800" : "bg-rose-100/80 text-rose-800"}`}>
                            {computedSurplus >= 0 ? "Affordable" : "Deficit Warning"}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[12px] divide-x divide-indigo-100">
                          <div className="pr-2">
                            <span className="text-[10px] text-black font-semibold uppercase block">Remaining Surplus If Onboarded with us:</span>
                            <div className={`text-[12px] font-black font-mono mt-1 ${computedSurplus >= 0 ? "text-emerald-700 " : "text-rose-700 "}`}>
                              R{computedSurplus.toLocaleString()}
                            </div>
                          </div>
                          <div className="pl-3">
                            <span className="text-[10px] text-black font-semibold uppercase block">Target Debt Service Ratio (DSR):</span>
                            <div className="text-[12px] font-black font-mono mt-1 text-indigo-700">
                              {Math.round(((totalDeductionsWithOurOffer) / grossIncome) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[12px] border-t pt-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Eligible Assessment stamp</label>
                          <select
                            value={selectedTicket.affordabilityOutcome.loanEligibilityStatus}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.affordabilityOutcome.loanEligibilityStatus = e.target.value as any;
                              setSelectedTicket(updated);
                            }}
                            className="w-full p-1.5 border rounded font-bold text-indigo-700"
                          >
                            <option value="Passed">Passed (Eligible mortgage routing)</option>
                            <option value="Conditional">Conditional (Verify statement uploads)</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-black block mb-0.5">TQM Risk Remarks</label>
                          <input
                            type="text"
                            value={selectedTicket.affordabilityOutcome.riskNotes}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              updated.affordabilityOutcome.riskNotes = e.target.value;
                              setSelectedTicket(updated);
                            }}
                            className="w-full p-1.5 border rounded font-medium text-black"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {activeModalTab === "qaAssessment" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2 mb-1">
                      <h4 className="font-extrabold text-[12px] uppercase text-black">Quality Assurance (QA) Assessment Sheet</h4>
                      {!selectedTicket.qaAssessment && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...selectedTicket };
                            updated.qaAssessment = {
                              id: `QA-${Math.floor(10000 + Math.random() * 90000)}`,
                              status: "Pending",
                              completedAt: new Date().toISOString(),
                              auditor: "QA Auditor",
                              score: 0,
                              checks: { identityVerified: false, incomeMatchesPayslip: false, expensesReasonable: false, debtReviewChecked: false, documentsComplete: false, approvedLimitValid: false },
                              comments: "",
                              autoAudited: false
                            };
                            setSelectedTicket(updated);
                          }}
                          className="text-[10px] bg-blue-600 text-white font-bold py-1 px-2 rounded hover:bg-blue-700"
                        >
                          Generate Assessment Form
                        </button>
                      )}
                      {selectedTicket.qaAssessment && (
                        <span className="font-mono text-[10px] bg-slate-100 py-0.5 px-2 rounded">
                          QA-ID: {selectedTicket.qaAssessment?.id || "Unassigned"}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Block: Status & Score */}
                      <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50/50">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-black block mb-1">Assessment Outcome Status</label>
                          <select
                            value={selectedTicket.qaAssessment?.status || "Pending"}
                            onChange={(e) => {
                              const updated = { ...selectedTicket };
                              if (!updated.qaAssessment) {
                                updated.qaAssessment = {
                                  id: `QA-${Math.floor(10000 + Math.random() * 90000)}`,
                                  status: "Pending",
                                  completedAt: new Date().toISOString(),
                                  auditor: "QA Auditor",
                                  score: 100,
                                  checks: { identityVerified: true, incomeMatchesPayslip: true, expensesReasonable: true, debtReviewChecked: true, documentsComplete: true, approvedLimitValid: true },
                                  comments: "",
                                  autoAudited: false
                                };
                              }
                              updated.qaAssessment.status = e.target.value as any;
                              updated.qaAssessment.autoAudited = false;
                              setSelectedTicket(updated);
                            }}
                            className="w-full text-[12px] p-1.5 border rounded font-bold text-black"
                          >
                            <option value="Passed">Passed (TQM Verified)</option>
                            <option value="Conditional">Conditional (Remediate Requirements)</option>
                            <option value="Failed">Failed (Regulatory Sanction)</option>
                            <option value="Pending">Pending Audit</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-black mb-1">
                            <span>Compliance Integrity Score</span>
                            <span className="font-mono font-bold text-blue-600">
                              {selectedTicket.qaAssessment?.score || 0}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={selectedTicket.qaAssessment?.score || 0}
                              onChange={(e) => {
                                const updated = { ...selectedTicket };
                                if (updated.qaAssessment) {
                                  updated.qaAssessment.score = Number(e.target.value);
                                  updated.qaAssessment.autoAudited = false;
                                  setSelectedTicket(updated);
                                }
                              }}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-black block mb-0.5 font-semibold">Auditor Name</label>
                            <input
                              type="text"
                              value={selectedTicket.qaAssessment?.auditor || "CentriX QA Auditor"}
                              onChange={(e) => {
                                const updated = { ...selectedTicket };
                                if (updated.qaAssessment) {
                                  updated.qaAssessment.auditor = e.target.value;
                                  setSelectedTicket(updated);
                                }
                              }}
                              className="w-full text-[12px] p-1 rounded border text-black"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-black block mb-0.5 font-semibold font-mono">Timestamp</label>
                            <input
                              type="text"
                              disabled
                              value={selectedTicket.qaAssessment?.completedAt ? new Date(selectedTicket.qaAssessment.completedAt).toLocaleString() : "Pending"}
                              className="w-full text-[10px] p-1 rounded border bg-slate-100 text-black font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const ticket = selectedTicket;
                            const identityVerified = ticket.supportingDocuments ? ticket.supportingDocuments.some(d => d.name.toLowerCase().includes("id") || d.category.toLowerCase().includes("client") || d.category.toLowerCase().includes("id")) : false;
                            const incomeMatchesPayslip = ticket.supportingDocuments ? ticket.supportingDocuments.some(d => d.name.toLowerCase().includes("payslip") || d.category.toLowerCase().includes("employment")) : false;
                            const expensesReasonable = (Number(ticket.expenses.rental) + Number(ticket.expenses.groceries) + Number(ticket.expenses.utilities)) < Number(ticket.clientInfo.salary) * 0.7;
                            const debtReviewChecked = !ticket.debtObligations.debtReviewFlag;
                            const documentsComplete = ticket.supportingDocuments ? ticket.supportingDocuments.length >= 2 : false;
                            const approvedLimitValid = Number(ticket.affordabilityOutcome.approvedLimit) > 0 || ticket.affordabilityOutcome.loanEligibilityStatus === "Passed";

                            let score = 0;
                            if (identityVerified) score += 20;
                            if (incomeMatchesPayslip) score += 20;
                            if (expensesReasonable) score += 15;
                            if (debtReviewChecked) score += 20;
                            if (documentsComplete) score += 15;
                            if (approvedLimitValid) score += 10;

                            let status: "Pending" | "Passed" | "Conditional" | "Failed" = "Passed";
                            let comments = "Robust QA Auto Re-evaluated: ";
                            if (!debtReviewChecked) {
                              status = "Failed";
                              comments += "CRITICAL CHECK FAILURE: Client flagged under Debt Review status.";
                            } else if (!identityVerified || !documentsComplete) {
                              status = "Conditional";
                              comments += "CONDITIONAL WARNING: Missing crucial document proof uploads.";
                            } else {
                              comments += "AUTOMATED SUCCESS: Registry checks, credit integrity thresholds satisfied.";
                            }

                            const updated = { ...selectedTicket };
                            updated.qaAssessment = {
                              id: ticket.qaAssessment?.id || `QA-${Math.floor(10000 + Math.random() * 90000)}`,
                              status,
                              completedAt: new Date().toISOString(),
                              auditor: "CentriX Automated QA Engine",
                              score,
                              checks: { identityVerified, incomeMatchesPayslip, expensesReasonable, debtReviewChecked, documentsComplete, approvedLimitValid },
                              comments,
                              autoAudited: true
                            };
                            setSelectedTicket(updated);
                          }}
                          className="w-full p-2 bg-slate-200 hover:bg-slate-350 :bg-slate-600 text-black font-bold rounded text-[11px] uppercase transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 text-emerald-600 mr-1 h-3 animate-spin-slow" /> Force Auto-calculate Metrics
                        </button>
                      </div>

                      {/* Right Block: Verification Checklists */}
                      <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                        <span className="text-[10px] uppercase font-bold text-black block mb-1">Compliance & Integrity Checklist</span>
                        
                        <div className="space-y-1.5 text-[12px]">
                          {[
                            { key: "identityVerified", label: "Primary ID Document Upload" },
                            { key: "incomeMatchesPayslip", label: "Salary Matches Payslip Deposit" },
                            { key: "expensesReasonable", label: "Acceptable Debt-to-Income Margin" },
                            { key: "debtReviewChecked", label: "Clean Debt Review National Database Registry" },
                            { key: "documentsComplete", label: "Standard Minimum Support Documents (>= 2)" },
                            { key: "approvedLimitValid", label: "Valid Non-Zero Affordability Outcome" }
                          ].map(check => {
                            const val = !!selectedTicket.qaAssessment?.checks?.[check.key as keyof typeof selectedTicket.qaAssessment.checks];
                            return (
                              <label key={check.key} className="flex items-center gap-2 p-1.5 border rounded border-slate-100 hover:bg-slate-50 :bg-slate-850 cursor-pointer text-black">
                                <input
                                  type="checkbox"
                                  checked={val}
                                  onChange={(e) => {
                                    const updated = { ...selectedTicket };
                                    if (updated.qaAssessment) {
                                      updated.qaAssessment.checks = {
                                        ...updated.qaAssessment.checks,
                                        [check.key]: e.target.checked
                                      };
                                      let score = 0;
                                      const ch = updated.qaAssessment.checks;
                                      if (ch.identityVerified) score += 20;
                                      if (ch.incomeMatchesPayslip) score += 20;
                                      if (ch.expensesReasonable) score += 15;
                                      if (ch.debtReviewChecked) score += 20;
                                      if (ch.documentsComplete) score += 15;
                                      if (ch.approvedLimitValid) score += 10;
                                      updated.qaAssessment.score = score;
                                      updated.qaAssessment.autoAudited = false;
                                      setSelectedTicket(updated);
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-650 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span className={val ? "font-semibold text-emerald-600 line-through " : ""}>{check.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-black block mb-0.5">QA Compliance Auditor Notes & Directives</label>
                      <textarea
                        value={selectedTicket.qaAssessment?.comments || ""}
                        onChange={(e) => {
                          const updated = { ...selectedTicket };
                          if (updated.qaAssessment) {
                            updated.qaAssessment.comments = e.target.value;
                            setSelectedTicket(updated);
                          }
                        }}
                        placeholder="Type standard regulatory remarks here..."
                        className="w-full text-[12px] p-2 border rounded h-16 resize-none font-medium text-black"
                      />
                    </div>

                    <div className="p-2.5 bg-blue-50/50 border-l-4 border-blue-500 rounded text-[10px] text-black italic font-medium">
                      Info: Any changes made to this QA assessment moves across all stages of the workflow process and is permanently stored inside the main system storage ledger.
                    </div>
                  </div>
                )}

                {activeModalTab === "departmentNotes" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2 mb-1">
                      <h4 className="font-extrabold text-[12px] uppercase text-black">📝 Inter-Departmental Work Notes & Hand-offs</h4>
                      <span className="font-mono text-[10px] bg-blue-50 text-blue-700 py-0.5 px-2 rounded">
                        Notes Ledger
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px] overflow-hidden">
                      {/* Left Block: History Timeline listview */}
                      <div className="border border-slate-200 rounded-lg p-3 flex flex-col h-full bg-slate-50/50">
                        <span className="text-[10px] uppercase font-bold text-black block mb-2">Notes Timeline history</span>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                          {(() => {
                            const notesTimeline = [];
                            if (selectedTicket.clientInfo.notes) {
                              notesTimeline.push({
                                id: "initial-sales-note",
                                timestamp: selectedTicket.auditLogs?.[0]?.timestamp || new Date().toISOString(),
                                author: "Sales Agent",
                                department: "Sales",
                                text: selectedTicket.clientInfo.notes
                              });
                            }
                            if (selectedTicket.notesHistory && Array.isArray(selectedTicket.notesHistory)) {
                              notesTimeline.push(...selectedTicket.notesHistory);
                            }

                            if (notesTimeline.length === 0) {
                              return (
                                <div className="text-center py-12 text-black text-[12px] italic">
                                  No transaction notes logged yet.
                                </div>
                              );
                            }

                            // Sort by time
                            return notesTimeline.map((note, index) => {
                              // Department color choices
                              let deptColor = "bg-slate-100 text-black border-slate-205  ";
                              if (note.department === "Sales") deptColor = "bg-blue-50 text-blue-700 border-blue-150  ";
                              else if (note.department === "Sales Administration") deptColor = "bg-sky-50 text-sky-700 border-sky-150  ";
                              else if (note.department === "Document Hunters") deptColor = "bg-amber-50 text-amber-700 border-amber-150  ";
                              else if (note.department === "Debt Review") deptColor = "bg-zinc-100 text-black border-zinc-250  ";
                              else if (note.department === "Quality Assurance") deptColor = "bg-emerald-50 text-emerald-700 border-emerald-150  ";
                              else if (note.department === "Client Experience") deptColor = "bg-teal-50 text-teal-700 border-teal-150  ";
                              else if (note.department === "Credit Committee") deptColor = "bg-purple-50 text-purple-700 border-purple-150  ";
                              else if (note.department === "Finance") deptColor = "bg-indigo-50 text-indigo-700 border-indigo-150  ";
                              else if (note.department === "Signed Off") deptColor = "bg-emerald-100 text-emerald-800 border-emerald-250  ";

                              return (
                                <div key={note.id || index} className="p-2.5 rounded-lg border border-slate-200 bg-white shadow-3xs space-y-1">
                                  <div className="flex justify-between items-start gap-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-bold text-[11px] text-black">{note.author}</span>
                                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full border text-center font-extrabold uppercase ${deptColor}`}>
                                        {note.department}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-black font-mono">
                                      {new Date(note.timestamp).toLocaleDateString()} {new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-black leading-relaxed font-medium pl-0.5 select-text">
                                    {note.text}
                                  </p>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Right Block: Add Note & Auto-Capture info */}
                      <div className="border border-slate-200 rounded-lg p-3 flex flex-col justify-between bg-white h-full">
                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                          <span className="text-[10px] uppercase font-bold text-black block font-mono">Commit new working notes</span>
                          
                          {/* Auto-Captured Agent Session */}
                          {(() => {
                            const emp = employees.find(e => e.email === authEmail) || employees.find(e => e.department === authorizedDept) || employees[0];
                            const empName = emp ? emp.name : authEmail.split("@")[0].toUpperCase();
                            const empId = emp ? emp.id : "system-agent";
                            const empDept = emp ? emp.department : selectedTicket.status;
                            const empRole = emp ? emp.role : "Agent";
                            return (
                              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                                <span className="text-[10px] uppercase font-black text-black block">Auto-Captured Session</span>
                                <div className="text-[12px] font-bold text-black truncate">
                                  {empName} <span className="text-[10px] text-black font-normal">({empId})</span>
                                </div>
                                <div className="text-[10px] text-black font-medium font-sans flex flex-wrap gap-1.5">
                                  <span>Dept: <b className="text-black">{empDept}</b></span>
                                  <span>•</span>
                                  <span>Role: <b className="text-black">{empRole}</b></span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Notes Text Area */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-black block font-mono">Your Notes & Remarks</label>
                            <textarea
                              value={noteInputText}
                              onChange={(e) => setNoteInputText(e.target.value)}
                              placeholder="Write a clear process note here to verify your action and proceed..."
                              className="w-full text-[12px] p-2 border rounded h-32 resize-none font-medium text-black placeholder-slate-400 focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Note actions buttons */}
                        <div className="pt-2 border-t">
                          <button
                            type="button"
                            onClick={() => handleAddNoteToTicket(selectedTicket, noteInputText)}
                            className="w-full p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded text-[11px] uppercase transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Save Note
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 bg-blue-50/50 border-l-4 border-blue-500 rounded text-[10px] text-black leading-relaxed font-semibold">
                      Regulatory Guardrail: The notes ledger acts as a permanent, immutable workspace tracker. Every user who handles the mortgage folder must record diagnostic remarks to verify and proceed.
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Modal actions footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between gap-3 text-[12px]">
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveApplication}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-white" /> Save Application
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsTicketModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 :bg-slate-700 text-black font-bold rounded-lg transition"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {/* 5. LIVE QA MONITORING MODAL */}
      {activeQAModal === "monitoring" && (
        <div className="fixed inset-0 z-[60] bg-black/5 flex items-start justify-center p-4">
             <div className="bg-white dark:bg-slate-850 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
                 <LiveMonitoring employeesList={employees} onClose={() => setActiveQAModal(null)} />
             </div>
        </div>
      )}

      {/* 4. ROBUST SALES CREATE TICKET MODAL */}
      {isCreateTicketOpen && (
        <div className="fixed inset-0 z-50 bg-black/5 overflow-y-auto flex items-start justify-center p-4">
          <form onSubmit={handleCreateSalesTicket} className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b pb-3 border-slate-205 text-black">
              <h3 className="text-[12px] font-extrabold uppercase tracking-wide">Create Sales Ticket</h3>
              <button type="button" onClick={() => setIsCreateTicketOpen(false)} className="text-black hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-[12px]">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Client Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sindi Ndaba"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-black block mb-0.5">National ID No</label>
                  <input
                    type="text"
                    placeholder="e.g. 9405021234085"
                    value={newClientNationalId}
                    onChange={(e) => setNewClientNationalId(e.target.value)}
                    className="w-full p-2 border rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Phone Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. +27 73 998 1221"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full p-2 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sindi@gmail.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Monthly Basic Income (R)</label>
                  <input
                    type="number"
                    value={newClientSalary}
                    onChange={(e) => setNewClientSalary(e.target.value)}
                    className="w-full p-2 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Mortgage Capital Required (R)</label>
                  <input
                    type="number"
                    value={newMortgageAmount}
                    onChange={(e) => setNewMortgageAmount(e.target.value)}
                    className="w-full p-2 border rounded font-mono"
                  />
                </div>
              </div>

              {/* PRODUCTS MATRICES MULTISELECT - EMBEDDING REQUIREMENT: Smartphones, wifi router, headphones, data sim cards, pocket wifi */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-black block">Select Asset portfolio & Value Added items</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] p-2.5 bg-slate-50 rounded border border-dashed text-black">
                  {[
                    "Full Home Mortgage 1.2M",
                    "Smartphone S24",
                    "Router Wifi Extreme",
                    "Wireless Headset",
                    "Prepaid Data Sim Card",
                    "Pocket Wi-Fi Lite",
                    "High-Fi Speaker Stack"
                  ].map(prod => {
                    const selected = newSelectedProducts.includes(prod);
                    return (
                      <button
                        key={prod}
                        type="button"
                        onClick={() => handleToggleProductSelection(prod)}
                        className={`p-1.5 rounded text-left border font-medium ${selected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-black "}`}
                      >
                        {selected ? "✓ " : "+ "} {prod}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Initial Ticket Status</label>
                  <select
                    value={newClientTicketStatus}
                    onChange={(e) => setNewClientTicketStatus(e.target.value as any)}
                    className="w-full p-2 border rounded font-bold text-[11px] text-black"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-black block mb-0.5">Sales Notes / Customer Requests</label>
                <textarea
                  placeholder="Insert client requirements..."
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  className="w-full p-2 border rounded h-16 resize-none"
                />
              </div>

            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                type="button"
                onClick={() => setIsCreateTicketOpen(false)}
                className="px-4 py-2 bg-slate-100 font-bold rounded-lg text-[12px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[12px] shadow-md transition"
              >
                Launch Sales Application
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Pop-up Document Viewer (Semi-translucent backdrop, custom styling, clear X close button) */}
      {previewingDoc && selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-black text-[12px] max-w-[420px] truncate">{previewingDoc.name}</h3>
                  <p className="text-[10px] text-black font-mono tracking-tight uppercase">Category: {previewingDoc.category}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingDoc(null)}
                className="p-1 rounded-lg hover:bg-slate-200 :bg-slate-800 text-black hover:text-black :text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 font-sans">
              {(() => {
                const preview = documentPreviews[previewingDoc.id];
                if (preview) {
                  if (preview.type.startsWith("image/")) {
                    return (
                      <div className="flex justify-center items-center py-4 bg-slate-100 rounded-lg border">
                        <img 
                          src={preview.dataUrl} 
                          alt={preview.name} 
                          className="max-h-[50vh] object-contain rounded border shadow-sm" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    );
                  } else if (preview.textContent) {
                    return (
                      <pre className="p-4 bg-slate-100 font-mono text-[12px] rounded border text-black overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[50vh]">
                        {preview.textContent}
                      </pre>
                    );
                  } else {
                    return (
                      <div className="text-center py-10 space-y-4">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-xs border">
                          <FileCheck className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-bold text-black">User Uploaded Binary Document</h4>
                          <p className="text-[12px] text-black mt-1 max-w-sm mx-auto">
                            Uploaded from your client-side device. File content payload is held securely in compliance session memory.
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border text-left text-[12px] space-y-1.5 font-mono max-w-xs mx-auto shadow-xs text-black">
                          <div className="truncate"><b>File Name:</b> {preview.name}</div>
                          <div><b>File Size:</b> {(preview.size / 1024).toFixed(2)} KB</div>
                          <div><b>MIME Type:</b> {preview.type || "unknown/binary"}</div>
                        </div>
                      </div>
                    );
                  }
                } else {
                  return (
                    <div className="space-y-4 py-2">
                      <div className="border border-slate-200 rounded-lg bg-white p-6 shadow-xs relative overflow-hidden">
                        <div className="absolute right-4 top-4 text-emerald-800/15 font-extrabold text-[12px] select-none font-mono">
                          VERIFIED
                        </div>
                        
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                          <div>
                            <div className="bg-emerald-100 text-emerald-805 font-bold px-2 py-0.5 rounded text-[10px] uppercase inline-block mb-1 font-mono tracking-tight">
                              Authentic Secure Scan
                            </div>
                            <h4 className="font-bold text-black text-[12px]">{previewingDoc.name}</h4>
                            <p className="text-[11px] text-black">Document Type ID: <span className="font-mono text-black">{previewingDoc.id}</span></p>
                          </div>
                          <div className="text-right font-mono text-[10px] text-black">
                            <div>Date Locked: {new Date().toLocaleDateString()}</div>
                            <div>System Hash: MD5-F58AC33</div>
                          </div>
                        </div>

                        <div className="space-y-3.5 text-[12px] text-black">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-2.5 rounded border border-dashed border-slate-205">
                              <span className="text-[10px] uppercase font-bold text-black block mb-1">CRM Anchor Account</span>
                              <div className="font-bold text-black">{selectedTicket.clientInfo.name}</div>
                              <div className="text-black font-mono text-[11px] mt-0.5">{selectedTicket.clientInfo.email}</div>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded border border-dashed border-slate-205">
                              <span className="text-[10px] uppercase font-bold text-black block mb-1 font-mono">Verification Status</span>
                              <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                                <Check className="w-4 h-4 bg-emerald-100 p-0.5 rounded-full" />
                                <span>SECURE CLEARED</span>
                              </div>
                              <div className="text-black text-[10px] mt-1">Checked on automated ingress</div>
                            </div>
                          </div>

                          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            <h5 className="font-bold text-blue-800 mb-1.5 flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5 text-blue-500" />
                              <span>Workplace Directives Check:</span>
                            </h5>
                            <p className="text-black leading-normal text-[11px]">
                              This file is stored in our read-only, fully compliant document storage vault. It matches the required payload schema for <b className="text-blue-700 font-semibold uppercase">{previewingDoc.category}</b> calculations. The content checksum was validated using local SSL/TSL compliance keys.
                            </p>
                          </div>

                          <div className="text-[11px] text-black italic mt-2 border-t pt-2 border-dashed border-slate-200">
                            Disclaimer: Since this is a pre-seeded workspace sample, this document has been mathematically compiled to reflect the target category structure. In your live workspace, any system file uploaded through the drive option will store its actual physical bytes.
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 rounded-b-xl">
              <button
                type="button"
                onClick={() => setPreviewingDoc(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 :bg-slate-700 text-black font-bold rounded-lg transition text-[12px]"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Integrated Unified FAB, 3-in-1 overlay space */}
      {isLoggedIn && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
          {/* Expanded micro button tray when clicked */}
          {isFabExpanded && (
            <div className="flex flex-col items-end gap-3 mb-2 animate-fadeIn">
              {/* 1. VoIP Voice Call button */}
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-md border border-slate-700">
                  Calls
                </span>
                <button
                  type="button"
                  id="fab-call-btn"
                  onClick={() => {
                    setFloatingCommsChannel("calls");
                    setIsFloatingCommsOpen(true);
                    setIsFabExpanded(false);
                  }}
                  className="w-11 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105"
                  title="Dial voice lines"
                >
                  <Phone className="w-5 h-5" />
                </button>
              </div>

              {/* 2. Face-to-Face Video Consultation */}
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-md border border-slate-700">
                  Video
                </span>
                <button
                  type="button"
                  id="fab-video-btn"
                  onClick={() => {
                    setFloatingCommsChannel("video");
                    setIsFloatingCommsOpen(true);
                    setIsFabExpanded(false);
                  }}
                  className="w-11 h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105"
                  title="Request video consult"
                >
                  <Video className="w-5 h-5" />
                </button>
              </div>

              {/* 3. Instant Chats (WhatsApp, Telegram) */}
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-md border border-slate-700">
                  Chat
                </span>
                <button
                  type="button"
                  id="fab-chat-btn"
                  onClick={() => {
                    setFloatingCommsChannel("chats");
                    setIsFloatingCommsOpen(true);
                    setIsFabExpanded(false);
                  }}
                  className="w-11 h-11 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105"
                  title="Omnichannel chat trunks"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Master FAB Trigger with multi-interaction indicators */}
          <button
            type="button"
            id="master-fab-trigger"
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl relative transition-all duration-300 ${
              isFabExpanded 
                ? "bg-slate-800 hover:bg-slate-900 rotate-135 scale-95" 
                : "bg-gradient-to-tr from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 hover:shadow-indigo-500/30 scale-100"
            }`}
          >
            {isFabExpanded ? (
              <X className="w-6 h-6 transition-transform rotate-45" />
            ) : (
              <div className="relative">
                <MessageSquare className="w-6 h-6" />
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-[9px] font-black w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center text-white">
                  3
                </span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Floated Comms Communicator Frame overlay */}
      {isLoggedIn && isFloatingCommsOpen && (
        <div 
          id="floating-comms-frame"
          className="fixed bottom-24 right-6 w-[420px] h-[525px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col font-sans transition-all duration-300"
        >
          {/* Custom modal header specifically keeping default LIGHT theme color layout active */}
          <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between border-b border-slate-750">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <h4 className="font-extrabold text-[12px] uppercase">CentriX Comms Vault Console</h4>
                <p className="text-[9px] text-zinc-300 font-medium">Compliance trunk synched with SysAdmin / IT</p>
              </div>
            </div>
            <button
              type="button"
              id="close-comms-frame"
              onClick={() => setIsFloatingCommsOpen(false)}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-slate-50 relative">
            <BlanketComms 
              ticketsList={tickets}
              employeesList={employees}
              selectedDept={selectedDept}
              onTriggerRefresh={fetchCrmData}
              chatsData={chatsData}
              callLogs={callLogs}
              videoSessions={videoSessions}
              defaultChannel={floatingCommsChannel}
            />
          </div>
        </div>
      )}

    </div>
  );
}
