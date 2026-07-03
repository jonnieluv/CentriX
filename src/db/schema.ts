import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  jsonb,
  uuid 
} from "drizzle-orm/pg-core";

// --- Users & Authenticaton ---
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull().default("Agent"),
  department: varchar("department", { length: 100 }),
  passwordHash: varchar("password_hash", { length: 255 }), // Populated when local Auth is used
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});

// --- Leads & Clients (CRM Core Pipeline) ---
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignedAgentId: uuid("assigned_agent_id").references(() => users.id),
  leadSource: varchar("lead_source", { length: 100 }), // Web, Social, Direct
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  nationalId: varchar("national_id", { length: 100 }).unique(),
  status: varchar("status", { length: 100 }).notNull().default("New Lead"),
  salary: integer("salary"),
  notes: text("notes"),
  consentDnc: boolean("consent_do_not_contact").default(false), // POPIA Compliance Flag
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});

// --- Affordability & Background Checks ---
export const financialEvaluations = pgTable("financial_evaluations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  creditScore: integer("credit_score"),
  disposableIncome: integer("disposable_income"),
  totalDebt: integer("total_debt"),
  debtReviewFlag: boolean("debt_review_flag").default(false),
  approvedLimit: integer("approved_limit"),
  decisionLogic: jsonb("decision_logic"), // Full transparent logic trace
  evaluatedAt: timestamp("evaluated_at", { withTimezone: true }).defaultNow()
});

// --- QA & Compliance Auditing ---
export const qaAssessments = pgTable("qa_assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id).notNull(),
  auditorId: uuid("auditor_id").references(() => users.id), // Can be null if AI Auto-audited
  score: integer("score").default(0),
  status: varchar("status", { length: 50 }).notNull().default("Pending"), // Passed, Failed, Conditional
  checkList: jsonb("check_list").notNull(), // Specific Boolean Checks matched via metadata
  comments: text("comments"),
  autoAudited: boolean("auto_audited").default(true),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow()
});

// --- Integrations & Service Mesh Definitions ---
export const integrationConnectors = pgTable("integration_connectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerAlias: varchar("provider_alias", { length: 100 }).notNull(), // Stripe, SAP, Zoom
  category: varchar("category", { length: 50 }).notNull(), // Business, Social
  status: varchar("status", { length: 50 }).notNull().default("Offline"),
  authStrategy: varchar("auth_strategy", { length: 100 }).notNull(), // OAuth 2.0, Webhook HMAC
  endpointUrl: varchar("endpoint_url", { length: 500 }),
  secretEncrypted: varchar("secret_encrypted", { length: 1000 }), // KMS Encrypted
  healthScore: integer("health_score").default(100),
  lastSyncPayload: jsonb("last_sync_payload"), // Useful for debugging latency issues
  syncLastTriggeredAt: timestamp("sync_last_triggered_at", { withTimezone: true })
});

// --- Global Audit Trailing ---
export const globalSystemLogs = pgTable("global_system_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  executorId: uuid("executor_id").references(() => users.id), // Can be System ID
  actionContext: text("action_context").notNull(), 
  entityAffected: varchar("entity_affected", { length: 255 }), // "Users", "Integrations"
  severityLevel: varchar("severity_level", { length: 50 }).default("Info"), // Info, Warning, Critical
  ipAddress: varchar("ip_address", { length: 100 }),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow()
});
