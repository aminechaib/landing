<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(ProductService $productService): void
    {
        // -------------------------------------------------------------
        // Categories — mirrors the storefront collections.
        // Root categories get a generated placeholder image that the
        // admin can replace with real photography via the admin panel.
        // -------------------------------------------------------------
        $roots = [
            ['name' => 'Audio', 'slug' => 'audio', 'sort_order' => 1, 'description' => 'From immersive over-ear sound to pocketable earbuds.', 'art' => 'headphones'],
            ['name' => 'Wearables', 'slug' => 'wearables', 'sort_order' => 2, 'description' => 'Smartwatches and bands that keep up with your day.', 'art' => 'watch'],
            ['name' => 'Home', 'slug' => 'home', 'sort_order' => 3, 'description' => 'Speakers and soundbars that fill your space.', 'art' => 'speaker'],
        ];

        foreach ($roots as $index => $data) {
            $category = Category::create([
                'name' => $data['name'],
                'slug' => $data['slug'],
                'sort_order' => $data['sort_order'],
                'description' => $data['description'],
            ]);

            $path = "categories/{$data['slug']}.svg";
            Storage::disk('public')->put($path, PlaceholderImage::make($data['art'], strtoupper($data['name']), $index));
            $category->update(['image_path' => $path]);
        }

        [$audio, $wearables, $home] = Category::query()->whereIn('slug', ['audio', 'wearables', 'home'])->orderBy('sort_order')->get()->all();

        $headphones = Category::create(['name' => 'Headphones', 'slug' => 'headphones', 'parent_id' => $audio->id]);
        $earbuds = Category::create(['name' => 'Earbuds', 'slug' => 'earbuds', 'parent_id' => $audio->id]);
        $watches = Category::create(['name' => 'Smart Watches', 'slug' => 'smart-watches', 'parent_id' => $wearables->id]);
        $speakers = Category::create(['name' => 'Speakers', 'slug' => 'speakers', 'parent_id' => $home->id]);
        $soundbars = Category::create(['name' => 'Soundbars', 'slug' => 'soundbars', 'parent_id' => $home->id]);

        $categories = compact('headphones', 'earbuds', 'watches', 'speakers', 'soundbars');

        // -------------------------------------------------------------
        // Brands
        // -------------------------------------------------------------
        $brands = collect(['Aurex', 'Sonaris', 'Volta', 'Nimbus', 'Kaido'])
            ->mapWithKeys(fn ($name) => [$name => \App\Models\Brand::create([
                'name' => $name,
                'slug' => Str::slug($name),
            ])]);

        // -------------------------------------------------------------
        // Products
        // -------------------------------------------------------------
        foreach ($this->products() as $data) {
            $product = Product::create([
                ...$data['attributes'],
                'brand_id' => $brands[$data['brand']]->id,
                'category_id' => $categories[$data['category']]->id,
                'slug' => Str::slug($data['attributes']['name']),
            ]);

            // Gallery: one image per variant angle, generated as premium SVG placeholders.
            foreach (range(0, 2) as $i) {
                $path = "products/{$product->slug}-" . ($i + 1) . '.svg';
                Storage::disk('public')->put($path, PlaceholderImage::make($data['art'], strtoupper($data['art']), $i));

                $product->images()->create([
                    'image_path' => $path,
                    'alt_text' => $product->name,
                    'sort_order' => $i,
                    'is_primary' => $i === 0,
                ]);
            }

            foreach ($data['variants'] ?? [] as $index => $variantName) {
                $product->variants()->create([
                    'name' => $variantName,
                    'sku' => $product->sku . '-' . Str::upper(Str::substr(Str::slug($variantName), 0, 4)),
                    'price' => $data['variant_prices'][$index] ?? null,
                    'sort_order' => $index,
                ]);
            }

            $productService->recordInitialPrice($product, (float) $product->selling_price, now()->subMonths(6));
        }

        // Demo price history on the flagship: 349 -> 329 two months ago -> back to 349.
        $flagship = Product::query()->where('slug', 'aurex-studio-x1-wireless-headphones')->firstOrFail();
        \App\Models\ProductPrice::create([
            'product_id' => $flagship->id,
            'price' => 329.00,
            'currency' => $flagship->currency,
            'valid_from' => now()->subMonths(6)->addDays(5),
            'valid_to' => now()->subMonths(2),
            'reason' => 'LAUNCH_PROMO',
        ]);
    }

    private function products(): array
    {
        return [
            [
                'brand' => 'Aurex',
                'category' => 'headphones',
                'art' => 'headphones',
                'attributes' => [
                    'sku' => 'AUR-STX1',
                    'name' => 'Aurex Studio X1 Wireless Headphones',
                    'description' => "The Studio X1 is our reference over-ear headphone. Custom 45mm drivers deliver a wide, detailed soundstage, while adaptive noise cancelling tunes itself to your surroundings.\n\nMachined aluminium arms, memory-foam earcushions and a 40-hour battery make it equally at home in the studio or at 35,000 feet.",
                    'features' => [
                        ['title' => 'Uncompromising Sound', 'description' => 'Custom 45mm drivers tuned for studio-grade detail across the whole range.'],
                        ['title' => 'Designed for Comfort', 'description' => 'Memory-foam cushions and a 254g frame you can wear all day.'],
                        ['title' => 'Smart Control, Anywhere', 'description' => 'Adaptive ANC, multipoint pairing and instant device switching.'],
                    ],
                    'selling_price' => 349.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 24,
                    'status' => 'ACTIVE',
                    'badge' => 'BEST_SELLER',
                    'is_featured' => true,
                    'barcode' => '8901234500011',
                ],
                'variants' => ['Midnight Black', 'Champagne Beige'],
                'variant_prices' => [349.00, 369.00],
            ],
            [
                'brand' => 'Sonaris',
                'category' => 'earbuds',
                'art' => 'earbuds',
                'attributes' => [
                    'sku' => 'SON-AIRP',
                    'name' => 'Sonaris Air Pro Earbuds',
                    'description' => "Feather-light buds with rich, punchy sound and crystal-clear calls. Six microphones with wind rejection keep your voice front and centre.\n\nIPX5 water resistance and wireless charging round out a truly pocketable flagship.",
                    'features' => [
                        ['title' => 'Big Sound, Tiny Shell', 'description' => '11mm dynamic drivers with deep bass you can feel.'],
                        ['title' => 'Clear Calls', 'description' => 'Six-mic array with AI noise reduction.'],
                        ['title' => 'All-Day Power', 'description' => '8h per charge, 32h with the case.'],
                    ],
                    'selling_price' => 129.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 12,
                    'status' => 'ACTIVE',
                    'badge' => 'NEW_ARRIVAL',
                    'is_featured' => true,
                    'barcode' => '8901234500028',
                ],
                'variants' => ['Arctic White', 'Graphite'],
                'variant_prices' => [129.00, 129.00],
            ],
            [
                'brand' => 'Aurex',
                'category' => 'watches',
                'art' => 'watch',
                'attributes' => [
                    'sku' => 'AUR-WVS2',
                    'name' => 'Aurex Wave S2 Smart Watch',
                    'description' => "A sapphire-crystal AMOLED display, week-long battery and precision health tracking. The Wave S2 measures heart rate, SpO2 and sleep stages around the clock.\n\nOver 120 sport modes with dual-band GPS keep every workout honest.",
                    'features' => [
                        ['title' => 'Brilliant AMOLED', 'description' => 'Always-on sapphire display, readable in direct sun.'],
                        ['title' => 'Health, Decoded', 'description' => 'HR, SpO2, sleep staging and stress tracking.'],
                        ['title' => '7-Day Battery', 'description' => 'Full week of use, 30 days on watch face only.'],
                    ],
                    'selling_price' => 299.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 12,
                    'status' => 'ACTIVE',
                    'badge' => 'SALE',
                    'is_featured' => true,
                    'barcode' => '8901234500035',
                ],
                'variants' => ['42mm Silver', '46mm Midnight'],
                'variant_prices' => [299.00, 319.00],
            ],
            [
                'brand' => 'Nimbus',
                'category' => 'watches',
                'art' => 'watch',
                'attributes' => [
                    'sku' => 'NIM-BND1',
                    'name' => 'Nimbus Pulse Band',
                    'description' => "Your lightest training partner. Continuous heart-rate, sleep scoring and smart notifications in a 21g band that disappears on your wrist.\n\nTwo-week battery life means you can forget the charger.",
                    'features' => [
                        ['title' => 'Ultra Light', 'description' => 'Just 21g — wear it day and night without noticing.'],
                        ['title' => '14-Day Battery', 'description' => 'Charge once every two weeks.'],
                        ['title' => 'Sleep Coach', 'description' => 'Automatic sleep staging with daily recovery score.'],
                    ],
                    'selling_price' => 79.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 12,
                    'status' => 'ACTIVE',
                    'is_featured' => false,
                    'barcode' => '8901234500042',
                ],
                'variants' => ['Obsidian', 'Sand'],
                'variant_prices' => [79.00, 79.00],
            ],
            [
                'brand' => 'Volta',
                'category' => 'speakers',
                'art' => 'speaker',
                'attributes' => [
                    'sku' => 'VOL-HOM1',
                    'name' => 'Volta Home One Speaker',
                    'description' => "Room-filling 360° sound from a speaker that fits in your palm. Pair two for true stereo or group twelve around the house.\n\nThe woven acoustic fabric and anodised grille look as good as they sound.",
                    'features' => [
                        ['title' => '360° Sound', 'description' => 'Dual passive radiators throw music in every direction.'],
                        ['title' => 'Multiroom Ready', 'description' => 'Group up to 12 speakers over Wi-Fi.'],
                        ['title' => '18-Hour Battery', 'description' => 'Take the party anywhere, IP67 rated.'],
                    ],
                    'selling_price' => 199.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 12,
                    'status' => 'ACTIVE',
                    'badge' => 'BEST_SELLER',
                    'is_featured' => true,
                    'barcode' => '8901234500059',
                ],
                'variants' => ['Charcoal', 'Linen'],
                'variant_prices' => [199.00, 199.00],
            ],
            [
                'brand' => 'Volta',
                'category' => 'speakers',
                'art' => 'speaker',
                'attributes' => [
                    'sku' => 'VOL-TWR3',
                    'name' => 'Volta Bass Tower 300',
                    'description' => "A floor-standing tower with dedicated subwoofer chamber. Three amplifiers drive tweeter, mid-woofer and down-firing bass port separately for hi-fi clarity at living-room volume.",
                    'features' => [
                        ['title' => 'Deep Bass Chamber', 'description' => 'Down-firing 6.5\" sub delivers room-shaking lows.'],
                        ['title' => 'Three Amps Inside', 'description' => 'Independent drivers, zero distortion at high volume.'],
                        ['title' => 'Optical + BT 5.3', 'description' => 'Plug into your TV or stream from anywhere.'],
                    ],
                    'selling_price' => 399.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 24,
                    'status' => 'ACTIVE',
                    'is_featured' => false,
                    'barcode' => '8901234500066',
                ],
                'variants' => [],
            ],
            [
                'brand' => 'Kaido',
                'category' => 'soundbars',
                'art' => 'soundbar',
                'attributes' => [
                    'sku' => 'KAI-SB30',
                    'name' => 'Kaido Cinema Soundbar',
                    'description' => "Virtual 5.1 surround with Dolby Atmos height channels in a single slim bar. Night mode keeps dialogue crisp while the neighbours stay asleep.",
                    'features' => [
                        ['title' => 'Dolby Atmos', 'description' => 'Height virtualisation puts you inside the scene.'],
                        ['title' => 'Voice Clarity', 'description' => 'Dedicated centre channel lifts dialogue.'],
                        ['title' => 'One-Cable Setup', 'description' => 'Single HDMI eARC to your TV.'],
                    ],
                    'selling_price' => 259.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 12,
                    'status' => 'ACTIVE',
                    'badge' => 'NEW_ARRIVAL',
                    'is_featured' => false,
                    'barcode' => '8901234500073',
                ],
                'variants' => [],
            ],
            [
                'brand' => 'Nimbus',
                'category' => 'earbuds',
                'art' => 'earbuds',
                'attributes' => [
                    'sku' => 'NIM-PODS',
                    'name' => 'Nimbus Beat Pods',
                    'description' => "Everyday wireless earbuds with balanced sound and instant pairing. USB-C quick charge gives you an hour of playback in five minutes.",
                    'features' => [
                        ['title' => 'Instant Pairing', 'description' => 'Open the case and they connect.'],
                        ['title' => 'Quick Charge', 'description' => '5 minutes = 60 minutes of play.'],
                        ['title' => 'Balanced Tuning', 'description' => 'Warm mids, clean highs, controlled bass.'],
                    ],
                    'selling_price' => 89.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 12,
                    'status' => 'ACTIVE',
                    'badge' => 'SALE',
                    'is_featured' => false,
                    'barcode' => '8901234500080',
                ],
                'variants' => [],
            ],
            [
                'brand' => 'Volta',
                'category' => 'speakers',
                'art' => 'speaker',
                'attributes' => [
                    'sku' => 'VOL-GO',
                    'name' => 'Volta Mini Go Speaker',
                    'description' => "A pocket speaker with surprisingly full sound. Clip it to a bag, drop it in sand, rinse it off — IP68 and ready for anything.",
                    'features' => [
                        ['title' => 'Pocket Size', 'description' => 'Fits in your palm, clips anywhere.'],
                        ['title' => 'IP68 Waterproof', 'description' => 'Pool-proof, beach-proof, life-proof.'],
                        ['title' => '12h Playtime', 'description' => 'Sunrise to sunset on one charge.'],
                    ],
                    'selling_price' => 59.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 12,
                    'status' => 'ACTIVE',
                    'badge' => 'NEW_ARRIVAL',
                    'is_featured' => false,
                    'barcode' => '8901234500097',
                ],
                'variants' => [],
            ],
            [
                'brand' => 'Kaido',
                'category' => 'soundbars',
                'art' => 'camera',
                'attributes' => [
                    'sku' => 'KAI-CAM4',
                    'name' => 'Kaido Lumen 4K Action Camera',
                    'description' => "Butter-smooth 4K60 with horizon lock and a touchscreen that works with wet fingers. Rugged to 10m without a case.",
                    'features' => [
                        ['title' => '4K60 Stabilised', 'description' => 'Gimbal-like stabilisation straight out of camera.'],
                        ['title' => 'Horizon Lock', 'description' => 'Level footage even when you are not.'],
                        ['title' => 'Waterproof 10m', 'description' => 'No housing needed down to 10 metres.'],
                    ],
                    'selling_price' => 179.00,
                    'currency' => config('shop.currency'),
                    'warranty_months' => 12,
                    'status' => 'ACTIVE',
                    'is_featured' => false,
                    'barcode' => '8901234500103',
                ],
                'variants' => [],
            ],
        ];
    }
}
