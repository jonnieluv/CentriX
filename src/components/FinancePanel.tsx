import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Coins, CreditCard, Download, Search, Plus, FileText, CheckCircle2, 
  AlertCircle, TrendingUp, RefreshCw, Sliders, Layers, Activity, 
  Sparkles, DollarSign, Filter, Calendar, ChevronRight, ChevronDown, 
  ChevronUp, Trash2, Briefcase, ShieldAlert, Check, X, FileCheck, 
  Eye, Settings, Upload, Clock, ArrowUpRight, ArrowDownLeft, Wallet, 
  Percent, Award, ArrowLeftRight, ExternalLink, ShieldCheck
} from "lucide-react";
import { Ticket } from "../types";

// --- Types ---
interface Transaction {
  id: string;
  date: string;
  description: string;
  institution: string;
  amount: number;
  type: "inflow" | "outflow";
  category: string;
  status: "unreconciled" | "reconciled";
  aiSuggestion?: {
    matchName: string;
    confidence: number; // e.g. 98
    reason: string;
    linkedId?: string;
  };
  comments?: string[];
}

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  date: string;
  dueDate: string;
  amount: number;
  subtotal: number;
  tax: number;
  currency: string;
  status: "Draft" | "Sent" | "Overdue" | "Paid";
  items: Array<{ description: string; quantity: number; price: number }>;
  comments?: string[];
}

interface Expense {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  category: string;
  status: "Pending" | "Approved" | "Declined";
  receiptUrl?: string;
  submittedBy: string;
  comments?: string[];
}

interface ProductStock {
  id: string;
  name: string;
  sku: string;
  stockLevel: number;
  reorderLevel: number;
  unitCost: number;
  retailPrice: number;
  comments?: string[];
}

interface ProjectCosting {
  id: string;
  name: string;
  client: string;
  budget: number;
  actualCost: number;
  status: "On Track" | "At Risk" | "Completed";
  tasks: number;
}

interface FinancePanelProps {
  tickets?: Ticket[];
  setTickets?: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

export default function FinancePanel({ tickets = [], setTickets }: FinancePanelProps) {
  const [activeTab, setActiveTab] = useState<
    "reconciliation" | "invoices" | "expenses" | "inventory" | "reporting" | "currency" | "addons" | "salesPayments"
  >("reconciliation");

  // --- Sub-level filter states ---
  const [reconFilter, setReconFilter] = useState<"all" | "unreconciled" | "reconciled">("unreconciled");
  const [invoiceFilter, setInvoiceFilter] = useState<"All" | "Draft" | "Sent" | "Overdue" | "Paid">("All");
  const [selectedPlan, setSelectedPlan] = useState<"Early" | "Growing" | "Advanced">("Growing");

  // --- Search query states ---
  const [searchTerm, setSearchTerm] = useState("");

  // Reset search filter on tab transfer to prevent list-empty states
  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  // --- Modals ---
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // --- Drill-down States for Reports ---
  const [drillDownItem, setDrillDownItem] = useState<{ name: string; value: number; type: "P&L" | "Balance Sheet"; details: Array<{ desc: string; date: string; value: number }> } | null>(null);

  // --- Mobile App Mode Simulation Toggle ---
  const [isMobileMode, setIsMobileMode] = useState(false);

  // --- Toast Notice ---
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // --- Dynamic Records Amending & Comments ---
  const [editRecord, setEditRecord] = useState<{
    type: "transaction" | "invoice" | "expense" | "product";
    id: string;
    data: any;
  } | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  const handleUpdateEditField = (field: string, value: any) => {
    if (!editRecord) return;
    setEditRecord(prev => {
      if (!prev) return null;
      return {
        ...prev,
        data: {
          ...prev.data,
          [field]: value
        }
      };
    });
  };

  const handleAddCommentToEditRecord = () => {
    if (!newCommentText.trim() || !editRecord) return;
    const author = "Finance Auditor";
    const timestamp = new Date().toLocaleTimeString();
    const newCommentString = `[${timestamp}] ${author}: ${newCommentText}`;
    
    setEditRecord(prev => {
      if (!prev) return null;
      const currentComments = prev.data.comments || [];
      return {
        ...prev,
        data: {
          ...prev.data,
          comments: [...currentComments, newCommentString]
        }
      };
    });
    setNewCommentText("");
  };

  const handleApplyAmends = () => {
    if (!editRecord) return;
    const { type, id, data } = editRecord;

    if (data && data.isSalesTicketMutate) {
      if (setTickets) {
        setTickets(prev => prev.map(t => {
          if (t.id === data.id) {
            const updatedComments = data.comments || [];
            // Use the last comment as the CRM remarks
            const remarksText = updatedComments.length > 0 
              ? updatedComments[updatedComments.length - 1].replace(/\[.*?\]\s*Finance Auditor:\s*/, "") 
              : t.remarks;
            return {
              ...t,
              clientInfo: {
                ...t.clientInfo,
                name: data.clientName,
                email: data.clientEmail
              },
              remarks: remarksText
            };
          }
          return t;
        }));
        showToast(`CRM Client ${data.clientName} information successfully updated.`);
      } else {
        showToast("Dynamic CRM syncing not possible: pipeline is offline.");
      }
      setEditRecord(null);
      return;
    }

    if (type === "transaction") {
      setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      showToast(`Transaction ${id} successfully amended & comments updated.`);
    } else if (type === "invoice") {
      setInvoices(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      showToast(`Invoice ${id} successfully amended & comments updated.`);
    } else if (type === "expense") {
      setExpenses(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      showToast(`Expense claim ${id} successfully amended & comments updated.`);
    } else if (type === "product") {
      setProducts(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      showToast(`Product stock ${id} successfully amended.`);
    }

    setEditRecord(null);
  };

  // --- Initial mock data ---
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "TX-1001",
      date: "2026-06-18",
      description: "Direct Deposit Inbound #STRIPE-40291",
      institution: "Silicon Valley Bank (SVB)",
      amount: 4500.0,
      type: "inflow",
      category: "SaaS Inflow",
      status: "unreconciled",
      aiSuggestion: {
        matchName: "Invoice #INV-2026-041",
        confidence: 99,
        reason: "Exact amount matched with open digital invoice sent to Acme Corp.",
        linkedId: "INV-2026-041"
      }
    },
    {
      id: "TX-1002",
      date: "2026-06-17",
      description: "AWS cloud services bill billing-38294",
      institution: "First National Bank",
      amount: 1420.5,
      type: "outflow",
      category: "AWS Cloud Hosting Expense",
      status: "unreconciled",
      aiSuggestion: {
        matchName: "Pending Auto-Debit Authorization #AWS-JUNE",
        confidence: 95,
        reason: "Recurring monthly vendor footprint matches IT Infrastructure forecast.",
        linkedId: "EXP-904"
      }
    },
    {
      id: "TX-1003",
      date: "2026-06-16",
      description: "Deposit - Paypal Transfer J. Jenkins",
      institution: "Silicon Valley Bank (SVB)",
      amount: 120.0,
      type: "inflow",
      category: "Services Revenue",
      status: "reconciled"
    },
    {
      id: "TX-1004",
      date: "2026-06-15",
      description: "Office Depot South Africa purchase Ref: 4402",
      institution: "Standard Bank Business",
      amount: 345.9,
      type: "outflow",
      category: "Company Equipment / Stationers",
      status: "unreconciled",
      aiSuggestion: {
        matchName: "Office Supplies Claim (CEO Admin Group)",
        confidence: 88,
        reason: "Matching expense report subtask draft filed by Sarah J. yesterday."
      }
    },
    {
      id: "TX-1005",
      date: "2026-06-14",
      description: "Fidelity Web Hosting SLA Renew",
      institution: "Standard Bank Business",
      amount: 49.0,
      type: "outflow",
      category: "Subscription Software",
      status: "reconciled"
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-2026-041",
      clientName: "Acme Corp Ltd",
      clientEmail: "billing@acme.com",
      date: "2026-06-10",
      dueDate: "2026-06-25",
      amount: 4500.0,
      subtotal: 4100.0,
      tax: 400.0,
      currency: "USD",
      status: "Sent",
      items: [
        { description: "CentriX Platform Core Licence (Enterprise)", quantity: 1, price: 3500.0 },
        { description: "Custom Compliance Setup Support Hour Suite", quantity: 3, price: 200.0 }
      ]
    },
    {
      id: "INV-2026-042",
      clientName: "Remington Global",
      clientEmail: "invoice@remington.co",
      date: "2026-06-12",
      dueDate: "2026-06-20",
      amount: 2150.0,
      subtotal: 1950.0,
      tax: 200.0,
      currency: "USD",
      status: "Sent",
      items: [
        { description: "SysAdmin SLA Advisory Package B4", quantity: 1, price: 1950.0 }
      ]
    },
    {
      id: "INV-2026-043",
      clientName: "Johannesburg Water Solutions",
      clientEmail: "procure@jwater.co.za",
      date: "2026-06-01",
      dueDate: "2026-06-15",
      amount: 7200.0,
      subtotal: 6545.0,
      tax: 655.0,
      currency: "USD",
      status: "Overdue",
      items: [
        { description: "PopIA Security Hardening Support System", quantity: 1, price: 6545.0 }
      ]
    },
    {
      id: "INV-2026-044",
      clientName: "Apex Digital Solutions",
      clientEmail: "accounts@apex.tech",
      date: "2026-06-15",
      dueDate: "2026-07-15",
      amount: 980.0,
      subtotal: 890.0,
      tax: 90.0,
      currency: "USD",
      status: "Draft",
      items: [
        { description: "Standard L&D Onboarding Curriculum API seat", quantity: 5, price: 178.0 }
      ]
    }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "EXP-901", merchant: "Zapper Cape Town Café", date: "2026-06-18", amount: 45.5, category: "Business Lunch / Meals", status: "Pending", submittedBy: "Jonathan Sneller" },
    { id: "EXP-902", merchant: "Uber Rides Ltd", date: "2026-06-15", amount: 32.1, category: "Ground Transport", status: "Approved", submittedBy: "Ashraf Patel" },
    { id: "EXP-903", merchant: "Amazon Web Services Inc", date: "2026-06-01", amount: 1420.5, category: "AWS Cloud Hosting Expense", status: "Pending", submittedBy: "Information & Technology" },
    { id: "EXP-904", merchant: "FlySafair Corporate Booking", date: "2026-05-28", amount: 289.4, category: "Travel Airfare", status: "Approved", submittedBy: "Sarah Jenkins" }
  ]);

