import { isSupabaseConfigured } from "@/lib/env";
import { getLegacyFallbackStorageKey, getScopedStorageKey, loadCurrentUserScope } from "@/lib/user-scope";

export type StoredAccount = {
  plan: "free" | "pro";
  fullName: string;
  professionalEmail: string;
  phone: string;
  companyName: string;
  legalName: string;
  companyAddress: string;
  companyMeta: string;
  siretNumber: string;
  vatNumber: string;
  website: string;
  iban: string;
  defaultPaymentTerms: string;
  footerNote: string;
  logoUrl: string;
  logoName: string;
  passwordUpdatedAt: string;
};

const ACCOUNT_KEY = "atelio_account_v1";
export const FREE_CLIENT_LIMIT = 5;
export const FREE_DOCUMENT_LIMIT = 10;

export function defaultAccount(): StoredAccount {
  const scope = loadCurrentUserScope();

  if (scope) {
    return {
      plan: "free",
      fullName: scope.fullName || "",
      professionalEmail: scope.email || "",
      phone: "",
      companyName: "",
      legalName: "",
      companyAddress: "",
      companyMeta: "",
      siretNumber: "",
      vatNumber: "",
      website: "",
      iban: "",
      defaultPaymentTerms: "30 jours net",
      footerNote: "Merci pour votre confiance.",
      logoUrl: "",
      logoName: "",
      passwordUpdatedAt: ""
    };
  }

  if (isSupabaseConfigured) {
    return {
      plan: "free",
      fullName: "",
      professionalEmail: "",
      phone: "",
      companyName: "",
      legalName: "",
      companyAddress: "",
      companyMeta: "",
      siretNumber: "",
      vatNumber: "",
      website: "",
      iban: "",
      defaultPaymentTerms: "30 jours net",
      footerNote: "Merci pour votre confiance.",
      logoUrl: "",
      logoName: "",
      passwordUpdatedAt: ""
    };
  }

  return {
    plan: "free",
    fullName: "Mathis",
    professionalEmail: "contact@atelio.fr",
    phone: "+33 6 00 00 00 00",
    companyName: "Atelio Flow",
    legalName: "Atelio Flow",
    companyAddress: "123 rue de la Paix",
    companyMeta: "75001 Paris · SIRET 123 456 789 00012",
    siretNumber: "123 456 789 00012",
    vatNumber: "FR12 345678901",
    website: "https://atelio.fr",
    iban: "FR76 1234 5678 9012 3456 7890 123",
    defaultPaymentTerms: "30 jours net",
    footerNote: "Merci pour votre confiance.",
    logoUrl: "",
    logoName: "",
    passwordUpdatedAt: ""
  };
}

export function isPremium(account: StoredAccount) {
  return account.plan === "pro";
}

export function canUseLockedDocumentTypes(account: StoredAccount) {
  return isPremium(account);
}

export function canCreateClient(account: StoredAccount, currentCount: number) {
  return isPremium(account) || currentCount < FREE_CLIENT_LIMIT;
}

export function canCreateDocument(account: StoredAccount, currentCount: number) {
  return isPremium(account) || currentCount < FREE_DOCUMENT_LIMIT;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadAccount(): StoredAccount {
  if (!canUseStorage()) return defaultAccount();

  const scopedRaw = window.localStorage.getItem(getScopedStorageKey(ACCOUNT_KEY));
  const legacyKey = getLegacyFallbackStorageKey(ACCOUNT_KEY);
  const raw = scopedRaw ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null);
  if (!raw) return defaultAccount();

  try {
    const parsed = { ...defaultAccount(), ...(JSON.parse(raw) as Partial<StoredAccount>) };

    // Smoothly migrate older demo branding already stored in the browser.
    if (parsed.companyName === "Atelio Studio") {
      parsed.companyName = "Atelio Flow";
    }

    if (parsed.legalName === "Atelio Studio") {
      parsed.legalName = "Atelio Flow";
    }

    return parsed;
  } catch {
    return defaultAccount();
  }
}

export function saveAccount(account: StoredAccount) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(getScopedStorageKey(ACCOUNT_KEY), JSON.stringify(account));
  window.dispatchEvent(new CustomEvent("atelio-account-updated"));
}
