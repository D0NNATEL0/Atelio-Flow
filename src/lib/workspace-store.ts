import { clientRows, documentRows } from "@/data";

export type StoredClient = {
  name: string;
  email: string;
  contactEmail: string;
  phone: string;
  coordinates: string;
  createdAt: string;
  kind: "pro" | "particulier";
  relationshipStatus: "Compte clé" | "Actif" | "À développer";
  initials: string;
  total: string;
  docs: number;
  accent: "violet" | "coral" | "cyan" | "green" | "amber" | "pink";
};

export type StoredDocument = {
  id: string;
  client: string;
  date: string;
  due: string;
  amount: string;
  status: string;
  type: string;
};

export type PendingExternalDocument = {
  fileName: string;
  guessedType: string;
  createdAt: string;
};

const CLIENTS_KEY = "atelio_clients_v1";
const DOCUMENTS_KEY = "atelio_documents_v1";
const PENDING_EXTERNAL_DOCUMENT_KEY = "atelio_pending_external_document_v1";

const accents: StoredClient["accent"][] = ["violet", "coral", "cyan", "green", "amber", "pink"];

function canUseStorage() {
  return typeof window !== "undefined";
}

function parseAmount(value: string) {
  return Number(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
}

function formatAmount(value: number) {
  return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
}

function initialsFromName(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "CL"
  );
}

export function getDocumentPrefix(type: string) {
  const normalized = type.toLowerCase();
  if (normalized === "facture") return "FAC";
  if (normalized === "devis") return "DEV";
  if (normalized === "contrat") return "CTR";
  if (normalized === "avenant") return "AVE";
  return "DOC";
}

export function guessDocumentTypeFromFileName(fileName: string) {
  const normalized = fileName.toLowerCase();
  if (normalized.includes("facture")) return "Facture";
  if (normalized.includes("devis")) return "Devis";
  if (normalized.includes("avenant")) return "Avenant";
  return "Contrat";
}

export function getNextDocumentNumber(documents: StoredDocument[], type: string, referenceDate: string) {
  const prefix = getDocumentPrefix(type);
  const year = /^\d{4}/.test(referenceDate) ? referenceDate.slice(0, 4) : new Date().getFullYear().toString();

  const maxSequence = documents.reduce((max, document) => {
    if (!document.id.startsWith(`${prefix}-`)) return max;

    const match = document.id.match(new RegExp(`^${prefix}-(\\d{4})-(\\d{3})$`));
    if (!match) return max;

    const [, documentYear, sequence] = match;
    if (documentYear !== year) return max;

    return Math.max(max, Number(sequence));
  }, 0);

  return `${year}-${String(maxSequence + 1).padStart(3, "0")}`;
}

export function createDocumentEntry(
  documents: StoredDocument[],
  type: string,
  client: string,
  referenceDate: string,
  amount = "0,00 €",
  status = "Brouillon",
  due = "—"
): StoredDocument {
  const nextNumber = getNextDocumentNumber(documents, type, referenceDate);

  return {
    id: `${getDocumentPrefix(type)}-${nextNumber}`,
    client,
    date: referenceDate,
    due,
    amount,
    status,
    type
  };
}

function defaultCreatedAt(index: number) {
  const date = new Date("2026-04-02T09:00:00");
  date.setDate(date.getDate() - index * 14);
  return date.toISOString().slice(0, 10);
}

function relationshipStatusFromDocs(docs: number): StoredClient["relationshipStatus"] {
  if (docs >= 10) return "Compte clé";
  if (docs >= 5) return "Actif";
  return "À développer";
}

function normalizeClient(client: StoredClient, index: number): StoredClient {
  return {
    ...client,
    createdAt: client.createdAt || defaultCreatedAt(index),
    kind: client.kind || "pro",
    relationshipStatus: client.relationshipStatus || relationshipStatusFromDocs(client.docs || 0),
    phone: client.phone || "À compléter",
    coordinates: client.coordinates || `${client.contactEmail || client.email} · Coordonnées à compléter`
  };
}

export function defaultClients(): StoredClient[] {
  return clientRows.map((client, index) =>
    normalizeClient(
      {
        ...client,
        email: client.email,
        contactEmail: client.email,
        phone: "À compléter",
        coordinates: `${client.email} · Coordonnées à compléter`,
        createdAt: defaultCreatedAt(index),
        kind: "pro",
        relationshipStatus: relationshipStatusFromDocs(client.docs)
      },
      index
    )
  );
}

export function defaultDocuments(): StoredDocument[] {
  return documentRows.map((row) => ({ ...row }));
}

export function hydrateClients(clients: StoredClient[], documents: StoredDocument[]) {
  return clients.map((client) => {
    const linkedDocs = documents.filter((row) => row.client === client.name);
    const total = linkedDocs.reduce((sum, row) => sum + parseAmount(row.amount), 0);

    return {
      ...client,
      docs: linkedDocs.length,
      total: linkedDocs.length ? formatAmount(total) : client.total
    };
  });
}

export function loadClients(): StoredClient[] {
  if (!canUseStorage()) return defaultClients();

  const raw = window.localStorage.getItem(CLIENTS_KEY);
  if (!raw) return defaultClients();

  try {
    return (JSON.parse(raw) as StoredClient[]).map((client, index) => normalizeClient(client, index));
  } catch {
    return defaultClients();
  }
}

export function saveClients(clients: StoredClient[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function loadDocuments(): StoredDocument[] {
  if (!canUseStorage()) return defaultDocuments();

  const raw = window.localStorage.getItem(DOCUMENTS_KEY);
  if (!raw) return defaultDocuments();

  try {
    return JSON.parse(raw) as StoredDocument[];
  } catch {
    return defaultDocuments();
  }
}

export function saveDocuments(documents: StoredDocument[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
}

export function loadPendingExternalDocument(): PendingExternalDocument | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(PENDING_EXTERNAL_DOCUMENT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingExternalDocument;
  } catch {
    return null;
  }
}

export function savePendingExternalDocument(document: PendingExternalDocument) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PENDING_EXTERNAL_DOCUMENT_KEY, JSON.stringify(document));
}

export function clearPendingExternalDocument() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(PENDING_EXTERNAL_DOCUMENT_KEY);
}

export function upsertClientFromDocument(
  clients: StoredClient[],
  recipient: { name: string; email?: string; coordinates: string }
) {
  const existing = clients.find((client) => client.name === recipient.name);
  if (existing) {
    return clients.map((client) =>
      client.name === recipient.name
        ? {
            ...client,
            contactEmail: recipient.email || client.contactEmail,
            email: recipient.email || client.email,
            coordinates: recipient.coordinates || client.coordinates
          }
        : client
    );
  }

  const nextClient: StoredClient = {
    name: recipient.name,
    email: recipient.email || "contact@client.fr",
    contactEmail: recipient.email || "contact@client.fr",
    phone: "À compléter",
    coordinates: recipient.coordinates || "Coordonnées à compléter",
    createdAt: new Date().toISOString().slice(0, 10),
    kind: "particulier",
    relationshipStatus: "À développer",
    initials: initialsFromName(recipient.name),
    total: "0 €",
    docs: 0,
    accent: accents[clients.length % accents.length]
  };

  return [nextClient, ...clients];
}
