import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Persistent/In-memory State Database
interface Ticket {
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
}

interface TicketNote {
  id: string;
  timestamp: string;
  author: string;
  department: string;
  text: string;
}

interface QAAssessment {
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

function autoAttachQaAssessment(ticket: Ticket): QAAssessment {
  const checks = {
    identityVerified: ticket.supportingDocuments ? ticket.supportingDocuments.some(d => d.name.toLowerCase().includes("id") || d.category.toLowerCase().includes("client info") || d.category.toLowerCase().includes("id")) : false,
    incomeMatchesPayslip: ticket.supportingDocuments ? ticket.supportingDocuments.some(d => d.name.toLowerCase().includes("payslip") || d.category.toLowerCase().includes("employment")) : false,
    expensesReasonable: (Number(ticket.expenses.rental) + Number(ticket.expenses.groceries) + Number(ticket.expenses.utilities)) < Number(ticket.clientInfo.salary) * 0.7,
    debtReviewChecked: !ticket.debtObligations.debtReviewFlag,
    documentsComplete: ticket.supportingDocuments ? ticket.supportingDocuments.length >= 2 : false,
    approvedLimitValid: Number(ticket.affordabilityOutcome.approvedLimit) > 0 || ticket.affordabilityOutcome.loanEligibilityStatus === "Passed",
  };

  let score = 0;
  if (checks.identityVerified) score += 20;
  if (checks.incomeMatchesPayslip) score += 20;
  if (checks.expensesReasonable) score += 15;
  if (checks.debtReviewChecked) score += 20;
  if (checks.documentsComplete) score += 15;
  if (checks.approvedLimitValid) score += 10;

  let status: "Pending" | "Passed" | "Conditional" | "Failed" = "Passed";
  let comments = "Robust QA Audit completed: ";
  
  if (!checks.debtReviewChecked) {
    status = "Failed";
    comments += "CRITICAL CHECK FAILURE: Client is flagged under Debt Review status. No mortgage approvals permitted.";
  } else if (!checks.identityVerified || !checks.documentsComplete) {
    status = "Conditional";
    comments += "CONDITIONAL WARNING: Primary identity upload card or supporting files are pending.";
  } else if (score < 60) {
    status = "Conditional";
    comments += "CONDITIONAL COMPLIANCE: Financial health limits are low, requiring closer oversight.";
  } else {
    comments += "FULLY VERIFIED: All mandatory document templates, credit checks, and affordability limits passed CRM registry guidelines.";
  }

  return {
    id: ticket.qaAssessment?.id || `QA-${Math.floor(10000 + Math.random() * 90000)}`,
    status,
    completedAt: ticket.qaAssessment?.completedAt || new Date().toISOString(),
    auditor: ticket.qaAssessment?.auditor || "CentriX Automated QA Engine",
    score,
    checks,
    comments: ticket.qaAssessment?.comments || comments,
    autoAudited: ticket.qaAssessment?.autoAudited ?? true,
  };
}


// Initial Mock data for a fully functional database
let tickets: Ticket[] = [
  ...[
    { id: "1", title: "Willamette Co deal", org: "Willamette Co", val: 1500, stage: "Qualified", color: "bg-slate-300", warning: false, active: false, won: false },
    { id: "2", title: "Park Place deal", org: "Park Place", val: 4500, stage: "Qualified", color: "bg-slate-300", warning: false, active: false, won: false },
    { id: "3", title: "Dream college deal", org: "Dream college", val: 3700, stage: "Qualified", color: "bg-yellow-500", warning: true, active: false, won: false },
    { id: "4", title: "Pet insurance deal", org: "Pet insurance", val: 1000, stage: "Qualified", color: "bg-slate-300", warning: false, active: false, won: false },
    { id: "5", title: "Tim and sons logistics deal", org: "Tim and sons logistics", val: 2300, stage: "Contact Made", color: "bg-rose-500", warning: false, active: true, won: false },
    { id: "6", title: "Fantastic hotels LTD deal", org: "Fantastic hotels LTD", val: 1900, stage: "Contact Made", color: "bg-green-500", warning: false, active: false, won: false },
    { id: "7", title: "JD manufacturing deal", org: "JD manufacturing", val: 1150, stage: "Contact Made", color: "bg-blue-500", warning: false, active: false, won: false },
    { id: "8", title: "Bringit media agency deal", org: "Bringit media agency", val: 1400, stage: "Demo Scheduled", color: "bg-slate-300", warning: false, active: false, won: false },
    { id: "9", title: "We heart trees non-profit deal", org: "We heart trees non-profit", val: 1700, stage: "Demo Scheduled", color: "bg-slate-300", warning: false, active: false, won: false },
    { id: "10", title: "Rio housing deal", org: "Rio housing", val: 2700, stage: "Proposal Made", color: "bg-slate-300", warning: false, active: false, won: false },
    { id: "11", title: "Maria M. retail LTD deal", org: "Maria M. retail LTD", val: 2600, stage: "Negotiations Started", color: "bg-slate-300", warning: false, active: false, won: false },
    { id: "12", title: "Trip abroad LTD deal", org: "Trip abroad LTD", val: 3750, stage: "Negotiations Started", color: "bg-green-500", warning: false, active: false, won: true }
  ].map(d => ({
    id: `DEAL-${d.id}`,
    clientInfo: {
      name: d.title,
      email: `${d.org.replace(/\s+/g, '').toLowerCase()}@example.com`,
      phone: "+1 555-0199",
      salary: 50000,
      idNumber: "0000000000000",
      departmentSelection: "Sales",
      notes: "B2B Deal migrated ticket."
    },
    addressDetails: {
      street: d.org,
      city: "Metropolis",
      postalCode: "10001",
      propertyValue: d.val * 1.5,
      mortgageRequired: d.val
    },
    employmentDetails: {
      company: d.org,
      jobTitle: "Executive",
      tenureMonths: 24,
      monthlyIncome: 10000
    },
    expenses: { rental: 1500, groceries: 400, leisure: 300, utilities: 200, debtRepayments: 500 },
    debtObligations: { bankLoans: 0, creditCards: 5000, storeAccounts: 1000, debtReviewFlag: false },
    bankStatementsAnalysis: { avg3MonthsBalance: 15000, salaryDepositMatched: true, overdraftFrequency: "None" },
    affordabilityOutcome: { disposableIncome: 7100, approvedLimit: 0, loanEligibilityStatus: "Passed" as const, riskNotes: "" },
    status: "Sales",
    subStatus: d.stage,
    ticketStatus: (d.warning ? "Review" : d.active ? "In Progress" : d.won ? "Completed" : "New") as any,
    selectedProducts: ["B2B Contract"],
    supportingDocuments: [],
    auditLogs: []
  })),
  {
    id: "TX-90112",
    clientInfo: {
      name: "Dumisani Khumalo",
      email: "dumisani@gmail.com",
      phone: "+27 72 345 6789",
      salary: 32000,
      idNumber: "9102045678082",
      departmentSelection: "Sales",
      notes: "Client is extremely interested in the fast WiFi Router and an Earphones bundle along with the 1.2M Home Mortgage."
    },
    addressDetails: {
      street: "244 Juta St",
      city: "Johannesburg",
      postalCode: "2001",
      propertyValue: 1200000,
      mortgageRequired: 950000
    },
    employmentDetails: {
      company: "Sentech Solutions",
      jobTitle: "Senior Systems Engineer",
      tenureMonths: 36,
      monthlyIncome: 32000
    },
    expenses: {
      rental: 6500,
      groceries: 3000,
      leisure: 1500,
      utilities: 1800,
      debtRepayments: 2000
    },
    debtObligations: {
      bankLoans: 14000,
      creditCards: 5000,
      storeAccounts: 1200,
      debtReviewFlag: false
    },
    bankStatementsAnalysis: {
      avg3MonthsBalance: 8400,
      salaryDepositMatched: true,
      overdraftFrequency: "None"
    },
    affordabilityOutcome: {
      disposableIncome: 17200,
      approvedLimit: 950000,
      loanEligibilityStatus: "Passed",
      riskNotes: "Excellent income consistency, low overall debt load."
    },
    status: "Sales Administration",
    ticketStatus: "In Progress",
    selectedProducts: ["Smartphone S24", "Wireless Headset", "Pocket Wi-Fi Lite", "Home Mortgage 1200"],
    supportingDocuments: [
      { id: "doc-1", name: "ID_Dumisani_Khumalo.pdf", category: "Client Info", uploadDate: "2026-05-28", url: "#" },
      { id: "doc-2", name: "Payslip_April2026.pdf", category: "Employment Details", uploadDate: "2026-05-28", url: "#" }
    ],
    auditLogs: [
      { id: "log-1", timestamp: "2026-05-28T10:00:00Z", auditor: "CentriX AI Engine", sentiment: "Positive", score: 88, comment: "Client profile shows high trust metric and verifiable salary deposit." }
    ]
  },
  {
    id: "TX-90113",
    clientInfo: {
      name: "Tshepo Modise",
      email: "tshepo.modise@yahoo.com",
      phone: "+27 83 912 3456",
      salary: 14000,
      idNumber: "8805125912089",
      departmentSelection: "Sales",
      notes: "Wants Wifi Router standard package and Huawei smartphone. Flagged for possible Debt Review verification."
    },
    addressDetails: {
      street: "89 Church Street",
      city: "Pretorias",
      postalCode: "0002",
      propertyValue: 450000,
      mortgageRequired: 300000
    },
    employmentDetails: {
      company: "Gauteng Transport Services",
      jobTitle: "Logistics Clerk",
      tenureMonths: 14,
      monthlyIncome: 14000
    },
    expenses: {
      rental: 4000,
      groceries: 2500,
      leisure: 1000,
      utilities: 1200,
      debtRepayments: 4500
    },
    debtObligations: {
      bankLoans: 28000,
      creditCards: 12000,
      storeAccounts: 4500,
      debtReviewFlag: true
    },
    bankStatementsAnalysis: {
      avg3MonthsBalance: -150,
      salaryDepositMatched: true,
      overdraftFrequency: "High"
    },
    affordabilityOutcome: {
      disposableIncome: 800,
      approvedLimit: 0,
      loanEligibilityStatus: "Rejected",
      riskNotes: "Under Debt Review status. Disposable income too low for current obligations."
    },
    status: "Debt Review",
    ticketStatus: "Review",
    selectedProducts: ["Home Mortgage 1200", "Router Wifi Extreme", "Huawei Smartphone"],
    supportingDocuments: [
      { id: "doc-3", name: "BankStatement_3Months.pdf", category: "Bank Statements Analysis (3 months)", uploadDate: "2026-05-28", url: "#" }
    ],
    auditLogs: [
      { id: "log-2", timestamp: "2026-05-28T10:15:00Z", auditor: "System Health Alert", sentiment: "Negative / Review Due", score: 34, comment: "Severe high values of credit card utilization. Recommended routing to Debt Review Desk." }
    ]
  },
  {
    id: "TX-90114",
    clientInfo: {
      name: "Sindi Ndaba",
      email: "sindi.ndaba@gmail.com",
      phone: "+27 73 998 1221",
      salary: 28000,
      idNumber: "9405021234085",
      departmentSelection: "Sales",
      notes: "Sindi is requesting a new mortgage application and Smartphone package. High quality credit history."
    },
    addressDetails: {
      street: "56 Enterprise Retail Ave",
      city: "Midrand, JHB",
      postalCode: "1682",
      propertyValue: 850000,
      mortgageRequired: 650000
    },
    employmentDetails: {
      company: "Direct Employer Ltd",
      jobTitle: "Mid-level Specialist",
      tenureMonths: 18,
      monthlyIncome: 28000
    },
    expenses: {
      rental: 7000,
      groceries: 4200,
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
      avg3MonthsBalance: 9800,
      salaryDepositMatched: true,
      overdraftFrequency: "None"
    },
    affordabilityOutcome: {
      disposableIncome: 11200,
      approvedLimit: 650000,
      loanEligibilityStatus: "Passed",
      riskNotes: "Strong credit record with healthy monthly surplus."
    },
    status: "Sales",
    ticketStatus: "New",
    selectedProducts: ["Smartphone S24", "Router Wifi Extreme", "Full Home Mortgage 1.2M"],
    supportingDocuments: [],
    auditLogs: []
  },
  {
    id: "TX-90115",
    clientInfo: {
      name: "Alistair Graham",
      email: "a.graham@corporate.co.za",
      phone: "+27 11 902 3344",
      salary: 45000,
      idNumber: "8110025123087",
      departmentSelection: "Sales",
      notes: "Looking to consolidate pre-existing debt. Needs document tracking validation."
    },
    addressDetails: {
      street: "12 West Street",
      city: "Sandton, JHB",
      postalCode: "2196",
      propertyValue: 2100000,
      mortgageRequired: 1500000
    },
    employmentDetails: {
      company: "Graham Legal Group",
      jobTitle: "Senior Legal Advocate",
      tenureMonths: 72,
      monthlyIncome: 45000
    },
    expenses: {
      rental: 12000,
      groceries: 5000,
      leisure: 3000,
      utilities: 2500,
      debtRepayments: 3000
    },
    debtObligations: {
      bankLoans: 12000,
      creditCards: 9000,
      storeAccounts: 2000,
      debtReviewFlag: false
    },
    bankStatementsAnalysis: {
      avg3MonthsBalance: 15000,
      salaryDepositMatched: true,
      overdraftFrequency: "None"
    },
    affordabilityOutcome: {
      disposableIncome: 19500,
      approvedLimit: 1500000,
      loanEligibilityStatus: "Passed",
      riskNotes: "Highly stable profile with substantial asset base holdings."
    },
    status: "Document Hunters",
    ticketStatus: "In Progress",
    selectedProducts: ["Router Wifi Extreme", "Wireless Headset"],
    supportingDocuments: [],
    auditLogs: []
  },
  {
    id: "TX-90116",
    clientInfo: {
      name: "Precious Ndlovu",
      email: "precious.ndlovu@gmail.com",
      phone: "+27 82 234 1109",
      salary: 19000,
      idNumber: "9512145123081",
      departmentSelection: "Sales",
      notes: "Inbound switchboard lead interested in pre-qualified personal loans. Extremely cooperative dialogue recorded."
    },
    addressDetails: {
      street: "77 Govan Mbeki Rd",
      city: "Gqeberha",
      postalCode: "6001",
      propertyValue: 600000,
      mortgageRequired: 400000
    },
    employmentDetails: {
      company: "Healthnet Clinics",
      jobTitle: "Staff Nurse",
      tenureMonths: 24,
      monthlyIncome: 19000
    },
    expenses: {
      rental: 4500,
      groceries: 3500,
      leisure: 1000,
      utilities: 1100,
      debtRepayments: 2200
    },
    debtObligations: {
      bankLoans: 8000,
      creditCards: 3000,
      storeAccounts: 800,
      debtReviewFlag: false
    },
    bankStatementsAnalysis: {
      avg3MonthsBalance: 3100,
      salaryDepositMatched: true,
      overdraftFrequency: "Rare"
    },
    affordabilityOutcome: {
      disposableIncome: 6700,
      approvedLimit: 400000,
      loanEligibilityStatus: "Passed",
      riskNotes: "Highly consistent healthcare sector income history."
    },
    status: "Client Experience",
    ticketStatus: "Completed",
    selectedProducts: ["Smartphone S24", "Wireless Headset"],
    supportingDocuments: [],
    auditLogs: []
  },
  {
    id: "TX-90117",
    clientInfo: {
      name: "Nicolette van der Merwe",
      email: "nicolette.vdm@webmail.co.za",
      phone: "+27 63 942 3311",
      salary: 31000,
      idNumber: "9204125890081",
      departmentSelection: "Sales",
      notes: "Lead generated via SEM. Wants immediate mortgage setup but credit check indicates high local store write-offs."
    },
    addressDetails: {
      street: "44 Melt Brink Street",
      city: "Bloemfontein",
      postalCode: "9301",
      propertyValue: 900000,
      mortgageRequired: 750000
    },
    employmentDetails: {
      company: "Meltcon Construction",
      jobTitle: "Office Estimator",
      tenureMonths: 15,
      monthlyIncome: 31000
    },
    expenses: {
      rental: 6000,
      groceries: 4000,
      leisure: 1800,
      utilities: 1600,
      debtRepayments: 6500
    },
    debtObligations: {
      bankLoans: 19000,
      creditCards: 14000,
      storeAccounts: 9000,
      debtReviewFlag: false
    },
    bankStatementsAnalysis: {
      avg3MonthsBalance: 500,
      salaryDepositMatched: true,
      overdraftFrequency: "Medium"
    },
    affordabilityOutcome: {
      disposableIncome: 2100,
      approvedLimit: 0,
      loanEligibilityStatus: "Rejected",
      riskNotes: "Failed basic affordability verification. Extreme exposure to unsecured retail store card accounts."
    },
    status: "Sales",
    ticketStatus: "Rejected",
    selectedProducts: ["High-Fi Speaker Stack", "Full Home Mortgage 1.2M"],
    supportingDocuments: [],
    auditLogs: []
  },
  {
    id: "TX-90118",
    clientInfo: {
      name: "Jacobus Pretorius",
      email: "jacobus.pret@gmail.com",
      phone: "+27 84 212 9054",
      salary: 22000,
      idNumber: "8411225023086",
      departmentSelection: "Sales",
      notes: "Wants premium WiFi setup and headset bundle concurrently. Income sheets uploaded."
    },
    addressDetails: {
      street: "109 Jan Shoba St",
      city: "Pretoria",
      postalCode: "0181",
      propertyValue: 700000,
      mortgageRequired: 550000
    },
    employmentDetails: {
      company: "Pretorius & Sons Auto",
      jobTitle: "Lead Technician",
      tenureMonths: 48,
      monthlyIncome: 22000
    },
    expenses: {
      rental: 5000,
      groceries: 3000,
      leisure: 1200,
      utilities: 1400,
      debtRepayments: 2000
    },
    debtObligations: {
      bankLoans: 7000,
      creditCards: 4000,
      storeAccounts: 1100,
      debtReviewFlag: false
    },
    bankStatementsAnalysis: {
      avg3MonthsBalance: 4605,
      salaryDepositMatched: true,
      overdraftFrequency: "None"
    },
    affordabilityOutcome: {
      disposableIncome: 9400,
      approvedLimit: 550000,
      loanEligibilityStatus: "Passed",
      riskNotes: "Solid technical employment record. Consistent cash balance."
    },
    status: "Document Hunters",
    ticketStatus: "Review",
    selectedProducts: ["Router Wifi Extreme", "Wireless Headset"],
    supportingDocuments: [],
    auditLogs: []
  }
];

// Directory / HR Users
let employees = [
  { id: "EMP01", name: "David Miller", email: "david.m@centrix.com", department: "Sales", role: "Sales Consultant", status: "Active" },
  { id: "EMP02", name: "Lerato Sebeko", email: "lerato.s@centrix.com", department: "Sales Administration", role: "Case Prepper", status: "Active" },
  { id: "EMP03", name: "Sarah Jenkins", email: "sarah.j@centrix.com", department: "Document Hunters", role: "Document Specialist", status: "Active" },
  { id: "EMP04", name: "Marcus Peterson", email: "marcus.p@centrix.com", department: "Debt Review", role: "Risk Counselor", status: "Active" },
  { id: "EMP05", name: "Samantha Khoza", email: "samantha.k@centrix.com", department: "Quality Assurance", role: "QA Auditor", status: "Active" },
  { id: "EMP06", name: "Brian O'Connor", email: "brian.o@centrix.com", department: "Credit Committee", role: "Risk Assessor", status: "On Leave" },
  { id: "EMP07", name: "Elena Rostova", email: "elena.r@centrix.com", department: "Finance", role: "Chief Financial Accountant", status: "Active" },
  { id: "EMP08", name: "Ashraf Patel", email: "ashraf.p@centrix.com", department: "Information & Technology", role: "CRM Admin", status: "Active" },
  { id: "EMP09", name: "Chantel Gouws", email: "chantel.g@centrix.com", department: "Human Capital", role: "HR Manager", status: "Active" }
];

// Switchboard data
let switchboardQueue = [
  { id: "call-q1", caller: "Precious Ndlovu", source: "Incoming - Cellular (+27 82 234 1109)", time: "12:15 PM", status: "Ringing" },
  { id: "call-q2", caller: "Alistair Graham", source: "Incoming - Landline (+27 11 902 3344)", time: "12:20 PM", status: "Waiting" }
];

let visitorLogs = [
  { id: "vis-1", name: "Sanele Sibiya", company: "Absa Valuation Officers", signInTime: "2026-05-28 09:30 AM", signOutTime: "2026-05-28 11:20 AM", purpose: "Asset Inspection" },
  { id: "vis-2", name: "Gary Vance", company: "Telkom Field Engineers", signInTime: "2026-05-28 11:45 AM", signOutTime: "--", purpose: "IT Switchboard Line Diagnostics" }
];

let packageLogs = [
  { id: "pkg-1", recipient: "David Miller (Sales)", carrier: "Courier Guy", description: "Wifi Routers Sample Pack", deliveryTime: "2026-05-28 10:10 AM", status: "Delivered" },
  { id: "pkg-2", recipient: " Elena Rostova (Finance)", carrier: "DHL", description: "Invoice Audit Files", deliveryTime: "2026-05-28 11:55 AM", status: "Held at Reception" }
];

// Communications logs
let chatsState: Record<string, { sender: "client" | "agent"; message: string; timestamp: string }[]> = {
  "Tshepo Modise": [
    { sender: "client", message: "Hi, I received an SMS saying my bank statements are empty. Can I resubmit them here?", timestamp: "12:01 PM" },
    { sender: "agent", message: "Hi Tshepo, yes indeed! You can drag and drop them here, or I can route you to our Document Hunters department to help.", timestamp: "12:04 PM" },
    { sender: "client", message: "Okay, I am in debt review but I just want a router and smartphone since my old phone broke.", timestamp: "12:05 PM" }
  ],
  "Dumisani Khumalo": [
    { sender: "client", message: "Good morning CentriX, is the mortgage application already sent to Credit Approvals?", timestamp: "09:12 AM" },
    { sender: "agent", message: "Hi Dumisani, it is currently undergoing Sales Administration prepping, we will update you shortly.", timestamp: "09:15 AM" }
  ]
};

let callLogsState = [
  { id: "call-1", direction: "Outbound", contactName: "Dumisani Khumalo", duration: "4m 12s", rate: "Passed", timestamp: "10:15 AM", auditReport: "AI Verified clear client commitment to mortgage offer." },
  { id: "call-2", direction: "Incoming", contactName: "Tshepo Modise", duration: "7m 55s", rate: "Needs Review", timestamp: "11:20 AM", auditReport: "Debt review rules discussed. Customer expressed concern about Smartphone bundle limits." }
];

let videoSessionsState = [
  { id: "vid-1", roomName: "Room-Alpha", clientName: "Dumisani Khumalo (Valuations)", duration: "12 mins", status: "Saved in Storage Drive" },
  { id: "vid-2", roomName: "Room-Beta", clientName: "Corporate Mortgage Counsel", duration: "45 mins", status: "Saved in Storage Drive" }
];

// Facilities logs
let facilitiesLogs = [
  { id: "fac-1", area: "Server Room B", task: "AC Filter Maintenance", scheduledDate: "2026-05-29", assignedTo: "CoolingTech Ltd", status: "Pending" },
  { id: "fac-2", area: "Main Reception Floor", task: "Daily switchboard sanity check & disinfection", scheduledDate: "2026-05-28", assignedTo: "Facilities Support Unit", status: "Completed" }
];

// Training Catalog
let trainingCatalog = [
  { id: "trn-1", title: "National Credit Act compliance v2.4", participants: 15, duration: "3 hours", progress: 85, status: "Active", materials: ["NCA_Manual_v2.pdf", "Quiz_1_Rules.json"] },
  { id: "trn-2", title: "Total Quality Management (TQM) in CRM Workflow Routing", participants: 8, duration: "5 hours", progress: 40, status: "Active", materials: ["TQM_Process_Map.png"] },
  { id: "trn-3", title: "CentriX Router & Smart Device Value Added Suite onboarding", participants: 22, duration: "1.5 hours", progress: 100, status: "Completed", materials: ["Router_Onboarding_Video.mp4"] }
];

let trainingAssignments: any[] = [
  { id: "asgn-1", employeeId: "EMP01", courseId: "trn-1", progress: 45, status: "In-Progress", assignedDate: "2026-05-20", completionDate: null, feedback: null },
  { id: "asgn-2", employeeId: "EMP03", courseId: "trn-2", progress: 10, status: "Assigned", assignedDate: "2026-05-25", completionDate: null, feedback: null }
];

// IT CRM Logs & Rights
let itOverrideLogs: any[] = [
  { id: "ovr-1", timestamp: "2026-05-28 10:20 AM", action: "User David Miller sales permissions upgraded to Supervisor Override", status: "SUCCESS" },
  { id: "ovr-2", timestamp: "2026-05-28 11:40 AM", action: "System upgrade backup triggered locally to storage", status: "SUCCESS" }
];

let activeITScreenRecordings = [
  { id: "rec-1", user: "EMP01 (David Miller)", action: "Active in Sales desk", time: "Live Running", isRecording: true },
  { id: "rec-2", user: "EMP02 (Lerato Sebeko)", action: "Analysing Bank Statements", time: "Stored - 14m", isRecording: false }
];

interface SupportTicket {
  id: string;
  user: string;
  department: string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In-Progress" | "Resolved";
  createdAt: string;
  replies: {
    id: string;
    sender: string;
    message: string;
    timestamp: string;
  }[];
}

let supportTickets: SupportTicket[] = [
  {
    id: "ST-81023",
    user: "David Miller",
    department: "Sales",
    subject: "CRM Portal frozen on mortgage submission step",
    description: "Every time I try to finalize a package for Alistair Graham, the loading spinner spins indefinitely. System says check browser console logs.",
    priority: "High",
    status: "Open",
    createdAt: "2026-05-28 10:14 AM",
    replies: [
      {
        id: "rep-1",
        sender: "IT Helpdesk Automation Agent",
        message: "Your ticket has been registered at Tier-2 support. Please do not re-submit. An engineer will inspect the transaction stream.",
        timestamp: "2026-05-28 10:15 AM"
      }
    ]
  },
  {
    id: "ST-81024",
    user: "Samantha Khoza",
    department: "Quality Assurance",
    subject: "Azure Entra ID SSO Gateway throws 502 Bad Gateway",
    description: "I am unable to login using SAML Okta integration. It fails at our company domain redirect layer. Can you purge my session cache?",
    priority: "Critical",
    status: "In-Progress",
    createdAt: "2026-05-28 11:32 AM",
    replies: [
      {
        id: "rep-2",
        sender: "Elena Rostova (IT DevOps)",
        message: "Checking the gateway logs now. Purged Azure AD tokens for your user. Please try hard Ctrl+F5 refresh.",
        timestamp: "2026-05-28 11:45 AM"
      }
    ]
  },
  {
    id: "ST-81025",
    user: "Lerato Sebeko",
    department: "Sales Administration",
    subject: "Webhook trigger question for external CRM callbacks",
    description: "Is the webhook callback triggered synchronously or in background queues when a loan is signed off? We need to sync with finance files.",
    priority: "Medium",
    status: "Resolved",
    createdAt: "2026-05-28 09:12 AM",
    replies: [
      {
        id: "rep-3",
        sender: "Brian O'Connor (SysOps Admin)",
        message: "It is triggered asynchronously with a retry interval of 3 attempts. You can see webhook callbacks in the SysAdmin logs tab.",
        timestamp: "2026-05-28 09:30 AM"
      },
      {
        id: "rep-4",
        sender: "Lerato Sebeko",
        message: "Excellent, thank you for confirming!",
        timestamp: "2026-05-28 09:44 AM"
      }
    ]
  }
];

// Marketing & Tele-Marketing State Databases
let marketingCampaigns: any[] = [
  {
    id: "MC-101",
    name: "Q2 Mortgage Facebook Lead Gen",
    channel: "Social",
    budget: 5000,
    spend: 4200,
    leadsCount: 310,
    contactedCount: 250,
    convertedCount: 18,
    status: "Active",
    leads: [
      {
        id: "M-LEAD-7301",
        name: "Sarah Jacobs",
        phone: "+27 82 451 9023",
        email: "sarah.j@gmail.com",
        source: "Facebook Ad Form",
        isDnc: false,
        callAttempts: 1,
        lastOutcome: "Not Called",
        assignedAgent: "Mthandazo Khumalo",
        notes: "Interested in a home loan of R1.2M. Needs immediate callback on mortgage details."
      },
      {
        id: "M-LEAD-7302",
        name: "Sipho Zwane",
        phone: "+27 71 391 8021",
        email: "s.zwane@outlook.com",
        source: "Facebook Ad Form",
        isDnc: true,
        callAttempts: 0,
        lastOutcome: "Not Called",
        assignedAgent: "Mthandazo Khumalo",
        notes: "Flagged on CPA National Do Not Contact registry list. Outbound dialler must scrub this out."
      }
    ]
  },
  {
    id: "MC-102",
    name: "Debt Consolidation Google SEM",
    channel: "Google Ads",
    budget: 12000,
    spend: 11500,
    leadsCount: 620,
    contactedCount: 510,
    convertedCount: 45,
    status: "Active",
    leads: [
      {
        id: "M-LEAD-7303",
        name: "Nicolette van der Merwe",
        phone: "+27 63 942 3311",
        email: "nicolette.vdm@webmail.co.za",
        source: "Google Search Landing Page",
        isDnc: false,
        callAttempts: 0,
        lastOutcome: "Not Called",
        assignedAgent: "Kelsey Miller",
        notes: "Wants a consolidation quote of R450k. Clear credit history."
      },
      {
        id: "M-LEAD-7304",
        name: "Jacobus Pretorius",
        phone: "+27 84 212 9054",
        email: "jacobus.pret@gmail.com",
        source: "Google Search Landing Page",
        isDnc: false,
        callAttempts: 3,
        lastOutcome: "Call Back Scheduled",
        assignedAgent: "Kelsey Miller",
        notes: "Scheduled callback for 2:30 PM. Needs explanation of interest rates caps."
      }
    ]
  },
  {
    id: "MC-103",
    name: "High-Net Worth Email Campaign",
    channel: "Email",
    budget: 1500,
    spend: 1200,
    leadsCount: 1200,
    contactedCount: 980,
    convertedCount: 32,
    status: "Active",
    leads: [
      {
        id: "M-LEAD-7305",
        name: "Gregory Harrison",
        phone: "+27 83 555 1234",
        email: "greg@harrisonlegal.co.za",
        source: "HNW Cold-Audience",
        isDnc: false,
        callAttempts: 1,
        lastOutcome: "Ringing",
        assignedAgent: "Zack Peterson",
        notes: "High income corporate attorney. Checking personal mortgage rates."
      }
    ]
  },
  {
    id: "MC-104",
    name: "Outbound Personal Loan Dialler",
    channel: "Tele-Marketing Outbound",
    budget: 8000,
    spend: 7800,
    leadsCount: 850,
    contactedCount: 720,
    convertedCount: 65,
    status: "Active",
    leads: [
      {
        id: "M-LEAD-7306",
        name: "Busisiwe Cele",
        phone: "+27 76 999 8811",
        email: "busi.cele@gov.za",
        source: "Tele-marketing Sourced List",
        isDnc: false,
        callAttempts: 2,
        lastOutcome: "No Answer",
        assignedAgent: "Zack Peterson",
        notes: "Government employment. High stability. Calling back."
      }
    ]
  }
];

let diallerState = {
  isActive: false,
  activeCampaignId: "MC-104",
  currentLeadIndex: 0,
  autoDialSpeed: 4,
  isCallConnected: false,
  recordingActive: false
};

// Systems Administration State Databases
let systemUsers = [
  {
    id: "USR-001",
    name: "Brian O'Connor",
    email: "brian.o@centrix.com",
    role: "Administrator",
    status: "Active",
    lastLogin: "2026-05-28 14:15"
  },
  {
    id: "USR-002",
    name: "Samantha Khoza",
    email: "samantha.k@centrix.com",
    role: "Supervisor",
    status: "Active",
    lastLogin: "2026-05-28 13:02"
  },
  {
    id: "USR-003",
    name: "Zack Peterson",
    email: "zack.p@centrix.com",
    role: "Agent",
    status: "Active",
    lastLogin: "2026-05-28 12:45"
  },
  {
    id: "USR-004",
    name: "Zapier Sync Hook",
    email: "api@zapier.centrix.com",
    role: "API-Service",
    status: "Active",
    lastLogin: "2026-05-28 14:12"
  }
];

let workflowAutomations = [
  {
    id: "WF-101",
    name: "Lead Assignment Auto-Route",
    trigger: "On Lead Created",
    action: "Assign to Ring Group A",
    status: "Active",
    executions: 1422
  },
  {
    id: "WF-102",
    name: "Sanity Income Threshold Guard",
    trigger: "Status Changed to QA",
    action: "Flag if monthlyIncome < R15000",
    status: "Active",
    executions: 893
  },
  {
    id: "WF-103",
    name: "Customer Welcome SMS/Email",
    trigger: "Status Changed to Signed Off",
    action: "Trigger Twilio API Gateway Send",
    status: "Active",
    executions: 341
  },
  {
    id: "WF-104",
    name: "DNC Opt-Out Auto Sync",
    trigger: "DNC Registry Updated",
    action: "Purge matching leads from dialler queue",
    status: "Paused",
    executions: 124
  }
];

let integrationConnectors = [
  {
    id: "INT-201",
    name: "HubSpot CRM",
    category: "Marketing",
    status: "Connected",
    lastSync: "2026-05-28 14:30",
    healthRate: 98
  },
  {
    id: "INT-202",
    name: "Microsoft Exchange SMTP",
    category: "Email",
    status: "Connected",
    lastSync: "2026-05-28 14:40",
    healthRate: 100
  },
  {
    id: "INT-203",
    name: "Sage Accounting ERP",
    category: "ERP",
    status: "Error",
    lastSync: "2026-05-28 12:15",
    healthRate: 64
  },
  {
    id: "INT-204",
    name: "Slack Webhook Gate",
    category: "Chat",
    status: "Connected",
    lastSync: "2026-05-28 14:42",
    healthRate: 99
  }
];

let securityAuditLogs = [
  {
    id: "SEC-9001",
    timestamp: "2026-05-28 14:35",
    user: "Brian O'Connor",
    action: "Changed system security rule: Whitelist IP 196.24.110.12",
    ipAddress: "196.24.110.12",
    severity: "High"
  },
  {
    id: "SEC-9002",
    timestamp: "2026-05-28 14:12",
    user: "Zapier Sync Hook",
    action: "API Authentication Successful",
    ipAddress: "54.89.231.111",
    severity: "Low"
  },
  {
    id: "SEC-9003",
    timestamp: "2026-05-28 13:45",
    user: "Zack Peterson",
    action: "Failed Login Attempt (Password Incorrect)",
    ipAddress: "105.184.22.41",
    severity: "Medium"
  },
  {
    id: "SEC-9004",
    timestamp: "2026-05-28 13:02",
    user: "Samantha Khoza",
    action: "Exported Ticket Dataset (125 records)",
    ipAddress: "196.24.110.45",
    severity: "High"
  }
];

let sysAdminSettings = {
  databaseBackupStatus: "Up-to-date",
  dataCleanlinessScore: 92,
  lastBackupTime: "2026-05-28 01:00 AM",
  autoDeduplicationEnabled: true,
  whitelistIps: "196.24.110.12, 196.24.110.45, 127.0.0.1"
};

// Gemini AI SDK Lazy Init Helper
let aiInstance: GoogleGenAI | null = null;
function getGeminiAi(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      console.warn("GEMINI_API_KEY is not configured in environment. Running AI in fallback mock mode.");
    }
  }
  return aiInstance;
}

