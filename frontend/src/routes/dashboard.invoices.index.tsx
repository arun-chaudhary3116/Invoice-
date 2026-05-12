import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clientName,
  fmtDate,
  fmtMoney,
  useInvoices,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import jsPDF from "jspdf";
import { CheckCircle2, Download, FileText, Link2, Plus, Search, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/invoices/")({
  head: () => ({ meta: [{ title: "Invoices — Ledgerly" }] }),
  component: InvoicesPage,
});

const statuses: Array<"all" | InvoiceStatus> = [
  "all",
  "draft",
  "sent",
  "paid",
  "overdue",
  "partial",
];

function badge(s: InvoiceStatus) {
  const map: Record<string, string> = {
    paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    sent: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    viewed: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    overdue: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    partial: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cancelled: "bg-muted text-muted-foreground border-border",
    draft: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge variant="outline" className={`${map[s]} capitalize border`}>
      {s}
    </Badge>
  );
}

// Copies the public payment link for this invoice to clipboard
function copyPaymentLink(invoiceId: string) {
  const url = `${window.location.origin}/pay/${invoiceId}`;
  navigator.clipboard.writeText(url).then(
    () => toast.success("Payment link copied to clipboard"),
    () => toast.error("Failed to copy link"),
  );
}

// Downloads invoice as PDF
async function downloadInvoicePDF(invoice: Invoice) {
  try {
    toast.loading("Generating PDF...");

    const client = typeof invoice.clientId === "object" ? invoice.clientId : null;

    // Create PDF directly with jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Set font
    pdf.setFont("helvetica");

    // Title
    pdf.setFontSize(28);
    pdf.text("INVOICE", margin, yPosition);
    yPosition += 15;

    // Invoice number and date
    pdf.setFontSize(10);
    pdf.text(`Invoice Number: ${invoice.invoiceNumber}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Issue Date: ${fmtDate(invoice.issueDate)}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Due Date: ${fmtDate(invoice.dueDate)}`, margin, yPosition);
    yPosition += 12;

    // Bill To section
    pdf.setFontSize(11);
    pdf.text("BILL TO", margin, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.text(client?.company || client?.name || "—", margin, yPosition);
    yPosition += 5;
    pdf.text(client?.email || "—", margin, yPosition);
    yPosition += 10;

    // Items table
    const columns = ["Description", "Qty", "Price", "Total"];
    const rows: (string | number)[][] = invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      fmtMoney(item.price, invoice.currency),
      fmtMoney(item.quantity * item.price, invoice.currency),
    ]);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    // Column positions
    const col1 = margin;
    const col2 = pageWidth - margin - 60;
    const col3 = pageWidth - margin - 40;
    const col4 = pageWidth - margin - 15;

    // Header
    pdf.text("Description", col1, yPosition);
    pdf.text("Qty", col2, yPosition);
    pdf.text("Price", col3, yPosition);
    pdf.text("Total", col4, yPosition, { align: "right" });
    yPosition += 6;

    // Separator
    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 4;

    // Rows
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    rows.forEach((row) => {
      pdf.text(row[0] as string, col1, yPosition);
      pdf.text(row[1] as string, col2, yPosition);
      pdf.text(row[2] as string, col3, yPosition);
      pdf.text(row[3] as string, col4, yPosition, { align: "right" });
      yPosition += 5;
    });

    // Separator
    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    // Totals
    const totalsX = pageWidth - margin - 50;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    pdf.text("Subtotal:", totalsX, yPosition);
    pdf.text(fmtMoney(invoice.subtotal, invoice.currency), pageWidth - margin, yPosition, {
      align: "right",
    });
    yPosition += 5;

    if (invoice.taxAmount > 0) {
      pdf.text(`Tax (${invoice.taxRate}%):`, totalsX, yPosition);
      pdf.text(fmtMoney(invoice.taxAmount, invoice.currency), pageWidth - margin, yPosition, {
        align: "right",
      });
      yPosition += 5;
    }

    if (invoice.discount > 0) {
      pdf.text("Discount:", totalsX, yPosition);
      pdf.text(fmtMoney(invoice.discount, invoice.currency), pageWidth - margin, yPosition, {
        align: "right",
      });
      yPosition += 5;
    }

    // Total
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("TOTAL:", totalsX, yPosition);
    pdf.text(fmtMoney(invoice.total, invoice.currency), pageWidth - margin, yPosition, {
      align: "right",
    });
    yPosition += 10;

    // Notes
    if (invoice.notes) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Notes:", margin, yPosition);
      yPosition += 5;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
      notesLines.forEach((line: string) => {
        pdf.text(line, margin, yPosition);
        yPosition += 4;
      });
    }

    // Download with invoice number as filename
    pdf.save(`${invoice.invoiceNumber}.pdf`);
    toast.dismiss();
    toast.success("Invoice downloaded");
  } catch (e) {
    toast.dismiss();
    toast.error("Failed to download PDF");
    console.error("PDF Generation Error:", e);
  }
}

