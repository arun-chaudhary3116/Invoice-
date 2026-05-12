import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fmtMoney, useClients, useInvoices } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Check, Copy, ExternalLink, Plus, Receipt, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/invoices/create")({
  head: () => ({ meta: [{ title: "New invoice — Ledgerly" }] }),
  component: CreateInvoice,
});

type DraftItem = { id: string; description: string; quantity: number; price: number };
const newId = () => Math.random().toString(36).slice(2, 10);

// ─────────────────────────────
// Payment link success banner
// ─────────────────────────────
function PaymentLinkBanner({
  invoiceId,
  invoiceNumber,
  onDone,
  stripeConnected,
}: {
  invoiceId: string;
  invoiceNumber: string;
  onDone: () => void;
  stripeConnected: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/pay/${invoiceId}`;

  const copy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Payment link copied!");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white text-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        {/* Icon + title */}
        <div className="flex items-center gap-3">
          <span
            className={`size-10 rounded-xl grid place-items-center ${
              stripeConnected ? "bg-emerald-100" : "bg-amber-100"
            }`}
          >
            {stripeConnected ? (
              <Check className="size-5 text-emerald-600" />
            ) : (
              <AlertCircle className="size-5 text-amber-600" />
            )}
          </span>
          <div>
            <h2 className="font-semibold text-zinc-900">Invoice created!</h2>
            <p className="text-xs text-zinc-500">#{invoiceNumber}</p>
          </div>
        </div>

        {/* Description */}
        {stripeConnected ? (
          <p className="text-sm text-zinc-600">
            Share this payment link with your client so they can pay online via Stripe.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-amber-700 font-medium">Online payments disabled</p>
            <p className="text-sm text-zinc-600">
              You need to connect your Stripe account to receive online payments. You can still
              track this invoice and record manual payments.
            </p>
          </div>
        )}

        {/* Link box — only if connected */}
        {stripeConnected && (
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5">
            <span className="flex-1 text-xs text-zinc-700 truncate font-mono">{link}</span>
            <button
              onClick={copy}
              className="shrink-0 p-1.5 rounded-lg hover:bg-zinc-200 transition text-zinc-500 hover:text-zinc-900"
              title="Copy link"
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-1.5 rounded-lg hover:bg-zinc-200 transition text-zinc-500 hover:text-zinc-900"
              title="Open link"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {stripeConnected && (
            <Button
              onClick={copy}
              className="flex-1 bg-zinc-900 text-white hover:bg-zinc-700 rounded-xl gap-1.5"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied!" : "Copy link"}
            </Button>
          )}
          <Button
            variant={stripeConnected ? "outline" : "default"}
            onClick={onDone}
            className={`${stripeConnected ? "flex-1" : "w-full"} rounded-xl`}
          >
            {stripeConnected ? "Go to invoices" : "Done"}
          </Button>
        </div>

        {!stripeConnected && (
          <div className="pt-2 border-t border-zinc-200">
            <a
              href="/dashboard/settings"
              className="block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Connect Stripe Account →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────
// Main page
// ─────────────────────────────
function CreateInvoice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clients, loading: loadingClients } = useClients();
  const { create } = useInvoices();

  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(due);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [items, setItems] = useState<DraftItem[]>([
    { id: newId(), description: "", quantity: 1, price: 0 },
  ]);
  const [busy, setBusy] = useState(false);

  // After creation — show the link banner
  const [createdInvoice, setCreatedInvoice] = useState<{
    _id: string;
    invoiceNumber: string;
  } | null>(null);

  if (!clientId && clients.length) setClientId(clients[0]._id);

  const client = clients.find((c) => c._id === clientId);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.quantity * i.price, 0), [items]);
  const tax = (subtotal - discount) * (taxRate / 100);
  const total = subtotal + tax - discount;

  const updateItem = (id: string, patch: Partial<DraftItem>) =>
    setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () =>
    setItems([...items, { id: newId(), description: "", quantity: 1, price: 0 }]);
  const removeItem = (id: string) => setItems(items.filter((it) => it.id !== id));

  const save = async (status: "draft" | "sent") => {
    if (!client) return toast.error("Pick a client first");
    if (items.some((i) => !i.description)) return toast.error("Each item needs a description");
    setBusy(true);
    try {
      const inv = await create({
        clientId: client._id,
        issueDate,
        dueDate,
        items: items.map(({ description, quantity, price }) => ({ description, quantity, price })),
        taxRate,
        discount,
        currency,
        notes,
        terms,
      });

      if (status === "sent" && inv?._id) {
        try {
          await (
            await import("@/lib/auth")
          ).api(`/api/invoices/${inv._id}/send`, {
            method: "POST",
          });
        } catch {}
      }

      // Show the payment link banner instead of navigating away immediately
      if (inv?._id) {
        setCreatedInvoice({ _id: inv._id, invoiceNumber: inv.invoiceNumber });
      } else {
        toast.success(status === "draft" ? "Saved as draft" : "Invoice created & sent");
        navigate({ to: "/dashboard/invoices" });
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create invoice");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Payment link modal shown after creation */}
      {createdInvoice && (
        <PaymentLinkBanner
          invoiceId={createdInvoice._id}
          invoiceNumber={createdInvoice.invoiceNumber}
          onDone={() => navigate({ to: "/dashboard/invoices" })}
          stripeConnected={!!user?.stripeAccountId}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,520px)] max-w-[1400px]">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Invoice</h1>
            <p className="text-sm text-muted-foreground">
              Fill in the details — your preview updates live. Invoice number is generated by your
              backend.
            </p>
          </div>

          {/* Details */}
          <section className="rounded-xl border border-border/60 bg-surface/60 p-5 space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={loadingClients ? "Loading…" : "Select client"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.company || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!loadingClients && clients.length === 0 && (
                  <p className="text-xs text-amber-300 mt-1.5">Add a client first.</p>
                )}
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "GBP", "CAD", "AUD"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Issue date</Label>
                <Input
                  type="date"
                  className="mt-1.5"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Due date</Label>
                <Input
                  type="date"
                  className="mt-1.5"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Line items */}
          <section className="rounded-xl border border-border/60 bg-surface/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Line items
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                <Plus className="size-4" /> Add item
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    className="col-span-6"
                    placeholder="Description"
                    value={it.description}
                    onChange={(e) => updateItem(it.id, { description: e.target.value })}
                  />
                  <Input
                    type="number"
                    min={0.01}
                    step="0.01"
                    className="col-span-2 text-right"
                    value={it.quantity}
                    onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="col-span-3 text-right"
                    value={it.price}
                    onChange={(e) => updateItem(it.id, { price: Number(e.target.value) || 0 })}
                  />
                  <button
                    onClick={() => removeItem(it.id)}
                    className="col-span-1 p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-rose-300 grid place-items-center"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div>
                <Label>Tax rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Discount</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1.5"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                className="mt-1.5"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment instructions, thank-you note…"
              />
            </div>
            <div>
              <Label>Terms</Label>
              <Textarea
                className="mt-1.5"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Net 14, late fees, etc."
              />
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={busy} onClick={() => save("draft")}>
              Save draft
            </Button>
            <Button
              disabled={busy}
              onClick={() => save("sent")}
              className="rounded-full bg-foreground text-primary-foreground hover:opacity-90"
            >
              {busy ? "Saving…" : "Send invoice"}
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="rounded-2xl border border-border/60 bg-white text-zinc-900 shadow-card overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="size-8 rounded-lg bg-zinc-900 grid place-items-center">
                      <Receipt className="size-4 text-white" />
                    </span>
                    {user?.name ?? "Your business"}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{user?.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Invoice</div>
                  <div className="font-semibold">DRAFT</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Bill to</div>
                  <div className="font-medium mt-1">{client?.company || client?.name || "—"}</div>
                  <div className="text-zinc-500">{client?.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Issued</div>
                  <div className="font-medium">{issueDate}</div>
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mt-2">Due</div>
                  <div className="font-medium">{dueDate}</div>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                  <tr>
                    <th className="text-left font-normal py-2">Description</th>
                    <th className="text-right font-normal py-2 w-12">Qty</th>
                    <th className="text-right font-normal py-2 w-24">Price</th>
                    <th className="text-right font-normal py-2 w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-zinc-100">
                      <td className="py-2">
                        {it.description || <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="py-2 text-right">{it.quantity}</td>
                      <td className="py-2 text-right">{fmtMoney(it.price, currency)}</td>
                      <td className="py-2 text-right">
                        {fmtMoney(it.quantity * it.price, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ml-auto w-56 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal</span>
                  <span>{fmtMoney(subtotal, currency)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Discount</span>
                    <span>-{fmtMoney(discount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tax ({taxRate}%)</span>
                  <span>{fmtMoney(tax, currency)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-zinc-200">
                  <span>Total</span>
                  <span>{fmtMoney(total, currency)}</span>
                </div>
              </div>

              {notes && (
                <div className="text-xs text-zinc-500 border-t border-zinc-200 pt-4">{notes}</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