  const [products, setProducts] = useState<ProductStock[]>([
    { id: "PRD-201", name: "CentriX Router Pro X100", sku: "CX-RTE-X100", stockLevel: 84, reorderLevel: 25, unitCost: 120.0, retailPrice: 249.0 },
    { id: "PRD-202", name: "Enterprise Fibre Node Terminal", sku: "CX-FIB-TERM", stockLevel: 14, reorderLevel: 15, unitCost: 45.0, retailPrice: 95.0 },
    { id: "PRD-203", name: "PoPIA Encrypted Smart Drive 2TB", sku: "CX-SEC-DRV2", stockLevel: 120, reorderLevel: 40, unitCost: 65.0, retailPrice: 150.0 },
    { id: "PRD-204", name: "CRM Access Tokens (Physical Bundle)", sku: "CX-CRM-TOK5", stockLevel: 9, reorderLevel: 10, unitCost: 5.0, retailPrice: 25.0 }
  ]);

  const [projects, setProjects] = useState<ProjectCosting[]>([
    { id: "PRJ-901", name: "Remington Systems Deployment", client: "Remington Global", budget: 15000, actualCost: 11450, status: "On Track", tasks: 24 },
    { id: "PRJ-902", name: "Johannesburg Water Security Protocol", client: "Johannesburg Water", budget: 45000, actualCost: 42300, status: "At Risk", tasks: 18 },
    { id: "PRJ-903", name: "Acme Cloud Tenant Setup", client: "Acme Corp Ltd", budget: 8500, actualCost: 3200, status: "On Track", tasks: 8 }
  ]);

  // --- Realtime calculations ---
  const totalAmountReceivable = invoices
    .filter(inv => inv.status === "Sent" || inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalAmountPaid = invoices
    .filter(inv => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalUnreconciledBankCount = transactions.filter(tx => tx.status === "unreconciled").length;

  const currentMonthInflow = transactions
    .filter(tx => tx.type === "inflow" && tx.status === "reconciled")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentMonthOutflow = transactions
    .filter(tx => tx.type === "outflow" && tx.status === "reconciled")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // --- Invoicing Create State ---
  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    clientEmail: "",
    dueDate: "",
    currency: "USD",
    items: [{ description: "", quantity: 1, price: 0 }]
  });

  // --- Expense Hub Form State ---
  const [newExpense, setNewExpense] = useState({
    merchant: "",
    amount: "",
    category: "Business Lunch / Meals",
    submittedBy: "Default Operator"
  });