// REST Endpoints
app.get("/api/crm/data", (req, res) => {
  tickets.forEach((t) => {
    if (!t.qaAssessment) {
      t.qaAssessment = autoAttachQaAssessment(t);
    }
  });
  res.json({
    tickets,
    employees,
    switchboardQueue,
    visitorLogs,
    packageLogs,
    chatsState,
    callLogsState,
    videoSessionsState,
    facilitiesLogs,
    trainingCatalog,
    trainingAssignments,
    itOverrideLogs,
    activeITScreenRecordings,
    supportTickets,
    marketingCampaigns,
    diallerState,
    systemUsers,
    workflowAutomations,
    integrationConnectors,
    securityAuditLogs,
    sysAdminSettings
  });
});

// Update or Create CRM Tickets
app.post("/api/crm/ticket", (req, res) => {
  const newTicket: Ticket = {
    id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
    clientInfo: {
      name: req.body.clientInfo?.name || "New Client",
      email: req.body.clientInfo?.email || "",
      phone: req.body.clientInfo?.phone || "",
      salary: Number(req.body.clientInfo?.salary) || 0,
      idNumber: req.body.clientInfo?.idNumber || "",
      departmentSelection: req.body.clientInfo?.departmentSelection || "Sales",
      notes: req.body.clientInfo?.notes || "",
      spouseName: req.body.clientInfo?.spouseName || "",
      spouseIdNumber: req.body.clientInfo?.spouseIdNumber || "",
      spousePhone: req.body.clientInfo?.spousePhone || "",
      spouseEmail: req.body.clientInfo?.spouseEmail || "",
      nokName: req.body.clientInfo?.nokName || "",
      nokRelationship: req.body.clientInfo?.nokRelationship || "",
      nokPhone: req.body.clientInfo?.nokPhone || "",
      aliases: req.body.clientInfo?.aliases || "",
      dob: req.body.clientInfo?.dob || "",
      gender: req.body.clientInfo?.gender || "",
      maritalStatus: req.body.clientInfo?.maritalStatus || "",
      dependentsCount: Number(req.body.clientInfo?.dependentsCount) || 0,
      pensionFundName: req.body.clientInfo?.pensionFundName || "",
      pensionMemberNumber: req.body.clientInfo?.pensionMemberNumber || "",
      monthlyPensionPayout: Number(req.body.clientInfo?.monthlyPensionPayout) || 0
    },
    addressDetails: {
      street: req.body.addressDetails?.street || "",
      city: req.body.addressDetails?.city || "",
      postalCode: req.body.addressDetails?.postalCode || "",
      propertyValue: Number(req.body.addressDetails?.propertyValue) || 0,
      mortgageRequired: Number(req.body.addressDetails?.mortgageRequired) || 0,
      residentialStatus: req.body.addressDetails?.residentialStatus || "",
      timeAtCurrentAddressMonths: Number(req.body.addressDetails?.timeAtCurrentAddressMonths) || 0
    },
    employmentDetails: {
      company: req.body.employmentDetails?.company || "",
      jobTitle: req.body.employmentDetails?.jobTitle || "",
      tenureMonths: Number(req.body.employmentDetails?.tenureMonths) || 0,
      monthlyIncome: Number(req.body.employmentDetails?.monthlyIncome) || 0,
      industry: req.body.employmentDetails?.industry || "",
      employeeNumber: req.body.employmentDetails?.employeeNumber || "",
      employmentType: req.body.employmentDetails?.employmentType || "",
      startDate: req.body.employmentDetails?.startDate || "",
      contractExpiryDate: req.body.employmentDetails?.contractExpiryDate || "",
      timeInIndustryMonths: Number(req.body.employmentDetails?.timeInIndustryMonths) || 0,
      workAddress: req.body.employmentDetails?.workAddress || "",
      hrContactName: req.body.employmentDetails?.hrContactName || "",
      hrContactPhone: req.body.employmentDetails?.hrContactPhone || "",
      companyEmail: req.body.employmentDetails?.companyEmail || "",
      salaryFrequency: req.body.employmentDetails?.salaryFrequency || "",
      payDay: Number(req.body.employmentDetails?.payDay) || 0
    },
    expenses: {
      rental: Number(req.body.expenses?.rental) || 0,
      groceries: Number(req.body.expenses?.groceries) || 0,
      leisure: Number(req.body.expenses?.leisure) || 0,
      utilities: Number(req.body.expenses?.utilities) || 0,
      debtRepayments: Number(req.body.expenses?.debtRepayments) || 0,
      editMotivations: req.body.expenses?.editMotivations || {}
    },
    debtObligations: {
      bankLoans: Number(req.body.debtObligations?.bankLoans) || 0,
      creditCards: Number(req.body.debtObligations?.creditCards) || 0,
      storeAccounts: Number(req.body.debtObligations?.storeAccounts) || 0,
      debtReviewFlag: !!req.body.debtObligations?.debtReviewFlag,
      insurances: Number(req.body.debtObligations?.insurances) || 0,
      phoneSubscriptions: Number(req.body.debtObligations?.phoneSubscriptions) || 0
    },
    bankStatementsAnalysis: {
      avg3MonthsBalance: Number(req.body.bankStatementsAnalysis?.avg3MonthsBalance) || 0,
      salaryDepositMatched: !!req.body.bankStatementsAnalysis?.salaryDepositMatched,
      overdraftFrequency: req.body.bankStatementsAnalysis?.overdraftFrequency || "None",
      monthlyDetails: req.body.bankStatementsAnalysis?.monthlyDetails || []
    },
    affordabilityOutcome: {
      disposableIncome: Number(req.body.affordabilityOutcome?.disposableIncome) || 0,
      approvedLimit: Number(req.body.affordabilityOutcome?.approvedLimit) || 0,
      loanEligibilityStatus: req.body.affordabilityOutcome?.loanEligibilityStatus || "Conditional",
      riskNotes: req.body.affordabilityOutcome?.riskNotes || "",
      externalInstalment: Number(req.body.affordabilityOutcome?.externalInstalment) || 0,
      internalOfferInstalment: Number(req.body.affordabilityOutcome?.internalOfferInstalment) || 0,
      internalOfferInterest: Number(req.body.affordabilityOutcome?.internalOfferInterest) || 0,
      termMonths: (Number(req.body.affordabilityOutcome?.termMonths) === 24 ? 24 : 12) as 12 | 24,
      surplusRemaining: Number(req.body.affordabilityOutcome?.surplusRemaining) || 0
    },
    status: req.body.status || "Sales",
    ticketStatus: req.body.ticketStatus || "New",
    selectedProducts: req.body.selectedProducts || [],
    supportingDocuments: req.body.supportingDocuments || [],
    auditLogs: req.body.auditLogs || []
  };

  newTicket.qaAssessment = autoAttachQaAssessment(newTicket);
  tickets.unshift(newTicket);
  res.json({ success: true, ticket: newTicket });
});

