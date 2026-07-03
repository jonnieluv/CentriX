import React, { useState } from "react";
import { 
  Settings, Users, Activity, Shield, RefreshCw, Zap, Server, 
  Trash2, Plus, Check, Play, Square, Eye, Sparkles, Database,
  FileSpreadsheet, Lock, AlertCircle, AlertTriangle, Key, Network, Cpu, X, CheckCircle,
  Wrench, BookOpen, HelpCircle, Briefcase, Code, Terminal, MessageSquare, Bot, ArrowUpRight,
  Download, Upload, Coins, MessageCircle, Hash, Instagram, Twitter, Linkedin, CreditCard,
  ShoppingCart, FileText, BarChart, Mail, Phone, Share2, Globe as World, LifeBuoy, Box, Archive, Layout, Video
} from "lucide-react";

// Robust Authentication Types
interface AuthConfig {
  method: 'OAuth 2.0' | 'API Key' | 'Bearer Token' | 'Client Secret' | 'Webhook HMAC';
  lastRotated?: string;
}

interface PlatformIntegration {
  id: string;
  name: string;
  category: 'Business' | 'Social';
  status: 'Active' | 'Warning' | 'Idle' | 'Offline';
  latency: string;
  throughput: string;
  icon: any;
  type: string;
  health: number;
  auth: AuthConfig;
}
import { 
  SystemUser, WorkflowAutomation, IntegrationConnector, SecurityAuditEntry, Employee, Ticket
} from "../types";

interface SysAdminPanelProps {
  systemUsers: SystemUser[];
  workflowAutomations: WorkflowAutomation[];
  integrationConnectors: IntegrationConnector[];
  securityAuditLogs: SecurityAuditEntry[];
  sysAdminSettings: {
    databaseBackupStatus: string;
    dataCleanlinessScore: number;
    lastBackupTime: string;
    autoDeduplicationEnabled: boolean;
    whitelistIps: string;
  };
  employees?: Employee[];
  tickets?: Ticket[];
  onUpdateUser: (user: Partial<SystemUser> & { id?: string }) => void;
  onUpdateWorkflow: (wf: Partial<WorkflowAutomation> & { id?: string }) => void;
  onSyncIntegration: (params: { id: string; syncNow?: boolean; toggleStatus?: boolean }) => void;
  onUpdateSettings: (params: { autoDeduplicationEnabled?: boolean; whitelistIps?: string }) => void;
  onTriggerBackup: () => void;
  onTriggerClean: () => void;
  onMigrateData: () => void;
  chatsData?: Record<string, any[]>;
  callLogs?: any[];
  videoSessions?: any[];
}

