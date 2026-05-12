import { motion } from "framer-motion";

export function Testimonial() {
  return (
    <section className="py-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-4xl text-center"
      >
        <span className="text-xs uppercase tracking-[0.2em] text-accent">Customer story</span>
        <p className="mt-6 text-3xl md:text-4xl font-display tracking-tight leading-snug text-gradient">
          “We cut our DSO from 42 days to 9. Ledgerly paid for itself in the first week —
          our cash flow has never looked healthier.”
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          <div className="size-10 rounded-full bg-accent-gradient" />
          <div className="text-left">
            <div className="font-medium">Maya Chen</div>
            <div className="text-muted-foreground">Head of Finance, Northwind Studios</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
