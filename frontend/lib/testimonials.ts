/**
 * Static customer stories shown on the product page.
 * Intentionally seed-style data for v1 — no review platform yet.
 */
export type Testimonial = {
  name: string;
  location: string;
  rating: number;
  title: string;
  text: string;
};

export const TESTIMONIALS: Testimonial[] = [
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
];
