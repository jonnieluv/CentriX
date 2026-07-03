import { CRMDepartment } from '../types';

export const mapEmailToDept = (email: string): CRMDepartment => {
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
