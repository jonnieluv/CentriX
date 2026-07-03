export interface Ticket {
  id: string;
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    salary: number;
    idNumber: string;
    departmentSelection: string;
    notes: string;
    spouseName?: string;
    spouseIdNumber?: string;
    spousePhone?: string;
    spouseEmail?: string;
    nokName?: string;
    nokRelationship?: string;
    nokPhone?: string;
    aliases?: string;
    dob?: string;
    gender?: string;
    maritalStatus?: string;
    dependentsCount?: number;
    pensionFundName?: string;
    pensionMemberNumber?: string;
    monthlyPensionPayout?: number;
  };
  addressDetails: {
    street: string;
    city: string;
    postalCode: string;
    propertyValue: number;
    mortgageRequired: number;
    residentialStatus?: string;
    timeAtCurrentAddressMonths?: number;
  };
  employmentDetails: {
    company: string;
    jobTitle: string;
    tenureMonths: number;
    monthlyIncome: number;
    industry?: string;
    employeeNumber?: string;
    employmentType?: string;
    startDate?: string;
    contractExpiryDate?: string;
    timeInIndustryMonths?: number;
    workAddress?: string;
    hrContactName?: string;
    hrContactPhone?: string;
    companyEmail?: string;
    salaryFrequency?: string;
    payDay?: number;
  };
  expenses: {
    rental: number;
    groceries: number;
    leisure: number;
    utilities: number;
    debtRepayments: number;
    editMotivations?: Record<string, string>;
  };
  debtObligations: {
    bankLoans: number;
    creditCards: number;
    storeAccounts: number;
    debtReviewFlag: boolean;
    insurances?: number;
    phoneSubscriptions?: number;
  };
  bankStatementsAnalysis: {
    avg3MonthsBalance: number;
    salaryDepositMatched: boolean;
    overdraftFrequency: string;
    monthlyDetails?: {
      category: string;
      m1: number;
      m2: number;
      m3: number;
      isOneOff: boolean;
      motivation?: string;
    }[];
  };
  affordabilityOutcome: {
    disposableIncome: number;
    approvedLimit: number;
    loanEligibilityStatus: "Passed" | "Conditional" | "Rejected";
    riskNotes: string;
    externalInstalment?: number;
    internalOfferInstalment?: number;
    internalOfferInterest?: number;
    termMonths?: 12 | 24;
    surplusRemaining?: number;
  };
  status: string; // "Sales" | "Sales Administration" | "Document Hunters" | "Debt Review" | "Quality Assurance" | "Client Experience" | "Credit Committee" | "Finance" | "Signed Off"
  subStatus?: string;
  ticketStatus: "New" | "In Progress" | "Review" | "Completed" | "Rejected";
  selectedProducts: string[];
  supportingDocuments: {
    id: string;
    name: string;
    category: string;
    uploadDate: string;
    url: string;
  }[];
  auditLogs: {
    id: string;
    timestamp: string;
    auditor: string;
    sentiment: string;
    score: number;
    comment: string;
  }[];
  qaAssessment?: QAAssessment;
  assignedDocumentHunter?: string;
  assignedQaAgent?: string;
  notesHistory?: TicketNote[];
  remarks?: string;
}

export interface TicketNote {
  id: string;
  timestamp: string;
  author: string;
  department: string;
  text: string;
}

export interface QAAssessment {
  id: string;
  status: "Pending" | "Passed" | "Conditional" | "Failed";
  completedAt: string;
  auditor: string;
  score: number;
  checks: {
    identityVerified: boolean;
    incomeMatchesPayslip: boolean;
    expensesReasonable: boolean;
    debtReviewChecked: boolean;
    documentsComplete: boolean;
    approvedLimitValid: boolean;
  };
  comments: string;
  autoAudited: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
}

export interface SwitchboardCall {
  id: string;
  caller: string;
  source: string;
  time: string;
  status: string;
}

export interface VisitorLog {
  id: string;
  name: string;
  company: string;
  signInTime: string;
  signOutTime: string;
  purpose: string;
}

export interface PackageLog {
  id: string;
  recipient: string;
  carrier: string;
  description: string;
  deliveryTime: string;
  status: string;
}

export interface ChatMessage {
  sender: "client" | "agent";
  message: string;
  timestamp: string;
}

export interface CallLog {
  id: string;
  direction: string;
  contactName: string;
  duration: string;
  rate: string;
  timestamp: string;
  auditReport: string;
}

export interface VideoSession {
  id: string;
  roomName: string;
  clientName: string;
  duration: string;
  status: string;
}

export interface FacilitiesLog {
  id: string;
  area: string;
  task: string;
  scheduledDate: string;
  assignedTo: string;
  status: string;
}

export interface HealthSafetyCheck {
  id: string;
  description: string;
  status: 'Pending' | 'Completed' | 'Resolved' | 'Cancelled';
}

export interface GrowthGoal {
  id: string;
  employeeId: string;
  title: string;
  progress: number; // 0-100
  status: 'In Progress' | 'Achieved';
}

export interface TrainingCourse {
  id: string;
  title: string;
  participants: number;
  duration: string;
  progress: number;
  status: string;
  materials?: string[];
}

export interface TrainingAssignment {
  id: string;
  employeeId: string;
  courseId: string;
  progress: number;
  status: 'Assigned' | 'In-Progress' | 'Completed';
  assignedDate: string;
  completionDate: string | null;
  feedback: string | null;
}

export interface ITOverrideLog {
  id: string;
  timestamp: string;
  action: string;
  status: string;
}

export interface ITScreenRecording {
  id: string;
  user: string;
  action: string;
  time: string;
  isRecording: boolean;
}

export type CRMDepartment =
  | "Sales"
  | "Sales Administration"
  | "Document Hunters"
  | "Debt Review"
  | "Quality Assurance"
  | "Client Experience"
  | "Credit Committee"
  | "Finance"
  | "Information & Technology"
  | "Human Capital"
  | "Training and Development"
  | "Reception"
  | "Facilities"
  | "Marketing & Tele-Marketing"
  | "Systems Administration";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Agent" | "Supervisor" | "API-Service";
  status: "Active" | "Deactivated";
  lastLogin: string;
}

export interface WorkflowAutomation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "Active" | "Paused";
  executions: number;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  category: "Email" | "ERP" | "Marketing" | "Chat" | "Database";
  status: "Connected" | "Disconnected" | "Error";
  lastSync: string;
  healthRate: number; // percentage
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  severity: "Low" | "Medium" | "High";
}

export interface TeleMarketingLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  isDnc: boolean;
  callAttempts: number;
  lastOutcome: "Not Called" | "Ringing" | "No Answer" | "Call Back Scheduled" | "Interested - Ticket Created" | "Not Interested" | "Opt Out requested";
  assignedAgent?: string;
  notes?: string;
}

export interface PlaybookCampaign {
  id: string;
  name: string;
  channel: "Digital" | "Social" | "Email" | "Google Ads" | "Radio/Offline" | "Tele-Marketing Outbound";
  budget: number;
  spend: number;
  leadsCount: number;
  contactedCount: number;
  convertedCount: number;
  status: "Active" | "Paused" | "Completed";
  leads: TeleMarketingLead[];
}

export interface DiallerState {
  isActive: boolean;
  activeCampaignId: string;
  currentLeadIndex: number;
  autoDialSpeed: number; // seconds
  isCallConnected: boolean;
  recordingActive: boolean;
}

export interface SupportTicketReply {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  user: string;
  department: string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In-Progress" | "Resolved";
  createdAt: string;
  replies: SupportTicketReply[];
}

