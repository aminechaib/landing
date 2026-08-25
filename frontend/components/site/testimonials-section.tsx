import { SectionHeading } from "@/components/site/section-heading";
import { StarRating } from "@/components/site/star-rating";
import { TESTIMONIALS, Testimonial } from "@/lib/testimonials";
import { useI18n } from "@/lib/i18n";
import { useInView } from "@/lib/use-in-view";
import { Card } from "@/components/ui/card";
import type { StoreSettings } from "@/types";

export function TestimonialsSection({ settings }: { settings: StoreSettings | null }) {
  const { t, locale } = useI18n();
  const { ref, visible } = useInView({ once: true, threshold: 0.05 });
  const mode = settings?.testimonials_mode ?? "custom";
  const custom = settings?.testimonials?.[locale];
  const items = mode === "custom" && custom && custom.length > 0 ? custom : TESTIMONIALS[locale];

  if (!settings) return null;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          kicker={t("stories.kicker")}
          title={t("stories.title")}
          description={t("stories.description")}
        />
        <div ref={ref} className="mt-10 grid gap-5 md:grid-cols-3 lg:gap-6">
          {items.map((testimonial: Testimonial, i: number) => (
            <Card
              key={testimonial.name}
              className="gap-0 p-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md"
              style={{
                transitionDelay: visible ? `${i * 120 + 100}ms` : "0ms",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
              }}
            >
              <StarRating rating={testimonial.rating} />
              <h3 className="mt-4 text-sm font-semibold">{testimonial.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <p className="mt-4 text-xs font-medium text-foreground/70">
                {testimonial.name} · <span className="text-muted-foreground">{testimonial.location}</span>
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
