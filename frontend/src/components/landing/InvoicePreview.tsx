import { motion } from "framer-motion";
import { Check, Clock, TrendingUp } from "lucide-react";

export function InvoicePreview() {
  return (
    <div className="relative mx-auto max-w-5xl rounded-3xl border border-border bg-surface/80 backdrop-blur-xl p-3 shadow-2xl glow-shadow border-gradient">
      <div className="rounded-2xl bg-background/60 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <span className="size-3 rounded-full bg-destructive/70" />
          <span className="size-3 rounded-full bg-accent/70" />
          <span className="size-3 rounded-full bg-secondary/70" />
          <div className="ml-4 text-xs text-muted-foreground font-mono">
            ledgerly.app/dashboard
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border">
          {/* Stats */}
          <StatCard label="Outstanding" value="$48,290" delta="+12%" icon={Clock} />
          <StatCard label="Paid this month" value="$127,840" delta="+34%" icon={Check} positive />
          <StatCard label="Avg. days to pay" value="6.2" delta="-2.1d" icon={TrendingUp} positive />
        </div>

        {/* Invoice rows */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Recent invoices</h3>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <div className="space-y-2">
            {ROWS.map((r, i) => (
              <motion.div
                key={r.client}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                className="grid grid-cols-12 items-center gap-3 rounded-xl bg-surface/60 hover:bg-surface px-4 py-3 text-sm transition"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-accent-gradient grid place-items-center text-xs font-semibold text-primary-foreground">
                    {r.client[0]}
                  </div>
                  <div>
                    <div className="font-medium">{r.client}</div>
                    <div className="text-xs text-muted-foreground">{r.id}</div>
                  </div>
                </div>
                <div className="col-span-3 text-muted-foreground text-xs">{r.due}</div>
                <div className="col-span-2 text-right font-mono">{r.amount}</div>
                <div className="col-span-2 flex justify-end">
                  <StatusPill status={r.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ROWS = [
  { client: "Northwind Studios", id: "INV-2041", due: "Due in 4 days", amount: "$4,800", status: "sent" },
  { client: "Acme Robotics", id: "INV-2040", due: "Paid · Apr 28", amount: "$12,400", status: "paid" },
  { client: "Globex Media", id: "INV-2039", due: "Overdue 2 days", amount: "$2,150", status: "overdue" },
  { client: "Initech LLC", id: "INV-2038", due: "Paid · Apr 24", amount: "$7,900", status: "paid" },
];

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
  positive?: boolean;
}) {
  return (
    <div className="bg-surface px-6 py-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <Icon className="size-4" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-display font-semibold tracking-tight">{value}</span>
        <span className={positive ? "text-xs text-accent" : "text-xs text-muted-foreground"}>{delta}</span>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-accent/15 text-accent",
    sent: "bg-secondary/20 text-secondary-foreground",
    overdue: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${map[status]}`}>
      {status}
    </span>
  );
}
