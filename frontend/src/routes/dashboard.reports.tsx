import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({ meta: [{ title: "Reports — Ledgerly" }] }),
  component: () => (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      <div className="rounded-xl border border-border/60 bg-surface/60 p-12 text-center">
        <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center"><BarChart3 className="size-5 text-muted-foreground" /></div>
        <h3 className="mt-4 font-medium">Reports coming soon</h3>
        <p className="mt-1 text-sm text-muted-foreground">Revenue trends, aging reports, and client breakdowns.</p>
      </div>
    </div>
  ),
});
