"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "ar" | "en";
export type Dir = "rtl" | "ltr";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ar: Record<string, any> = {
  nav: { home: "الرئيسية", collections: "المجموعات", support: "الدعم", menu: "فتح القائمة" },
  hero: {
    badge: "موسم جديد · تقنيات مميزة",
    titleA: "اكتشف ",
    titleAccent: "المستقبل",
    titleB: " من الإلكترونيات.",
    subtitle: "تسوّق أحدث التقنيات المميزة، المنتقاة بعناية لتناسب أسلوب حياتك.",
    cta: "اشترِ الآن",
    explore: "استكشف المجموعات",
    freeShipping: "شحن مجاني",
    onEveryOrder: "على كل الطلبات",
    imgAlt: "إلكترونيات مميزة",
  },
  collections: {
    kicker: "تسوّق حسب الفئة",
    title: "تسوّق حسب المجموعة",
    description: "ثلاث فئات مختارة بعناية، من الصوت الغامر إلى الأناقة الذكية.",
    wearables: "الأجهزة القابلة للارتداء",
    wearablesDesc: "ساعات ذكية تواكب يومك بأناقة.",
    audio: "الصوتيات",
    audioDesc: "صوت غامر يليق بيومك.",
    home: "المنزل الذكي",
    homeDesc: "صوت ونور يملآن مساحتك.",
    featuredAlt: "أبرز المنتجات",
  },
  favorites: {
    kicker: "يفضّلها عملاؤنا",
    title: "الأكثر طلباً",
    description: "قطع يعود إليها مجتمعنا مراراً وتكراراً.",
    all: "الكل",
    empty: "لا توجد منتجات في هذه المجموعة بعد — عود قريباً.",
  },
  badges: {
    NEW_ARRIVAL: "وصل حديثاً",
    BEST_SELLER: "الأكثر مبيعاً",
    SALE: "تخفيض",
    OUT_OF_STOCK: "غير متوفر",
    VIEW: "عرض",
  },
  promo: {
    kicker: "حصري على إنستغرام",
    defaultTitle: "حصري على إنستغرام — خصم إضافي {percent}% بكود {code}",
    copied: "تم نسخ الكود!",
    copyAria: "انسخ كود الخصم {code}",
  },
  guarantee: {
    shipping: { title: "شحن مجاني", text: "على كل طلب، حتى باب منزلك." },
    warranty: { title: "{months} شهر ضمان", year: "سنة واحدة ضمان", text: "تغطية رسمية شاملة لعيوب الصناعة." },
    returns: { title: "إرجاع خلال 30 يوماً", text: "غيّرت رأيك؟ لا مشكلة." },
  },
  stories: {
    kicker: "قصص العملاء",
    title: "ماذا يقول عملاؤنا",
    description: "تجارب حقيقية لعملاء اشتروا بالدفع عند الاستلام.",
  },
  product: {
    home: "الرئيسية",
    brand: "الماركة",
    styleLabel: "الخيار",
    selectStyle: "اختر خياراً",
    orderNow: "اطلب الآن",
    stockInfo: "{count} قطعة متوفرة · الدفع عند الاستلام",
    outOfStockLine: "عودة قريباً",
    warrantyMonths: "ضمان {months} شهر",
    warrantyYear: "ضمان سنة واحدة",
    storiesHint: "شاهد تجارب العملاء أدناه",
    notAvailable: "هذا المنتج لم يعد متوفراً.",
    backToStore: "العودة إلى المتجر",
    loading: "جارٍ التحميل…",
  },
  order: {
    title: "إتمام الطلب",
    close: "إغلاق",
    item: "المنتج",
    quantity: "الكمية",
    maxQty: "الحد الأقصى {max} قطعة",
    contactTitle: "بيانات المستلم",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phone: "رقم الهاتف",
    emailOptional: "البريد الإلكتروني (اختياري)",
    address: "العنوان بالتفصيل",
    city: "المدينة",
    notes: "ملاحظات (اختياري)",
    paymentTitle: "الدفع عند الاستلام",
    paymentText: "ادفع نقداً عند وصول الطلب. لا حاجة لأي بطاقة.",
    promoCode: "كود الخصم (اختياري)",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    free: "مجاني",
    discount: "خصم {percent}% ({code})",
    total: "الإجمالي",
    place: "تأكيد الطلب — الدفع عند الاستلام",
    placing: "جارٍ إرسال الطلب…",
    successTitle: "تم استلام طلبك!",
    successBody: "سنتصل بك على رقم هاتفك لتأكيد الطلب قبل الشحن.",
    orderNumber: "رقم الطلب",
    payOnDelivery: "المبلغ المطلوب عند الاستلام",
    continueShopping: "مواصلة التسوق",
    failed: "تعذر إرسال الطلب. حاول مرة أخرى.",
  },
  footer: {
    tagline: "إلكترونيات مميزة منتقاة بذوق رفيع — دفع عند الاستلام وشحن مجاني وضمان رسمي.",
    quickLinks: "روابط سريعة",
    customerService: "خدمة العملاء",
    shippingPolicy: "سياسة الشحن",
    returnPolicy: "سياسة الإرجاع",
    warrantyClaim: "مطالبة الضمان",
    contactUs: "تواصل معنا",
    hours: "أوقات العمل: كل أيام الأسبوع، 9 صباحاً – 6 مساءً",
    newsletterTitle: "اشترك في نشرتنا",
    newsletterText: "عروض حصرية وإطلاقات جديدة، مباشرة إلى بريدك.",
    placeholder: "بريدك الإلكتروني",
    subscribe: "اشتراك",
    subscribed: "تم الاشتراك بنجاح!",
    subscribeFailed: "تعذر الاشتراك. تحقق من بريدك.",
    rights: "© {year} بورتاج. جميع الحقوق محفوظة.",
    builtWith: "دفع عند الاستلام · شحن مجاني · ضمان رسمي",
  },
  lang: { switch: "English" },
  admin: {
    console: "لوحة التحكم",
    logout: "تسجيل الخروج",
    signIn: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    welcome: "مرحباً بعودتك",
    hint: "بيانات الدخول الافتراضية: admin@portage.test / admin123",
    openMenu: "فتح القائمة",
    mobileTitle: "بورتاج للإدارة",
    nav: {
      dashboard: "لوحة المعلومات",
      orders: "الطلبات",
      products: "المنتجات",
      inventory: "المخزون",
      customers: "العملاء",
      warranties: "الضمانات",
      returns: "المرتجعات",
      categories: "الفئات",
      brands: "الماركات",
      suppliers: "الموردون",
      exports: "التصدير",
      settings: "الإعدادات",
    },
  },
  dash: {
    revenueToday: "إيرادات اليوم",
    ordersToday: "طلب اليوم",
    pendingOrders: "طلبات معلقة",
    awaitingConfirm: "بانتظار التأكيد",
    unitsInStock: "قطع في المخزون",
    productsCount: "{count} منتج",
    stockAlerts: "تنبيهات المخزون",
    lowOut: "{low} منخفض · {out} نفد",
    latestOrders: "أحدث الطلبات",
    viewAll: "عرض الكل",
    table: { order: "الطلب", customer: "العميل", date: "التاريخ", status: "الحالة", total: "الإجمالي" },
  },
  common: {
    loading: "جارٍ التحميل…",
    previous: "السابق",
    next: "التالي",
    showing: "عرض {from}–{to} من {total}",
  },
};

