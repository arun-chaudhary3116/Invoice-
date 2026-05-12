import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientName, fmtDate, fmtMoney, useInvoices, usePayments, type Payment } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/payments")({
  head: () => ({ meta: [{ title: "Payments — Ledgerly" }] }),
  component: PaymentsPage,
});

const invNum = (i: Payment["invoiceId"]) => (typeof i === "string" ? i : (i?.invoiceNumber ?? "—"));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Period = "7d" | "30d" | "90d" | "12m" | "all";

function PaymentsPage() {
  const { payments, loading, error, record, remove } = usePayments();
  const { invoices } = useInvoices();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [period, setPeriod] = useState<Period>("30d");
  const [form, setForm] = useState({
    invoiceId: "",
    amount: 0,
    method: "bank_transfer",
    reference: "",
  });

  const unpaid = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");

  // ── Filter payments by period ──
  const now = new Date();
  const filteredPayments = useMemo(() => {
    if (period === "all") return payments;
    const cutoff = new Date();
    if (period === "7d") cutoff.setDate(now.getDate() - 7);
    else if (period === "30d") cutoff.setDate(now.getDate() - 30);
    else if (period === "90d") cutoff.setDate(now.getDate() - 90);
    else if (period === "12m") cutoff.setMonth(now.getMonth() - 12);
    return payments.filter((p) => new Date(p.paidAt || p.createdAt) >= cutoff);
  }, [payments, period]);

  // ── Previous period for comparison ──
  const prevPayments = useMemo(() => {
    if (period === "all") return [];
    const now2 = new Date();
    const start = new Date();
    const end = new Date();
    if (period === "7d") {
      start.setDate(now2.getDate() - 14);
      end.setDate(now2.getDate() - 7);
    } else if (period === "30d") {
      start.setDate(now2.getDate() - 60);
      end.setDate(now2.getDate() - 30);
    } else if (period === "90d") {
      start.setDate(now2.getDate() - 180);
      end.setDate(now2.getDate() - 90);
    } else if (period === "12m") {
      start.setMonth(now2.getMonth() - 24);
      end.setMonth(now2.getMonth() - 12);
    }
    return payments.filter((p) => {
      const d = new Date(p.paidAt || p.createdAt);
      return d >= start && d < end;
    });
  }, [payments, period]);

  // ── Stats ──
  const totalRevenue = filteredPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const prevRevenue = prevPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : null;

  const avgPayment = filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0;
  const prevAvg = prevPayments.length > 0 ? prevRevenue / prevPayments.length : 0;
  const avgChange = prevAvg > 0 ? ((avgPayment - prevAvg) / prevAvg) * 100 : null;

  const outstanding = invoices.reduce((s, i) => s + Math.max(0, i.total - (i.paidAmount ?? 0)), 0);

  // ── Monthly chart data (last 6 months) ──
  const monthlyData = useMemo(() => {
    const result: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = MONTHS[d.getMonth()];
      const year = d.getFullYear();
      const amount = payments
        .filter((p) => {
          const pd = new Date(p.paidAt || p.createdAt);
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === year;
        })
        .reduce((s, p) => s + (p.amount || 0), 0);
      result.push({ month, amount });
    }
    return result;
  }, [payments]);

  const maxMonthly = Math.max(...monthlyData.map((d) => d.amount), 1);

  // ── Per-client breakdown ──
  const clientBreakdown = useMemo(() => {
    const map: Record<string, { name: string; amount: number; count: number }> = {};
    filteredPayments.forEach((p) => {
      const inv =
        typeof p.invoiceId === "object" ? p.invoiceId : invoices.find((i) => i._id === p.invoiceId);
      const name = inv ? clientName((inv as any).clientId) : "Unknown";
      const key = name;
      if (!map[key]) map[key] = { name, amount: 0, count: 0 };
      map[key].amount += p.amount || 0;
      map[key].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredPayments, invoices]);

  // ── Method breakdown ──
  const methodBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPayments.forEach((p) => {
      const m = p.method || "other";
      map[m] = (map[m] || 0) + (p.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredPayments]);

  const onRecord = async () => {
    if (!form.invoiceId || !form.amount) return toast.error("Pick invoice and amount");
    setBusy(true);
    try {
      await record(form);
      setForm({ invoiceId: "", amount: 0, method: "bank_transfer", reference: "" });
      setOpen(false);
      toast.success("Payment recorded");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const periodLabel: Record<Period, string> = {
    "7d": "vs last 7 days",
    "30d": "vs last 30 days",
    "90d": "vs last 90 days",
    "12m": "vs last 12 months",
    all: "",
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">
            Revenue, collection history & client breakdown
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {/* Period selector */}
          <div className="flex gap-1 p-1 rounded-full bg-surface/60 border border-border/60">
            {(["7d", "30d", "90d", "12m", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs rounded-full capitalize whitespace-nowrap transition ${
                  period === p
                    ? "bg-foreground text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Record payment */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-foreground text-primary-foreground hover:opacity-90">
                <Plus className="size-4" /> Record payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record a payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label>Invoice</Label>
                  <Select
                    value={form.invoiceId}
                    onValueChange={(v) => {
                      const inv = invoices.find((i) => i._id === v);
                      setForm({
                        ...form,
                        invoiceId: v,
                        amount: inv ? inv.total - inv.paidAmount : 0,
                      });
                    }}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {unpaid.map((i) => (
                        <SelectItem key={i._id} value={i._id}>
                          {i.invoiceNumber} — {clientName(i.clientId)} ·{" "}
                          {fmtMoney(i.total - i.paidAmount, i.currency)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="mt-1.5"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Method</Label>
                    <Select
                      value={form.method}
                      onValueChange={(v) => setForm({ ...form, method: v })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["bank_transfer", "cash", "credit_card", "check", "paypal", "other"].map(
                          (m) => (
                            <SelectItem key={m} value={m}>
                              {m.replace("_", " ")}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Reference</Label>
                  <Input
                    className="mt-1.5"
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    placeholder="Transaction ID, note…"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={onRecord}
                  disabled={busy}
                  className="rounded-full bg-foreground text-primary-foreground hover:opacity-90"
                >
                  {busy ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="rounded-xl border border-border/60 bg-surface/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</span>
            <Wallet className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-3 text-2xl font-semibold tabular-nums">{fmtMoney(totalRevenue)}</div>
          {revenueChange !== null && (
            <div
              className={`mt-1 flex items-center gap-1 text-xs ${revenueChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {revenueChange >= 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {Math.abs(revenueChange).toFixed(1)}% {periodLabel[period]}
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="rounded-xl border border-border/60 bg-surface/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Transactions
            </span>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-3 text-2xl font-semibold tabular-nums">{filteredPayments.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {prevPayments.length > 0 && `${prevPayments.length} previous period`}
          </div>
        </div>

        {/* Avg payment */}
        <div className="rounded-xl border border-border/60 bg-surface/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Avg payment
            </span>
            <Calendar className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-3 text-2xl font-semibold tabular-nums">{fmtMoney(avgPayment)}</div>
          {avgChange !== null && (
            <div
              className={`mt-1 flex items-center gap-1 text-xs ${avgChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {avgChange >= 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {Math.abs(avgChange).toFixed(1)}% {periodLabel[period]}
            </div>
          )}
        </div>

        {/* Outstanding */}
        <div className="rounded-xl border border-border/60 bg-surface/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Outstanding
            </span>
            <Users className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-3 text-2xl font-semibold tabular-nums text-amber-400">
            {fmtMoney(outstanding)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {unpaid.length} unpaid invoice{unpaid.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* ── Monthly bar chart + client breakdown ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Monthly chart */}
        <div className="rounded-xl border border-border/60 bg-surface/60 p-5">
          <h2 className="font-semibold mb-4">Monthly revenue</h2>
          <div className="flex items-end gap-2 h-36">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {d.amount > 0 ? fmtMoney(d.amount, undefined, true) : ""}
                </span>
                <div
                  className="w-full rounded-t-md bg-foreground/10 relative overflow-hidden"
                  style={{ height: "80px" }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-md bg-foreground transition-all duration-500"
                    style={{ height: `${(d.amount / maxMonthly) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients */}
        <div className="rounded-xl border border-border/60 bg-surface/60 p-5">
          <h2 className="font-semibold mb-4">Top clients</h2>
          {clientBreakdown.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No data for this period
            </div>
          ) : (
            <div className="space-y-3">
              {clientBreakdown.map((c, idx) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                      <span className="text-sm font-medium truncate max-w-[160px]">{c.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.count} payment{c.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{fmtMoney(c.amount)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-foreground transition-all duration-500"
                      style={{ width: `${(c.amount / clientBreakdown[0].amount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Payment method breakdown ── */}
      {methodBreakdown.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-surface/60 p-5">
          <h2 className="font-semibold mb-4">Payment methods</h2>
          <div className="flex flex-wrap gap-3">
            {methodBreakdown.map(([method, amount]) => (
              <div
                key={method}
                className="flex items-center gap-2 bg-background/40 rounded-lg px-3 py-2"
              >
                <span className="text-sm capitalize text-muted-foreground">
                  {method.replace("_", " ")}
                </span>
                <span className="text-sm font-semibold tabular-nums">{fmtMoney(amount)}</span>
                <span className="text-xs text-muted-foreground">
                  {totalRevenue > 0 ? `${((amount / totalRevenue) * 100).toFixed(0)}%` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Payment history table ── */}
      <section className="rounded-xl border border-border/60 bg-surface/60 overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Payment history</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""} ·{" "}
              {fmtMoney(totalRevenue)} collected
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No payments in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-background/40">
                <tr>
                  <th className="text-left font-normal px-5 py-3">Date</th>
                  <th className="text-left font-normal px-5 py-3">Invoice</th>
                  <th className="text-left font-normal px-5 py-3">Client</th>
                  <th className="text-left font-normal px-5 py-3">Method</th>
                  <th className="text-left font-normal px-5 py-3">Reference</th>
                  <th className="text-right font-normal px-5 py-3">Amount</th>
                  <th className="text-right font-normal px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const inv =
                    typeof p.invoiceId === "object"
                      ? p.invoiceId
                      : invoices.find((i) => i._id === p.invoiceId);
                  const client = inv ? clientName((inv as any).clientId) : "—";
                  return (
                    <tr key={p._id} className="border-t border-border/60 hover:bg-background/30">
                      <td className="px-5 py-3 text-muted-foreground">
                        {fmtDate(p.paidAt || p.createdAt)}
                      </td>
                      <td className="px-5 py-3 font-medium">{invNum(p.invoiceId)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{client}</td>
                      <td className="px-5 py-3 text-muted-foreground capitalize">
                        {(p.method ?? "—").replace("_", " ")}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground truncate max-w-[160px]">
                        {p.reference ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">
                        {fmtMoney(p.amount)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() =>
                            remove(p._id)
                              .then(() => toast.success("Removed"))
                              .catch((e: any) => toast.error(e.message))
                          }
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-rose-300"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
