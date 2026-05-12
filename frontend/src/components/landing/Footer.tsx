import { Receipt } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-14 px-4">
      <div className="mx-auto max-w-6xl grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display font-semibold">
            <span className="size-8 rounded-lg bg-accent-gradient grid place-items-center">
              <Receipt className="size-4 text-primary-foreground" />
            </span>
            Ledgerly
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            The modern invoice & payment tracker for teams who'd rather build than chase.
          </p>
        </div>
        <FooterCol title="Product" links={["Features", "Pricing", "Integrations", "Changelog"]} />
        <FooterCol title="Company" links={["About", "Customers", "Careers", "Contact"]} />
      </div>
      <div className="mx-auto max-w-6xl mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© 2026 Ledgerly Inc. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" className="hover:text-foreground transition">Privacy</a>
          <a href="#" className="hover:text-foreground transition">Terms</a>
          <a href="#" className="hover:text-foreground transition">Security</a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="hover:text-foreground transition">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
