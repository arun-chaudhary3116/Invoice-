import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "./Bento";

const FAQS = [
  { q: "How long does setup take?", a: "Most teams are sending invoices within 10 minutes. Import clients via CSV or sync from QuickBooks/Stripe." },
  { q: "Do you charge fees on payments?", a: "No platform fees. You only pay the standard processor fees from Stripe or your bank." },
  { q: "Can I customise invoice templates?", a: "Yes — full control over branding, layout, line items, taxes, and legal footers." },
  { q: "Is my data secure?", a: "We're SOC 2 Type II certified, with bank-grade encryption at rest and in transit." },
  { q: "Do you support multiple currencies?", a: "135+ currencies with real-time FX rates and multi-entity reporting." },
];

export function FAQ() {
  return (
    <section id="faq" className="py-32 px-4 bg-surface/30 border-y border-border">
      <div className="mx-auto max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-16 space-y-3">
          {FAQS.map((f, i) => (
            <FAQItem key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-background/40 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="font-medium">{q}</span>
        <Plus
          className={`size-4 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-muted-foreground">{a}</p>
      </motion.div>
    </div>
  );
}
