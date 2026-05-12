import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowUpRight, DollarSign, Clock, AlertTriangle, CheckCircle2, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useInvoices, useInvoiceStats, fmtMoney, fmtDate, clientName, type Invoice } from "@/lib/api";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — Ledgerly" }] }),
  component: DashboardHome,
});

function statusBadge(s: Invoice["status"]) {
  const map: Record<string, string> = {
    paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    sent: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    viewed: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    overdue: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    partial: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cancelled: "bg-muted text-muted-foreground border-border",
    draft: "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="outline" className={`${map[s]} capitalize border`}>{s}</Badge>;
}

function DashboardHome() {
  const { user } = useAuth();
  const { invoices, loading } = useInvoices();
  const { stats } = useInvoiceStats();

  const cards = [
    { label: "Total Revenue", value: fmtMoney(stats?.paidAmount ?? 0), delta: `${stats?.paid ?? 0} paid`, icon: DollarSign },
    { label: "Outstanding", value: fmtMoney(stats?.pendingAmount ?? 0), delta: `${(stats?.sent ?? 0) + (stats?.partial ?? 0)} open`, icon: Clock },
    { label: "Total Invoiced", value: fmtMoney(stats?.totalAmount ?? 0), delta: `${stats?.total ?? 0} total`, icon: CheckCircle2 },
    { label: "Overdue", value: String(stats?.overdue ?? 0), delta: stats?.overdue ? "Action needed" : "All clear", icon: AlertTriangle },
  ];

  const recent = [...invoices]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Business Overview</h1>
          <p className="text-sm text-muted-foreground">
            {user?.name ? `${user.name.split(" ")[0]}, ` : ""}here's how your business looks today.
          </p>
        </div>
        <Button asChild className="rounded-full bg-foreground text-primary-foreground hover:opacity-90">
          <Link to="/dashboard/invoices/create"><Plus className="size-4" /> New invoice</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-xl border border-border/60 bg-surface/60 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <s.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.delta}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-border/60 bg-surface/60 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="font-semibold">Recent Invoices</h2>
            <p className="text-xs text-muted-foreground">Latest activity across your workspace</p>
          </div>
          <Link to="/dashboard/invoices" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <div className="border-t border-border/60">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : recent.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-background/40">
                <tr>
                  <th className="text-left font-normal px-5 py-3">Invoice</th>
                  <th className="text-left font-normal px-5 py-3">Client</th>
                  <th className="text-left font-normal px-5 py-3">Status</th>
                  <th className="text-left font-normal px-5 py-3">Due</th>
                  <th className="text-right font-normal px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inv) => (
                  <tr key={inv._id} className="border-t border-border/60 hover:bg-background/30">
                    <td className="px-5 py-3 font-medium">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-muted-foreground">{clientName(inv.clientId)}</td>
                    <td className="px-5 py-3">{statusBadge(inv.status)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{fmtDate(inv.dueDate)}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{fmtMoney(inv.total, inv.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center">
        <Plus className="size-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-medium">No invoices yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Create your first invoice to start tracking payments.</p>
      <Button asChild className="mt-4 rounded-full bg-foreground text-primary-foreground hover:opacity-90">
        <Link to="/dashboard/invoices/create">Create invoice</Link>
      </Button>
    </div>
  );
}