export default function SysAdminPanel({
  systemUsers = [],
  workflowAutomations = [],
  integrationConnectors = [],
  securityAuditLogs = [],
  sysAdminSettings = {
    databaseBackupStatus: "Up-to-date",
    dataCleanlinessScore: 92,
    lastBackupTime: "2026-05-28 01:00 AM",
    autoDeduplicationEnabled: true,
    whitelistIps: "196.24.110.12, 196.24.110.45"
  },
  employees = [],
  tickets = [],
  onUpdateUser,
  onUpdateWorkflow,
  onSyncIntegration,
  onUpdateSettings,
  onTriggerBackup,
  onTriggerClean,
  onMigrateData,
  chatsData = {},
  callLogs = [],
  videoSessions = []
}: SysAdminPanelProps) {
  
  const [activeTab, setActiveTab ] = useState<"platform" | "users" | "workflows" | "integrations" | "audits" | "services">("platform");
  const [searchLogQuery, setSearchLogQuery] = useState("");
  const [logSeverityFilter, setLogSeverityFilter] = useState("All");

  // Systems & Admin operational request tickets states
  const [selectedAdminTicket, setSelectedAdminTicket] = useState<any | null>(null);
  const [isAdminTicketModalOpen, setIsAdminTicketModalOpen] = useState(false);
  const [adminTicketsList, setAdminTicketsList] = useState([
    { id: "SYS-REQ-109", task: "Database Lock Investigation", requester: "Sarah Jenkins", category: "Database Integrity", urgency: "High", status: "Pending", details: "Requested a temporary telemetry probe to audit Firestore lock contention during duplicate sweeper runs." },
    { id: "SYS-REQ-241", task: "IAM Role Modification", requester: "Ashraf Patel (IT)", category: "Security", urgency: "Critical", status: "In Progress", details: "Elevated credential grant requested to perform manual SSL point handshake validation on API gateway." },
    { id: "SYS-REQ-388", task: "API Webhook Callback Handshake", requester: "External Webhook Client", category: "API Gateway", urgency: "Medium", status: "Pending", details: "Ping verification failure reported from server route webhook: 403 Forbidden payload response." }
  ]);

  // User tab form states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"Administrator" | "Agent" | "Supervisor" | "API-Service">("Agent");
  const [newUserStatus, setNewUserStatus] = useState<"Active" | "Deactivated">("Active");

  // Workflow tab form states
  const [newWfName, setNewWfName] = useState("");
  const [newWfTrigger, setNewWfTrigger] = useState("");
  const [newWfAction, setNewWfAction] = useState("");

  // Settings local state for saving
  const [localWhitelist, setLocalWhitelist] = useState(sysAdminSettings.whitelistIps);
  const [localAutoDeduplication, setLocalAutoDeduplication] = useState(sysAdminSettings.autoDeduplicationEnabled);

  // Today's System upgrades & isolation parameters local states
  const [localStaffIsolation, setLocalStaffIsolation] = useState(true);
  const [localTicketAutoTransitionReview, setLocalTicketAutoTransitionReview] = useState(true);
  const [localMinSentimentScore, setLocalMinSentimentScore] = useState(70);

  // Success Feedbacks
  const [feedback, setFeedback] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([
    // Business Integrations (25)
    { id: "b1", name: "Salesforce CRM", category: "Business", status: "Active", latency: "14ms", throughput: "4.5k/hr", icon: Database, type: "REST API", health: 100, auth: { method: 'OAuth 2.0', lastRotated: '2026-05-10' } },
    { id: "b2", name: "SAP ERP", category: "Business", status: "Active", latency: "45ms", throughput: "1.2k/hr", icon: Server, type: "OData/REST", health: 98, auth: { method: 'Client Secret' } },
    { id: "b3", name: "Oracle Cloud", category: "Business", status: "Active", latency: "22ms", throughput: "8.9k/hr", icon: Database, type: "OCI SDK", health: 100, auth: { method: 'API Key' } },
    { id: "b4", name: "Dynamics 365", category: "Business", status: "Active", latency: "18ms", throughput: "2.1k/hr", icon: Briefcase, type: "Dataverse", health: 99, auth: { method: 'OAuth 2.0' } },
    { id: "b5", name: "HubSpot", category: "Business", status: "Active", latency: "12ms", throughput: "500/hr", icon: BarChart, type: "JSON API", health: 100, auth: { method: 'API Key' } },
    { id: "b6", name: "Jira Software", category: "Business", status: "Active", latency: "30ms", throughput: "150/hr", icon: Layout, type: "Atlassian API", health: 95, auth: { method: 'Bearer Token' } },
    { id: "b7", name: "Confluence", category: "Business", status: "Active", latency: "25ms", throughput: "80/hr", icon: FileText, type: "Atlassian API", health: 97, auth: { method: 'Bearer Token' } },
    { id: "b8", name: "Zoom Meetings", category: "Business", status: "Active", latency: "110ms", throughput: "5k/hr", icon: Video, type: "WebSockets", health: 92, auth: { method: 'OAuth 2.0' } },
    { id: "b9", name: "Stripe Payments", category: "Business", status: "Active", latency: "8ms", throughput: "12k/hr", icon: CreditCard, type: "Stripe SDK", health: 100, auth: { method: 'Webhook HMAC' } },
    { id: "b10", name: "PayPal Business", category: "Business", status: "Active", latency: "15ms", throughput: "3.5k/hr", icon: CreditCard, type: "PayPal API", health: 99, auth: { method: 'OAuth 2.0' } },
    { id: "b11", name: "QuickBooks", category: "Business", status: "Active", latency: "55ms", throughput: "200/hr", icon: BarChart, type: "Intuit API", health: 100, auth: { method: 'OAuth 2.0' } },
    { id: "b12", name: "Xero Accounting", category: "Business", status: "Active", latency: "42ms", throughput: "150/hr", icon: BarChart, type: "Xero API", health: 98, auth: { method: 'OAuth 2.0' } },
    { id: "b13", name: "Shopify Store", category: "Business", status: "Active", latency: "20ms", throughput: "15k/hr", icon: ShoppingCart, type: "GraphQL", health: 100, auth: { method: 'API Key' } },
    { id: "b14", name: "Magento Cloud", category: "Business", status: "Active", latency: "65ms", throughput: "4k/hr", icon: ShoppingCart, type: "REST API", health: 94, auth: { method: 'Bearer Token' } },
    { id: "b15", name: "DocuSign Hub", category: "Business", status: "Active", latency: "35ms", throughput: "50/hr", icon: FileText, type: "eSign SDK", health: 100, auth: { method: 'OAuth 2.0' } },
    { id: "b16", name: "Dropbox", category: "Business", status: "Active", latency: "38ms", throughput: "5GB/hr", icon: Archive, type: "Dropbox SDK", health: 99, auth: { method: 'Bearer Token' } },
    { id: "b17", name: "Box Platform", category: "Business", status: "Active", latency: "28ms", throughput: "1.2GB/hr", icon: Box, type: "Box API", health: 100, auth: { method: 'OAuth 2.0' } },
    { id: "b18", name: "Tableau BI", category: "Business", status: "Active", latency: "150ms", throughput: "300/hr", icon: BarChart, type: "Hyper API", health: 96, auth: { method: 'Client Secret' } },
    { id: "b19", name: "PowerBI Engine", category: "Business", status: "Active", latency: "120ms", throughput: "2k/hr", icon: BarChart, type: "REST API", health: 97, auth: { method: 'OAuth 2.0' } },
    { id: "b20", name: "Mailchimp", category: "Business", status: "Active", latency: "18ms", throughput: "50k/hr", icon: Mail, type: "v3 API", health: 100, auth: { method: 'API Key' } },
    { id: "b21", name: "SendGrid SMTP", category: "Business", status: "Active", latency: "5ms", throughput: "200k/hr", icon: Mail, type: "SMTP/REST", health: 100, auth: { method: 'API Key' } },
    { id: "b22", name: "Twilio Comms", category: "Business", status: "Active", latency: "10ms", throughput: "10k/hr", icon: Phone, type: "Twilio SDK", health: 100, auth: { method: 'Bearer Token' } },
    { id: "b23", name: "PagerDuty", category: "Business", status: "Active", latency: "12ms", throughput: "20/hr", icon: Activity, type: "Events API", health: 100, auth: { method: 'API Key' } },
    { id: "b24", name: "Datadog", category: "Business", status: "Active", latency: "7ms", throughput: "1M/hr", icon: Activity, type: "StatsD", health: 100, auth: { method: 'API Key' } },
    { id: "b25", name: "Sentry OS", category: "Business", status: "Active", latency: "15ms", throughput: "400/hr", icon: Zap, type: "REST API", health: 99, auth: { method: 'Bearer Token' } },
    
    // Social & Messaging Integrations (10)
    { id: "s1", name: "Telegram Bot", category: "Social", status: "Active", latency: "12ms", throughput: "500/min", icon: MessageCircle, type: "Webhook", health: 100, auth: { method: 'API Key' } },
    { id: "s2", name: "WhatsApp Business", category: "Social", status: "Active", latency: "25ms", throughput: "1.2k/min", icon: MessageSquare, type: "Cloud API", health: 98, auth: { method: 'Bearer Token' } },
    { id: "s3", name: "Microsoft Teams", category: "Social", status: "Active", latency: "45ms", throughput: "2.1k/min", icon: Users, type: "Graph API", health: 99, auth: { method: 'OAuth 2.0' } },
    { id: "s4", name: "Slack Connect", category: "Social", status: "Active", latency: "15ms", throughput: "800/min", icon: MessageSquare, type: "OAuth SDK", health: 100, auth: { method: 'OAuth 2.0' } },
    { id: "s5", name: "Discord Bot", category: "Social", status: "Active", latency: "20ms", throughput: "3k/min", icon: Hash, type: "Bot Toolkit", health: 100, auth: { method: 'Bearer Token' } },
    { id: "s6", name: "LinkedIn Sales", category: "Social", status: "Warning", latency: "205ms", throughput: "100/hr", icon: Linkedin, type: "Ads API", health: 64, auth: { method: 'OAuth 2.0' } },
    { id: "s7", name: "X/Twitter Ads", category: "Social", status: "Active", latency: "38ms", throughput: "1.2k/hr", icon: Twitter, type: "v2 API", health: 95, auth: { method: 'OAuth 2.0' } },
    { id: "s8", name: "Facebook Business", category: "Social", status: "Active", latency: "55ms", throughput: "10k/hr", icon: World, type: "Graph API", health: 90, auth: { method: 'OAuth 2.0' } },
    { id: "s9", name: "Instagram Graph", category: "Social", status: "Active", latency: "48ms", throughput: "8k/hr", icon: Instagram, type: "Graph API", health: 92, auth: { method: 'OAuth 2.0' } },
    { id: "s10", name: "TikTok Business", category: "Social", status: "Active", latency: "42ms", throughput: "5k/hr", icon: Share2, type: "Ads API", health: 100, auth: { method: 'OAuth 2.0' } },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<PlatformIntegration | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [integrationFilter, setIntegrationFilter] = useState<'All' | 'Business' | 'Social'>('All');

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // --- Real-time Integration Heartbeat Simulation ---
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIntegrations(prev => prev.map(item => {
        // Randomly simulate small changes in latency and health for data-driven feel
        if (Math.random() > 0.7) {
          const latValue = parseInt(item.latency) || 10;
          const newLat = Math.max(2, latValue + (Math.random() > 0.5 ? 1 : -1));
          return {
            ...item,
            latency: `${newLat}ms`,
            health: Math.min(100, Math.max(80, item.health + (Math.random() > 0.5 ? 0.5 : -0.5)))
          };
        }
        return item;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- New Systems Admin Interactive Services States ---
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [serviceDeploymentLogs, setServiceDeploymentLogs] = useState<string[]>([]);
  const [serviceDeployStatus, setServiceDeployStatus] = useState<"idle" | "deploying" | "success" | "failed">("idle");
  const [serviceDeployProgress, setServiceDeployProgress] = useState(0);

  // Layout customizing simulation state
  const [crmFields, setCrmFields] = useState([
    { field: "leadSource", type: "Select", status: "Active", system: true },
    { field: "monthlyIncome", type: "Currency", status: "Active", system: true },
    { field: "debtAmount", type: "Currency", status: "Active", system: true },
    { field: "bureauScore", type: "Number", status: "Active", system: false },
    { field: "preferredContactTime", type: "Text", status: "Inactive", system: false }
  ]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("Text");

  // In-memory duplicates cleaner
  const [dbDuplicates, setDbDuplicates] = useState([
    { id: "DUP-102", name: "Johnathan Doe", primaryEmail: "johndoe@gmail.com", matches: ["John Doe", "J. Doe"], score: 98 },
    { id: "DUP-504", name: "Sarah Connor", primaryEmail: "sarah@sky.net", matches: ["Sarah Connor-Reese"], score: 92 },
    { id: "DUP-881", name: "Donald Draper", primaryEmail: "don@sterlingcooper.com", matches: ["Don Draper", "Donald F. Draper"], score: 95 }
  ]);

  // Data parser input
  const [csvImportInput, setCsvImportInput] = useState("");
  const [dataLogs, setDataLogs] = useState<string[]>([
    "System Database synchronized successfully.",
    "Data import thread ID #094 initialized.",
    "SLA performance tracking running normally."
  ]);

  // Support ticket tracking
  const [supportTicketsList, setSupportTicketsList] = useState([
    { id: "BUG-882", issue: "Hubspot Webhook Payload Parse failure on leads", severity: "High", assignedTo: "Ashraf Patel", status: "Assigned" },
    { id: "BUG-109", issue: "Deduplicator running in O(n^2) causing DB timeout", severity: "Medium", assignedTo: "Dev Team", status: "In Reviews" },
    { id: "BUG-249", issue: "SSO handshakes failing for remote training logins", severity: "Critical", assignedTo: "Sarah Jenkins", status: "In Progress" }
  ]);
  const [newIssueText, setNewIssueText] = useState("");
  const [newIssueSeverity, setNewIssueSeverity] = useState("Medium");

  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    score: number;
    checkedAt: string | null;
    issues: { category: string; test: string; status: "Healthy" | "Warning" | "Critical"; recommendation: string; actionKey?: string }[];
  } | null>(null);

  const triggerAudit = () => {
    setIsRunningAudit(true);
    setTimeout(() => {
      setIsRunningAudit(false);
      
      const issues: { category: string; test: string; status: "Healthy" | "Warning" | "Critical"; recommendation: string; actionKey?: string }[] = [];
      let calculatedScore = 100;

      // 1. Check database Cleanliness Score
      if (sysAdminSettings.dataCleanlinessScore < 95) {
        issues.push({
          category: "Database Integrity",
          test: `Data cleanliness is at ${sysAdminSettings.dataCleanlinessScore}%`,
          status: "Warning",
          recommendation: "Run our Duplicate Record Sweeper to auto-sanitize names, phones, and emails.",
          actionKey: "clean"
        });
        calculatedScore -= 15;
      } else {
        issues.push({
          category: "Database Integrity",
          test: `Data cleanliness is outstanding (${sysAdminSettings.dataCleanlinessScore}%)`,
          status: "Healthy",
          recommendation: "Excellent index cleanliness. Normal patterns match expectations."
        });
      }

      // 2. Check failed API Integration connectors
      const brokenConnectors = integrationConnectors.filter(c => c.status === "Error" || c.healthRate < 80);
      if (brokenConnectors.length > 0) {
        brokenConnectors.forEach(c => {
          issues.push({
            category: "API Integration",
            test: `${c.name} connector sync failing`,
            status: "Critical",
            recommendation: `Manual sync state error reported. Click 'Sync Node' to re-try remote socket handshake.`,
            actionKey: `sync-${c.id}`
          });
          calculatedScore -= 20;
        });
      } else {
        issues.push({
          category: "API Integration",
          test: "All external outbound API connectors functional",
          status: "Healthy",
          recommendation: "Corporate Rest handshakes with Sage Account, HubSpot and Slack SMTP are optimal."
        });
      }

      // 3. User Administration
      const adminsCount = systemUsers.filter(u => u.role === "Administrator").length;
      if (adminsCount > 2) {
        issues.push({
          category: "RBAC Security",
          test: `${adminsCount} authorized Administrator profiles found`,
          status: "Warning",
          recommendation: "High ratio of superusers! Re-evaluate permissions to limit breach surface vectors."
        });
        calculatedScore -= 10;
      }

      // 4. Backup Recency
      const containsToday = sysAdminSettings.lastBackupTime.includes("14:") || sysAdminSettings.lastBackupTime.includes("15:");
      if (!containsToday) {
        issues.push({
          category: "Disaster Recovery",
          test: "Cold DB backup is stale (> 24 hours)",
          status: "Warning",
          recommendation: "Enforce safe disaster procedures by performing a manual Firestore export.",
          actionKey: "backup"
        });
        calculatedScore -= 10;
      } else {
        issues.push({
          category: "Disaster Recovery",
          test: `Backup file verified (${sysAdminSettings.lastBackupTime})`,
          status: "Healthy",
          recommendation: "Disaster recovery records are signed and packed cleanly."
        });
      }

      // 5. HCM Department Staffing Check (Today's Upgrade)
      const hcCount = employees.filter(e => e.department === "Human Capital").length;
      const tdCount = employees.filter(e => e.department === "Training and Development").length;
      if (hcCount === 0 || tdCount === 0) {
        issues.push({
          category: "HCM Roster Integrity",
          test: `Human Capital Roster (${hcCount} employees) & Training (${tdCount} employees) under-provisioned`,
          status: "Warning",
          recommendation: "Assign at least one active corporate representative to both Human Capital and Training & Development departments."
        });
        calculatedScore -= 10;
      } else {
        issues.push({
          category: "HCM Roster Integrity",
          test: "Active representative staffing verified in HC & Training departments",
          status: "Healthy",
          recommendation: "Staffing rules comply with corporate development directory blueprints."
        });
      }

      // 6. HCM Department Isolation Firewall (Today's Upgrade)
      if (localStaffIsolation) {
        issues.push({
          category: "Information Barriers",
          test: "Staff Department Communications Isolation Firewall is activated",
          status: "Healthy",
          recommendation: "Internal trunks (Human Capital / T&D) are successfully shielded from external unauthenticated telemarketer dialers."
        });
      } else {
        issues.push({
          category: "Information Barriers",
          test: "Staff Department Communication Isolation Firewall is DISABLED (Warning)",
          status: "Critical",
          recommendation: "Trunk voice lines and chat lines are exposed system-wide! Click 'Resolve' to re-apply Isolation firewall principles.",
          actionKey: "isolate-security"
        });
        calculatedScore -= 15;
      }

      // 7. Expanded 5-Tier Ticket Status Validation (Today's Upgrade)
      const outdatedTickets = tickets.filter(t => !["New", "In Progress", "Review", "Completed", "Rejected"].includes(t.ticketStatus)).length;
      if (outdatedTickets > 0) {
        issues.push({
          category: "Lending Ticket Schema",
          test: `${outdatedTickets} legacy active tickets hold old 3-tier status headers`,
          status: "Warning",
          recommendation: "Trigger standard CRM index Sweep to migrate active records into 'New', 'In Progress', 'Review', 'Completed', 'Rejected' statuses."
        });
        calculatedScore -= 10;
      } else {
        issues.push({
          category: "Lending Ticket Schema",
          test: "Active Client Tickets adhere strictly to the 5-tier status pipeline",
          status: "Healthy",
          recommendation: "All records are compliant with today's newly deployed ticket transition flows."
        });
      }

      setAuditResult({
        score: Math.max(10, calculatedScore),
        checkedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        issues
      });
      triggerFeedback("CentriX Security & Integrity Audit generated successfully!");
    }, 1000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    onUpdateUser({ name: newUserName, email: newUserEmail, role: newUserRole, status: newUserStatus });
    setNewUserName("");
    setNewUserEmail("");
    triggerFeedback("New system operator deployed successfully to Active Directory!");
  };

  const handleAddWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim() || !newWfTrigger.trim() || !newWfAction.trim()) return;
    onUpdateWorkflow({ name: newWfName, trigger: newWfTrigger, action: newWfAction, status: "Active" });
    setNewWfName("");
    setNewWfTrigger("");
    setNewWfAction("");
    triggerFeedback("Automation trigger successfully published and armed!");
  };

  const handleApplySettings = () => {
    onUpdateSettings({ autoDeduplicationEnabled: localAutoDeduplication, whitelistIps: localWhitelist });
    triggerFeedback(`Global CRM policies updated! Comms isolation is ${localStaffIsolation ? "ENABLED" : "DISABLED"}. Ticket triggers saved.`);
  };

  const filteredLogs = securityAuditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchLogQuery.toLowerCase()) || 
      log.action.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      log.ipAddress.includes(searchLogQuery);
    
    const matchesSeverity = logSeverityFilter === "All" || log.severity === logSeverityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <div id="sys-admin-department-panel" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs space-y-4">
      
      {/* Upper SysOps Control Bar */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 border-b dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5">
            <Settings className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            <span className="font-mono tracking-wider font-extrabold text-[11px] uppercase text-cyan-400">
              CentriX Custom Systems Administrator Suite
            </span>
          </div>
          <h4 className="font-sans font-extrabold text-[12px] text-slate-100 uppercase tracking-tight mt-0.5">
            CRM System Management, Automation & Compliance Controls
          </h4>
          <p className="text-[11px] text-black mt-1 max-w-xl">
            Audit system logs, provision roles, map third-party REST integrations, deploy event triggers, sweep database duplicates, and manage disaster recovery procedures.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[12px]">
          <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-705/60 flex items-center gap-1.5 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            DB: ONLINE
          </div>
          <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-705/60 font-mono text-[10px] text-cyan-200">
            AUDIT: GDPR/CPA OK
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Horizontal Navigation Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-205 dark:border-slate-800 pb-2">
          {[
            { id: "platform", label: "⚙️ Core Admin Console", color: "hover:text-cyan-500" },
            { id: "users", label: "👥 User Administration", color: "hover:text-amber-500" },
            { id: "workflows", label: "🤖 Workflow Automation", color: "hover:text-emerald-500" },
            { id: "integrations", label: "🔌 API Integrations", color: "hover:text-indigo-500" },
            { id: "audits", label: "🛡️ Security Compliance Logs", color: "hover:text-rose-500" },
            { id: "services", label: "💼 CRM SysAdmin Service Center", color: "hover:text-purple-500" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setLocalWhitelist(sysAdminSettings.whitelistIps);
                  setLocalAutoDeduplication(sysAdminSettings.autoDeduplicationEnabled);
                }}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  isActive 
                    ? "bg-slate-100 dark:bg-slate-850 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700" 
                    : `bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-black ${tab.color} hover:bg-slate-50 dark:hover:bg-slate-700`
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="mx-4 p-2 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-800 dark:text-emerald-300 text-[12px] rounded hover:opacity-90 flex items-center justify-between">
          <span>{feedback}</span>
          <Check className="w-4 h-4 ml-2" />
        </div>
      )}

      <div className="p-4 pt-1 space-y-4">
        
        {/* TAB 1: CORE PLATFORM MANAGEMENT */}
        {activeTab === "platform" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Status Cards */}
            <div className="lg:col-span-4 space-y-4">
              <div className="border rounded-xl p-3 bg-white dark:bg-slate-850 space-y-3.5">
                <div>
                  <h5 className="font-extrabold text-[11px] text-black uppercase tracking-widest flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-cyan-500" /> Database Integrity Status
                  </h5>
                  <p className="text-[10px] text-black">Track raw data health metrics, deduplication performance thresholds, and cold-backups schedules.</p>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2 font-mono text-[12px]">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-black">Cold-Backup Status:</span>
                    <span className="text-emerald-500 font-bold">{sysAdminSettings.databaseBackupStatus}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-black">Last Backup Created:</span>
                    <span className="text-cyan-500">{sysAdminSettings.lastBackupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black">Data Integrity Score:</span>
                    <span className="text-rose-500 font-bold">{sysAdminSettings.dataCleanlinessScore}% Pristine</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      onTriggerBackup();
                      triggerFeedback("Manual database backup successfully exported & signed to cold-storage.");
                    }}
                    className="w-full text-center py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[12px] uppercase rounded transition duration-200 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Back Up Active Firestore Database
                  </button>
                  <button 
                    onClick={() => {
                      onMigrateData();
                      triggerFeedback("Data migration to Firestore initiated.");
                    }}
                    className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[12px] uppercase rounded transition duration-200 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" /> Migrate Data to Firestore
                  </button>
                  <button 
                    onClick={() => {
                      onTriggerClean();
                      triggerFeedback("Data deduplication completed. Sanitized duplicate lead forms!");
                    }}
                    className="w-full text-center py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-705 text-black dark:text-white font-bold text-[12px] uppercase rounded transition duration-200 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Run Duplicate Record Sweeper
                  </button>
                </div>
              </div>

              <div className="border rounded-xl p-3 bg-white dark:bg-slate-850 space-y-3">
                <span className="text-[10px] uppercase font-bold text-black flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-500" /> API Gateway Health
                </span>
                <p className="text-[10px] text-black">Platform performance checks map outbound webhook deliveries.</p>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded font-mono text-[10px] text-black dark:text-white space-y-1">
                  <div>CPU Utilization: <span className="text-indigo-500 font-bold">14% Avg</span></div>
                  <div>Endpoint Port Route: <span className="text-cyan-500 font-bold">Port 3000 Ingress</span></div>
                  <div>SSL Handshake Policy: <span className="text-emerald-500 font-bold">TLSv1.3 Active</span></div>
                </div>
              </div>

              {/* Unique Clickable System request tickets for SysAdmin */}
              <div className="border rounded-xl p-3 bg-white dark:bg-slate-850 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold text-blue-600 dark:text-cyan-400 flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Systems Request Tickets
                  </span>
                  <span className="text-[8px] bg-red-100 text-red-600 font-bold font-mono px-1 rounded animate-pulse">
                    {adminTicketsList.filter(t => t.status === "Pending").length} Alert
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 font-medium leading-tight">Active operator exceptions & authentication requests. Click to process.</p>
                <div className="space-y-2">
                  {adminTicketsList.map(ticket => (
                    <div 
                      key={ticket.id}
                      onClick={() => {
                        setSelectedAdminTicket(ticket);
                        setIsAdminTicketModalOpen(true);
                      }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 hover:border-cyan-500 border dark:border-slate-805 rounded-lg cursor-pointer transition flex flex-col gap-1 text-left"
                    >
                      <div className="flex justify-between items-center text-[9px] font-mono whitespace-nowrap">
                        <span className="text-cyan-500 font-bold">{ticket.id}</span>
                        <span className={`px-1 rounded text-[8px] font-bold text-white uppercase ${
                          ticket.urgency === 'Critical' ? 'bg-rose-600 animate-pulse' :
                          ticket.urgency === 'High' ? 'bg-amber-500' : 'bg-slate-500'
                        }`}>{ticket.urgency}</span>
                      </div>
                      <span className="text-black dark:text-white font-extrabold text-[11px] truncate leading-tight mt-0.5">{ticket.task}</span>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium pt-0.5">
                        <span className="truncate max-w-[80px]">By: {ticket.requester}</span>
                        <span className={`font-bold uppercase text-[8px] px-1 rounded ${
                          ticket.status === 'Pending' ? 'bg-yellow-100 text-yellow-750' :
                          ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-750' : 'bg-emerald-100 text-emerald-750'
                        }`}>{ticket.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Form Settings Column */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Interactive CRM Optimization & Compliance Audit Hub */}
              <div className="border rounded-xl p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-850 dark:to-slate-800 border-slate-205 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="font-extrabold text-[11px] text-black uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-cyan-500" /> CRM Optimization & Compliance Audit Hub
                    </h5>
                    <p className="text-[11px] text-black mt-1">
                      Check platform configuration, data compliance, API connector health, and security rules against POPIA/GDPR frameworks.
                    </p>
                  </div>
                  
                  <button
                    onClick={triggerAudit}
                    disabled={isRunningAudit}
                    className={`p-2 px-3 text-[12px] font-bold font-sans uppercase tracking-tight rounded-lg flex items-center gap-1.5 transition duration-200 cursor-pointer ${
                      isRunningAudit 
                        ? "bg-slate-200 dark:bg-slate-800 text-black" 
                        : "bg-indigo-650 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {isRunningAudit ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Running Audit...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        Execute Audit Diagnostics
                      </>
                    )}
                  </button>
                </div>

                {auditResult ? (
                  <div className="space-y-3.5 animate-fadeIn">
                    {/* Gauge score overview */}
                    <div className="p-3 bg-slate-105/60 dark:bg-slate-900 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-extrabold text-[12px] ${
                          auditResult.score >= 90
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                            : auditResult.score >= 70
                            ? "border-amber-400 text-amber-500 bg-amber-50/50"
                            : "border-rose-500 text-rose-550 bg-rose-50/50"
                        }`}>
                          {auditResult.score}%
                        </div>
                        <div>
                          <strong className="text-[12px] text-black dark:text-slate-200 block">Overall Platform Health Index</strong>
                          <span className="text-[10px] text-black block">Checked at: <span className="font-mono">{auditResult.checkedAt}</span></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          auditResult.score >= 90
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}>
                          {auditResult.score >= 90 ? "POPIA COMPLIANT PASS" : "ATTENTION SUGGESTED"}
                        </span>
                      </div>
                    </div>

                    {/* Diagnostic issues list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-black">Diagnostic Checklist</span>
                      <div className="divide-y border dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        {auditResult.issues.map((issue, idx) => (
                          <div key={idx} className="p-2.5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5">
                                {issue.status === "Healthy" ? (
                                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px]"><Check className="w-3.5 h-3.5" /></span>
                                ) : issue.status === "Warning" ? (
                                  <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[10px]"><AlertTriangle className="w-3.5 h-3.5" /></span>
                                ) : (
                                  <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-[10px]"><AlertCircle className="w-3.5 h-3.5" /></span>
                                )}
                              </span>
                              <div>
                                <span className="text-[11px] font-mono text-black block uppercase font-extrabold">{issue.category}</span>
                                <strong className="text-[12px] text-black dark:text-slate-200 block mt-0.5">{issue.test}</strong>
                                <span className="text-[11px] text-black block mt-0.5">{issue.recommendation}</span>
                              </div>
                            </div>

                            {issue.actionKey && (
                              <button
                                onClick={() => {
                                  if (issue.actionKey === "clean") {
                                    onTriggerClean();
                                    triggerFeedback("Auto-sanitizing and sweeper engine executed!");
                                  } else if (issue.actionKey === "backup") {
                                    onTriggerBackup();
                                    triggerFeedback("Manual secure backup transaction executed!");
                                  } else if (issue.actionKey === "isolate-security") {
                                    setLocalStaffIsolation(true);
                                    triggerFeedback("Department Communication Isolation Firewall successfully enforced!");
                                  } else if (issue.actionKey?.startsWith("sync-")) {
                                    onSyncIntegration({ id: issue.actionKey.replace("sync-", ""), syncNow: true });
                                    triggerFeedback("Handshake sync successfully retried.");
                                  }
                                  // Refresh audit info after a delay
                                  setTimeout(() => triggerAudit(), 800);
                                }}
                                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-[10px] font-bold uppercase rounded cursor-pointer shrink-0 transition"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border border-dashed rounded-xl text-center text-black space-y-2">
                    <Shield className="w-8 h-8 text-black mx-auto" />
                    <div>
                      <strong className="text-[12px] text-black dark:text-white block">No Audit Report On Record</strong>
                      <span className="text-[11px] block text-black">Run a routine audit diagnostic check on active operations, encryption policy keys, and redundant logs.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Security gate Whitelist card */}
              <div className="border rounded-xl p-4 bg-white dark:bg-slate-850/50 space-y-4">
              <div>
                <h5 className="font-extrabold text-[11px] text-black uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-cyan-500" /> Security Gateways & Whitelist Configuration
                </h5>
                <p className="text-[11px] text-black mt-1">Configure global server rules to enforce static office IP routes and toggle bulk scheduled operations.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-3 border rounded-xl border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localAutoDeduplication}
                    onChange={(e) => setLocalAutoDeduplication(e.target.checked)}
                    className="rounded border-slate-300 text-cyan-600 w-4 h-4 mt-0.5 accent-cyan-500"
                  />
                  <div>
                    <span className="font-bold text-[12px] block text-black dark:text-white">Enable Real-Time Lead Contact Deduplication</span>
                    <span className="text-[10px] text-black block mt-0.5">Automatically runs heuristics when a new telemarketing or social lead registers. Matches on normalized phone and email lines.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-xl border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localStaffIsolation}
                    onChange={(e) => setLocalStaffIsolation(e.target.checked)}
                    className="rounded border-slate-300 text-cyan-600 w-4 h-4 mt-0.5 accent-cyan-500"
                  />
                  <div>
                    <span className="font-bold text-[12px] block text-black dark:text-white">Enable HCM Staff & Training Isolation Firewall</span>
                    <span className="text-[10px] text-black block mt-0.5">Enforces strict information barriers. Shields internal trunks (Human Capital and Training & Development) from public external telemarketer dialer lines, restricting access to authenticated secure intercoms and scrums.</span>
                  </div>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-start gap-3 p-3 border rounded-xl border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={localTicketAutoTransitionReview}
                      onChange={(e) => setLocalTicketAutoTransitionReview(e.target.checked)}
                      className="rounded border-slate-300 text-cyan-600 w-4 h-4 mt-0.5 accent-cyan-500"
                    />
                    <div>
                      <span className="font-bold text-[12px] block text-black dark:text-white">Automate Completed/Review States</span>
                      <span className="text-[10px] text-black block mt-0.5">Launches CRM automation triggers immediately when a lending client's ticket status updates to 'Review', 'Completed', or 'Rejected'.</span>
                    </div>
                  </label>

                  <div className="p-3 border rounded-xl border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[12px]">
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">
                      Min Intercom Sentiment: <span className="font-mono text-cyan-500">{localMinSentimentScore}%</span>
                    </label>
                    <input 
                      type="range"
                      min="50"
                      max="90"
                      step="5"
                      value={localMinSentimentScore}
                      onChange={(e) => setLocalMinSentimentScore(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <span className="text-[10px] text-black block mt-1">SLA alert threshold flag for internal staff intercom audits.</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-black uppercase block mb-1">
                    Allowed Systems Administration Whitelisted IP Addresses (Comma Separated)
                  </label>
                  <textarea 
                    rows={3}
                    value={localWhitelist}
                    onChange={(e) => setLocalWhitelist(e.target.value)}
                    placeholder="e.g. 196.24.110.12, 196.24.110.45, 127.0.0.1"
                    className="w-full text-[12px] font-mono p-2 border dark:bg-slate-900 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white focus:ring-1 focus:ring-cyan-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-black mt-1">Provides access lockouts to non-authorized IP ranges. Local traffic loopback (127.0.0.1) is forced allowed by backend fallback.</p>
                </div>

                <div className="border-t border-dashed my-4"></div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleApplySettings}
                    className="p-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[12px] uppercase rounded transition duration-200 cursor-pointer flex items-center gap-1"
                  >
                    Save Changes & Deploy Security Rules
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
        )}

        {/* TAB 2: USER ACCOUNT ADMINISTRATION */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Add User Operator Profile */}
              <div className="lg:col-span-4 border rounded-xl p-3 bg-white dark:bg-slate-850 space-y-3">
                <div>
                  <h5 className="font-extrabold text-[11px] text-black uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-500" /> Provision CRM Operator
                  </h5>
                  <p className="text-[10px] text-black">Grant authorized system access to new agents, supervisors, or automated programmatic API endpoints.</p>
                </div>

                <form onSubmit={handleAddUser} className="space-y-3 font-sans">
                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Operator Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Zack Peterson"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full text-[12px] p-2 border dark:bg-slate-900 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Corporate Email Identifier</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. zack.p@centrix.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full text-[12px] p-2 border dark:bg-slate-900 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-black uppercase block mb-1">Role Type</label>
                      <select 
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                        className="w-full text-[12px] p-1.5 border dark:bg-slate-900 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Agent">Agent</option>
                        <option value="API-Service">API-Service</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-black uppercase block mb-1">Access Status</label>
                      <select 
                        value={newUserStatus}
                        onChange={(e) => setNewUserStatus(e.target.value as any)}
                        className="w-full text-[12px] p-1.5 border dark:bg-slate-900 rounded border-slate-200 dark:border-slate-800 text-black dark:text-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Deactivated">Deactivated</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[12px] uppercase rounded transition duration-200 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Provision Safe Account
                  </button>
                </form>
              </div>

              {/* Operators Table */}
              <div className="lg:col-span-8 border rounded-xl overflow-hidden bg-white dark:bg-slate-850">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-black">CentriX System Registry ({systemUsers.length} operators)</span>
                  <span className="text-[10px] text-black font-mono">RBAC Authorization: Configured</span>
                </div>

                <div className="overflow-x-auto text-[12px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-950 text-black uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Operator</th>
                        <th className="p-2.5">Security Role</th>
                        <th className="p-2.5">Last Sync Activity</th>
                        <th className="p-2.5">Access Scope</th>
                        <th className="p-2.5 text-right pr-4">Scope Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {systemUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="p-2.5">
                            <div className="font-bold text-black dark:text-white">{user.name}</div>
                            <div className="text-[10px] text-black font-mono">{user.email}</div>
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.role === "Administrator" 
                                ? "bg-rose-55 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
                                : user.role === "Supervisor"
                                ? "bg-amber-55 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                                : user.role === "API-Service"
                                ? "bg-indigo-55 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400"
                                : "bg-cyan-55 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-2.5 text-black font-mono text-[11px]">
                            {user.lastLogin}
                          </td>
                          <td className="p-2.5">
                            <span className={`inline-flex items-center gap-1 font-extrabold text-[10px] uppercase ${
                              user.status === "Active" ? "text-emerald-500" : "text-rose-500"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500 animate-ping" : "bg-rose-500"}`}></span>
                              {user.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-right pr-4">
                            <button 
                              onClick={() => onUpdateUser({ id: user.id, status: user.status === "Active" ? "Deactivated" : "Active" })}
                              className={`p-1 px-2 rounded font-mono font-bold text-[10px] uppercase cursor-pointer ${
                                user.status === "Active"
                                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              }`}
                            >
                              {user.status === "Active" ? "⛔ Lock Account" : "🔓 Authorize"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: WORKFLOW AUTOMATIONS */}
        {activeTab === "workflows" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Add automation trigger */}
              <div className="lg:col-span-4 border rounded-xl p-3 bg-white dark:bg-slate-850 space-y-3">
                <div>
                  <h5 className="font-extrabold text-[11px] text-black uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-500" /> New Event Mechanism
                  </h5>
                  <p className="text-[10px] text-black">Formulate active trigger actions to reduce redundant staff routines.</p>
                </div>

                <form onSubmit={handleAddWorkflow} className="space-y-3 text-[12px] font-sans">
                  <div>
                    <label className="text-[10px] font-bold text-black uppercase block mb-1">Automation Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sage Accounting Auto-Export"
                      value={newWfName}
                      onChange={(e) => setNewWfName(e.target.value)}
                      className="w-full text-[12px] p-2 border dark:bg-slate-900 rounded border-slate-205 dark:border-slate-800 text-black dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-black block mb-1 uppercase">Platform Hook Event (Trigger)</label>
                    <select 
                      value={newWfTrigger}
                      onChange={(e) => setNewWfTrigger(e.target.value)}
                      required
                      className="w-full text-[12px] p-2 border dark:bg-slate-900 rounded border-slate-205 dark:border-slate-800 text-black dark:text-white"
                    >
                      <option value="">-- Choose Target Trigger --</option>
                      <option value="On Lead Created">On Lead Sourced</option>
                      <option value="Status Changed to QA">Status Changed to QA</option>
                      <option value="Status Changed to Signed Off">Status Changed to Signed Off</option>
                      <option value="Visitor Checked In">Visitor Digital Switchboard Connection</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-black block mb-1 uppercase">Executable API Pipeline Action</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. REST POST custom webhook headers"
                      value={newWfAction}
                      onChange={(e) => setNewWfAction(e.target.value)}
                      className="w-full text-[12px] p-2 border dark:bg-slate-900 rounded border-slate-205 dark:border-slate-800 text-black dark:text-white"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[12px] uppercase rounded transition duration-200 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Defer Hook Trigger
                  </button>
                </form>
              </div>

              {/* Workflows list */}
              <div className="lg:col-span-8 border rounded-xl overflow-hidden bg-white dark:bg-slate-850">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-black">CentriX Background Automation Routines ({workflowAutomations.length} workflows)</span>
                  <span className="text-[10px] text-black font-mono font-bold text-emerald-500 animate-pulse">Core Active Service Deferrers</span>
                </div>

                <div className="overflow-x-auto text-[12px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-950 text-black uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Automation Pipeline</th>
                        <th className="p-2.5">Hook Event Trigger</th>
                        <th className="p-2.5">API Callback Dispatch</th>
                        <th className="p-2.5">Executions Log</th>
                        <th className="p-2.5 text-right pr-4">Scope Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {workflowAutomations.map(wf => (
                        <tr key={wf.id} className="hover:bg-slate-55/40 dark:hover:bg-slate-900/30">
                          <td className="p-2.5">
                            <div className="font-bold text-black dark:text-white">{wf.name}</div>
                            <div className="text-[10px] text-black font-mono">{wf.id}</div>
                          </td>
                          <td className="p-2.5">
                            <span className="bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 px-1.5 py-0.5 rounded text-[10px] font-mono">
                              {wf.trigger}
                            </span>
                          </td>
                          <td className="p-2.5 text-black font-mono">
                            {wf.action}
                          </td>
                          <td className="p-2.5 font-bold font-mono text-black dark:text-white">
                            {wf.executions} triggers
                          </td>
                          <td className="p-2.5 text-right pr-4">
                            <button 
                              onClick={() => onUpdateWorkflow({ id: wf.id, status: wf.status === "Active" ? "Paused" : "Active" })}
                              className={`p-1 px-2 rounded font-mono font-bold text-[10px] uppercase cursor-pointer ${
                                wf.status === "Active"
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              }`}
                            >
                              {wf.status === "Active" ? "⏸️ Pause Hook" : "▶️ Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: API INTEGRATIONS DIRECTORY */}
        {activeTab === "integrations" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Integration Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-950/30 rounded-xl">
                  <World className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-black dark:text-white m-0">Global Integration Hub</h4>
                  <p className="text-[11px] text-slate-500 m-0">Managing {integrations.length} active service bridges</p>
                </div>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border">
                {(['All', 'Business', 'Social'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setIntegrationFilter(f)}
                    className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${integrationFilter === f ? "bg-white dark:bg-slate-700 shadow-sm text-cyan-600" : "text-slate-500 hover:text-black dark:hover:text-white"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {integrations.filter(i => integrationFilter === 'All' || i.category === integrationFilter).map(service => (
                <div key={service.id} className="border rounded-2xl p-4 bg-white dark:bg-slate-900 flex flex-col justify-between hover:shadow-md transition-all group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950/20 transition-colors">
                          <service.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-cyan-600" />
                        </div>
                        <div>
                          <h5 className="text-[13px] font-black text-black dark:text-white leading-none mb-1">{service.name}</h5>
                          <span className="text-[9px] uppercase font-mono text-slate-400 px-1.5 bg-slate-100 dark:bg-slate-800 rounded">{service.type}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        service.status === "Active" ? "bg-emerald-100 text-emerald-600" : 
                        service.status === "Warning" ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                      }`}>
                        {service.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Latency</p>
                          <p className="text-[12px] font-mono font-bold text-black dark:text-white">{service.latency}</p>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Health</p>
                          <p className={`text-[12px] font-mono font-bold ${service.health > 90 ? "text-emerald-500" : "text-amber-500"}`}>{Math.round(service.health)}%</p>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Security Mode</span>
                        <span className="font-bold text-black dark:text-white px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded uppercase tracking-tighter">{service.auth.method}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Throughput</span>
                        <span className="font-bold text-cyan-600">{service.throughput}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full transition-all duration-1000 ${service.health > 95 ? "bg-emerald-500" : service.health > 85 ? "bg-amber-500" : "bg-rose-500"}`} 
                          style={{ width: `${service.health}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => { setSelectedIntegration(service); setIsAuthModalOpen(true); }}
                      className="flex-1 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" /> Config Auth
                    </button>
                    <button 
                      className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => triggerFeedback(`Diagnosing connection for ${service.name}... Socket is clear.`)}
                    >
                      <Activity className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-start gap-3">
               <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
               <div className="space-y-1">
                  <h6 className="text-xs font-black text-indigo-900 dark:text-indigo-300 m-0 uppercase italic">Enterprise Security Protocol 4.0</h6>
                  <p className="text-[11px] text-indigo-800/70 dark:text-indigo-400/70 m-0 leading-relaxed">
                    All outbound connections utilize 256-bit AES encryption tunnels. Identity handshakes for WhatsApp and Telegram are routed through our secure messaging gateway with randomized key rotation policies.
                  </p>
               </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY AUDIT LOGS */}
        {activeTab === "audits" && (
          <div className="space-y-4">
            
            {/* Filter Log Bar */}
            <div className="border rounded-xl p-3 bg-white dark:bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="font-bold text-black text-[11px] uppercase">Filter Audit Logs:</span>
                <select 
                  value={logSeverityFilter}
                  onChange={(e) => setLogSeverityFilter(e.target.value)}
                  className="p-1.5 border dark:bg-slate-900 rounded font-bold text-black dark:text-white"
                >
                  <option value="All">All Severities</option>
                  <option value="High">🔴 High Risk Severity</option>
                  <option value="Medium">🟡 Medium Severity</option>
                  <option value="Low">🟢 Low Safe Severity</option>
                </select>
              </div>

              <div className="w-full sm:w-80">
                <input 
                  type="text" 
                  placeholder="Search logs by operator email, action or IP..."
                  value={searchLogQuery}
                  onChange={(e) => setSearchLogQuery(e.target.value)}
                  className="w-full p-1.5 text-[12px] rounded border dark:bg-slate-900 border-slate-205 text-black dark:text-white"
                />
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="border rounded-xl bg-white dark:bg-slate-850 overflow-hidden">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b flex justify-between items-center text-[11px]">
                <span className="font-bold text-black uppercase">GDPR / Popia Compliance Security Trails</span>
                <span className="text-black font-mono text-[10px]">Vault Records: Unalterable Ledger</span>
              </div>

              <div className="max-h-[350px] overflow-y-auto text-[12px]">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-black font-mono italic">
                    No security compliance logs matched your query.
                  </div>
                ) : (
                  <table className="w-full text-left font-mono">
                    <thead className="bg-slate-100 dark:bg-slate-950 text-black uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Security Log ID</th>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Operator Entity</th>
                        <th className="p-2.5">Gateway Action Logged</th>
                        <th className="p-2.5">Terminal IP</th>
                        <th className="p-2.5 text-right pr-4">Log Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="p-2.5 text-black dark:text-white font-bold">{log.id}</td>
                          <td className="p-2.5 text-black">{log.timestamp}</td>
                          <td className="p-2.5 text-black dark:text-white font-sans font-bold">{log.user}</td>
                          <td className="p-2.5 text-black dark:text-white font-sans">{log.action}</td>
                          <td className="p-2.5 text-black">{log.ipAddress}</td>
                          <td className="p-2.5 text-right pr-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.severity === "High" 
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                                : log.severity === "Medium"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            }`}>
                              {log.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Unified Interactive Comms Archived Backups */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-extrabold text-[12px] text-black dark:text-white uppercase flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-indigo-500" />
                    Unified Interactive Comms Archived Backups
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Compliance log and recorded system interaction archives for all VoIP calls, virtual video consultations, and instant messaging chats.
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex gap-2">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Central Sync Active
                  </span>
                  <span className="bg-slate-100 text-slate-850 dark:bg-slate-800 dark:text-slate-300 border border-slate-205 dark:border-slate-750 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono">
                    AES-256
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Chats Interactions Backups */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 h-[300px] flex flex-col justify-between">
                  <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-100 dark:border-blue-900/50">
                    <span className="font-bold text-[11px] text-blue-700 dark:text-blue-400 uppercase flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      Instant Chats Backups
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 font-mono">
                      {Object.keys(chatsData || {}).length} Chats
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] mt-2">
                    {Object.keys(chatsData || {}).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                        No chats recorded.
                      </div>
                    ) : (
                      Object.entries(chatsData || {}).map(([contact, messages]) => (
                        <div key={contact} className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/60 shadow-xs">
                          <div className="font-bold text-black dark:text-zinc-200 truncate">{contact}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5 font-mono truncate">
                            Last: {messages[messages.length - 1]?.message || "No messages"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Phone Call Backups */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 h-[300px] flex flex-col justify-between">
                  <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded border border-emerald-100 dark:border-emerald-900/50">
                    <span className="font-bold text-[11px] text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      VoIP Call Interact Recordings
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      {(callLogs || []).length} Logs
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] mt-2">
                    {(callLogs || []).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                        No call logs archived.
                      </div>
                    ) : (
                      (callLogs || []).map((log, i) => (
                        <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-1">
                          <div className="flex justify-between font-bold text-black dark:text-white">
                            <span className="truncate max-w-[110px]">{log.contactName}</span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{log.duration}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 flex justify-between font-mono">
                            <span>{log.timestamp} ({log.direction})</span>
                            <span className="text-blue-500 font-bold">{log.rate}</span>
                          </div>
                          <div className="text-[10px] italic text-zinc-650 dark:text-zinc-300 bg-slate-50 dark:bg-slate-900 p-1 rounded border border-slate-100 dark:border-slate-800 truncate">
                            {log.auditReport}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Video Meeting Backups */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 h-[300px] flex flex-col justify-between">
                  <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-950/20 p-2 rounded border border-rose-100 dark:border-rose-900/50">
                    <span className="font-bold text-[11px] text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      Virtual Consult Archives
                    </span>
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 font-mono">
                      {(videoSessions || []).length} Meets
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] mt-2">
                    {(videoSessions || []).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                        No meetings recorded.
                      </div>
                    ) : (
                      (videoSessions || []).map((session, i) => (
                        <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-1">
                          <div className="flex justify-between font-bold text-black dark:text-white">
                            <span className="truncate max-w-[120px]">{session.clientName}</span>
                            <span className="text-[10px] font-mono text-rose-500 dark:text-rose-400">{session.duration}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            Room: {session.roomName} — {session.status}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: CRM SYSTEMS ADMINISTRATOR SERVICES & FUNCTIONS WORKSPACE */}
        {activeTab === "services" && (
          <div className="space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100 px-4 pb-6">
            {/* Top Overview Banner */}
            <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-indigo-950 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -ml-20 -mb-20"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-mono font-black uppercase tracking-wider">
                      Administrator Portfolio
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs text-slate-300 font-mono">SLA Active-Direct (Port 3000 Ingress)</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white m-0">IT Systems Administrator Suite</h3>
                  <p className="text-sm text-slate-200 max-w-2xl font-sans lg:leading-relaxed m-0 mt-1">
                    Optimize, automate, customize, and secure your enterprise Customer Relationship Management. 
                    Manage custom database fields, sweep duplicates, track operator bug reports, map third-party REST webhook connectors, and deploy advanced CRM capabilities in real-time.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-stretch md:self-auto bg-black/30 p-4 rounded-2xl border border-white/5 shrink-0 justify-between">
                  <div className="text-center font-mono">
                    <span className="text-[10px] text-slate-400 block uppercase">Compliance Meter</span>
                    <span className="text-xl font-black text-purple-300">POPIA</span>
                  </div>
                  <div className="w-[1px] h-10 bg-white/10"></div>
                  <div className="text-center font-mono">
                    <span className="text-[10px] text-slate-400 block uppercase">Sys Cleanliness</span>
                    <span className="text-xl font-black text-emerald-400">{sysAdminSettings.dataCleanlinessScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
              
              {/* LEFT COLUMN: Administrator Custom Services Marketplace & Live Deployment Wizard */}
              <div className="xl:col-span-7 space-y-6">
                
                {/* Services Catalog */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="text-left">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2 m-0">
                      <Briefcase className="w-5 h-5 text-purple-500" />
                      Administrator Services Marketplace
                    </h4>
                    <p className="text-slate-500 text-xs font-sans mt-1 m-0">
                      Select and deploy pre-packaged robust services dynamically designed to customize, audit, integrate, and future-proof corporate client management.
                    </p>
                  </div>

                  {/* Horizontal Categories */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* Business Services Group */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                      <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 font-sans tracking-widest block border-b pb-1 border-slate-205 dark:border-slate-800">
                        Business Services
                      </span>
                      <div className="space-y-1.5 text-xs text-left">
                        {[
                          { name: "CRM Implementation Blueprint", desc: "Configuration rollouts for fresh Salesforce/HubSpot migrations.", target: "Standard Core Setup" },
                          { name: "SLA Customization Health Audit", desc: "Data cleaning, custom field consolidation, POPIA check.", target: "Health checkup" },
                          { name: "Employee Onboarding & Training", desc: "Coaching classes, user manuals & sandbox logs.", target: "Staff Coaching" },
                          { name: "Optimization Consulting", desc: "Configure sales pipelines limits, streamline bottlenecks.", target: "Workflow Optimization" },
                        ].map((srv, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedService({ ...srv, category: "Business Services" });
                              setServiceDeployStatus("idle");
                              setServiceDeployProgress(0);
                              setServiceDeploymentLogs([]);
                            }}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/25 border hover:border-purple-500 border-slate-200 dark:border-slate-800 rounded-xl text-left transition font-semibold block cursor-pointer"
                          >
                            <div className="text-slate-800 dark:text-white font-bold text-xs flex items-center justify-between">
                              <span className="truncate mr-1">{srv.name}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5 font-normal">{srv.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Technical Services Group */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                      <span className="text-[10px] font-black uppercase text-indigo-650 dark:text-indigo-400 font-sans tracking-widest block border-b pb-1 border-slate-205 dark:border-slate-800">
                        Technical Services
                      </span>
                      <div className="space-y-1.5 text-xs text-left">
                        {[
                          { name: "REST API Integration Handshake", desc: "Socket connectivity mapping for Slack, Mailchimp & Zapier.", target: "Outbound API Handshake" },
                          { name: "Workflow Setup & Automation triggers", desc: "Publish automated triggers mapping sales leads to actions.", target: "Automation pipeline" },
                          { name: "Database Migrations & Tuning", desc: "Firestore schemas, index caching, backup export profiles.", target: "Relational DB tuning" },
                          { name: "Custom KPI Dashboards Setup", desc: "Dynamic widgets charting raw lead flow times and conversion.", target: "BI Analytics Panel" },
                        ].map((srv, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedService({ ...srv, category: "Technical Services" });
                              setServiceDeployStatus("idle");
                              setServiceDeployProgress(0);
                              setServiceDeploymentLogs([]);
                            }}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/25 border hover:border-indigo-500 border-slate-200 dark:border-slate-800 rounded-xl text-left transition font-semibold block cursor-pointer"
                          >
                            <div className="text-slate-800 dark:text-white font-bold text-xs flex items-center justify-between">
                              <span className="truncate mr-1">{srv.name}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5 font-normal">{srv.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Services Group */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                      <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 font-sans tracking-widest block border-b pb-1 border-slate-205 dark:border-slate-800">
                        Advanced Services
                      </span>
                      <div className="space-y-1.5 text-xs text-left">
                        {[
                          { name: "AI-Powered Automatons Setup", desc: "Auto-sentiment, auto-routing rules using smart model keys.", target: "Smart AI Bot Core" },
                          { name: "Predictive Analytics Forecast", desc: "Machine Learning projections for mortgage & budget leads.", target: "Forecasting ML" },
                          { name: "Custom segmentation & Chatbot", desc: "Multi-channel bot config using custom logic workflows.", target: "Omnichannel Chatbot" },
                          { name: "Identity Shield & SSL Tuning", desc: "Whitelist IP gates, MFA token standards, secure rules.", target: "Security Shielding" },
                        ].map((srv, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedService({ ...srv, category: "Advanced Services" });
                              setServiceDeployStatus("idle");
                              setServiceDeployProgress(0);
                              setServiceDeploymentLogs([]);
                            }}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/25 border hover:border-emerald-500 border-slate-200 dark:border-slate-800 rounded-xl text-left transition font-semibold block cursor-pointer"
                          >
                            <div className="text-slate-800 dark:text-white font-bold text-xs flex items-center justify-between">
                              <span className="truncate mr-1">{srv.name}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5 font-normal">{srv.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Live Deployment Configurator Wizard */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 m-0">
                      <Terminal className="w-4 h-4 text-purple-500" />
                      Dynamic SLA Deployment Configurator
                    </h4>
                    {selectedService && (
                      <span className="text-[9px] uppercase font-black bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 px-2.5 py-0.5 rounded-md">
                        {selectedService.category}
                      </span>
                    )}
                  </div>

                  {selectedService ? (
                    <div className="space-y-4 text-left">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850/60 space-y-2">
                        <strong className="text-sm font-black text-slate-950 dark:text-white block">{selectedService.name}</strong>
                        <p className="text-slate-500 text-xs font-sans leading-relaxed m-0">{selectedService.desc}</p>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100 dark:border-slate-850">
                          Target Core Architecture: <span className="text-purple-600 dark:text-purple-400 font-extrabold">{selectedService.target}</span>
                        </div>
                      </div>

                      {/* Interactive form variables */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] uppercase font-black">Authentication Host Platform</label>
                          <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 dark:text-white">
                            <option>Centrix Enterprise Core</option>
                            <option>Salesforce Cloud API</option>
                            <option>HubSpot REST Platform</option>
                            <option>Zoho Active Agent</option>
                            <option>Microsoft Dynamics 365</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px] uppercase font-black">Deployment Priority Scope</label>
                          <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 dark:text-white">
                            <option>High (Corporate SLA - Next Sweep Cycle)</option>
                            <option>Medium (Gradual background handshake)</option>
                            <option>Critical (Force instant pipeline hot-patch)</option>
                          </select>
                        </div>
                      </div>

                      {/* Terminal deployment blocks */}
                      {serviceDeployStatus !== "idle" && (
                        <div className="p-3 bg-black text-lime-400 font-mono text-[10.5px] rounded-xl space-y-1 max-h-40 overflow-y-auto border-2 border-slate-800 shadow-inner">
                          {serviceDeploymentLogs.map((log, index) => (
                            <div key={index} className="leading-relaxed whitespace-pre-wrap">{log}</div>
                          ))}
                          {serviceDeployStatus === "deploying" && (
                            <div className="flex items-center gap-1.5 text-slate-400 mt-1 animate-pulse">
                              <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-ping"></span>
                              <span>Compiling dynamic components schemas, please wait...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Progress Bar */}
                      {serviceDeployStatus !== "idle" && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span>Service Provisioning Handshake</span>
                            <span>{serviceDeployProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                              style={{ width: `${serviceDeployProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Control buttons */}
                      <div className="flex justify-end gap-2 pt-2">
                        {serviceDeployStatus === "idle" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setServiceDeployStatus("deploying");
                              setServiceDeployProgress(12);
                              const logs = [
                                `[${new Date().toLocaleTimeString()}] 🚀 Initiating platform deployer hook for: ${selectedService.name}...`,
                                `[${new Date().toLocaleTimeString()}] 📦 Reading CentriX client schemas and mapping whitelists...`
                              ];
                              setServiceDeploymentLogs(logs);

                              // Tick up
                              setTimeout(() => {
                                setServiceDeployProgress(48);
                                setServiceDeploymentLogs(prev => [
                                  ...prev,
                                  `[${new Date().toLocaleTimeString()}] 🔨 Mapping field parameters to active relational indices...`,
                                  `[${new Date().toLocaleTimeString()}] 🔒 Binding secure TLS handshake on port 3000...`
                                ]);
                              }, 900);

                              setTimeout(() => {
                                setServiceDeployProgress(82);
                                setServiceDeploymentLogs(prev => [
                                  ...prev,
                                  `[${new Date().toLocaleTimeString()}] 📡 Configuring webhook routes with external CRM handshakes...`,
                                  `[${new Date().toLocaleTimeString()}] 🧪 Executing predictive auto-validation checks...`
                                ]);
                              }, 1800);

                              setTimeout(() => {
                                setServiceDeployProgress(100);
                                setServiceDeployStatus("success");
                                setServiceDeploymentLogs(prev => [
                                  ...prev,
                                  `[${new Date().toLocaleTimeString()}] ✅ Service successfully active in client roster database!`,
                                  `[${new Date().toLocaleTimeString()}] 📊 Tracking live data telemetry and POPIA whitelisted endpoints.`
                                ]);
                                
                                triggerFeedback(`Service node ${selectedService.name} successfully deployed!`);
                              }, 2700);

                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase transition duration-150 cursor-pointer flex items-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                            Deploy Service Node
                          </button>
                        ) : serviceDeployStatus === "success" ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedService(null);
                                setServiceDeployStatus("idle");
                                setServiceDeployProgress(0);
                                setServiceDeploymentLogs([]);
                              }}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                            >
                              Exit Wizard
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setServiceDeployStatus("idle");
                                setServiceDeployProgress(0);
                                setServiceDeploymentLogs([]);
                                triggerFeedback("Service connection status parameters reset.");
                              }}
                              className="px-4 py-2 border border-purple-500 text-purple-655 hover:bg-purple-50 dark:hover:bg-purple-950/10 rounded-xl text-xs font-extrabold uppercase transition duration-150 cursor-pointer flex items-center gap-1.5 animate-pulse"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Re-test Handshake
                            </button>
                          </div>
                        ) : null}
                      </div>

                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-center text-slate-400 space-y-2">
                      <Wrench className="w-10 h-10 text-purple-400/80 mx-auto animate-bounce" style={{ animationDuration: '3s' }} />
                      <div className="text-center">
                        <strong className="text-xs text-slate-700 dark:text-white block font-black">No Service Selected</strong>
                        <span className="text-slate-400 text-xs block font-sans mt-0.5">
                          Click any service from Business, Technical, or Advanced categories above to launch the interactive live deployment workspace.
                        </span>
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* RIGHT COLUMN: Core Administration Functions Liveboards */}
              <div className="xl:col-span-5 space-y-6 text-left">
                
                {/* 1. CRM Field Customizer Board */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 m-0">
                      <Settings className="w-4 h-4 text-purple-500" />
                      1. CRM System Management & Form Builder
                    </h4>
                    <p className="text-slate-500 text-xs font-sans mt-1 m-0">
                      Configure custom field properties, schema variables, and document modules in your database system.
                    </p>
                  </div>

                  {/* List of active fields */}
                  <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-2.5 space-y-2">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider px-1">Active Schema Fields Registry</span>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                      {crmFields.map((field, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-2 rounded-lg text-xs leading-none">
                          <div className="text-left">
                            <span className="font-mono font-bold text-slate-900 dark:text-white select-all">{field.field}</span>
                            <span className="text-[8px] font-bold uppercase block text-slate-400 font-sans mt-1">{field.type} Field</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-black uppercase px-1 rounded-sm ${
                              field.status === "Active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                            }`}>{field.status}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setCrmFields(prev => prev.map(f => f.field === field.field ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f));
                                triggerFeedback(`Field '${field.field}' routing status toggled!`);
                              }}
                              className="px-1.5 py-0.5 border hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 rounded font-bold text-[8px] uppercase font-mono cursor-pointer text-slate-700 dark:text-white"
                            >
                              Toggle
                            </button>
                            {!field.system && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCrmFields(prev => prev.filter(f => f.field !== field.field));
                                  triggerFeedback(`Deleted deprecated schema field '${field.field}'.`);
                                }}
                                className="text-red-500 hover:text-red-750 p-0.5 cursor-pointer bg-transparent border-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add dynamic field form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newFieldName.trim()) return;
                      // Format to camelCase
                      const formatted = newFieldName.trim()
                        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, i) => i === 0 ? letter.toLowerCase() : letter.toUpperCase())
                        .replace(/\s+/g, "");

                      if (crmFields.some(f => f.field === formatted)) {
                        triggerFeedback(`Fail: field '${formatted}' already exists in schema.`);
                        return;
                      }

                      setCrmFields(prev => [...prev, { field: formatted, type: newFieldType, status: "Active", system: false }]);
                      setNewFieldName("");
                      triggerFeedback(`Successfully compiled and published field ${formatted} to active CRM database!`);
                    }}
                    className="grid grid-cols-12 gap-2 text-xs"
                  >
                    <div className="col-span-6">
                      <input 
                        type="text"
                        placeholder="e.g., scoringTier"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-purple-500 dark:text-white font-semibold"
                      />
                    </div>
                    <div className="col-span-4">
                      <select 
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-purple-500 dark:text-white"
                      >
                        <option value="Text font-bold">Text</option>
                        <option value="Number">Number</option>
                        <option value="Currency">Currency</option>
                        <option value="Select font-medium">Dropdown</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <button
                        type="submit"
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center font-sans h-full text-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. User Administration Support & Troubleshooting Logs */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 m-0 font-sans">
                      <Users className="w-4 h-4 text-purple-500" />
                      2. User Administration & Troubleshooting Console
                    </h4>
                    <p className="text-slate-500 text-xs font-sans mt-1 m-0">
                      Assess, diagnose, and resolve platform bugs or permission queries reported by employees.
                    </p>
                  </div>

                  {/* Active Bug List */}
                  <div className="space-y-2">
                    {supportTicketsList.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 italic text-xs bg-slate-50 dark:bg-slate-950 rounded-xl">
                        Clean SLA! No outstanding operator bugs reported.
                      </div>
                    ) : (
                      supportTicketsList.map((bug) => (
                        <div key={bug.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold block">{bug.id}</span>
                              <strong className="text-xs text-slate-905 dark:text-white font-bold leading-tight block mt-0.5">{bug.issue}</strong>
                            </div>
                            <span className={`text-[8px] font-mono px-1 rounded font-bold uppercase shrink-0 ml-1 ${
                              bug.severity === "Critical" ? "bg-red-50 text-red-650 border border-red-200" :
                              bug.severity === "High" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                            }`}>{bug.severity}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                            <span>Assigned: <strong className="text-slate-700 dark:text-slate-250 font-bold">{bug.assignedTo}</strong></span>
                            <div className="flex gap-1">
                              {bug.status !== "Fixed" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSupportTicketsList(prev => prev.map(pt => pt.id === bug.id ? { ...pt, assignedTo: "You (Admin)", status: "Diagnosing" } : pt));
                                      triggerFeedback(`Assigned bug ${bug.id} for diagnostic investigation.`);
                                    }}
                                    className="px-2 py-0.5 bg-slate-900 hover:bg-black dark:bg-slate-800 text-white rounded text-[8px] font-black uppercase tracking-wider cursor-pointer font-sans"
                                  >
                                    Diagnose
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSupportTicketsList(prev => prev.filter(pt => pt.id !== bug.id));
                                      triggerFeedback(`Bug ${bug.id} successfully resolved. Incident ticket closed.`);
                                    }}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-black uppercase tracking-wider cursor-pointer font-sans"
                                  >
                                    Resolve
                                  </button>
                                </>
                              ) : (
                                <span className="text-emerald-600 text-[8px] uppercase font-black font-sans flex items-center gap-1">✓ Solved</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Bug Form */}
                  <div className="p-3 bg-purple-50/20 dark:bg-purple-950/5 border border-purple-100 dark:border-purple-950/40 rounded-xl space-y-2">
                    <span className="text-[9px] uppercase font-black text-purple-650 tracking-wider block">Log Support Ticket / Diagnostics Exception</span>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newIssueText.trim()) return;
                        const bugId = `BUG-${Math.floor(Math.random() * 800 + 100)}`;
                        setSupportTicketsList(prev => [
                          ...prev,
                          { id: bugId, issue: newIssueText.trim(), severity: newIssueSeverity, assignedTo: "Awaiting Triage", status: "New" }
                        ]);
                        setNewIssueText("");
                        triggerFeedback(`Support ticket ${bugId} successfully registered.`);
                      }}
                      className="space-y-2 text-xs"
                    >
                      <input 
                        type="text"
                        placeholder="e.g., Salesforce sync timeouts"
                        value={newIssueText}
                        onChange={(e) => setNewIssueText(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-purple-500 font-semibold dark:text-white"
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Severity:</span>
                          <select 
                            value={newIssueSeverity}
                            onChange={(e) => setNewIssueSeverity(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded font-bold text-[10px]"
                          >
                            <option value="Low">Low (Safe)</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer font-sans"
                        >
                          Send Ticket
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* 3. Deduplication Record Sweeper (Data Management) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 m-0 font-sans">
                      <Database className="w-4 h-4 text-purple-500" />
                      3. Data Management & Deduplication
                    </h4>
                    <p className="text-slate-500 text-xs font-sans mt-1 m-0">
                      Import client batches, sweep data redundancies, and manage backup files.
                    </p>
                  </div>

                  {dbDuplicates.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 italic text-xs bg-slate-50 dark:bg-slate-950 rounded-xl">
                      Database cleanliness index verified! Current Data Health: <strong className="text-emerald-500 font-black">100% Outstanding</strong>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Conflicting Redundant Entries Found</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {dbDuplicates.map((dup) => (
                          <div key={dup.id} className="p-3 bg-rose-50/25 dark:bg-rose-955/5 border border-rose-100 dark:border-rose-950/20 rounded-xl flex justify-between items-center text-xs text-left">
                            <div>
                              <strong className="text-slate-800 dark:text-white font-extrabold block">{dup.name}</strong>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{dup.primaryEmail}</span>
                              <p className="text-[9px] text-rose-600 dark:text-rose-400 block font-semibold mt-1 m-0">Matches: {dup.matches.join(", ")} ({dup.score}% confidence)</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setDbDuplicates(prev => prev.filter(d => d.id !== dup.id));
                                triggerFeedback(`Merged ${dup.name} indices safely. Cleanliness score refreshed.`);
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer font-sans shrink-0 ml-2"
                            >
                              Merge
                            </button>
                          </div>
                        ))}
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setDbDuplicates([]);
                          onTriggerClean();
                          triggerFeedback("Standard deduplication sweep complete! Master database sanitized.");
                        }}
                        className="w-full text-center py-2 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-black text-[10px] tracking-wider uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        ⚡ Run Deduplication Sweeper
                      </button>
                    </div>
                  )}

                  {/* CSV Importer */}
                  <div className="pt-2 border-t border-slate-150 dark:border-slate-800 space-y-2 text-left">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-sans">CSV / JSON Bulk Migrator Panel</span>
                    <textarea 
                      rows={2}
                      placeholder='Paste JSON, e.g.: [{"name": "Leo Kent", "email": "leo@kent.com"}]'
                      value={csvImportInput}
                      onChange={(e) => setCsvImportInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-purple-500 text-slate-800 dark:text-white"
                    ></textarea>
                    <div className="flex justify-end gap-1.5 text-[9px] text-right m-0">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const trimmed = csvImportInput.trim() || "[]";
                            const parsed = JSON.parse(trimmed);
                            if (!Array.isArray(parsed)) {
                              triggerFeedback("Invalid format: Must be a JSON array [] of objects.");
                              return;
                            }
                            setDataLogs(prev => [
                              `[${new Date().toLocaleTimeString()}] Migrated ${parsed.length} client indices into CRM core pipeline.`,
                              ...prev
                            ]);
                            setCsvImportInput("");
                            triggerFeedback(`Data Management: Successfully imported ${parsed.length} new records!`);
                          } catch (err: any) {
                            triggerFeedback(`Error parsing input JSON: ${err.message}`);
                          }
                        }}
                        className="px-2.5 py-1 bg-purple-650 hover:bg-purple-700 text-white rounded-md font-bold uppercase cursor-pointer"
                      >
                        Parse & Migrated
                      </button>
                    </div>
                    {dataLogs.length > 0 && (
                      <div className="bg-slate-955 dark:bg-black p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[9px] text-slate-400 space-y-1 h-20 overflow-y-auto">
                        {dataLogs.map((log, i) => <div key={i}>{log}</div>)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. API Integration handshaking checks */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 m-0 font-sans">
                      <Network className="w-4 h-4 text-purple-500" />
                      4. Webhook payload & API handshakes
                    </h4>
                    <p className="text-slate-500 text-xs font-sans mt-1 m-0">
                      Diagnose status handshakes for Slack, Mailchimp, QuickBooks, or Zapier integration connectors.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-left">
                    {[
                      { name: "Slack Notifications Router", icon: MessageSquare, desc: "Port 443 Webhook Ingress", state: "Active", testUrl: "https://api.slack.com/webhooks" },
                      { name: "Mailchimp Segments Sync", icon: Users, desc: "Segment Sync Sync REST", state: "Active", testUrl: "https://us18.api.mailchimp.com" },
                      { name: "QuickBooks Account Ledger", icon: Coins, desc: "Sage & QB API sync", state: "Active", testUrl: "https://quickbooks.api.intuit.com" },
                      { name: "Zapier Automated Triggers", icon: Zap, desc: "Automate Pipeline Node", state: "Inactive", testUrl: "https://hooks.zapier.com/v1" }
                    ].map((api, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1">
                            <api.icon className="w-3.5 h-3.5 text-indigo-500" />
                            {api.name}
                          </span>
                          <span className={`text-[8px] font-black uppercase px-1 rounded-sm ${
                            api.state === "Active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-slate-100 text-slate-450 dark:bg-slate-850"
                          }`}>{api.state}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 block font-normal m-0">{api.desc}</span>
                        <div className="flex justify-end pt-1 m-0">
                          <button
                            type="button"
                            onClick={() => {
                              setDataLogs(prev => [
                                `[${new Date().toLocaleTimeString()}] Handshake checked for ${api.name}: 200 OK connected to ${api.testUrl}`,
                                ...prev
                              ]);
                              triggerFeedback(`Ping success on ${api.name}: API connection verified`);
                            }}
                            className="px-2 py-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 rounded font-bold text-[8px] uppercase font-mono cursor-pointer text-slate-700 dark:text-white"
                          >
                            Ping Node
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. POPIA & GDPR Safety Auditor Compliance Checklist */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 m-0 font-sans">
                      <Shield className="w-4 h-4 text-purple-500" />
                      5. POPIA & GDPR Cybersecurity Compliance Logs
                    </h4>
                    <p className="text-slate-500 text-xs font-sans mt-1 m-0 font-normal">
                      Track security access controls and data protection guidelines under regulatory compliant SLAs.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-950/30 rounded-2xl space-y-3">
                    <span className="text-[10px] font-black text-purple-750 dark:text-purple-300 uppercase tracking-widest block font-mono text-left">POPIA Compliance Safeguards</span>
                    
                    <div className="space-y-2 text-xs text-left">
                      {[
                        { label: "IP whitelisting gateways enabled for remote operator logins", checked: true },
                        { label: "Two-Factor SSL handshakes authorized under TLSv1.3 standards", checked: true },
                        { label: "System database backup records fully encrypted", checked: true },
                        { label: "Unauthenticated chatbot visitor credentials purged every 24hr", checked: false },
                        { label: "Client profiles and mortgage values masked in raw stdout telemetry", checked: false }
                      ].map((chk, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-left">
                          <input 
                            type="checkbox"
                            defaultChecked={chk.checked}
                            onChange={(e) => {
                              triggerFeedback(`POPIA policy modified: ${chk.label}`);
                            }}
                            className="mt-0.5 h-3.5 w-3.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <span className="text-slate-700 dark:text-slate-200 font-medium leading-normal block">{chk.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-purple-100/35 dark:border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>Regulatory Officer Signature</span>
                      <strong className="text-purple-600 dark:text-purple-400">Attorney General / IT QA</strong>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Interactive Systems Support Ticket Modal for SysAdmin */}
      {/* Secure Connection Vault: Integration Auth Modal */}
      {isAuthModalOpen && selectedIntegration && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-slate-950/5 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <selectedIntegration.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black m-0">Connection Vault</h3>
                  <p className="text-[10px] uppercase font-mono text-cyan-400/80 m-0 tracking-widest">{selectedIntegration.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAuthModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Authentication Strategy</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border flex items-center justify-between">
                    <span className="text-sm font-bold text-black dark:text-white capitalize">{selectedIntegration.auth.method.replace('_', ' ')}</span>
                    <Key className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Environment</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white">
                      <option>Production (Live)</option>
                      <option>Sandbox (Test)</option>
                      <option>Staging</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">API Region</label>
                    <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white">
                      <option>US-EAST-1</option>
                      <option>EU-WEST-2</option>
                      <option>AF-SOUTH-1</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">{selectedIntegration.auth.method === 'API Key' ? 'API Token Key' : 'Client Access Secret'}</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value="********************************"
                      readOnly
                      className="w-full p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-cyan-600 hover:underline px-2 py-1 bg-cyan-50 dark:bg-cyan-900/30 rounded">
                      ROTATE
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">Last key rotation: {selectedIntegration.auth.lastRotated || 'Never'}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Webhook Endpoint URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={`https://api.centrix.io/v4/hooks/${selectedIntegration.id}`}
                      readOnly
                      className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl text-xs font-mono text-slate-500 truncate"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`https://api.centrix.io/v4/hooks/${selectedIntegration.id}`);
                        triggerFeedback("Webhook URL copied to clipboard");
                      }}
                      className="p-3 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                       <RefreshCw className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsAuthModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    triggerFeedback(`Connection Settings Saved for ${selectedIntegration.name}`);
                  }}
                  className="flex-1 py-3 bg-cyan-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 active:scale-95 transition-all"
                >
                  Apply Config
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Systems Support Ticket Modal for SysAdmin */}
      {isAdminTicketModalOpen && selectedAdminTicket && (() => {
        const ticket = selectedAdminTicket;
        return (
          <div id="sysAdminRequestModal" className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col hover:border-transparent">
              
              {/* Modal Header */}
              <div className="p-6 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-855 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-105 dark:bg-blue-950 text-blue-600 rounded-xl">
                     <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-black text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 px-1.5 py-0.5 rounded uppercase">{ticket.id}</span>
                      <span className="text-xs text-slate-400 font-bold">Systems Command Authorization</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">{ticket.task}</h3>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAdminTicketModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
                
                {/* Meta details */}
                <div className="p-4 bg-slate-50 dark:bg-slate-855 rounded-2xl flex flex-wrap gap-4 justify-between items-center text-xs text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-black">Authorized Requester</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{ticket.requester}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-black">Subsystem Category</span>
                    <span className="font-semibold">{ticket.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-black">Status Ledger</span>
                    <span className="font-mono bg-yellow-105 dark:bg-yellow-950 text-yellow-700 font-extrabold text-[10px] px-1.5 py-0.5 rounded uppercase">{ticket.status}</span>
                  </div>
                </div>

                {/* Scope Details */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Operation Technical Description</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 font-mono text-xs rounded-xl border dark:border-slate-800 text-slate-805 leading-relaxed">
                    {ticket.details}
                  </div>
                </div>

                {/* Simulated Actions Checklist */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Required System Access Vectors</span>
                  <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-indigo-200">
                      <Lock className="w-4 h-4 text-indigo-500" />
                      <span>Security Clearances of level <strong className="font-sans font-bold">L2 Core Console Or Higher</strong> needed.</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-800 dark:text-indigo-200">
                      <Network className="w-4 h-4 text-emerald-500" />
                      <span>Temporary Port Bindings: routing handshakes verified under TLSv1.3.</span>
                    </div>
                  </div>
                </div>

                {/* Operations Commands Options (Action Buttons) */}
                <div className="space-y-2.5 pt-2 border-t dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider font-sans">Interactive SysAdmin Actions</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Mark approved
                        setAdminTicketsList(prev => prev.map(t => t.id === ticket.id ? { ...t, status: "Approved" } : t));
                        setIsAdminTicketModalOpen(false);
                      }}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve Privilege Grant
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Mark quarantined
                        setAdminTicketsList(prev => prev.map(t => t.id === ticket.id ? { ...t, status: "Quarantined" } : t));
                        setIsAdminTicketModalOpen(false);
                      }}
                      className="p-3 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Reject & Quarantine Outbound Route
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Toggle Status to In Progress
                        setAdminTicketsList(prev => prev.map(t => t.id === ticket.id ? { ...t, status: "In Progress" } : t));
                      }}
                      className="p-3 bg-slate-900 hover:bg-black dark:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Force Handshake Hand-off
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Dismiss ticket from queue
                        setAdminTicketsList(prev => prev.filter(t => t.id !== ticket.id));
                        setIsAdminTicketModalOpen(false);
                      }}
                      className="p-3 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-55 dark:hover:bg-slate-850 text-[11px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Discard From Workspace Queue
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