  // --- Receipt scanner mockup ---
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);

  // --- Reconcile logic ---
  const handleReconcile = (txId: string, customMatch?: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        showToast(`Successfully reconciled transaction: ${tx.description} with ${customMatch || tx.aiSuggestion?.matchName || "Direct Ledger Match"}.`);
        return { ...tx, status: "reconciled" };
      }
      return tx;
    }));
  };

  const handleAutoReconcileAll = () => {
    let count = 0;
    setTransactions(prev => prev.map(tx => {
      if (tx.status === "unreconciled" && tx.aiSuggestion) {
        count++;
        // If it was linked to an invoice, let's mark that invoice paid
        if (tx.aiSuggestion.linkedId) {
          setInvoices(invs => invs.map(i => i.id === tx.aiSuggestion?.linkedId ? { ...i, status: "Paid" } : i));
        }
        return { ...tx, status: "reconciled" };
      }
      return tx;
    }));
    showToast(`AI-driven reconciliation complete! Reconciled ${count} transactions.`);
  };

  // --- Invoicing Actions ---
  const handleAddInvoiceItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, price: 0 }]
    }));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.clientName || !newInvoice.clientEmail) {
      showToast("Please provide client name and email.");
      return;
    }

    const calculatedSubtotal = newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const calculatedTax = parseFloat((calculatedSubtotal * 0.15).toFixed(2));
    const finalAmount = calculatedSubtotal + calculatedTax;

    const invoice: Invoice = {
      id: `INV-2026-${Math.floor(Math.random() * 900 + 100)}`,
      clientName: newInvoice.clientName,
      clientEmail: newInvoice.clientEmail,
      date: new Date().toISOString().split("T")[0],
      dueDate: newInvoice.dueDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
      items: newInvoice.items,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      amount: finalAmount,
      currency: newInvoice.currency,
      status: "Sent"
    };

    setInvoices(prev => [invoice, ...prev]);
    setIsInvoiceModalOpen(false);
    setNewInvoice({
      clientName: "",
      clientEmail: "",
      dueDate: "",
      currency: "USD",
      items: [{ description: "", quantity: 1, price: 0 }]
    });
    showToast(`Invoice ${invoice.id} custom drafted & instantly transmitted.`);
  };

  const handleSimulatePayment = (id: string, gateway: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        showToast(`Stripe Integration triggered for ${inv.clientName}. Simulated checkout complete via ${gateway}! Status is now PAID.`);
        return { ...inv, status: "Paid" };
      }
      return inv;
    }));
  };

  // --- Receipt Capture Simulation ---
  const handleFileChangeSimulation = () => {
    setReceiptLoading(true);
    setOcrSuccess(false);
    setTimeout(() => {
      setReceiptLoading(false);
      setOcrSuccess(true);
      setNewExpense({
        merchant: "Sandton Convention Center Parking",
        amount: "85.00",
        category: "Travel Ground Transport",
        submittedBy: "Sarah Jenkins"
      });
      showToast("AI Receipt Capture OCR successfully extracted metadata!");
    }, 1200);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.merchant || !newExpense.amount) {
      showToast("Please write merchant and amount.");
      return;
    }

    const exp: Expense = {
      id: `EXP-${Math.floor(Math.random() * 900 + 100)}`,
      merchant: newExpense.merchant,
      date: new Date().toISOString().split("T")[0],
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      status: "Pending",
      submittedBy: newExpense.submittedBy || "System Operator"
    };

    setExpenses(prev => [exp, ...prev]);
    setNewExpense({
      merchant: "",
      amount: "",
      category: "Business Lunch / Meals",
      submittedBy: "Default Operator"
    });
    setOcrSuccess(false);
    setIsExpenseModalOpen(false);
    showToast(`Expense claim registered for ${exp.merchant} (${exp.amount}). awaiting review.`);
  };

  const handleActionExpense = (id: string, newStatus: "Approved" | "Declined") => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        showToast(`Expense ${exp.id} marked ${newStatus.toUpperCase()}.`);
        
        if (newStatus === "Approved") {
          // Add matching ledger transaction to transactions automatically
          const newTxId = `TX-${Math.floor(Math.random() * 9000 + 1000)}`;
          const newTx: Transaction = {
            id: newTxId,
            date: exp.date || new Date().toISOString().split("T")[0],
            description: `Expense Reimbursement: ${exp.merchant}`,
            institution: "General Operating Cash",
            amount: exp.amount,
            type: "outflow",
            category: exp.category,
            status: "reconciled" // Automatically parsed
          };
          setTransactions(tPrev => [newTx, ...tPrev]);
          showToast(`Expense Approved & Posted to General Ledger Cash Desk (Posted transaction ${newTxId})`);
        }
        
        return { ...exp, status: newStatus };
      }
      return exp;
    }));
  };

  // --- Currency converter simulation ---
  const [conversionState, setConversionState] = useState({
    amount: "1000",
    from: "USD",
    to: "EUR",
    result: 921.20
  });

  const currencyRates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    ZAR: 18.15
  };

  const handleConvertCurrency = (amt: string, from: string, to: string) => {
    const val = parseFloat(amt) || 0;
    const usdValue = val / currencyRates[from];
    const converted = usdValue * currencyRates[to];
    setConversionState({
      amount: amt,
      from,
      to,
      result: parseFloat(converted.toFixed(2))
    });
  };

  // --- Stock adjustment ---
  const handleStockAdjustment = (id: string, newLevel: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, stockLevel: newLevel };
      }
      return p;
    }));
  };

  if (isMobileMode) {
    return (
      <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left font-sans">
        
        {/* Toast alert system */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 z-50 text-xs w-96 font-medium"
            >
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></div>
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header to toggle back */}
        <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-black text-[#a3e635] bg-lime-950 px-2 py-0.5 rounded">CentriX OS Mobile v1.2</span>
            <h2 className="text-base font-black text-slate-800 dark:text-white mt-1">Mobile Interface Simulator</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMode(false)}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-wider"
          >
            🖥️ Return to Desktop View
          </button>
        </div>

        {/* Bezel frame of Phone */}
        <div className="flex justify-center py-8 bg-slate-100 dark:bg-slate-900">
          <div className="w-[375px] h-[780px] bg-slate-950 rounded-[50px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-white/10 text-left">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-2xl flex items-center justify-center z-40">
              <div className="w-24 h-4 bg-black rounded-full flex items-center justify-around px-2 text-[9px] text-slate-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                <span>CentriX OS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635]"></span>
              </div>
            </div>
            
            {/* Battery, Wifi status */}
            <div className="h-10 pt-6 px-6 bg-white dark:bg-slate-900 flex justify-between items-center text-[10px] font-black text-slate-500 font-mono z-30 select-none border-b dark:border-slate-850">
              <span>02:46 PM</span>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span>📶</span>
                <span>🔋 98%</span>
              </div>
            </div>

            {/* Scrollable interior */}
            <div className="flex-1 overflow-y-auto scrollbar-thin dark:bg-slate-950 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border dark:border-slate-800 text-left">
                  <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Unreconciled</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono block mt-0.5">{totalUnreconciledBankCount}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border dark:border-slate-800 text-left">
                  <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Receivables</span>
                  <span className="text-base font-black text-indigo-650 dark:text-indigo-400 font-mono block mt-0.5">${totalAmountReceivable.toLocaleString()}</span>
                </div>
              </div>

              {/* Mobile tabs row */}
              <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl overflow-x-auto gap-0.5 scrollbar-none select-none">
                {[
                  { id: "reconciliation", label: "Bank" },
                  { id: "invoices", label: "Invoices" },
                  { id: "expenses", label: "Scanner" },
                  { id: "inventory", label: "Assets" },
                  { id: "reporting", label: "Reports" },
                  { id: "currency", label: "FX" },
                  { id: "salesPayments", label: "Prospects" },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition shrink-0 ${activeTab === t.id ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Active Mobile TAB details */}
              <div className="space-y-4">
                {activeTab === "reconciliation" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase text-slate-400">Match Requests</span>
                      <button onClick={handleAutoReconcileAll} className="text-[9px] font-black uppercase text-[#a3e635] bg-lime-950 px-2.5 py-1 rounded-lg">Auto All</button>
                    </div>
                    {transactions.filter(t => t.status === "unreconciled").map(tx => (
                      <div key={tx.id} className="p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl space-y-2 text-left">
                        <div className="flex justify-between items-start">
                          <div className="max-w-[180px]">
                            <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">{tx.description}</span>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{tx.date} • {tx.institution}</span>
                          </div>
                          <span className="font-mono text-xs font-black text-rose-500 whitespace-nowrap">-${tx.amount}</span>
                        </div>
                        {tx.aiSuggestion && (
                          <div className="bg-purple-500/5 p-2 rounded-lg border border-purple-500/20 text-[10px] space-y-2">
                            <span className="text-purple-655 dark:text-purple-400 font-bold block">🌟 Suggest: {tx.aiSuggestion.matchName}</span>
                            <button onClick={() => handleReconcile(tx.id, tx.aiSuggestion?.matchName)} className="w-full bg-[#a3e635] text-slate-950 text-[9px] font-black py-1 rounded uppercase">Accept Suggestion</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "invoices" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase text-slate-400">Ledger Invoices</span>
                      <button onClick={() => setIsInvoiceModalOpen(true)} className="text-[9px] font-black uppercase text-slate-900 bg-[#a3e635] px-2.5 py-1 rounded-lg">+ Add</button>
                    </div>
                    {invoices.map(inv => (
                      <div key={inv.id} className="p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl space-y-2 text-xs text-left">
                        <div className="flex justify-between items-center">
                          <strong className="font-mono block text-slate-900 dark:text-white">{inv.id}</strong>
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${inv.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{inv.status}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <div>
                            <span>Recipient: <strong>{inv.clientName}</strong></span>
                            <span className="block mt-0.5">Due: {inv.dueDate}</span>
                          </div>
                          <span className="font-mono font-black text-slate-950 dark:text-white text-xs whitespace-nowrap">${inv.amount}</span>
                        </div>
                        {inv.status !== "Paid" && (
                          <div className="flex gap-1 pt-1">
                            <button onClick={() => handleSimulatePayment(inv.id, "Stripe Mobile API")} className="flex-1 py-1.5 bg-[#635bff] text-white text-[9px] font-black rounded-lg uppercase">💳 Stripe</button>
                            <button onClick={() => setSelectedInvoice(inv)} className="flex-1 py-1.5 border dark:border-slate-800 text-[9px] font-black rounded-lg text-slate-500 uppercase">Inspect</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "expenses" && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Mobile Capture OCR</span>
                    <div className="p-4 bg-slate-900 border border-slate-800 text-white rounded-xl text-center space-y-2">
                      <span className="text-[9px] font-mono text-[#a3e635] block font-black">FAST TRANSIT SCANNER</span>
                      <button onClick={handleFileChangeSimulation} className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl uppercase">📸 Snap Receipt Photo</button>
                    </div>
                    
                    {ocrSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs space-y-2 text-left animate-in fade-in slide-in-from-top-2">
                        <span className="text-emerald-400 font-extrabold block text-[10px]">✓ OCR Extracted: Sandton Convention</span>
                        <div className="flex justify-between font-mono text-[11px] text-slate-350">
                          <span>Amount:</span>
                          <strong>$85.00</strong>
                        </div>
                        <button onClick={(e) => {
                          const exp: Expense = {
                            id: `EXP-${Math.floor(Math.random() * 900 + 100)}`,
                            merchant: "Sandton Convention Center Parking",
                            date: new Date().toISOString().split("T")[0],
                            amount: 85.00,
                            category: "Travel Ground Transport",
                            status: "Approved",
                            submittedBy: "Sarah Jenkins"
                          };
                          setExpenses(prev => [exp, ...prev]);
                          
                          // Add corresponding outflow
                          const newTxId = `TX-${Math.floor(Math.random() * 9000 + 1000)}`;
                          const newTx: Transaction = {
                            id: newTxId,
                            date: exp.date,
                            description: `Expense Reimbursement: ${exp.merchant}`,
                            institution: "General Operating Cash",
                            amount: exp.amount,
                            type: "outflow",
                            category: exp.category,
                            status: "reconciled"
                          };
                          setTransactions(tPrev => [newTx, ...tPrev]);

                          setOcrSuccess(false);
                          showToast(`Filed expense via mobile OCR & posted matching transaction ${newTxId} to general ledger!`);
                        }} className="w-full py-1.5 bg-emerald-600 text-white font-bold rounded-lg uppercase text-[9px]">File & Approve OCR expense</button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "inventory" && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Active Stock Levels</span>
                    {products.map(p => (
                      <div key={p.id} className="p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl space-y-1.5 text-xs text-left">
                        <div className="flex justify-between">
                          <strong className="text-slate-900 dark:text-white font-bold block truncate max-w-[170px]">{p.name}</strong>
                          <span className={`${p.stockLevel <= p.reorderLevel ? "text-amber-500" : "text-emerald-500"} font-mono font-bold shrink-0`}>{p.stockLevel} left</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={p.stockLevel}
                          onChange={(e) => handleStockAdjustment(p.id, parseInt(e.target.value))}
                          className="w-full accent-lime-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reporting" && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Ledger Revenue Drilldown</span>
                    <div className="space-y-1">
                      <div className="p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl flex justify-between items-center text-xs text-left">
                        <div>
                          <span className="font-bold">Enterprise Licences</span>
                          <span className="text-[8px] text-slate-400 block font-mono">3 transactions</span>
                        </div>
                        <span className="font-mono text-emerald-500 font-bold whitespace-nowrap">+$124,500</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl flex justify-between items-center text-xs text-left">
                        <div>
                          <span className="font-bold">Cloud Infrastructure</span>
                          <span className="text-[8px] text-slate-400 block font-mono">1 transaction</span>
                        </div>
                        <span className="font-mono text-rose-500 whitespace-nowrap">-$1,420.50</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "currency" && (
                  <div className="p-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs space-y-3 text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest font-mono">Mobile FX Calculator</span>
                    <input
                      type="number"
                      value={conversionState.amount}
                      className="w-full p-2 border dark:border-slate-800 dark:bg-slate-855 rounded-lg text-xs font-mono font-bold"
                      onChange={(e) => handleConvertCurrency(e.target.value, conversionState.from, conversionState.to)}
                    />
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase text-[11px] text-slate-450">{conversionState.from} ➔ {conversionState.to}</span>
                      <strong className="font-mono text-sm text-[#a3e635]">{conversionState.result}</strong>
                    </div>
                    <button onClick={() => handleConvertCurrency(conversionState.amount, conversionState.to, conversionState.from)} className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-655 text-[9px] font-bold rounded-lg uppercase">Invert denoms</button>
                  </div>
                )}

                {activeTab === "salesPayments" && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 block px-1">CRM Prospects Onboarded</span>
                    <div className="space-y-2">
                      {tickets.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 italic text-xs">No active CRM deals</div>
                      ) : (
                        tickets.map(t => {
                          const directPaymentRecorded = transactions.some(tx => tx.description.includes(t.clientInfo.name));
                          return (
                            <div key={t.id} className="p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl space-y-2.5 text-left text-xs">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-extrabold text-slate-800 dark:text-white block">{t.clientInfo.name}</span>
                                  <span className="text-[8px] font-mono text-slate-400 block">{t.status}</span>
                                </div>
                                <span className="font-mono font-bold text-slate-905 dark:text-white">
                                  ${Number(t.addressDetails?.mortgageRequired || 1500).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg text-[9px] font-bold">
                                <span>Setup Fee Status:</span>
                                {directPaymentRecorded ? (
                                  <span className="text-lime-600 font-extrabold uppercase">✓ Cash Received</span>
                                ) : (
                                  <span className="text-amber-600 font-extrabold uppercase">Pending Invoice</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Home navigation bar */}
            <div className="h-4 bg-slate-900 flex justify-center items-center pb-1">
              <div className="w-32 h-1 bg-white/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Modal views that may open from Mobile frame */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 w-full max-w-sm shadow-xl flex flex-col space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="text-[9px] font-mono font-black text-lime-400">MOBILE INVOICE REVIEW</span>
                  <h4 className="font-extrabold text-sm">{selectedInvoice.id} Detail View</h4>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 px-2 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-white"
                >
                  X
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <span className="text-slate-500 block text-[9px] font-black uppercase">Client Representative</span>
                <strong className="text-white block">{selectedInvoice.clientName}</strong>
                <span className="text-[10px] text-slate-400">{selectedInvoice.clientEmail}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl text-xs space-y-1">
                {selectedInvoice.items.map((it, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-white/5 last:border-b-0">
                    <span>{it.description} <strong className="text-slate-500 font-normal font-sans text-[10px]">x{it.quantity}</strong></span>
                    <span className="font-mono text-slate-200">${(it.quantity * it.price).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 mt-2 pt-2 flex justify-between text-lime-400 font-extrabold text-xs">
                  <span>TOTAL SUM DUE</span>
                  <span className="font-mono">${selectedInvoice.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-left font-sans">
      
      {/* Toast alert system */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 z-50 text-xs w-96 font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finance Header */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#a3e635] bg-lime-950 px-2 py-0.5 rounded">AUTO-RECONCILIATION SUITE</span>
            <span className="text-xs text-slate-400 font-bold">Ledger Integration System v4.1</span>
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 mt-1">
            <Coins className="w-6 h-6 text-lime-500" /> Core Accounting & Cash Flow
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated bank reconciliation imports from 21,150 financial institutions, invoicing, bill expenses, and strategic reporting.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plan subscription selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
            <button 
              type="button" 
              onClick={() => { setSelectedPlan("Early"); showToast("Switched active profile context to Early Plan capabilities."); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${selectedPlan === "Early" ? "bg-white dark:bg-slate-700 shadow-xs text-blue-650 font-extrabold" : "text-slate-500"}`}
            >
              Early
            </button>
            <button 
              type="button" 
              onClick={() => { setSelectedPlan("Growing"); showToast("Switched active profile context to Growing Plan (Standard)."); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${selectedPlan === "Growing" ? "bg-white dark:bg-slate-700 shadow-xs text-blue-650 font-extrabold" : "text-slate-500"}`}
            >
              Growing
            </button>
            <button 
              type="button" 
              onClick={() => { setSelectedPlan("Advanced"); showToast("Unlocked Advanced Plan complete telemetry & API costing."); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${selectedPlan === "Advanced" ? "bg-white dark:bg-slate-700 shadow-xs text-blue-650 font-extrabold" : "text-slate-500"}`}
            >
              Advanced
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMode(!isMobileMode)}
            className={`p-2 rounded-xl text-xs font-bold border transition duration-150 flex items-center gap-1.5 ${isMobileMode ? "bg-slate-900 border-black text-white" : "bg-white border-slate-205 text-slate-705 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"}`}
          >
            {isMobileMode ? "🖥️ Desktop View" : "📱 Mobile Mode Simulation"}
          </button>
        </div>
      </div>

      {/* Benefits Headline Bar */}
      <div className="bg-gradient-to-r from-lime-500/10 via-emerald-500/5 to-slate-200/40 p-4 border-b dark:border-slate-800 text-xs flex flex-col md:flex-row justify-around gap-4 text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <strong>Real-Time Cash Flow</strong>
            <span className="block text-[10px] text-slate-400">Total Visibility Everywhere</span>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l dark:border-slate-800 pt-2 md:pt-0 md:pl-4">
          <Clock className="w-4 h-4 text-lime-600 shrink-0" />
          <div>
            <strong>Reconciliation Automation</strong>
            <span className="block text-[10px] text-slate-400">Reduces manual bookkeeping by 82%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l dark:border-slate-800 pt-2 md:pt-0 md:pl-4">
          <Award className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <strong>Over 1,000 Apps Linked</strong>
            <span className="block text-[10px] text-slate-400">Payroll, Ecommerce & Drizzle sync</span>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l dark:border-slate-800 pt-2 md:pt-0 md:pl-4">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <div>
            <strong>Secure Bank Connections</strong>
            <span className="block text-[10px] text-slate-400">Full encryption & 24/7 security</span>
          </div>
        </div>
      </div>

      {/* Stat Boxes */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Unreconciled Bank Entries</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block flex items-baseline gap-2">
            {totalUnreconciledBankCount}
            {totalUnreconciledBankCount > 0 && (
              <span className="text-xs text-amber-500 font-sans font-bold animate-pulse">Needs Override</span>
            )}
          </span>
          <div className="text-[10px] text-slate-400 mt-1">From 21,150 linked institutes</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Open Account Receivables</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block flex items-baseline gap-1 text-indigo-650 dark:text-indigo-400">
            <span className="text-sm font-sans font-normal text-slate-400">$</span>
            {totalAmountReceivable.toLocaleString()}
          </span>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Automated Invoice Reminders Active</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Simulated Bank Inflow (Reconciled)</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
            ${currentMonthInflow.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Reconciled to ledger this week</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-2xs">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Operating Expenses Outflow</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1 block">
            ${currentMonthOutflow.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">AWS Hosting billing captured</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="px-6 border-b dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto flex scrollbar-thin">
        {[
          { id: "reconciliation", label: "Bank Reconciliation", badge: totalUnreconciledBankCount || "✓" },
          { id: "invoices", label: "Custom Invoices & Quotes", badge: invoices.length },
          { id: "expenses", label: "Expense Hub & OCR Scanner", badge: expenses.filter(e => e.status === "Pending").length || "✓" },
          { id: "inventory", label: "Inventory & Projects Costing" },
          { id: "reporting", label: "Over 55 Reports & drilldowns" },
          { id: "currency", label: "Global Multi-Currency" },
          { id: "salesPayments", label: "Sales Client Payments", badge: tickets.length || 0 },
          { id: "addons", label: "1,000+ Integrations & Plans" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-4 px-4 font-bold text-xs uppercase tracking-wider relative shrink-0 transition-all border-b-2 cursor-pointer ${activeTab === tab.id ? "text-lime-600 dark:text-lime-400 border-lime-500" : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-white"}`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {"badge" in tab && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${tab.id === "reconciliation" && totalUnreconciledBankCount > 0 ? "bg-amber-500 text-slate-900 animate-pulse" : "bg-slate-100 text-slate-655 font-mono dark:bg-slate-800"}`}>
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Main Panel Content Body */}
      <div className="p-6">
        
        {/* TAB 1: Bank Connections & Reconciliation */}
        {activeTab === "reconciliation" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 p-5 rounded-2xl border dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#a3e635]" /> AI-Assisted Automated Matching Ledger
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Imports secure SSL transaction flow logs. Suggestions match existing open invoices with over 95% certainty index.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAutoReconcileAll}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition"
                >
                  Confirm Auto-Match All Suggestions ({totalUnreconciledBankCount})
                </button>
              </div>
            </div>

            {/* Filter & List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-1">
                  {(["all", "unreconciled", "reconciled"] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setReconFilter(f)}
                      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition ${reconFilter === f ? "bg-slate-900 text-white dark:bg-slate-800" : "bg-slate-100 dark:bg-slate-800/40 text-slate-500"}`}
                    >
                      {f} ({f === "all" ? transactions.length : f === "unreconciled" ? transactions.filter(t=>t.status === "unreconciled").length : transactions.filter(t=>t.status==="reconciled").length})
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {/* Ledger search bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      placeholder="Search ledger description..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border dark:border-slate-800 dark:bg-slate-900 rounded-xl text-xs font-medium w-full sm:w-56 focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono hidden sm:flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Polling 21,150 banks in background
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                {transactions
                  .filter(tx => reconFilter === "all" ? true : tx.status === reconFilter)
                  .filter(tx => {
                    if (!searchTerm) return true;
                    const q = searchTerm.toLowerCase();
                    return tx.description.toLowerCase().includes(q) || 
                           tx.category.toLowerCase().includes(q) || 
                           tx.institution.toLowerCase().includes(q) || 
                           tx.id.toLowerCase().includes(q);
                  })
                  .map((tx) => (
                    <div 
                      key={tx.id} 
                      className={`p-4 rounded-2xl border transition duration-150 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 ${tx.status === "reconciled" ? "bg-slate-50/50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-75" : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 shadow-xs"}`}
                    >
                      {/* Left Block */}
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "inflow" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"}`}>
                          {tx.type === "inflow" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-950 dark:text-white select-all">{tx.description}</span>
                            <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 rounded uppercase">{tx.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono">{tx.date}</span>
                            <span>•</span>
                            <span>{tx.institution}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-655 dark:text-slate-300">{tx.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Reconcile Suggestion OR Reconciled status */}
                      <div className="flex flex-wrap lg:items-center gap-4 ml-12 lg:ml-0">
                        <div className="text-right">
                          <span className={`text-sm font-mono font-black block ${tx.type === "inflow" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {tx.type === "inflow" ? "+" : "-"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-mono">Captured currency: USD</span>
                        </div>

                        <div className="border-l dark:border-slate-800 pl-4 py-1 flex flex-col justify-center gap-1.5 min-w-[280px]">
                          {/* General Amend Button for all states */}
                          <button
                            type="button"
                            onClick={() => setEditRecord({ type: "transaction", id: tx.id, data: { ...tx } })}
                            className="px-2.5 py-1 self-start bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border dark:border-slate-700 text-[10px] font-black uppercase flex items-center gap-1 transition cursor-pointer"
                          >
                            ✍️ Amend / Comment Entry
                          </button>

                          {tx.status === "reconciled" ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 mt-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" /> Reconciled to ledger
                            </div>
                          ) : tx.aiSuggestion ? (
                            <div className="w-full mt-1">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-purple-650 dark:text-purple-400 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" /> AI Sug: {tx.aiSuggestion.matchName}
                                </span>
                                <span className="font-mono text-emerald-700 font-extrabold bg-emerald-50 dark:bg-emerald-900/30 px-1 py-0.2 rounded text-[9px]">{tx.aiSuggestion.confidence}% Match</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[240px] leading-relaxed">{tx.aiSuggestion.reason}</p>
                              
                              <div className="flex gap-1.5 mt-2">
                                <button
                                  type="button"
                                  onClick={() => handleReconcile(tx.id, tx.aiSuggestion?.matchName)}
                                  className="px-2.5 py-1 bg-lime-650 text-white rounded-lg text-[10px] font-black uppercase hover:bg-lime-700 cursor-pointer"
                                >
                                  Accept Match
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTransaction(tx);
                                    showToast("Switching to manual matching override console...");
                                  }}
                                  className="px-2.5 py-1 border border-slate-205 dark:border-slate-800 text-slate-705 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  Custom Match
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="text-[10px] text-slate-351 block mb-1">No automated Sug matched.</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTransaction(tx);
                                }}
                                className="px-2.5 py-1 bg-slate-900 text-white dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                              >
                                Manual Match
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Custom transaction match modal if selected */}
            {selectedTransaction && (
              <div className="p-4 bg-lime-50/50 dark:bg-slate-900 border border-lime-300 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div>
                  <span className="text-[9px] font-mono font-black text-lime-700 bg-lime-100 px-1 rounded block w-fit mb-1">MANUAL LEDGER ATTACHMENT OVERRIDE</span>
                  <strong>Reconciling:</strong> {selectedTransaction.description} (${selectedTransaction.amount})
                  <p className="text-slate-500 text-[11px] mt-0.5">Please map this transaction to an active ledger account or digital invoices listed on standard accounts.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <select 
                    id="ledgerSelect"
                    className="p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-xl font-bold font-sans text-xs"
                    onChange={(e) => {
                      if(e.target.value) {
                        handleReconcile(selectedTransaction.id, e.target.value);
                        setSelectedTransaction(null);
                      }
                    }}
                  >
                    <option value="">Select Accounts ledger target...</option>
                    <option value="Direct Sales Revenue Office A">Sales Capital Revenue (Internal Code: SL-09)</option>
                    <option value="Equity Distribution Trust">Legal Trust Account (PoPIA Vault ID)</option>
                    <option value="Office Consumables/Marketing Materials">Operational Marketing Expense Outflow</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 text-slate-400 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Online Invoicing & Quotes */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-extrabold text-slate-950 dark:text-white text-[15px]">Custom Online Invoicing Suite</h3>
                <p className="text-slate-505 text-xs">Draft and send custom invoices. Allow client instant payment via simulated Stripe credit card buttons.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(true)}
                className="px-4 py-2.5 bg-[#a3e635] text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-lime-500 transition duration-150 flex items-center gap-1"
              >
                <Plus className="w-4 h-4 cursor-pointer" /> Create New Invoice
              </button>
            </div>

            {/* Filter buttons & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-slate-800 pb-2">
              <div className="flex flex-wrap gap-1">
                {(["All", "Draft", "Sent", "Overdue", "Paid"] as const).map(filter => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setInvoiceFilter(filter)}
                    className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition ${invoiceFilter === filter ? "bg-slate-900 text-white dark:bg-slate-800" : "bg-slate-100 dark:bg-slate-800/40 text-slate-500"}`}
                  >
                    {filter} ({filter === "All" ? invoices.length : invoices.filter(inv=>inv.status === filter).length})
                  </button>
                ))}
              </div>

              {/* Search clients */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  placeholder="Search client representation..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border dark:border-slate-800 dark:bg-slate-900/40 rounded-xl text-xs font-medium w-full sm:w-56 focus:outline-none focus:border-lime-500"
                />
              </div>
            </div>

            {/* Invoices List table */}
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-855 border-b dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                      <th className="p-4">Invoice ID</th>
                      <th className="p-4">Client Representative</th>
                      <th className="p-4">Send Date</th>
                      <th className="p-4">Expiry Limit</th>
                      <th className="p-4 text-right">Invoice Sum</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Integrations & Pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {invoices
                      .filter(inv => invoiceFilter === "All" ? true : inv.status === invoiceFilter)
                      .filter(inv => {
                        if (!searchTerm) return true;
                        const q = searchTerm.toLowerCase();
                        return inv.clientName.toLowerCase().includes(q) || 
                               inv.clientEmail.toLowerCase().includes(q) || 
                               inv.id.toLowerCase().includes(q);
                      })
                      .map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white select-all">{inv.id}</td>
                          <td className="p-4">
                            <span className="font-semibold block text-slate-850 dark:text-slate-100">{inv.clientName}</span>
                            <span className="text-[10px] text-slate-400 block">{inv.clientEmail}</span>
                          </td>
                          <td className="p-4 text-slate-500">{inv.date}</td>
                          <td className="p-4">
                            <span className="font-medium">{inv.dueDate}</span>
                            {inv.status === "Overdue" && (
                              <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1 py-0.2 rounded ml-1 animate-pulse uppercase">Dunning Nudge</span>
                            )}
                          </td>
                          <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">
                            ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] font-black tracking-wide uppercase px-2.5 py-0.8 rounded-full ${inv.status === "Paid" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40" : inv.status === "Sent" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40" : inv.status === "Overdue" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40" : "bg-slate-100 text-slate-655"}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setEditRecord({ type: "invoice", id: inv.id, data: { ...inv } })}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border dark:border-slate-700 font-black rounded-lg text-[9px] uppercase inline-flex items-center gap-1 transition cursor-pointer"
                            >
                              ✍️ Amend & Comment
                            </button>
                            {inv.status !== "Paid" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSimulatePayment(inv.id, "Stripe Portal")}
                                  className="px-2.5 py-1.5 bg-[#635bff] text-white hover:bg-[#5b51dd] rounded-lg text-[9px] font-black uppercase flex inline-flex items-center gap-1 transition"
                                >
                                  💳 Pay Stripe
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSimulatePayment(inv.id, "PayPal Flow")}
                                  className="px-2.5 py-1.5 bg-yellow-500 text-slate-950 hover:bg-yellow-600 rounded-lg text-[9px] font-black uppercase flex inline-flex items-center gap-1 transition"
                                >
                                  PayPal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                  }}
                                  className="px-2 py-1.5 border dark:border-slate-800 text-slate-655 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[9px] font-black uppercase"
                                >
                                  View Itemization
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium inline-flex items-center gap-1">
                                <Check className="w-4 h-4 text-emerald-500" /> Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoicing detailed review section */}
            {selectedInvoice && (
              <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-801 max-w-2xl shadow-xl flex flex-col space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] font-mono font-black text-lime-400">ITEMIZED INVOICE TELESCOPE</span>
                    <h4 className="font-extrabold text-sm">{selectedInvoice.id} - Detail View</h4>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl"
                  >
                    Close Inspection
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[9px] font-black uppercase">Client Info</span>
                    <strong className="text-white font-sans">{selectedInvoice.clientName}</strong>
                    <span className="block text-slate-400">{selectedInvoice.clientEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-black uppercase">Schedule Check</span>
                    <span className="block">Issue Date: {selectedInvoice.date}</span>
                    <span className="block font-bold">Due Deadline: {selectedInvoice.dueDate}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950 p-4 rounded-2xl">
                  <span className="text-[9px] font-mono uppercase font-black text-slate-500 block mb-2 border-b border-slate-900 pb-1">Products & Services Itemization</span>
                  {selectedInvoice.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-xs text-slate-300 py-1 border-b border-white/5 last:border-b-0">
                      <span>{it.description} <strong className="text-[10px] text-slate-500 font-normal">x{it.quantity}</strong></span>
                      <span className="font-mono">${(it.quantity * it.price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800 mt-2 pt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-450">
                      <span>Commission Subtotal</span>
                      <span className="font-mono">${selectedInvoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-450">
                      <span>Value Added Tax (VAT 15%)</span>
                      <span className="font-mono">${selectedInvoice.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lime-400 font-extrabold border-t border-slate-800 pt-1">
                      <span>TOTAL PAYABLE INVOICE SUM</span>
                      <span className="font-mono">${selectedInvoice.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Expense Management & OCR Receipt scanner */}
        {activeTab === "expenses" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Receipt OCR Upload component */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
                    <span className="text-[9px] font-mono tracking-wider text-indigo-200 uppercase font-black">AI OCR receipt capture</span>
                  </div>
                  <h4 className="font-extrabold text-sm mb-1">Instant Machine-Vision Scanner</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Capture receipts via mobile phone or workspace. Auto-extracts tax, merchant, category, and expense subtotal instantly.
                  </p>
                </div>

                <div className="my-6 border border-dashed border-white/20 hover:border-[#a3e635] p-6 rounded-2xl text-center bg-white/5 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="receiptUpload"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChangeSimulation}
                    disabled={receiptLoading}
                  />
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div className="text-xs">
                      {receiptLoading ? (
                        <span className="text-lime-400 font-bold block animate-pulse">Running OCR analysis algorithms...</span>
                      ) : ocrSuccess ? (
                        <span className="text-emerald-400 font-extrabold block">✓ OCR Successfully Decoded!</span>
                      ) : (
                        <span>Drag / Select corporate receipt photo</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block">Accepts HEIC, PNG, JPEG, PDF</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFileChangeSimulation}
                  className="w-full py-2 bg-[#a3e635] hover:bg-lime-500 text-slate-900 text-xs font-black uppercase rounded-lg transition"
                >
                  Mock Auto receipt scanning Extract
                </button>
              </div>

              {/* Expense submission form */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 md:col-span-2 space-y-4 shadow-xs">
                <div>
                  <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">Register Outbound Corporate Claim</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Enter standard voucher claims, cash vouchers, or reconcile scanned OCR fields below.</p>
                </div>

                <form onSubmit={handleCreateExpense} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block">Merchant Name / Vendor</label>
                      <input
                        type="text"
                        value={newExpense.merchant}
                        onChange={(e)=>setNewExpense({...newExpense, merchant: e.target.value})}
                        placeholder="e.g. AWS Billing, Uber Ride"
                        className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block">Excluding / Claim Sum (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newExpense.amount}
                        placeholder="0.00"
                        onChange={(e)=>setNewExpense({...newExpense, amount: e.target.value})}
                        className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block">Category Cluster</label>
                      <select
                        value={newExpense.category}
                        onChange={(e)=>setNewExpense({...newExpense, category: e.target.value})}
                        className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl font-bold"
                      >
                        <option value="Business Lunch / Meals">Business Lunch / Meals</option>
                        <option value="Ground Transport">Ground Transport</option>
                        <option value="AWS Cloud Hosting Expense">AWS Cloud Hosting Expense</option>
                        <option value="Subscription Software">Subscription Software</option>
                        <option value="Travel Airfare">Travel Airfare</option>
                        <option value="Office Equipment / Consumables">Office Equipment / Consumables</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block">Claimant Staff Member</label>
                      <input
                        type="text"
                        value={newExpense.submittedBy}
                        onChange={(e)=>setNewExpense({...newExpense, submittedBy: e.target.value})}
                        placeholder="Group Leader Representative"
                        className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-black text-white text-xs font-black uppercase rounded-xl tracking-wider transition"
                  >
                    Instantly Register Active Claim Expense
                  </button>
                </form>
              </div>

            </div>

            {/* Expense claims list table */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-463 block">Recent Expense Claim Requests & Approvals</span>
              <div className="space-y-2">
                {expenses.map((exp) => (
                  <div key={exp.id} className="p-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-extrabold text-slate-501 font-mono uppercase">
                        {exp.merchant[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{exp.merchant}</span>
                          <span className="text-[8px] font-mono font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded uppercase">{exp.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-indigo-650 dark:text-indigo-400">{exp.category}</span>
                          <span>•</span>
                          <span>Claimant: {exp.submittedBy}</span>
                          <span>•</span>
                          <span className="font-mono">{exp.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="font-mono font-black text-slate-950 dark:text-white text-sm">
                        ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setEditRecord({ type: "expense", id: exp.id, data: { ...exp } })}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border dark:border-slate-700 rounded-lg text-[9px] font-black uppercase transition cursor-pointer"
                        >
                          ✍️ Amend & Comment
                        </button>
                        {exp.status === "Pending" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleActionExpense(exp.id, "Approved")}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActionExpense(exp.id, "Declined")}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black uppercase transition cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${exp.status === "Approved" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40" : "bg-rose-50 text-rose-700 dark:bg-rose-950/40"}`}>
                            {exp.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Inventory & Projects Costing */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Stock levels and adjustments */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 space-y-4 shadow-xs">
                <div>
                  <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">Inventory Levels & Stock Valuation</h4>
                  <p className="text-slate-500 text-xs">Track current stock adjustments and trigger automatic reorders for critical hardware.</p>
                </div>

                <div className="space-y-3">
                  {products.map((p) => {
                    const isCrit = p.stockLevel <= p.reorderLevel;
                    return (
                      <div key={p.id} className="p-3.5 bg-slate-50 dark:bg-slate-855 rounded-2xl border dark:border-slate-800 transition">
                        <div className="flex justify-between items-start mb-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white select-all block">{p.name} <span className="font-mono text-[9px] text-slate-400 bg-slate-200 dark:bg-slate-800 px-1 rounded uppercase">{p.sku}</span></span>
                            <span className="text-[10px] text-slate-450 block">Cost margin: ${p.unitCost} → RSP: ${p.retailPrice}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-black block font-mono ${isCrit ? "text-amber-600" : "text-emerald-600"}`}>
                              {p.stockLevel} units left
                            </span>
                            {isCrit && (
                              <span className="text-[8px] font-mono font-black text-amber-700 bg-amber-50 px-1 rounded uppercase animate-pulse">Low stock alert</span>
                            )}
                          </div>
                        </div>

                        {/* Adjuster slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-448">
                            <span>Stock Adjustment</span>
                            <span>Limit: 200</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={p.stockLevel}
                            onChange={(e) => handleStockAdjustment(p.id, parseInt(e.target.value))}
                            className="w-full accent-lime-500"
                          />
                          <button
                            type="button"
                            onClick={() => setEditRecord({ type: "product", id: p.id, data: { ...p } })}
                            className="mt-1.5 text-[9px] font-black uppercase text-indigo-650 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            ✍️ Amend SKU / Price / Comments
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Projects Profitability & Job Costing */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 space-y-4 shadow-xs">
                <div>
                  <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">Live Job Costing & Project Profitability</h4>
                  <p className="text-slate-500 text-xs">Acoustical view comparing project client budgets to real expenses of operational units.</p>
                </div>

                <div className="space-y-4">
                  {projects.map((proj) => {
                    const ratio = parseFloat(((proj.actualCost / proj.budget) * 100).toFixed(0));
                    const isDanger = ratio >= 90;
                    return (
                      <div key={proj.id} className="p-4 border dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950 rounded-2xl text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-950 dark:text-white text-xs">{proj.name}</span>
                            <span className="text-[10px] text-slate-400 block">SLA Client: {proj.client}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded ${proj.status === "Checked" || proj.status === "On Track" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700 animate-pulse"}`}>
                            {proj.status}
                          </span>
                        </div>

                        {/* Cost Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>Cost Ratio: {ratio}% ({proj.tasks} subtasks complete)</span>
                            <span className="font-bold">${proj.actualCost.toLocaleString()} / ${proj.budget.toLocaleString()} Budget</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${isDanger ? "bg-rose-500" : "bg-indigo-600"}`} 
                              style={{ width: `${Math.min(ratio, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                          <span>Target margin left: <strong>${(proj.budget - proj.actualCost).toLocaleString()}</strong></span>
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Dispatched budget warning alert notification for ${proj.name}.`);
                            }}
                            className="text-indigo-650 hover:underline"
                          >
                            Nudge project leads
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: Reporting & Analytics with Drill-down */}
        {activeTab === "reporting" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h4 className="font-extrabold text-[#a3e635] text-sm tracking-wide uppercase font-mono">Interactive Financial Ledger Drill-downs</h4>
                  <p className="text-slate-501 text-xs">Displaying Over 55 structured reports with real-time dynamic transaction trace. Click on item lines to inspect transaction details of the Ledger.</p>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold">
                  <span className="bg-white dark:bg-slate-700 p-1 rounded px-2.5 text-slate-801 dark:text-white uppercase font-black">Profit & Loss (P&L) Report</span>
                  <span className="p-1 px-2.5 text-slate-400 uppercase font-bold">Balance Sheet</span>
                </div>
              </div>

              {/* Sample P&L list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2 border-r dark:border-slate-800 pr-0 md:pr-6">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block border-b pb-1 dark:border-slate-800">Operational Income (Revenue)</span>
                  {[
                    { name: "SaaS Enterprise Licences Inbound", value: 124500, details: [
                      { desc: "Acme Corp Core platform licence SLA", date: "2026-06-10", value: 3500 },
                      { desc: "Remington Global platform bundle", date: "2026-06-12", value: 1950 },
                      { desc: "Pre-paid cloud storage allocation limits", date: "2026-06-01", value: 119050 }
                    ]},
                    { name: "SLA Custom Integration Services Hour Package", value: 48500, details: [
                      { desc: "Advisory sessions team A", date: "2026-06-03", value: 30000 },
                      { desc: "Training onboarding integration", date: "2026-06-04", value: 18500 }
                    ]},
                    { name: "Hardware Router Equipment Outlay Sales", value: 24900, details: [
                      { desc: "Direct bulk depot router sale Unit B", date: "2026-05-15", value: 24900 }
                    ]}
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => setDrillDownItem({ name: item.name, value: item.value, type: "P&L", details: item.details })}
                      className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-lime-50/40 dark:hover:bg-slate-800 cursor-pointer rounded-2xl transition border border-transparent hover:border-lime-200"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-850 dark:text-slate-100 block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">Drill down ({item.details.length} transactions mapped)</span>
                      </div>
                      <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">+${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block border-b pb-1 dark:border-slate-800">Operating Expenses Outflow (OPEX)</span>
                  {[
                    { name: "Cloud Infrastructure Hosting (AWS / GCP)", value: 1420.50, details: [
                      { desc: "Amazon Web Services recurring VM fee June", date: "2026-06-17", value: 1420.50 }
                    ]},
                    { name: "Corporate Travel Airfares & Noodling", value: 1485.40, details: [
                      { desc: "Sarah Jenkins local business flight JHB", date: "2026-05-28", value: 289.40 },
                      { desc: "Johannesburg office transit taxi loops", date: "2026-05-20", value: 1196.00 }
                    ]},
                    { name: "Internal Stationery & Office Supplies Depot", value: 394.90, details: [
                      { desc: "Office Depot stationery and cartridges", date: "2026-06-16", value: 345.90 },
                      { desc: "Coffee pods and pantry tea", date: "2026-06-12", value: 49.00 }
                    ]}
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => setDrillDownItem({ name: item.name, value: item.value, type: "P&L", details: item.details })}
                      className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50/40 dark:hover:bg-slate-800 cursor-pointer rounded-2xl transition border border-transparent hover:border-rose-220"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-850 dark:text-slate-100 block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">Drill down ({item.details.length} transactions mapped)</span>
                      </div>
                      <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400">-${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drill-down Telescope panel */}
              {drillDownItem && (
                <div className="p-5 mt-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-[8px] font-mono font-black text-[#a3e635] tracking-wide uppercase">Drill-Down Explorer ledger</span>
                      <h5 className="font-extrabold text-xs">{drillDownItem.name}</h5>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setDrillDownItem(null)}
                      className="p-1 px-2.5 bg-slate-800 hover:bg-slate-705 text-[10px] rounded"
                    >
                      Reset drill down
                    </button>
                  </div>

                  <div className="space-y-2">
                    {drillDownItem.details.map((det, index) => (
                      <div key={index} className="flex justify-between items-center text-xs text-slate-300 py-1.5 border-b border-white/5 last:border-b-0">
                        <div>
                          <strong className="block text-white">{det.desc}</strong>
                          <span className="text-[9px] text-slate-500 font-mono">{det.date}</span>
                        </div>
                        <span className="font-mono font-bold text-lime-400">${det.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Global Multi-Currency Support */}
        {activeTab === "currency" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
              <div>
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">Corporate Multi-Currency Support</h4>
                <p className="text-slate-500 text-xs">Execute immediate conversions between USD base balances and global trade denominations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Real-time interactive calculation desk */}
                <div className="p-5 bg-slate-50 dark:bg-slate-955 rounded-2xl border dark:border-slate-800 space-y-4 text-xs">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest font-mono">FX CONVERSION CALCULATOR</span>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[9px] font-black uppercase text-slate-405 block mb-1">Convert Val</label>
                        <input
                          type="number"
                          value={conversionState.amount}
                          className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl font-mono font-bold"
                          onChange={(e) => handleConvertCurrency(e.target.value, conversionState.from, conversionState.to)}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase text-slate-405 block mb-1">Source Denom</label>
                        <select
                          value={conversionState.from}
                          onChange={(e) => handleConvertCurrency(conversionState.amount, e.target.value, conversionState.to)}
                          className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="ZAR">ZAR (R)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <ArrowLeftRight className="w-5 h-5 text-indigo-600 shrink-0" />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-405 block mb-1">Target Denom</label>
                      <select
                        value={conversionState.to}
                        onChange={(e) => handleConvertCurrency(conversionState.amount, conversionState.from, e.target.value)}
                        className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="ZAR">ZAR (R)</option>
                      </select>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-center space-y-1">
                      <span className="text-[10px] text-slate-400 block font-mono">Calculated conversion:</span>
                      <strong className="text-xl font-mono font-black text-slate-900 dark:text-white block">
                        {conversionState.to === "EUR" ? "€" : conversionState.to === "GBP" ? "£" : conversionState.to === "ZAR" ? "R" : "$"}{conversionState.result.toLocaleString()}
                      </strong>
                      <span className="text-[9px] text-green-600 dark:text-green-400 font-bold block">✓ SSL real-time conversion rates applied</span>
                    </div>
                  </div>
                </div>

                {/* Info about conversions */}
                <div className="space-y-4">
                  <div className="p-4 bg-lime-50/50 dark:bg-slate-950 border border-lime-200 dark:border-slate-800 rounded-2xl">
                    <span className="font-extrabold text-xs block text-slate-900 dark:text-white mb-1 flex items-center gap-1"><Sparkles className="w-4 h-4 text-lime-600" /> Automatic FX Swaps enabled</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Remediation algorithms automatically calculate optimal currency exchanges based on real-time rate indices, preventing slippage on global invoice payments.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block border-b pb-1">Current SLA Target conversion ratios</span>
                    <div className="flex justify-between py-1 border-b dark:border-slate-800 text-slate-655 dark:text-slate-351">
                      <span>USD to ZAR (South Africa)</span>
                      <strong className="font-mono text-slate-800 dark:text-white">R 18.15</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b dark:border-slate-800 text-slate-655 dark:text-slate-351">
                      <span>USD to EUR (Eurozone)</span>
                      <strong className="font-mono text-slate-800 dark:text-white">€ 0.92</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b dark:border-slate-800 text-slate-655 dark:text-slate-351">
                      <span>USD to GBP (Great Britain)</span>
                      <strong className="font-mono text-slate-800 dark:text-white">£ 0.79</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 7: 1000+ App integrations / Plan tiers & Security */}
        {activeTab === "addons" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-xs">
              <div>
                <h4 className="font-extrabold text-slate-901 dark:text-white text-sm">Over 1,000 App Integrations & Pricing Tiers</h4>
                <p className="text-slate-500 text-xs">Connect payroll, CRM pipelines, and e-commerce stores effortlessly. Scale capacity securely as operational metrics balloon.</p>
              </div>

              {/* Over 1000 app grid showcase */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block border-b pb-1 dark:border-slate-800">Connected platforms</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center font-bold">
                  <div className="p-4 bg-slate-50 dark:bg-slate-855 rounded-2xl border dark:border-slate-800">
                    <span className="block text-indigo-650 dark:text-indigo-400 text-sm">Stripe Inc</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Payment gateway</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-855 rounded-2xl border dark:border-slate-800">
                    <span className="block text-blue-600 dark:text-blue-400 text-sm">PayPal</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Global Transfers</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-855 rounded-2xl border dark:border-slate-800">
                    <span className="block text-emerald-600 dark:text-emerald-400 text-sm">Shopify API</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">E-commerce Sync</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-855 rounded-2xl border dark:border-slate-800">
                    <span className="block text-[#a3e635] text-sm">Sage Payroll</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Staff Salaries</span>
                  </div>
                </div>
              </div>

              {/* Pricing Cards tier checklist */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {[
                  { name: "Early Plan", price: "$15/mo", features: ["Up to 5 custom invoices/mo", "Single-currency Ledger", "FNB South Africa reconciliation integration", "24/7 basic mail support"] },
                  { name: "Growing Plan", price: "$49/mo", features: ["Continuous invoicing Unlimited", "Over 21,150 connected banks", "AI recommendation suggest match", "Sage Payroll plugin modules"] },
                  { name: "Advanced Plan", price: "$120/mo", features: ["Comprehensive global multi-currency", "Enterprise job cost monitoring", "Dedicated PopIA compliance vaults", "Dedicated L&D SLA override tokens"] }
                ].map((tier, idx) => {
                  const isActive = (selectedPlan === "Early" && idx === 0) || (selectedPlan === "Growing" && idx === 1) || (selectedPlan === "Advanced" && idx === 2);
                  return (
                    <div 
                      key={idx} 
                      className={`p-5 rounded-3xl border transition flex flex-col justify-between ${isActive ? "bg-slate-900 text-white border-black shadow-lg" : "bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 text-slate-800 dark:text-slate-200"}`}
                    >
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                          <strong className="text-sm font-sans">{tier.name}</strong>
                          {isActive && (
                            <span className="text-[8px] font-mono font-black text-slate-900 bg-[#a3e635] px-1.5 rounded uppercase">Active client contract</span>
                          )}
                        </div>

                        <span className="text-2xl font-mono font-black block">{tier.price}</span>

                        <ul className="space-y-2 pt-2 border-t dark:border-slate-800">
                          {tier.features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-[11px]">
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#a3e635]" : "text-slate-400"}`} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const planName = idx === 0 ? "Early" : idx === 1 ? "Growing" : "Advanced";
                          setSelectedPlan(planName);
                          showToast(`Simulating active operational contract regrade to ${tier.name}.`);
                        }}
                        className={`w-full py-2 mt-6 text-xs font-black uppercase tracking-wider rounded-xl transition ${isActive ? "bg-[#a3e635] hover:bg-lime-500 text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"}`}
                      >
                        {isActive ? "Contract active" : `Upgrade to ${tier.name.split(" ")[0]}`}
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* TAB 8: Sales Onboarded Clients & Payments Ledger */}
        {activeTab === "salesPayments" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-lime-500" />
                    Sales Client Onboarding & Payments Ledger
                  </h4>
                  <p className="text-slate-500 text-xs font-sans">
                    Real-time synchronization tracking setup fees, deal value parameters, and cash inflow from clients onboarded by sales.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search sales clients pipeline..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 w-64 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Statistics cards for this tab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border dark:border-slate-800 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Total Sales Pipeline Deals</span>
                  <span className="text-xl font-mono font-black text-slate-900 dark:text-white mt-1 block">{tickets.length}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border dark:border-slate-800 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Onboarding Setup Potential</span>
                  <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    ${(tickets.length * 1500).toLocaleString()}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border dark:border-slate-800 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Registered Custom Invoices</span>
                  <span className="text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                    {invoices.filter(inv => inv.id.startsWith("INV-SL-")).length}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border dark:border-slate-800 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider font-sans">Reconciled Cash Inflow</span>
                  <span className="text-xl font-mono font-black text-lime-600 dark:text-[#a3e635] mt-1 block">
                    ${(transactions.filter(t => t.description.includes("Direct Setup") || t.description.includes("Onboarding")).reduce((sum, item) => sum + item.amount, 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Pipeline List Table */}
              <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-855 border-b dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                        <th className="p-4">Client Representative</th>
                        <th className="p-4">Stage Status</th>
                        <th className="p-4 font-mono">Prospect Deal Value</th>
                        <th className="p-4">Comments & Remarks Log</th>
                        <th className="p-4 text-right">Accounting Action Ledger</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-450 italic">
                            No clients identified in CRM global pipeline. Setup some deals in Sales department first!
                          </td>
                        </tr>
                      ) : (
                        tickets
                          .filter(t => {
                            if (!searchTerm) return true;
                            const q = searchTerm.toLowerCase();
                            return (
                              t.clientInfo.name.toLowerCase().includes(q) ||
                              t.status.toLowerCase().includes(q)
                            );
                          })
                          .map((t) => {
                            // Find invoice generated for this client
                            const clientSetupInvoice = invoices.find(inv => inv.id === `INV-SL-${t.id}`);
                            const directPaymentRecorded = transactions.some(tx => tx.description.includes(t.clientInfo.name));

                            let paymentStateHtml = (
                              <span className="text-[9px] uppercase font-black bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-md text-center inline-block">Uninvoiced Setup</span>
                            );
                            if (directPaymentRecorded) {
                              paymentStateHtml = (
                                <span className="text-[9px] uppercase font-black bg-lime-50 text-lime-700 dark:bg-lime-950/20 dark:text-lime-450 px-2.5 py-1 rounded-md text-center inline-block animate-pulse">Direct Cash Received</span>
                              );
                            } else if (clientSetupInvoice) {
                              if (clientSetupInvoice.status === "Paid") {
                                paymentStateHtml = (
                                  <span className="text-[9px] uppercase font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-1 rounded-md text-center inline-block">Invoice Paid</span>
                                );
                              } else {
                                paymentStateHtml = (
                                  <span className="text-[9px] uppercase font-black bg-amber-55 text-amber-750 dark:bg-amber-955/20 dark:text-amber-400 px-2.5 py-1 rounded-md text-center inline-block">Inv Sent / Unpaid ({clientSetupInvoice.status})</span>
                                );
                              }
                            }

                            return (
                              <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                                <td className="p-4">
                                  <div className="font-bold text-slate-900 dark:text-white text-xs">{t.clientInfo.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{t.clientInfo.email} • ID: {t.id}</div>
                                </td>
                                <td className="p-4">
                                  <span className="text-[10px] font-black uppercase text-indigo-650 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md block w-fit">
                                    {t.status}
                                  </span>
                                  {t.subStatus && (
                                    <span className="text-[9px] text-slate-400 block mt-0.5 font-medium select-none truncate max-w-[120px]">{t.subStatus}</span>
                                  )}
                                </td>
                                <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                                  ${Number(t.addressDetails?.mortgageRequired || 1500).toLocaleString()}
                                </td>
                                <td className="p-4 max-w-xs">
                                  {t.remarks ? (
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans">{t.remarks}</p>
                                  ) : (
                                    <span className="text-[9px] text-slate-400 italic font-sans select-none">No custom backoffice comments logged</span>
                                  )}
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5 flex-wrap whitespace-nowrap">
                                    {paymentStateHtml}

                                    {/* Action 1: Create invoice if not yet exist */}
                                    {!clientSetupInvoice && !directPaymentRecorded && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const invoice: Invoice = {
                                            id: `INV-SL-${t.id}`,
                                            clientName: t.clientInfo.name,
                                            clientEmail: t.clientInfo.email || "support@centrix.com",
                                            date: new Date().toISOString().split("T")[0],
                                            dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split("T")[0],
                                            subtotal: 1304.35,
                                            tax: 195.65,
                                            amount: 1500.00,
                                            currency: "USD",
                                            status: "Sent",
                                            items: [{ description: "CRM Onboarding Platform Entry Fee Setup", quantity: 1, price: 1500.00 }],
                                            comments: [`[System] Autogenerated setup invoice from Sales pipeline onboarding.`]
                                          };
                                          setInvoices(prev => [invoice, ...prev]);
                                          showToast(`Dynamic Onboarding invoice INV-SL-${t.id} successfully created for ${t.clientInfo.name}!`);
                                        }}
                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-[9px] font-black uppercase transition cursor-pointer"
                                      >
                                        ⚡ Generate Invoice
                                      </button>
                                    )}

                                    {/* Action 2: Direct bank settlement */}
                                    {!directPaymentRecorded && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const txId = `TX-SL-${Math.floor(Math.random() * 8000 + 1000)}`;
                                          const newTx: Transaction = {
                                            id: txId,
                                            date: new Date().toISOString().split("T")[0],
                                            description: `Direct Setup Payment Inflow: ${t.clientInfo.name}`,
                                            institution: "Silicon Valley Bank",
                                            amount: 1500.00,
                                            type: "inflow",
                                            category: "Brokerage Onboarding Fees",
                                            status: "reconciled",
                                            comments: [`[System] Direct ledger payment recorded by Finance Auditor.`]
                                          };
                                          setTransactions(prev => [newTx, ...prev]);
                                          
                                          // Update corresponding invoice to paid if it exists
                                          if (clientSetupInvoice) {
                                            setInvoices(prev => prev.map(inv => inv.id === clientSetupInvoice.id ? { ...inv, status: "Paid" } : inv));
                                          }

                                          showToast(`Recorded dynamic cashier receipt inflow of $1,500.00 for ${t.clientInfo.name}!`);
                                        }}
                                        className="px-2.5 py-1 bg-[#a3e635] hover:bg-lime-500 text-slate-900 rounded-lg text-[9px] font-black uppercase transition cursor-pointer font-sans font-bold"
                                      >
                                        📥 Record Direct Paid
                                      </button>
                                    )}

                                    {/* Action 3: Amend client params */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Open standard setup to mutate CRM ticket details in global state!
                                        setEditRecord({
                                          type: "invoice", 
                                          id: `INV-SL-${t.id}`,
                                          data: {
                                            id: t.id,
                                            clientName: t.clientInfo.name,
                                            clientEmail: t.clientInfo.email,
                                            comments: [t.remarks || ""].filter(Boolean),
                                            isSalesTicketMutate: true
                                          }
                                        });
                                      }}
                                      className="px-2.5 py-1 border dark:border-slate-705 text-slate-700 dark:text-slate-200 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg text-[9px] font-black uppercase transition cursor-pointer font-sans"
                                    >
                                      🖊️ Amend Client / Comment
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Create Custom Invoice */}
      {isInvoiceModalOpen && (
        <div id="createInvoicePortal" className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200 text-left">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-855 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-lime-100 text-lime-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-lime-705 block">TRANSMISSION AGENT MODULE</span>
                  <h3 className="font-extrabold text-slate-909 dark:text-white text-base">Generate Customs/Service Invoice</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 overflow-y-auto max-h-[65s]">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block">Client Entity Name</label>
                  <input
                    type="text"
                    required
                    value={newInvoice.clientName}
                    onChange={(e)=>setNewInvoice({...newInvoice, clientName: e.target.value})}
                    placeholder="e.g. Acme Corp Ltd"
                    className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block">Recipient Email Address</label>
                  <input
                    type="email"
                    required
                    value={newInvoice.clientEmail}
                    onChange={(e)=>setNewInvoice({...newInvoice, clientEmail: e.target.value})}
                    placeholder="e.g. accounts@acme.com"
                    className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block">Due Date limit</label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e)=>setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-850 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block">Ledger trade currency</label>
                  <select
                    value={newInvoice.currency}
                    onChange={(e)=>setNewInvoice({...newInvoice, currency: e.target.value})}
                    className="w-full p-2.5 border dark:border-slate-800 dark:bg-slate-855 rounded-xl font-bold"
                  >
                    <option value="USD">USD ($) - Base Ledger</option>
                    <option value="EUR">EUR (€) - Euro trade</option>
                    <option value="ZAR">ZAR (R) - South Africa regional</option>
                  </select>
                </div>
              </div>

              {/* Items row */}
              <div className="space-y-2 pt-2 border-t dark:border-slate-800">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                  <span>Scope Products & Bill quantities</span>
                  <button
                    type="button"
                    onClick={handleAddInvoiceItem}
                    className="text-indigo-650 hover:underline flex items-center gap-0.5"
                  >
                    + Add New Row
                  </button>
                </div>

                <div className="space-y-2">
                  {newInvoice.items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 text-xs">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          value={it.description}
                          onChange={(e) => {
                            const updated = [...newInvoice.items];
                            updated[i].description = e.target.value;
                            setNewInvoice({...newInvoice, items: updated});
                          }}
                          placeholder="Line item description"
                          className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min="1"
                          value={it.quantity}
                          onChange={(e) => {
                            const updated = [...newInvoice.items];
                            updated[i].quantity = parseInt(e.target.value) || 1;
                            setNewInvoice({...newInvoice, items: updated});
                          }}
                          className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-mono"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          required
                          placeholder="Price"
                          value={it.price || ""}
                          onChange={(e) => {
                            const updated = [...newInvoice.items];
                            updated[i].price = parseFloat(e.target.value) || 0;
                            setNewInvoice({...newInvoice, items: updated});
                          }}
                          className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t dark:border-slate-800 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-300 rounded-xl"
                >
                  Discard Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-lime-650 hover:bg-lime-700 text-white font-black uppercase rounded-xl"
                >
                  Authorize and Dispatch
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: Amend / Comment Dynamic Records console */}
      {editRecord && (
        <div id="amendRecordPortal" className="fixed inset-0 bg-slate-950/5 flex items-start justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200 text-left">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-855 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-black text-indigo-605 block uppercase">DYNAMIC LEDGER OVERWRITE ENGINE</span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    Amend Record & Comments: <span className="font-mono text-xs text-slate-500">{editRecord.id}</span>
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* Dynamic Edit Form Fields based on Type */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Configure Record Fields</span>
                
                {editRecord.type === "transaction" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Description / Merchant</label>
                      <input
                        type="text"
                        value={editRecord.data.description || ""}
                        onChange={(e) => handleUpdateEditField("description", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Total Inflow / Outflow Sum</label>
                      <input
                        type="number"
                        value={editRecord.data.amount || 0}
                        onChange={(e) => handleUpdateEditField("amount", parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Category Label</label>
                      <input
                        type="text"
                        value={editRecord.data.category || ""}
                        onChange={(e) => handleUpdateEditField("category", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Institution Agency</label>
                      <input
                        type="text"
                        value={editRecord.data.institution || ""}
                        onChange={(e) => handleUpdateEditField("institution", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-sans"
                      />
                    </div>
                  </div>
                )}

                {editRecord.type === "invoice" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Client Representative Name</label>
                      <input
                        type="text"
                        value={editRecord.data.clientName || ""}
                        onChange={(e) => handleUpdateEditField("clientName", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Client Billing Email</label>
                      <input
                        type="email"
                        value={editRecord.data.clientEmail || ""}
                        onChange={(e) => handleUpdateEditField("clientEmail", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Due Date Expiry</label>
                      <input
                        type="date"
                        value={editRecord.data.dueDate || ""}
                        onChange={(e) => handleUpdateEditField("dueDate", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Invoice Total Sum</label>
                      <input
                        type="number"
                        value={editRecord.data.amount || 0}
                        onChange={(e) => handleUpdateEditField("amount", parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {editRecord.type === "expense" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Merchant / Vendor</label>
                      <input
                        type="text"
                        value={editRecord.data.merchant || ""}
                        onChange={(e) => handleUpdateEditField("merchant", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Claim Amount</label>
                      <input
                        type="number"
                        value={editRecord.data.amount || 0}
                        onChange={(e) => handleUpdateEditField("amount", parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Category Cluster</label>
                      <input
                        type="text"
                        value={editRecord.data.category || ""}
                        onChange={(e) => handleUpdateEditField("category", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Claimant Employee</label>
                      <input
                        type="text"
                        value={editRecord.data.submittedBy || ""}
                        onChange={(e) => handleUpdateEditField("submittedBy", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-sans"
                      />
                    </div>
                  </div>
                )}

                {editRecord.type === "product" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Product Designation</label>
                      <input
                        type="text"
                        value={editRecord.data.name || ""}
                        onChange={(e) => handleUpdateEditField("name", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-bold font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Hardware SKU Tag</label>
                      <input
                        type="text"
                        value={editRecord.data.sku || ""}
                        onChange={(e) => handleUpdateEditField("sku", e.target.value)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Unit Cost Margin</label>
                      <input
                        type="number"
                        value={editRecord.data.unitCost || 0}
                        onChange={(e) => handleUpdateEditField("unitCost", parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 block">Retail Sale Price (RSP)</label>
                      <input
                        type="number"
                        value={editRecord.data.retailPrice || 0}
                        onChange={(e) => handleUpdateEditField("retailPrice", parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Comments and Audit Logs Section */}
              <div className="border-t dark:border-slate-800 pt-4 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Internal Audit Notes & Backlog Comments</span>
                
                {/* Message input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Type professional remark or amendment justification..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCommentToEditRecord();
                      }
                    }}
                    className="flex-1 p-2 border dark:border-slate-800 dark:bg-slate-850 rounded-xl text-xs dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCommentToEditRecord}
                    className="p-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap"
                  >
                    Attach Note
                  </button>
                </div>

                {/* Timeline display */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl space-y-2 border dark:border-slate-800 max-h-36 overflow-y-auto">
                  {(!editRecord.data.comments || editRecord.data.comments.length === 0) ? (
                    <span className="text-[10px] text-slate-400 italic block py-2 select-none">No custom backlog notes associated with this ledger node. Enter a comment above.</span>
                  ) : (
                    editRecord.data.comments.map((comment: string, idx: number) => (
                      <div key={idx} className="text-[11px] border-b last:border-0 pb-1.5 dark:border-slate-800 leading-relaxed text-slate-700 dark:text-slate-300 font-medium font-sans">
                        {comment}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Global system sync notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-start gap-2.5 text-[11px]">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800 dark:text-amber-400 font-medium leading-relaxed font-sans">
                  <strong>Database Integrity Protocol:</strong> Confirming changes will rewrite corresponding items dynamically or reconcile other references directly in real-time.
                </p>
              </div>

            </div>

            {/* Sticky Actions Footer */}
            <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-855 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditRecord(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition font-sans font-bold cursor-pointer"
              >
                Cancel Override
              </button>
              <button
                type="button"
                onClick={handleApplyAmends}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-black uppercase rounded-xl transition shadow-xs cursor-pointer"
              >
                Apply Overwrite Sync
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
