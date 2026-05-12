import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionHeader } from "./Bento";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    desc: "For freelancers getting started.",
    features: ["Up to 5 invoices/mo", "Email reminders", "1 team seat", "Basic templates"],
    cta: "Start free",
  },
  {
    name: "Growth",
    price: "$29",
    desc: "For growing teams chasing real revenue.",
    features: ["Unlimited invoices", "AI smart reminders", "5 team seats", "Stripe + QuickBooks", "Multi-currency"],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Scale",
    price: "$99",
    desc: "For finance teams that need control.",
    features: ["Everything in Growth", "Unlimited seats", "Approval workflows", "SOC 2 + SSO", "Dedicated CSM"],
    cta: "Talk to sales",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 px-4">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          subtitle="Pay monthly. Cancel anytime. No platform fees on payments."
        />
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 border ${
                p.featured
                  ? "border-accent/40 bg-surface glow-shadow"
                  : "border-border bg-surface/60"
              } border-gradient`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest bg-accent-gradient text-primary-foreground px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-display font-semibold tracking-tight">{p.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <a
                href="#"
                className={`mt-6 block text-center rounded-full px-4 py-3 text-sm font-medium transition ${
                  p.featured
                    ? "bg-foreground text-primary-foreground hover:opacity-90"
                    : "border border-border bg-background/40 hover:bg-surface"
                }`}
              >
                {p.cta}
              </a>
              <ul className="mt-8 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-accent mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
