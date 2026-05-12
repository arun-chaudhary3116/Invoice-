import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-5xl rounded-3xl border border-border bg-surface/60 backdrop-blur p-14 text-center overflow-hidden border-gradient glow-shadow"
      >
        <div className="absolute inset-0 bg-hero opacity-70 pointer-events-none" />
        <div className="absolute inset-0 grid-pattern pointer-events-none" />
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-semibold text-gradient leading-tight">
            Stop chasing. Start collecting.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Join 12,000+ teams already getting paid faster with Ledgerly.
          </p>
          <a
            href="#"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-foreground text-primary-foreground px-7 py-3.5 font-medium hover:opacity-90 transition"
          >
            Start your free trial
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
