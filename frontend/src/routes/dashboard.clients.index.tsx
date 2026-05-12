import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useClients, fmtMoney } from "@/lib/api";

export const Route = createFileRoute("/dashboard/clients/")({
  head: () => ({ meta: [{ title: "Clients — Ledgerly" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const { clients, loading, error, create, remove } = useClients();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", company: "", phone: "" });

  const onCreate = async () => {
    if (!draft.name || !draft.email) return toast.error("Name and email required");
    setBusy(true);
    try {
      await create(draft);
      setDraft({ name: "", email: "", company: "", phone: "" });
      setOpen(false);
      toast.success("Client added");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async (id: string) => {
    try { await remove(id); toast.success("Client removed"); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">{clients.length} clients in your workspace</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-foreground text-primary-foreground hover:opacity-90">
              <Plus className="size-4" /> Add client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New client</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label>Name</Label><Input className="mt-1.5" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" className="mt-1.5" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
              <div><Label>Company</Label><Input className="mt-1.5" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></div>
              <div><Label>Phone</Label><Input className="mt-1.5" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={onCreate} disabled={busy} className="rounded-full bg-foreground text-primary-foreground hover:opacity-90">
                {busy ? "Adding…" : "Add client"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Couldn't reach backend: {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border/60 bg-surface/60 p-12 text-center text-sm text-muted-foreground">
          Loading clients…
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-surface/60 p-12 text-center">
          <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-medium">No clients yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first client to start sending invoices.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <div key={c._id} className="rounded-xl border border-border/60 bg-surface/60 p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.company || c.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{c.email}</div>
                </div>
                <button onClick={() => onRemove(c._id)} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-rose-300">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Invoiced</div>
                  <div className="font-medium tabular-nums">{fmtMoney(c.totalInvoiced ?? 0)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Total paid</div>
                  <div className="font-medium tabular-nums">{fmtMoney(c.totalPaid ?? 0)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