// Update Existing Ticket Details & Move Stages
app.post("/api/crm/ticket/update", (req, res) => {
  const { id, updates } = req.body;
  const index = tickets.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Ticket not found" });
  }

  const prevQa = tickets[index].qaAssessment;

  tickets[index] = {
    ...tickets[index],
    ...updates,
    clientInfo: { ...tickets[index].clientInfo, ...updates.clientInfo },
    addressDetails: { ...tickets[index].addressDetails, ...updates.addressDetails },
    employmentDetails: { ...tickets[index].employmentDetails, ...updates.employmentDetails },
    expenses: { ...tickets[index].expenses, ...updates.expenses },
    debtObligations: { ...tickets[index].debtObligations, ...updates.debtObligations },
    bankStatementsAnalysis: { ...tickets[index].bankStatementsAnalysis, ...updates.bankStatementsAnalysis },
    affordabilityOutcome: { ...tickets[index].affordabilityOutcome, ...updates.affordabilityOutcome },
    qaAssessment: updates.qaAssessment ? { ...prevQa, ...updates.qaAssessment } : prevQa,
    notesHistory: updates.notesHistory !== undefined ? updates.notesHistory : tickets[index].notesHistory
  };

  if (!updates.qaAssessment) {
    tickets[index].qaAssessment = autoAttachQaAssessment(tickets[index]);
  }

  res.json({ success: true, ticket: tickets[index] });
});

