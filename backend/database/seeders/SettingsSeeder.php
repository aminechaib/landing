<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'store_name' => 'Portage',
            'promo_code' => 'PORTAGE10',
            'promo_percent' => '10',
            'promo_title' => 'Instagram Exclusive — Extra 10% Off with Code PORTAGE10',
            'promo_title_ar' => 'حصري على إنستغرام — خصم إضافي {percent}% بكود {code}',
            'shipping_cost' => '0',
            'support_email' => 'support@portage.store',
            'support_phone' => '+1 555 010 2030',
        ];

        foreach ($settings as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }

        // Bilingual homepage content. Stored as JSON: {en: {...}, ar: {...}}.
        // The storefront falls back to its built-in copy when keys are absent.
        $defaults = [
            'home_content' => [
                'en' => [
                    'hero' => [
                        'badge' => 'New Season · Premium Tech',
                        'title_before' => 'Discover the ',
                        'title_accent' => 'Future',
                        'title_after' => ' of Electronics.',
                        'subtitle' => 'Shop premium tech, curated for your lifestyle.',
                        'cta' => 'SHOP NOW',
                        'explore' => 'Explore collections',
                        'image' => '/hero.svg',
                        'image_alt' => 'Featured electronics',
                        'free_shipping' => 'Free shipping',
                        'on_every_order' => 'On every order',
                    ],
                    'guarantees' => [
                        'shipping' => ['title' => 'Free Shipping', 'text' => 'On every order, straight to your door.'],
                        'warranty' => ['title' => '{months}-Month Warranty', 'year' => '1-Year Warranty', 'text' => 'Official coverage on all defects.'],
                        'returns' => ['title' => '30-Day Returns', 'text' => 'Changed your mind? No problem.'],
                    ],
                ],
                'ar' => [
                    'hero' => [
                        'badge' => 'موسم جديد · تقنيات مميزة',
                        'title_before' => 'اكتشف ',
                        'title_accent' => 'المستقبل',
                        'title_after' => ' من الإلكترونيات.',
                        'subtitle' => 'تسوّق أحدث التقنيات المميزة، المنتقاة بعناية لتناسب أسلوب حياتك.',
                        'cta' => 'اشترِ الآن',
                        'explore' => 'استكشف المجموعات',
                        'image' => '/hero.svg',
                        'image_alt' => 'إلكترونيات مميزة',
                        'free_shipping' => 'شحن مجاني',
                        'on_every_order' => 'على كل الطلبات',
                    ],
                    'guarantees' => [
                        'shipping' => ['title' => 'شحن مجاني', 'text' => 'على كل طلب، حتى باب منزلك.'],
                        'warranty' => ['title' => '{months} شهر ضمان', 'year' => 'سنة واحدة ضمان', 'text' => 'تغطية رسمية شاملة لعيوب الصناعة.'],
                        'returns' => ['title' => 'إرجاع خلال 30 يوماً', 'text' => 'غيّرت رأيك؟ لا مشكلة.'],
                    ],
                ],
            ],
            'testimonials' => [
                'en' => [
                    ['name' => 'Sarah M.', 'location' => 'Casablanca', 'rating' => 5, 'title' => 'Better than expected', 'text' => 'Ordered on Monday, delivered Wednesday with cash on delivery. The build quality genuinely surprised me — these feel twice their price.'],
                    ['name' => 'Omar K.', 'location' => 'Dubai', 'rating' => 5, 'title' => 'The battery life is real', 'text' => 'I get a solid week of use before charging. Sound is clean and balanced, and pairing takes two seconds.'],
                    ['name' => 'Lina R.', 'location' => 'Tunis', 'rating' => 4, 'title' => 'Great value, elegant design', 'text' => 'It looks beautiful on my desk and the app is refreshingly simple. Support answered my question within an hour.'],
                ],
                'ar' => [
                    ['name' => 'سارة م.', 'location' => 'الدار البيضاء', 'rating' => 5, 'title' => 'أفضل من المتوقع', 'text' => 'طلبت يوم الاثنين ووصلني الطلب يوم الأربعاء مع الدفع عند الاستلام. جودة التصنيع فاجأتني فعلاً — يبدو أنها بضعف سعرها.'],
                    ['name' => 'عمر ك.', 'location' => 'دبي', 'rating' => 5, 'title' => 'عمر البطارية حقيقي', 'text' => 'أستخدمه أسبوعاً كاملاً قبل الشحن. الصوت نقي ومتوازن، والاقتران يستغرق ثانيتين فقط.'],
                    ['name' => 'لينا ر.', 'location' => 'تونس', 'rating' => 4, 'title' => 'قيمة رائعة وتصميم أنيق', 'text' => 'يبدو جميلاً على مكتبي والتطبيق بسيط بشكل منعش. خدمة العملاء أجابت على سؤالي خلال ساعة.'],
                ],
            ],
        ];

        foreach ($defaults as $key => $content) {
            Setting::firstOrCreate(['key' => $key], ['value' => json_encode($content, JSON_UNESCAPED_UNICODE)]);
        }

        // Which homepage sections are visible. All on by default.
        Setting::firstOrCreate(['key' => 'home_sections'], ['value' => json_encode([
            'hero' => true,
            'collections' => true,
            'promo' => true,
            'favorites' => true,
            'stories' => true,
        ])]);
    }
}
