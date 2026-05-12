import { motion } from "framer-motion";
import { Bell, CreditCard, FileText, Globe2, Sparkles, Zap } from "lucide-react";

export function Bento() {
  return (
    <section id="features" className="py-32 px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need to get paid faster"
          subtitle="From the first invoice to the final receipt — Ledgerly handles the boring parts so you can focus on growth."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-6 gap-4">
          <BentoCard className="md:col-span-4 md:row-span-2 min-h-[360px]" delay={0}>
            <div className="flex items-start gap-3 text-accent">
              <Sparkles className="size-5" />
              <span className="text-xs uppercase tracking-wider">AI assist</span>
            </div>
            <h3 className="mt-6 text-3xl font-semibold tracking-tight">
              Smart reminders that sound human, not robotic.
            </h3>
            <p className="mt-3 text-muted-foreground max-w-md">
              AI drafts the right follow-up at the right tone — polite at first, firm when needed.
              Average days-to-pay drops by 38%.
            </p>
            <div className="mt-8 space-y-2">
              {["Hi Sarah, just a friendly nudge…", "Following up on INV-2039 from last week.", "Final notice — payment is now 14 days overdue."].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-xl bg-background/60 border border-border px-4 py-3 text-sm text-muted-foreground"
                >
                  {t}
                </motion.div>
              ))}
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2 min-h-[170px]" delay={0.1}>
            <Bell className="size-5 text-accent" />
            <h3 className="mt-4 text-xl font-semibold">Auto reminders</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Schedule sequences that fire on overdue, paid, or partially paid.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-2 min-h-[170px]" delay={0.15}>
            <CreditCard className="size-5 text-accent" />
            <h3 className="mt-4 text-xl font-semibold">One-click pay</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Card, ACH, and wire — bundled with reconciliation built-in.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-2 min-h-[200px]" delay={0.2}>
            <FileText className="size-5 text-accent" />
            <h3 className="mt-4 text-xl font-semibold">Beautiful invoices</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              On-brand templates with logos, signatures, and itemised line breaks.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-2 min-h-[200px]" delay={0.25}>
            <Globe2 className="size-5 text-accent" />
            <h3 className="mt-4 text-xl font-semibold">135 currencies</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Real-time FX, multi-entity support, and tax handled automatically.
            </p>
          </BentoCard>

          <BentoCard className="md:col-span-2 min-h-[200px]" delay={0.3}>
            <Zap className="size-5 text-accent" />
            <h3 className="mt-4 text-xl font-semibold">Connects everywhere</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Stripe, QuickBooks, Xero, Slack, and 60+ tools in your stack.
            </p>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className={`relative rounded-3xl bg-surface/70 border border-border p-7 overflow-hidden border-gradient hover:bg-surface transition ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <span className="text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</span>
      <h2 className="mt-3 text-4xl md:text-5xl font-semibold text-gradient leading-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