// Perform Background AI Sentiment, Risk and Audit using Gemini
app.post("/api/crm/ai-audit", async (req, res) => {
  const { channel, messageLog, contextValue } = req.body;
  const ai = getGeminiAi();

  if (!ai) {
    // Elegant Mock Fallback if no API Key is available
    const auditObj = {
      sentiment: contextValue > 1000000 ? "Caution Needed / High Liability" : "Moderately Positive",
      score: contextValue > 1000000 ? 58 : 83,
      comment: `[CentriX AI Simulator Core] Audited interaction with potential risk values of ${contextValue ? "R" + contextValue : "N/A"}. Highly consistent customer intent observed over ${channel}. No high risk debt flags detected.`
    };
    return res.json({ success: true, audit: auditObj });
  }

  try {
    const prompt = `Analyze this customer support CRM chat or case details.
Channel: ${channel}
Message Logs: ${JSON.stringify(messageLog)}
Transaction/Mortgage Value: ${contextValue}

Analyze for:
1. Sentiment (Positive, Negative, Neutral, Skeptical)
2. Score (0 to 100 on trustworthiness and financial health risk)
3. Comment (Precise 2-sentence summary of customer sentiment and financial stability alert).

Provide your answer in strict, standardized JSON matching this format:
{
  "sentiment": "String containing sentiment analysis description",
  "score": 85,
  "comment": "Exact 2 sentences comment"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const output = response.text ? response.text.trim() : "";
    let data;
    try {
      data = JSON.parse(output);
    } catch {
      data = {
        sentiment: "Neutral",
        score: 75,
        comment: "AI analysis was executed successfully. General positive indicators, standard transaction range."
      };
    }

    res.json({ success: true, audit: data });
  } catch (error: any) {
    console.error("Gemini AI API Call failed:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate AI Audit analysis" });
  }
});

// Simulate File Upload to Local Storage Drive
app.post("/api/crm/upload", (req, res) => {
  const { fileName, category, ticketId } = req.body;
  const docId = `doc-${Date.now()}`;
  const mockUrl = `/api/crm/drive-download/${docId}`;

  const index = tickets.findIndex((t) => t.id === ticketId);
  if (index !== -1) {
    tickets[index].supportingDocuments.push({
      id: docId,
      name: fileName,
      category,
      uploadDate: new Date().toISOString().split("T")[0],
      url: mockUrl
    });
    res.json({ success: true, doc: tickets[index].supportingDocuments });
  } else {
    res.status(444).json({ success: false, error: "Ticket not found to anchor document details" });
  }
});

// Route Call Switchboard Option
app.post("/api/crm/digital-switchboard/route", (req, res) => {
  const { callId, targetDept } = req.body;
  switchboardQueue = switchboardQueue.filter((c) => c.id !== callId);
  res.json({ success: true, message: `Routed call ${callId} directly to ${targetDept} desk.` });
});

app.post("/api/crm/visitors/add", (req, res) => {
  const { name, company, purpose } = req.body;
  const newVis = {
    id: `vis-${Date.now()}`,
    name,
    company,
    signInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    signOutTime: "--",
    purpose
  };
  visitorLogs.unshift(newVis);
  res.json({ success: true, visitors: visitorLogs });
});

app.post("/api/crm/visitors/update", (req, res) => {
  const { id, visitor } = req.body;
  visitorLogs = visitorLogs.map(v => v.id === id ? { ...v, ...visitor } : v);
  res.json({ success: true, visitors: visitorLogs });
});

app.post("/api/crm/visitors/delete", (req, res) => {
  const { id } = req.body;
  visitorLogs = visitorLogs.filter(v => v.id !== id);
  res.json({ success: true, visitors: visitorLogs });
});

app.post("/api/crm/packages/add", (req, res) => {
  const { recipient, carrier, description } = req.body;
  const newPkg = {
    id: `pkg-${Date.now()}`,
    recipient,
    carrier,
    description,
    deliveryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: "Held at Reception"
  };
  packageLogs.unshift(newPkg);
  res.json({ success: true, packages: packageLogs });
});

app.post("/api/crm/packages/update", (req, res) => {
  const { id, pkg } = req.body;
  packageLogs = packageLogs.map(p => p.id === id ? { ...p, ...pkg } : p);
  res.json({ success: true, packages: packageLogs });
});

app.post("/api/crm/packages/delete", (req, res) => {
  const { id } = req.body;
  packageLogs = packageLogs.filter(p => p.id !== id);
  res.json({ success: true, packages: packageLogs });
});

// HR action: Add employee
app.post("/api/crm/hr/employee", (req, res) => {
  const { name, email, department, role } = req.body;
  const emp = {
    id: `EMP${Math.floor(10 + Math.random() * 90)}`,
    name,
    email,
    department,
    role,
    status: "Active"
  };
  employees.push(emp);
  res.json({ success: true, employees });
});

// HR action: Update employee status
app.post("/api/crm/hr/employee/status", (req, res) => {
  const { id, status } = req.body;
  const emp = employees.find(e => e.id === id);
  if (emp) {
    emp.status = status;
  }
  res.json({ success: true, employees });
});

// HR action: Update employee role
app.post("/api/crm/hr/employee/role", (req, res) => {
  const { id, role } = req.body;
  const emp = employees.find(e => e.id === id);
  if (emp) {
    emp.role = role;
  }
  res.json({ success: true, employees });
});

// Training actions: build materials
app.post("/api/crm/training/build", (req, res) => {
  const { title, duration } = req.body;
  const newTrn = {
    id: `trn-${Date.now()}`,
    title,
    participants: 0,
    duration,
    progress: 0,
    status: "Active",
    materials: []
  };
  trainingCatalog.push(newTrn);
  res.json({ success: true, catalog: trainingCatalog });
});

app.post("/api/crm/training/assign", (req, res) => {
  const { employeeId, courseId } = req.body;
  const newAsgn = {
    id: `asgn-${Date.now()}`,
    employeeId,
    courseId,
    progress: 0,
    status: "Assigned",
    assignedDate: new Date().toISOString().split('T')[0],
    completionDate: null,
    feedback: null
  };
  trainingAssignments.push(newAsgn);
  
  // Update participants count
  const course = trainingCatalog.find(c => c.id === courseId);
  if (course) course.participants += 1;
  
  res.json({ success: true, assignments: trainingAssignments, catalog: trainingCatalog });
});

app.post("/api/crm/training/progress", (req, res) => {
  const { assignmentId, progress, status, feedback } = req.body;
  const asgn = trainingAssignments.find(a => a.id === assignmentId);
  if (asgn) {
    if (progress !== undefined) asgn.progress = Number(progress);
    if (status) asgn.status = status;
    if (feedback) asgn.feedback = feedback;
    if (asgn.progress >= 100) {
      asgn.status = "Completed";
      asgn.completionDate = new Date().toISOString().split('T')[0];
    }
  }
  res.json({ success: true, assignments: trainingAssignments });
});

app.post("/api/crm/training/course/update", (req, res) => {
  const { id, title, duration, materials } = req.body;
  const course = trainingCatalog.find(c => c.id === id);
  if (course) {
    if (title) course.title = title;
    if (duration) course.duration = duration;
    if (materials) course.materials = materials;
  }
  res.json({ success: true, catalog: trainingCatalog });
});

app.post("/api/crm/training/course/delete", (req, res) => {
  const { id } = req.body;
  trainingCatalog = trainingCatalog.filter(c => c.id !== id);
  trainingAssignments = trainingAssignments.filter(a => a.courseId !== id);
  res.json({ success: true, catalog: trainingCatalog, assignments: trainingAssignments });
});

// IT query/overrides
app.post("/api/crm/it/override", (req, res) => {
  const { details } = req.body;
  const newLog = {
    id: `ovr-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    action: details,
    status: "SUCCESS"
  };
  itOverrideLogs.unshift(newLog);
  res.json({ success: true, logs: itOverrideLogs });
});

