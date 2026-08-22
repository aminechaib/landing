"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { downloadExport, getAdminToken, API_URL } from "@/lib/api";

const EXPORTS = [
  { type: "products", title: "Products", description: "Full catalog with prices, stock and status." },
  { type: "orders", title: "Orders", description: "Every order with customer info and totals." },
  { type: "customers", title: "Customers", description: "Contact list with order counts and lifetime value." },
  { type: "inventory", title: "Inventory batches", description: "Arrivals with suppliers, quantities and unit costs." },
  { type: "movements", title: "Stock movements", description: "The complete inventory ledger." },
  { type: "price-history", title: "Price history", description: "Every price change with old and new values." },
  { type: "warranties", title: "Warranties", description: "Issued warranties with serial numbers." },
  { type: "returns", title: "Returns", description: "Registered returns with item dispositions." },
  { type: "newsletter-subscribers", title: "Newsletter subscribers", description: "Footer opt-ins for marketing." },
];

export default function ExportsPage() {
  async function handleExport(type: string, title: string) {
    const token = getAdminToken();
    if (!token) return void toast.error("Session expired — please log in again");
    try {
      await downloadExport(`${API_URL}/api/admin/export/${type}`, token);
      toast.success(`${title} exported`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  }

  return (
    <div>
      <PageHeader title="Exports" description="Download raw CSV data for accounting and analysis." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {EXPORTS.map((item) => (
          <Card key={item.type} className="gap-2 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
              <Button variant="outline" size="icon" aria-label={`Export ${item.title}`} onClick={() => handleExport(item.type, item.title)}>
                <Download className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Files are generated as UTF-8 CSV (BOM included) and stream directly to your browser.
      </p>
    </div>
  );
}
