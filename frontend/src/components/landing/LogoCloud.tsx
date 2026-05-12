const LOGOS = ["NORTHWIND", "ACME", "GLOBEX", "INITECH", "STARK", "WAYNE", "UMBRELLA", "HOOLI"];

export function LogoCloud() {
  return (
    <section className="py-16 border-y border-border bg-surface/30 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
        Trusted by 12,000+ finance teams worldwide
      </p>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee gap-16 whitespace-nowrap">
          {[...LOGOS, ...LOGOS].map((l, i) => (
            <span
              key={i}
              className="font-display font-semibold tracking-[0.2em] text-muted-foreground/60 text-lg"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