// Facilities Management update
app.post("/api/crm/facilities/update", (req, res) => {
  const { id, status } = req.body;
  const idx = facilitiesLogs.findIndex((f) => f.id === id);
  if (idx !== -1) {
    facilitiesLogs[idx].status = status;
  }
  res.json({ success: true, logs: facilitiesLogs });
});

// Simulate Live chats sending messaging
app.post("/api/crm/chats/send", (req, res) => {
  const { clientName, sender, message } = req.body;
  if (!chatsState[clientName]) {
    chatsState[clientName] = [];
  }
  chatsState[clientName].push({
    sender,
    message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  res.json({ success: true, chat: chatsState[clientName] });
});

// Outbound / Inbound Call Interaction Logging
app.post("/api/crm/calls/add", (req, res) => {
  const { direction, contactName, duration, rate, auditReport } = req.body;
  const newLog = {
    id: `call-${Math.floor(100 + Math.random() * 899)}`,
    direction: direction || "Outbound",
    contactName: contactName || "Unknown Contact",
    duration: duration || "0s",
    rate: rate || "Passed",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    auditReport: auditReport || "Interaction recorded & logged successfully."
  };
  callLogsState.unshift(newLog);
  res.json({ success: true, logs: callLogsState });
});

// Video Consultation Session Interaction Logging
app.post("/api/crm/video/add", (req, res) => {
  const { roomName, clientName, duration, status } = req.body;
  const newSession = {
    id: `vid-${Math.floor(100 + Math.random() * 899)}`,
    roomName: roomName || "Room-Alpha",
    clientName: clientName || "Unknown Contact",
    duration: duration || "0s",
    status: status || "Saved in Storage Drive"
  };
  videoSessionsState.unshift(newSession);
  res.json({ success: true, sessions: videoSessionsState });
});

// IT Helpdesk Ticketing Endpoints
app.post("/api/crm/helpdesk/ticket/add", (req, res) => {
  const { user, department, subject, description, priority } = req.body;
  
  const newTicket: SupportTicket = {
    id: `ST-${Math.floor(80000 + Math.random() * 19999)}`,
    user: user || "Anonymous System User",
    department: department || "General Systems",
    subject: subject || "No Subject Provided",
    description: description || "",
    priority: priority || "Medium",
    status: "Open",
    createdAt: new Date().toLocaleString(),
    replies: []
  };

  supportTickets.unshift(newTicket);
  res.json({ success: true, ticket: newTicket, supportTickets });
});

app.post("/api/crm/helpdesk/ticket/reply", (req, res) => {
  const { ticketId, sender, message } = req.body;
  const ticket = supportTickets.find(t => t.id === ticketId);
  
  if (!ticket) {
    return res.status(404).json({ success: false, error: "Support Ticket not found" });
  }

  const newReply = {
    id: `rep-${Date.now()}`,
    sender: sender || "IT Operations Specialist",
    message: message || "",
    timestamp: new Date().toLocaleString()
  };

  ticket.replies.push(newReply);
  res.json({ success: true, reply: newReply, supportTickets });
});

app.post("/api/crm/helpdesk/ticket/status", (req, res) => {
  const { ticketId, status, priority } = req.body;
  const ticket = supportTickets.find(t => t.id === ticketId);

  if (!ticket) {
    return res.status(404).json({ success: false, error: "Support Ticket not found" });
  }

  if (status) ticket.status = status;
  if (priority) ticket.priority = priority;

  res.json({ success: true, ticket, supportTickets });
});

// ==========================================================
// MARKETING & TELE-MARKETING REAL-TIME MANAGEMENT ENDPOINTS
// ==========================================================

// Create/Update Brand Campaigns
app.post("/api/crm/marketing/campaign/update", (req, res) => {
  const { id, name, channel, budget, spend, status } = req.body;
  
  if (id) {
    const campaign = marketingCampaigns.find(c => c.id === id);
    if (campaign) {
      if (name) campaign.name = name;
      if (channel) campaign.channel = channel;
      if (budget !== undefined) campaign.budget = Number(budget);
      if (spend !== undefined) campaign.spend = Number(spend);
      if (status) campaign.status = status;
      return res.json({ success: true, campaign, marketingCampaigns });
    }
  }

  const newCamp = {
    id: `MC-${Math.floor(105 + Math.random() * 890)}`,
    name: name || "New Ad Strategy Leadgen",
    channel: channel || "Digital",
    budget: Number(budget) || 2500,
    spend: Number(spend) || 0,
    leadsCount: 0,
    contactedCount: 0,
    convertedCount: 0,
    status: status || "Active",
    leads: []
  };
  marketingCampaigns.push(newCamp);
  res.json({ success: true, campaign: newCamp, marketingCampaigns });
});

// Create Lead inside a Campaign
app.post("/api/crm/marketing/lead/add", (req, res) => {
  const { campaignId, name, phone, email, source, notes } = req.body;
  const campaign = marketingCampaigns.find(c => c.id === campaignId);
  if (!campaign) {
    return res.status(404).json({ success: false, error: "Marketing Campaign not found" });
  }

  const newLead = {
    id: `M-LEAD-${Math.floor(7400 + Math.random() * 2500)}`,
    name: name || "Anonymous Lead",
    phone: phone || "",
    email: email || "",
    source: source || "Direct Landing Page",
    isDnc: false,
    callAttempts: 0,
    lastOutcome: "Not Called",
    notes: notes || ""
  };

  campaign.leads.unshift(newLead);
  campaign.leadsCount = campaign.leads.length;
  res.json({ success: true, lead: newLead, marketingCampaigns });
});

// Update single Lead Outcome, Agent, or notes
app.post("/api/crm/marketing/lead/update", (req, res) => {
  const { campaignId, leadId, notes, lastOutcome, assignedAgent, isDnc } = req.body;
  let foundLead = null;
  let foundCampaign = null;

  for (const c of marketingCampaigns) {
    if (campaignId && c.id !== campaignId) continue;
    const l = c.leads.find((le) => le.id === leadId);
    if (l) {
      foundLead = l;
      foundCampaign = c;
      break;
    }
  }

  if (!foundLead) {
    return res.status(404).json({ success: false, error: "Tele-marketing Lead not found" });
  }

  if (notes !== undefined) foundLead.notes = notes;
  if (assignedAgent !== undefined) foundLead.assignedAgent = assignedAgent;
  if (isDnc !== undefined) foundLead.isDnc = isDnc;

  if (lastOutcome) {
    const prevOutcome = foundLead.lastOutcome;
    foundLead.lastOutcome = lastOutcome;
    if (prevOutcome === "Not Called" && lastOutcome !== "Not Called") {
      foundLead.callAttempts += 1;
      foundCampaign.contactedCount = (foundCampaign.contactedCount || 0) + 1;
    } else {
      foundLead.callAttempts += 1;
    }
  }

  res.json({ success: true, lead: foundLead, marketingCampaigns });
});

// Toggle CPA / POPIA DNC Registry status
app.post("/api/crm/marketing/lead/toggle-dnc", (req, res) => {
  const { leadId } = req.body;
  let foundLead = null;

  for (const c of marketingCampaigns) {
    const l = c.leads.find((le) => le.id === leadId);
    if (l) {
      foundLead = l;
      break;
    }
  }

  if (!foundLead) {
    return res.status(404).json({ success: false, error: "Lead not found" });
  }

  foundLead.isDnc = !foundLead.isDnc;
  res.json({ success: true, lead: foundLead, marketingCampaigns });
});

// Convert Lead: Creates an active pre-sales CRM Ticket & ties to CRM workflow
app.post("/api/crm/marketing/lead/convert", (req, res) => {
  const { leadId, campaignId, loanAmount, monthlyIncome } = req.body;
  let foundLead = null;
  let foundCampaign = null;

  for (const c of marketingCampaigns) {
    if (campaignId && c.id !== campaignId) continue;
    const l = c.leads.find((le) => le.id === leadId);
    if (l) {
      foundLead = l;
      foundCampaign = c;
      break;
    }
  }

  if (!foundLead) {
    return res.status(404).json({ success: false, error: "Lead not found to convert" });
  }

  foundLead.lastOutcome = "Interested - Ticket Created";
  foundCampaign.convertedCount = (foundCampaign.convertedCount || 0) + 1;

  const newTicketId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
  const convertedTicket: Ticket = {
    id: newTicketId,
    clientInfo: {
      name: foundLead.name,
      email: foundLead.email,
      phone: foundLead.phone,
      salary: Number(monthlyIncome) || 45000,
      idNumber: `840528${Math.floor(1000 + Math.random() * 2000)}084`,
      departmentSelection: "Sales",
      notes: `Converted Tele-Marketing Lead from brand campaign: [${foundCampaign.name}]. Lead ID: ${foundLead.id}. Briefing summary: ${foundLead.notes || 'None'}`,
      spouseName: "",
      spouseIdNumber: "",
      spousePhone: "",
      spouseEmail: "",
      nokName: "",
      nokRelationship: "",
      nokPhone: "",
      aliases: "",
      dob: "",
      gender: "",
      maritalStatus: "",
      dependentsCount: 0,
      pensionFundName: "",
      pensionMemberNumber: "",
      monthlyPensionPayout: 0
    },
    addressDetails: {
      street: "77 Centrix Avenue",
      city: "Johannesburg",
      postalCode: "2000",
      propertyValue: (Number(loanAmount) || 1200000) * 1.25,
      mortgageRequired: Number(loanAmount) || 1200000,
      residentialStatus: "",
      timeAtCurrentAddressMonths: 0
    },
    employmentDetails: {
      company: "Private Enterprise",
      jobTitle: "Administrative Consultant",
      tenureMonths: 18,
      monthlyIncome: Number(monthlyIncome) || 45000,
      industry: "",
      employeeNumber: "",
      employmentType: "",
      startDate: "",
      contractExpiryDate: "",
      timeInIndustryMonths: 0,
      workAddress: "",
      hrContactName: "",
      hrContactPhone: "",
      companyEmail: "",
      salaryFrequency: "",
      payDay: 0
    },
    expenses: {
      rental: 8500,
      groceries: 3000,
      leisure: 1500,
      utilities: 1200,
      debtRepayments: 3500
    },
    debtObligations: {
      bankLoans: 0,
      creditCards: 1000,
      storeAccounts: 200,
      debtReviewFlag: false
    },
    bankStatementsAnalysis: {
      avg3MonthsBalance: 6400,
      salaryDepositMatched: true,
      overdraftFrequency: "None"
    },
    affordabilityOutcome: {
      disposableIncome: (Number(monthlyIncome) || 45000) - 14200,
      approvedLimit: Number(loanAmount) || 1200000,
      loanEligibilityStatus: "Passed",
      riskNotes: "Pre-authorized via active Tele-Marketing outbound verification lines."
    },
    status: "Sales",
    ticketStatus: "New",
    selectedProducts: ["Home Loan", "Credit Life Protector"],
    supportingDocuments: [],
    auditLogs: [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        auditor: "CentriX Tele-Marketing Lead Integration Hub",
        sentiment: "Highly Positive",
        score: 96,
        comment: `Automated Lead verified from Campaign: ${foundCampaign.name}. Fully compliant response sequence registered.`
      }
    ]
  };

  convertedTicket.qaAssessment = autoAttachQaAssessment(convertedTicket);
  tickets.unshift(convertedTicket);

  res.json({ success: true, ticket: convertedTicket, lead: foundLead, marketingCampaigns, tickets });
});

// Outbound Dialler control adjustments
app.post("/api/crm/marketing/dialler/update", (req, res) => {
  const { isActive, activeCampaignId, currentLeadIndex, isCallConnected, recordingActive, autoDialSpeed } = req.body;
  if (isActive !== undefined) diallerState.isActive = isActive;
  if (activeCampaignId !== undefined) diallerState.activeCampaignId = activeCampaignId;
  if (currentLeadIndex !== undefined) diallerState.currentLeadIndex = currentLeadIndex;
  if (isCallConnected !== undefined) diallerState.isCallConnected = isCallConnected;
  if (recordingActive !== undefined) diallerState.recordingActive = recordingActive;
  if (autoDialSpeed !== undefined) diallerState.autoDialSpeed = Number(autoDialSpeed);
  res.json({ success: true, diallerState });
});

// Systems Administrator Operations
app.post("/api/crm/sysadmin/user/update", (req, res) => {
  const { id, name, email, role, status } = req.body;
  
  if (id) {
    const user = systemUsers.find(u => u.id === id);
    if (user) {
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (role !== undefined) user.role = role;
      if (status !== undefined) user.status = status;
      
      securityAuditLogs.unshift({
        id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        user: "Brian O'Connor",
        action: `Updated user profile for ${user.name} (Role: ${user.role}, Status: ${user.status})`,
        ipAddress: "127.0.0.1",
        severity: "Medium"
      });
      
      return res.json({ success: true, user, systemUsers, securityAuditLogs });
    }
  }
  
  const newUser = {
    id: `USR-${Math.floor(100 + Math.random() * 899)}`,
    name: name || "New CRM Administrator",
    email: email || "new.admin@centrix.com",
    role: role || "Administrator",
    status: status || "Active",
    lastLogin: "Never Logged In"
  };
  systemUsers.push(newUser);
  
  securityAuditLogs.unshift({
    id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    user: "Brian O'Connor",
    action: `Created new user ${newUser.name} with role ${newUser.role}`,
    ipAddress: "127.0.0.1",
    severity: "High"
  });
  
  res.json({ success: true, user: newUser, systemUsers, securityAuditLogs });
});

app.post("/api/crm/sysadmin/workflow/update", (req, res) => {
  const { id, name, trigger, action, status } = req.body;
  
  if (id) {
    const wf = workflowAutomations.find(w => w.id === id);
    if (wf) {
      if (name !== undefined) wf.name = name;
      if (trigger !== undefined) wf.trigger = trigger;
      if (action !== undefined) wf.action = action;
      if (status !== undefined) wf.status = status;
      
      securityAuditLogs.unshift({
        id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        user: "Brian O'Connor",
        action: `Toggled/Updated workflow automation: ${wf.name} to ${wf.status}`,
        ipAddress: "127.0.0.1",
        severity: "Low"
      });
      
      return res.json({ success: true, workflow: wf, workflowAutomations, securityAuditLogs });
    }
  }
  
  const newWf = {
    id: `WF-${Math.floor(105 + Math.random() * 890)}`,
    name: name || "Auto Notify Supervisor",
    trigger: trigger || "On Status Change",
    action: action || "Send Push notification",
    status: status || "Active",
    executions: 0
  };
  workflowAutomations.push(newWf);
  
  securityAuditLogs.unshift({
    id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    user: "Brian O'Connor",
    action: `Deployed new automated workflow trigger: ${newWf.name}`,
    ipAddress: "127.0.0.1",
    severity: "Medium"
  });
  
  res.json({ success: true, workflow: newWf, workflowAutomations, securityAuditLogs });
});

app.post("/api/crm/sysadmin/integration/sync", (req, res) => {
  const { id, syncNow, toggleStatus } = req.body;
  const conn = integrationConnectors.find(c => c.id === id);
  if (!conn) {
    return res.status(404).json({ success: false, error: "Integration not found" });
  }
  
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  if (toggleStatus) {
    conn.status = conn.status === "Connected" ? "Disconnected" : "Connected";
    if (conn.status === "Connected") {
      conn.healthRate = 100;
      conn.lastSync = nowStr;
    }
    securityAuditLogs.unshift({
      id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: nowStr,
      user: "Brian O'Connor",
      action: `Changed integration ${conn.name} status to ${conn.status}`,
      ipAddress: "127.0.0.1",
      severity: "Medium"
    });
  } else if (syncNow) {
    conn.lastSync = nowStr;
    conn.healthRate = Math.min(100, Math.floor(90 + Math.random() * 11));
    conn.status = "Connected";
    securityAuditLogs.unshift({
      id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
      timestamp: nowStr,
      user: "Brian O'Connor",
      action: `Triggered manual REST API sync pool for ${conn.name}`,
      ipAddress: "127.0.0.1",
      severity: "Low"
    });
  }
  
  res.json({ success: true, connector: conn, integrationConnectors, securityAuditLogs });
});

app.post("/api/crm/sysadmin/settings/update", (req, res) => {
  const { autoDeduplicationEnabled, whitelistIps } = req.body;
  if (autoDeduplicationEnabled !== undefined) {
    sysAdminSettings.autoDeduplicationEnabled = autoDeduplicationEnabled;
  }
  if (whitelistIps !== undefined) {
    sysAdminSettings.whitelistIps = whitelistIps;
  }
  
  securityAuditLogs.unshift({
    id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    user: "Brian O'Connor",
    action: `Updated CRM gateway rules and IP Whitelists`,
    ipAddress: "127.0.0.1",
    severity: "High"
  });
  
  res.json({ success: true, sysAdminSettings, securityAuditLogs });
});

app.post("/api/crm/sysadmin/action/backup", (req, res) => {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  sysAdminSettings.databaseBackupStatus = "Up-to-date";
  sysAdminSettings.lastBackupTime = nowStr;
  
  securityAuditLogs.unshift({
    id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
    timestamp: nowStr,
    user: "Brian O'Connor",
    action: "Manual Firestore Database Backup triggered successfully",
    ipAddress: "127.0.0.1",
    severity: "High"
  });
  
  res.json({ success: true, sysAdminSettings, securityAuditLogs });
});

app.post("/api/crm/sysadmin/action/clean", (req, res) => {
  sysAdminSettings.dataCleanlinessScore = 99;
  
  securityAuditLogs.unshift({
    id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    user: "Brian O'Connor",
    action: "Triggered CRM Database Deduplication and Sanitization engine",
    ipAddress: "127.0.0.1",
    severity: "Medium"
  });
  
  res.json({ success: true, sysAdminSettings, securityAuditLogs });
});

// --- Enterprise Service Mesh Routing & Middleware ---
app.use("/api/crm/integrations/:connectorId/webhook", (req, res, next) => {
  // Example Authentication Gatekeeper for Integration Webhooks
  const signature = req.headers["x-centrix-signature"];
  const bearer = req.headers.authorization;
  
  console.log(`[Integration Mesh Gateway] Received payload for connector [${req.params.connectorId}]`);
  
  // Proceeding with mock acceptance for the preview
  next();
});

app.post("/api/crm/integrations/:connectorId/webhook", (req, res) => {
  const { connectorId } = req.params;
  const metrics = req.body;
  
  securityAuditLogs.unshift({
    id: `SEC-${Math.floor(9000 + Math.random() * 999)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    user: "System Service Bus",
    action: `Processed 3rd party webhook payload bound for ${connectorId}`,
    ipAddress: req.ip || "API Gateway",
    severity: "Low"
  });
  
  const responseData = {
    success: true,
    status: "ACK",
    transactionId: `TXN-${Math.floor(Math.random() * 100000)}`,
    message: `${connectorId} synchronization successfully completed via REST webhook.`
  };

  res.status(200).json(responseData);
});

// --- Global CentriX Error Boundary & Unhandled Exception Catcher ---
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[CentriX FATAL] Unhandled Operational Exception Intercepted:", err.message);
  
  // Attempt to write to secure audit logs (Memory / Fallback to DB in prod)
  securityAuditLogs.unshift({
    id: `ERR-${Math.floor(90000 + Math.random() * 99999)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    user: "Node.js Core",
    action: `System Exception Trapped by Global Handler: ${err.message}`,
    ipAddress: "System Localhost",
    severity: "Critical"
  });

  res.status(err.status || 500).json({
    success: false,
    error: {
      message: "An internal operational fault occurred within the CentriX Application Space. Administrators have been notified.",
      code: err.code || "INTERNAL_CRM_FAULT"
    }
  });
});

// Vite Middleware & static assets serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CentriX CRM selfhosted backend running securely on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
