import { motion } from "framer-motion";
import { SectionHeader } from "./Bento";

const STEPS = [
  { n: "01", title: "Create & send", desc: "Design an invoice in seconds with reusable templates and auto-filled client data." },
  { n: "02", title: "Track in real-time", desc: "See when clients open, click, and pay. Get notified the moment money lands." },
  { n: "03", title: "Reconcile automatically", desc: "Payments match invoices automatically and sync to your accounting tool." },
];

export function Workflow() {
  return (
    <section id="workflow" className="py-32 px-4 bg-surface/30 border-y border-border">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Workflow"
          title="From sent to settled in three steps"
        />
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative rounded-2xl border border-border bg-background/40 p-8 border-gradient"
            >
              <span className="font-mono text-sm text-accent">{s.n}</span>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
