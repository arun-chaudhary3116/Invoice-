// API-backed hooks talking to your Express backend.
// Endpoints used:
//   GET/POST/PATCH/DELETE  /api/clients
//   GET/POST/PATCH/DELETE  /api/invoices  +  POST /api/invoices/:id/send  +  GET /api/invoices/stats/summary
//   GET/POST               /api/payments  +  GET /api/payments/stats/summary
//   POST                   /api/payments/checkout  (Stripe — see backend guide)
import { useCallback, useEffect, useState } from "react";
import { api } from "./auth";

export type Client = {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  website?: string;
  notes?: string;
  totalInvoiced?: number;
  totalPaid?: number;
  outstandingAmount?: number;
  createdAt: string;
};

export type InvoiceItem = {
  _id?: string;
  description: string;
  quantity: number;
  price: number;
  amount?: number;
};

export type InvoiceStatus =
  | "draft" | "sent" | "viewed" | "paid" | "partial" | "overdue" | "cancelled";

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  clientId: string | { _id: string; name: string; email: string; company?: string };
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  createdAt: string;
};

export type Payment = {
  _id: string;
  invoiceId: string | { _id: string; invoiceNumber: string };
  clientId?: string | { _id: string; name: string };
  amount: number;
  method?: string;
  status?: string;
  paidAt?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
};

export type InvoiceStats = {
  total: number; draft: number; sent: number; paid: number;
  overdue: number; partial: number;
  totalAmount: number; paidAmount: number; pendingAmount: number;
};

// ─── generic resource hook ─────────────────────────────────────────────
function useResource<T>(path: string, key: string = "data") {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ ok: boolean; [k: string]: any }>(path);
      setItems((res[key] ?? res.data ?? []) as T[]);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [path, key]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, reload, setItems };
}

// ─── clients ──────────────────────────────────────────────────────────
export function useClients() {
  const r = useResource<Client>("/api/clients");
  return {
    clients: r.items,
    loading: r.loading,
    error: r.error,
    reload: r.reload,
    create: async (data: Partial<Client>) => {
      const res = await api<{ data: Client }>("/api/clients", {
        method: "POST",
        body: JSON.stringify(data),
      });
      await r.reload();
      return res.data;
    },
    update: async (id: string, data: Partial<Client>) => {
      await api(`/api/clients/${id}`, { method: "PATCH", body: JSON.stringify(data) });
      await r.reload();
    },
    remove: async (id: string) => {
      await api(`/api/clients/${id}`, { method: "DELETE" });
      await r.reload();
    },
  };
}

// ─── invoices ─────────────────────────────────────────────────────────
export function useInvoices() {
  const r = useResource<Invoice>("/api/invoices");
  return {
    invoices: r.items,
    loading: r.loading,
    error: r.error,
    reload: r.reload,
    create: async (data: any) => {
      const res = await api<{ data: Invoice }>("/api/invoices", {
        method: "POST",
        body: JSON.stringify(data),
      });
      await r.reload();
      return res.data;
    },
    update: async (id: string, data: any) => {
      await api(`/api/invoices/${id}`, { method: "PATCH", body: JSON.stringify(data) });
      await r.reload();
    },
    send: async (id: string) => {
      await api(`/api/invoices/${id}/send`, { method: "POST" });
      await r.reload();
    },
    markPaid: async (inv: Invoice) => {
      await api(`/api/invoices/${inv._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "paid", paidAmount: inv.total }),
      });
      await r.reload();
    },
    remove: async (id: string) => {
      await api(`/api/invoices/${id}`, { method: "DELETE" });
      await r.reload();
    },
  };
}

export function useInvoiceStats() {
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try {
      const res = await api<{ data: InvoiceStats }>("/api/invoices/stats/summary");
      setStats(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { stats, loading, reload };
}

// ─── payments ─────────────────────────────────────────────────────────
export function usePayments() {
  const r = useResource<Payment>("/api/payments");
  return {
    payments: r.items,
    loading: r.loading,
    error: r.error,
    reload: r.reload,
    record: async (data: { invoiceId: string; amount: number; method?: string; reference?: string; notes?: string }) => {
      await api("/api/payments", { method: "POST", body: JSON.stringify(data) });
      await r.reload();
    },
    remove: async (id: string) => {
      await api(`/api/payments/${id}`, { method: "DELETE" });
      await r.reload();
    },
  };
}

// ─── helpers ──────────────────────────────────────────────────────────
export const clientName = (c: Invoice["clientId"]) =>
  typeof c === "string" ? "" : (c?.company || c?.name || "—");
export const clientEmail = (c: Invoice["clientId"]) =>
  typeof c === "string" ? "" : (c?.email ?? "");
export const clientIdOf = (c: Invoice["clientId"]) =>
  typeof c === "string" ? c : c?._id;

export const fmtMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n || 0);

export const fmtDate = (d?: string) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";
