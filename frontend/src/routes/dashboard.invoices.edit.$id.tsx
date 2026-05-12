import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInvoices, type Invoice } from "@/lib/api";
import { api } from "@/lib/auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/invoices/edit/$id")({
  component: EditInvoice,
});

type DraftItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

const newId = () => Math.random().toString(36).slice(2, 10);

function EditInvoice() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { update } = useInvoices();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);

  // LOAD INVOICE
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api<{ data: Invoice }>(`/api/invoices/${id}`);
        const inv = res.data;

        setInvoice(inv);

        setClientId(typeof inv.clientId === "string" ? inv.clientId : inv.clientId._id);
        setIssueDate(new Date(inv.issueDate).toISOString().slice(0, 10));
        setDueDate(new Date(inv.dueDate).toISOString().slice(0, 10));
        setCurrency(inv.currency || "USD");
        setTaxRate(inv.taxRate || 0);
        setDiscount(inv.discount || 0);
        setNotes(inv.notes || "");
        setTerms(inv.terms || "");

        setItems(
          inv.items.map((i: any) => ({
            id: i._id || newId(),
            description: i.description,
            quantity: i.quantity,
            price: i.price,
          })),
        );
      } catch {
        toast.error("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.quantity * i.price, 0), [items]);

  const tax = (subtotal - discount) * (taxRate / 100);
  const total = subtotal + tax - discount;

  const updateItem = (itemId: string, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...patch } : it)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: newId(), description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const save = async () => {
    try {
      await update(id, {
        clientId,
        issueDate,
        dueDate,
        currency,
        taxRate,
        discount,
        notes,
        terms,
        items: items.map(({ description, quantity, price }) => ({
          description,
          quantity,
          price,
        })),
      });

      toast.success("Invoice updated");
      navigate({ to: "/dashboard/invoices" });
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px] p-6">
      {/* LEFT */}
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Edit Invoice: {invoice.invoiceNumber}</h1>

        {/* CLIENT */}
        <div>
          <Label>Client ID</Label>
          <Input value={clientId} onChange={(e) => setClientId(e.target.value)} />
        </div>

        {/* DATES */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Issue Date</Label>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>

          <div>
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        {/* ITEMS */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Items</Label>
            <Button type="button" onClick={addItem}>
              Add Item
            </Button>
          </div>

          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
              />

              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
              />

              <Input
                type="number"
                value={item.price}
                onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
              />

              <Button type="button" onClick={() => removeItem(item.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>

        {/* NOTES */}
        <div>
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div>
          <Label>Terms</Label>
          <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} />
        </div>

        {/* SAVE */}
        <Button onClick={save} className="w-full">
          Save Invoice
        </Button>
      </div>

      {/* RIGHT SUMMARY */}
      <div className="border p-4 rounded-lg space-y-2">
        <h2 className="font-semibold">Summary</h2>

        <p>Subtotal: {subtotal}</p>
        <p>Tax: {tax}</p>
        <p>Discount: {discount}</p>

        <hr />

        <p className="font-bold">Total: {total}</p>
      </div>
    </div>
  );
}
