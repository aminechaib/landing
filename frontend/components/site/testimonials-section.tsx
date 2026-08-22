import { SectionHeading } from "@/components/site/section-heading";
import { StarRating } from "@/components/site/star-rating";
import { TESTIMONIALS } from "@/lib/testimonials";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";

export function TestimonialsSection() {
  const { t, locale } = useI18n();
  const items = TESTIMONIALS[locale];

  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          kicker={t("stories.kicker")}
          title={t("stories.title")}
          description={t("stories.description")}
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:gap-6">
          {items.map((testimonial) => (
            <Card key={testimonial.name} className="gap-0 p-6 transition-shadow hover:shadow-md">
              <StarRating rating={testimonial.rating} />
              <h3 className="mt-4 text-sm font-semibold">{testimonial.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                “{testimonial.text}”
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