const en: Record<string, any> = {
  nav: { home: "Home", collections: "Collections", support: "Support", menu: "Open menu" },
  hero: {
    badge: "New Season · Premium Tech",
    titleA: "Discover the ",
    titleAccent: "Future",
    titleB: " of Electronics.",
    subtitle: "Shop premium tech, curated for your lifestyle.",
    cta: "SHOP NOW",
    explore: "Explore collections",
    freeShipping: "Free shipping",
    onEveryOrder: "On every order",
    imgAlt: "Featured electronics",
  },
  collections: {
    kicker: "Shop by category",
    title: "SHOP BY COLLECTION",
    description: "Three curated worlds, from immersive sound to smart elegance.",
    wearables: "Wearables",
    wearablesDesc: "Smart watches that keep pace with your day.",
    audio: "Audio",
    audioDesc: "Immersive sound for every moment.",
    home: "Smart Home",
    homeDesc: "Sound and light for every room.",
    featuredAlt: "Featured products",
  },
  favorites: {
    kicker: "Loved by our customers",
    title: "CUSTOMER FAVORITES",
    description: "The pieces our community keeps coming back for.",
    all: "All",
    empty: "No products in this collection yet — check back soon.",
  },
  badges: {
    NEW_ARRIVAL: "NEW ARRIVAL",
    BEST_SELLER: "BEST SELLER",
    SALE: "SALE",
    OUT_OF_STOCK: "OUT OF STOCK",
    VIEW: "View",
  },
  promo: {
    kicker: "Instagram Exclusive",
    defaultTitle: "Instagram Exclusive — Extra {percent}% Off with Code {code}",
    copied: "Code copied!",
    copyAria: "Copy discount code {code}",
  },
  guarantee: {
    shipping: { title: "Free Shipping", text: "On every order, straight to your door." },
    warranty: { title: "{months}-Month Warranty", year: "1-Year Warranty", text: "Official coverage on all defects." },
    returns: { title: "30-Day Returns", text: "Changed your mind? No problem." },
  },
  stories: {
    kicker: "Customer stories",
    title: "WHAT PEOPLE SAY",
    description: "Real feedback from customers who ordered with cash on delivery.",
  },
  product: {
    home: "HOME",
    brand: "BRAND",
    styleLabel: "Style",
    selectStyle: "Select an option",
    orderNow: "ORDER NOW",
    stockInfo: "{count} in stock · Cash on Delivery",
    outOfStockLine: "Check back soon",
    warrantyMonths: "{months}-month warranty",
    warrantyYear: "1-year warranty",
    storiesHint: "Customer stories below",
    notAvailable: "This product is no longer available.",
    backToStore: "Back to store",
    loading: "Loading…",
  },
  order: {
    title: "Complete your order",
    close: "Close",
    item: "Item",
    quantity: "Quantity",
    maxQty: "Max {max}",
    contactTitle: "Delivery details",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone number",
    emailOptional: "Email (optional)",
    address: "Full address",
    city: "City",
    notes: "Notes (optional)",
    paymentTitle: "Cash on Delivery",
    paymentText: "Pay with cash when your order arrives. No card needed.",
    promoCode: "Discount code (optional)",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "FREE",
    discount: "Discount {percent}% ({code})",
    total: "Total",
    place: "Place Order — Pay on Delivery",
    placing: "Placing order…",
    successTitle: "Order received!",
    successBody: "We'll call you shortly to confirm before shipping.",
    orderNumber: "Order number",
    payOnDelivery: "Amount due on delivery",
    continueShopping: "Continue shopping",
    failed: "Something went wrong. Please try again.",
  },
  footer: {
    tagline:
      "Premium electronics, curated for your lifestyle — cash on delivery, free shipping and official warranty.",
    quickLinks: "Quick links",
    customerService: "Customer service",
    shippingPolicy: "Shipping policy",
    returnPolicy: "Return policy",
    warrantyClaim: "Warranty claim",
    contactUs: "Contact us",
    hours: "Support hours: 9am – 6pm, seven days a week",
    newsletterTitle: "Join our newsletter",
    newsletterText: "Exclusive offers and early drops, straight to your inbox.",
    placeholder: "Your email address",
    subscribe: "Subscribe",
    subscribed: "Subscribed successfully!",
    subscribeFailed: "Subscription failed. Check your email.",
    rights: "© {year} Portage. All rights reserved.",
    builtWith: "Cash on delivery · Free shipping · Official warranty",
  },
  lang: { switch: "العربية" },
  admin: {
    console: "ADMIN CONSOLE",
    logout: "Log out",
    signIn: "Sign in",
    email: "Email",
    password: "Password",
    welcome: "Welcome back",
    hint: "Default seeded credentials: admin@portage.test / admin123",
    openMenu: "Open menu",
    mobileTitle: "Portage Admin",
    nav: {
      dashboard: "Dashboard",
      orders: "Orders",
      products: "Products",
      inventory: "Inventory",
      customers: "Customers",
      warranties: "Warranties",
      returns: "Returns",
      categories: "Categories",
      brands: "Brands",
      suppliers: "Suppliers",
      exports: "Exports",
      settings: "Settings",
    },
  },
  dash: {
    revenueToday: "Revenue today",
    ordersToday: "order(s) today",
    pendingOrders: "Pending orders",
    awaitingConfirm: "Awaiting confirmation",
    unitsInStock: "Units in stock",
    productsCount: "{count} products",
    stockAlerts: "Stock alerts",
    lowOut: "{low} low · {out} out",
    latestOrders: "Latest orders",
    viewAll: "View all",
    table: { order: "Order", customer: "Customer", date: "Date", status: "Status", total: "Total" },
  },
  common: {
    loading: "Loading…",
    previous: "Previous",
    next: "Next",
    showing: "Showing {from}–{to} of {total}",
  },
};

const DICTIONARIES: Record<Locale, Record<string, any>> = { ar, en };

type I18nContextValue = {
  locale: Locale;
  dir: Dir;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "locale";

function resolve(dictionary: Record<string, any>, key: string): string {
  const value = key.split(".").reduce<any>(
    (node, part) => (node && typeof node === "object" ? node[part] : undefined),
    dictionary,
  );
  return typeof value === "string" ? value : key;
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  );
}

/** Client-side only i18n. Arabic is the default language; choice persists in localStorage. */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Default: Arabic. Restored preference is applied after mount (client-side only).
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const localized = resolve(DICTIONARIES[locale], key);
      const template =
        localized === key ? resolve(DICTIONARIES.en, key) : localized; // fall back to English, then raw key
      return interpolate(template, params);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, dir: locale === "ar" ? "rtl" : "ltr", setLocale, t }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used within <LocaleProvider>");
  return ctx;
}
