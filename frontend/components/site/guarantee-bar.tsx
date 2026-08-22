import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

export function GuaranteeBar({ warrantyMonths }: { warrantyMonths: number }) {
  const items = [
    {
      icon: Truck,
      title: "Free Shipping",
      text: "On every order, straight to your door.",
    },
    {
      icon: ShieldCheck,
      title:
        warrantyMonths === 12
          ? "1-Year Warranty"
          : `${warrantyMonths}-Month Warranty`,
      text: "Official coverage on all defects.",
    },
    {
      icon: RotateCcw,
      title: "30-Day Returns",
      text: "Changed your mind? No problem.",
    },
  ];

  return (
    <section className="border-y border-border bg-[#faf8f4]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
              <item.icon className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
