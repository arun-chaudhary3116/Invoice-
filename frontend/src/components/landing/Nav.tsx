import { motion } from "framer-motion";
import { Receipt } from "lucide-react";

export function Nav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
    >
      <div className="mx-auto max-w-6xl rounded-2xl border border-border/60 bg-background/60 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-display font-semibold tracking-tight">
          <span className="size-8 rounded-lg bg-accent-gradient grid place-items-center glow-shadow">
            <Receipt className="size-4 text-primary-foreground" />
          </span>
          Ledgerly
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="/signin" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition">Sign in</a>
          <a
            href="/signup"
            className="text-sm rounded-full bg-foreground text-primary-foreground px-4 py-2 font-medium hover:opacity-90 transition"
          >
            Start free
          </a>
        </div>
      </div>
    </motion.header>
  );
}
