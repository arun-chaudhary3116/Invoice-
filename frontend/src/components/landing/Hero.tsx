import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { InvoicePreview } from "./InvoicePreview";

export function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-hero pointer-events-none" />
      <div className="absolute inset-0 grid-pattern pointer-events-none" />
      <div className="absolute inset-0 noise opacity-50 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 backdrop-blur px-3 py-1 text-xs text-muted-foreground"
        >
          <Sparkles className="size-3 text-accent" />
          New · AI-powered payment reminders
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 text-5xl md:text-7xl font-semibold text-gradient leading-[1.05]"
        >
          Invoices, paid <br className="hidden md:block" />
          on time. Every time.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
        >
          Ledgerly is the modern invoice & payment tracker for teams who hate chasing money.
          Send beautiful invoices, automate follow-ups, and reconcile in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <a
            href="#"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition"
          >
            Start tracking free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur px-6 py-3 font-medium hover:bg-surface transition"
          >
            See how it works
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          Free 14-day trial · No credit card · Cancel anytime
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 relative"
        >
          <div className="absolute -inset-x-20 -top-10 -bottom-10 bg-accent-gradient opacity-20 blur-3xl rounded-full pointer-events-none" />
          <InvoicePreview />
        </motion.div>
      </div>
    </section>
  );
}
