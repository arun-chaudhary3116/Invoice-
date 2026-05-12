import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 bg-hero pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="px-6 py-5">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-semibold tracking-tight">
            <span className="size-8 rounded-lg bg-accent-gradient grid place-items-center glow-shadow">
              <Receipt className="size-4 text-primary-foreground" />
            </span>
            Ledgerly
          </Link>
        </header>
        <div className="flex-1 grid place-items-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="border-gradient rounded-2xl bg-surface/80 backdrop-blur-xl p-8 shadow-card">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
