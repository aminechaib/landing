/**
 * Static customer stories shown on the product page.
 * Intentionally seed-style data for v1 — no review platform yet.
 * Content is localized client-side (ar default, en fallback).
 */
export type Testimonial = {
  name: string;
  location: string;
  rating: number;
  title: string;
  text: string;
};

export const TESTIMONIALS: Record<"ar" | "en", Testimonial[]> = {
  ar: [
    {
      name: "سارة م.",
      location: "الدار البيضاء",
      rating: 5,
      title: "أفضل من المتوقع",
      text: "طلبت يوم الاثنين ووصلني الطلب يوم الأربعاء مع الدفع عند الاستلام. جودة التصنيع فاجأتني فعلاً — يبدو أنها بضعف سعرها.",
    },
    {
      name: "عمر ك.",
      location: "دبي",
      rating: 5,
      title: "عمر البطارية حقيقي",
      text: "أستخدمه أسبوعاً كاملاً قبل الشحن. الصوت نقي ومتوازن، والاقتران يستغرق ثانيتين فقط.",
    },
    {
      name: "لينا ر.",
      location: "تونس",
      rating: 4,
      title: "قيمة رائعة وتصميم أنيق",
      text: "يبدو جميلاً على مكتبي والتطبيق بسيط بشكل منعش. خدمة العملاء أجابت على سؤالي خلال ساعة.",
    },
  ],
  en: [
    {
      name: "Sarah M.",
      location: "Casablanca",
      rating: 5,
      title: "Better than expected",
      text: "Ordered on Monday, delivered Wednesday with cash on delivery. The build quality genuinely surprised me — these feel twice their price.",
    },
    {
      name: "Omar K.",
      location: "Dubai",
      rating: 5,
      title: "The battery life is real",
      text: "I get a solid week of use before charging. Sound is clean and balanced, and pairing takes two seconds.",
    },
    {
      name: "Lina R.",
      location: "Tunis",
      rating: 4,
      title: "Great value, elegant design",
      text: "It looks beautiful on my desk and the app is refreshingly simple. Support answered my question within an hour.",
    },
  ],
};