function InvoicesPage() {
  const { invoices, loading, error, markPaid, send, remove } = useInvoices();
  const [filter, setFilter] = useState<(typeof statuses)[number]>("all");
  const [q, setQ] = useState("");

  const filtered = invoices.filter((i) => {
    if (filter !== "all" && i.status !== filter) return false;
    const text = `${i.invoiceNumber} ${clientName(i.clientId)}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    return true;
  });

  const onMarkPaid = async (inv: Invoice) => {
    try {
      await markPaid(inv);
      toast.success("Marked as paid");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onSend = async (id: string) => {
    try {
      await send(id);
      toast.success("Invoice sent");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onRemove = async (id: string) => {
    try {
      await remove(id);
      toast.success("Invoice deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            {invoices.length} total · {invoices.filter((i) => i.status === "overdue").length}{" "}
            overdue
          </p>
        </div>

        <Button
          asChild
          className="rounded-full bg-foreground text-primary-foreground hover:opacity-90"
        >
          <Link to="/dashboard/invoices/create">
            <Plus className="size-4" /> New invoice
          </Link>
        </Button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by number or client"
            className="pl-9 bg-surface/60"
          />
        </div>

        <div className="flex gap-1 p-1 rounded-full bg-surface/60 border border-border/60 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-full capitalize whitespace-nowrap transition ${
                filter === s
                  ? "bg-foreground text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Couldn't reach backend: {error}
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-xl border border-border/60 bg-surface/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading invoices…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto size-12 rounded-full bg-muted grid place-items-center">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-medium">No invoices match</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different filter or create a new invoice.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-background/40">
                <tr>
                  <th className="text-left px-5 py-3">Invoice</th>
                  <th className="text-left px-5 py-3">Client</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Issue</th>
                  <th className="text-left px-5 py-3">Due</th>
                  <th className="text-right px-5 py-3">Amount</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv._id} className="border-t border-border/60 hover:bg-background/30">
                    <td className="px-5 py-3 font-medium">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-muted-foreground">{clientName(inv.clientId)}</td>
                    <td className="px-5 py-3">{badge(inv.status)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{fmtDate(inv.issueDate)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{fmtDate(inv.dueDate)}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">
                      {fmtMoney(inv.total, inv.currency)}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1 items-center">
                        {/* EDIT */}
                        <Link to="/dashboard/invoices/edit/$id" params={{ id: inv._id }}>
                          <button
                            title="Edit"
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-amber-300"
                          >
                            Edit
                          </button>
                        </Link>

                        {/* COPY PAYMENT LINK — shown for all non-paid, non-cancelled invoices */}
                        {inv.status !== "paid" && inv.status !== "cancelled" && (
                          <button
                            onClick={() => copyPaymentLink(inv._id)}
                            title="Copy payment link"
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-violet-300"
                          >
                            <Link2 className="size-4" />
                          </button>
                        )}

                        {/* SEND */}
                        {inv.status === "draft" && (
                          <button
                            onClick={() => onSend(inv._id)}
                            title="Send"
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-sky-300"
                          >
                            <Send className="size-4" />
                          </button>
                        )}

                        {/* MARK PAID */}
                        {inv.status !== "paid" && (
                          <button
                            onClick={() => onMarkPaid(inv)}
                            title="Mark paid"
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-emerald-300"
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                        )}

                        {/* DOWNLOAD PDF */}
                        <button
                          onClick={() => downloadInvoicePDF(inv)}
                          title="Download PDF"
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-blue-300"
                        >
                          <Download className="size-4" />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => onRemove(inv._id)}
                          title="Delete"
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-rose-300"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
