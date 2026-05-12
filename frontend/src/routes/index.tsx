import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { LogoCloud } from "@/components/landing/LogoCloud";
import { Bento } from "@/components/landing/Bento";
import { Workflow } from "@/components/landing/Workflow";
import { Testimonial } from "@/components/landing/Testimonial";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ledgerly — Invoices, paid on time. Every time." },
      {
        name: "description",
        content:
          "Ledgerly is the modern invoice and payment tracker for teams. Send beautiful invoices, automate reminders, and reconcile payments in seconds.",
      },
      { property: "og:title", content: "Ledgerly — Invoice & Payment Tracker" },
      {
        property: "og:description",
        content: "Get paid faster with smart invoices and automated payment tracking.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <LogoCloud />
      <Bento />
      <Workflow />
      <Testimonial />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
