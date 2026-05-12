import { fmtDate, fmtMoney } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Receipt, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/pay/$invoiceId")({
  head: () => ({ meta: [{ title: "Pay Invoice — Ledgerly" }] }),
  component: PayPage,
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type InvoicePublic = {
  _id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  total: number;
  paidAmount: number;
  status: string;
  items: { description: string; quantity: number; price: number }[];
  clientId: { name: string; email: string; company?: string } | null;
  notes?: string;
};

function PayPage() {
  const { invoiceId } = Route.useParams();
  const [invoice, setInvoice] = useState<InvoicePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/invoices/${invoiceId}/public`)
      .then((r) => {
        if (!r.ok) throw new Error("Invoice not found");
        return r.json();
      })
      .then((r) => setInvoice(r.data ?? r))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handlePay = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      const res = await fetch(`${API}/api/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // No auth header — guest checkout
        body: JSON.stringify({ invoiceId: invoice._id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Checkout failed");
      if (!data.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
      setPaying(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-sm text-zinc-400">Loading invoice…</div>
      </div>
    );
  }

  // ── Error ──
  if (error || !invoice) {
    const isStripeNotConnected = error?.includes("not connected");
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 max-w-md w-full text-center">
          <XCircle className="size-12 text-rose-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-zinc-900">
            {isStripeNotConnected ? "Online payments unavailable" : "Invoice not found"}
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            {isStripeNotConnected
              ? "This business hasn't connected their Stripe account yet. Please contact them to set up online payments, or ask about alternative payment methods."
              : (error ?? "This invoice doesn't exist or has been removed.")}
          </p>
        </div>
      </div>
    );
  }

  const outstanding = invoice.total - invoice.paidAmount;
  const alreadyPaid = invoice.status === "paid" || outstanding <= 0;
  const clientLabel = invoice.clientId?.company || invoice.clientId?.name || "—";

  // ── Already paid ──
  if (alreadyPaid) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 max-w-md w-full text-center">
          <CheckCircle2 className="size-12 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-zinc-900">Already paid</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Invoice {invoice.invoiceNumber} has already been settled. Thank you!
          </p>
        </div>
      </div>
    );
  }

  // ── Pay page ──
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden w-full max-w-lg">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="size-8 rounded-lg bg-zinc-900 grid place-items-center">
              <Receipt className="size-4 text-white" />
            </span>
            <span className="font-semibold text-zinc-900">Ledgerly</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Invoice</div>
            <div className="font-semibold text-zinc-900">{invoice.invoiceNumber}</div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Billed to</div>
              <div className="font-medium text-zinc-900">{clientLabel}</div>
              {invoice.clientId?.email && (
                <div className="text-zinc-500 text-xs">{invoice.clientId.email}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Due date</div>
              <div className="font-medium text-zinc-900">{fmtDate(invoice.dueDate)}</div>
            </div>
          </div>

          {/* Line items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs text-zinc-400 uppercase tracking-wider">
                <th className="text-left font-normal py-2">Description</th>
                <th className="text-right font-normal py-2 w-10">Qty</th>
                <th className="text-right font-normal py-2 w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-zinc-50">
                  <td className="py-2 text-zinc-700">{item.description}</td>
                  <td className="py-2 text-right text-zinc-500">{item.quantity}</td>
                  <td className="py-2 text-right text-zinc-700 tabular-nums">
                    {fmtMoney(item.quantity * item.price, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm text-zinc-500">
              {invoice.paidAmount > 0
                ? `Outstanding (${fmtMoney(invoice.paidAmount, invoice.currency)} already paid)`
                : "Total due"}
            </span>
            <span className="text-xl font-bold text-zinc-900 tabular-nums">
              {fmtMoney(outstanding, invoice.currency)}
            </span>
          </div>

          {invoice.notes && (
            <p className="text-xs text-zinc-400 border-t border-zinc-100 pt-4">{invoice.notes}</p>
          )}

          {/* CTA */}
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-3 rounded-xl bg-zinc-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-700 transition disabled:opacity-60"
          >
            <CreditCard className="size-4" />
            {paying ? "Redirecting to Stripe…" : `Pay ${fmtMoney(outstanding, invoice.currency)}`}
          </button>

          <p className="text-center text-xs text-zinc-400">
            Secured by Stripe · You'll be redirected to complete payment
          </p>
        </div>
      </div>
    </div>
  );
}
