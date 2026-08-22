<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Database\Seeder;

class DemoSalesSeeder extends Seeder
{
    public function run(OrderService $orders): void
    {
        $bySku = Product::query()->pluck('id', 'sku');

        $customers = [
            'sara' => Customer::create([
                'first_name' => 'Sarah', 'last_name' => 'Bennani',
                'phone' => '+15550100201', 'email' => 'sarah.bennani@example.com',
                'address' => '221 Garden Street, Apt 4B', 'city' => 'Casablanca', 'country' => 'Morocco',
            ]),
            'omar' => Customer::create([
                'first_name' => 'Omar', 'last_name' => 'Haddad',
                'phone' => '+15550100344', 'email' => 'omar.haddad@example.com',
                'address' => '14 Palm Avenue', 'city' => 'Dubai', 'country' => 'UAE',
            ]),
            'lina' => Customer::create([
                'first_name' => 'Lina', 'last_name' => 'Chowdhury',
                'phone' => '+15550100789', 'email' => 'lina.c@example.com',
                'address' => '9 Lakeside Road', 'city' => 'London', 'country' => 'UK',
            ]),
        ];

        // 1) Instagram ad order — pending confirmation.
        $order = $orders->create([
            'items' => [
                ['product_id' => $bySku['AUR-STX1'], 'variant_id' => null, 'quantity' => 1],
            ],
            'customer' => [
                'first_name' => $customers['sara']->first_name,
                'last_name' => $customers['sara']->last_name,
                'phone' => $customers['sara']->phone,
                'email' => $customers['sara']->email,
                'address' => $customers['sara']->address,
                'city' => $customers['sara']->city,
            ],
            'discount_code' => 'PORTAGE10',
            'source' => 'INSTAGRAM',
            'utm_source' => 'instagram',
            'utm_medium' => 'paid',
            'utm_campaign' => 'summer_audio',
            'utm_content' => 'ad1_studio_x1',
            'utm_term' => null,
        ]);

        // 2) Direct order — confirmed (warranties are created on confirmation).
        $order2 = $orders->create([
            'items' => [
                ['product_id' => $bySku['SON-AIRP'], 'quantity' => 1],
                ['product_id' => $bySku['AUR-WVS2'], 'quantity' => 1],
            ],
            'customer' => [
                'first_name' => $customers['omar']->first_name,
                'last_name' => $customers['omar']->last_name,
                'phone' => $customers['omar']->phone,
                'email' => $customers['omar']->email,
                'address' => $customers['omar']->address,
                'city' => $customers['omar']->city,
            ],
            'source' => 'DIRECT',
        ]);
        $orders->updateStatus($order2, 'CONFIRMED');

        // 3) Snapchat campaign — delivered & paid.
        $order3 = $orders->create([
            'items' => [
                ['product_id' => $bySku['VOL-HOM1'], 'quantity' => 1],
                ['product_id' => $bySku['VOL-GO'], 'quantity' => 2],
            ],
            'customer' => [
                'first_name' => $customers['lina']->first_name,
                'last_name' => $customers['lina']->last_name,
                'phone' => $customers['lina']->phone,
                'email' => $customers['lina']->email,
                'address' => $customers['lina']->address,
                'city' => $customers['lina']->city,
            ],
            'notes' => 'Please leave with the concierge.',
            'source' => 'SNAPCHAT',
            'utm_source' => 'snapchat',
            'utm_medium' => 'paid',
            'utm_campaign' => 'home_audio_launch',
            'utm_content' => 'story_v2',
        ]);
        $orders->updateStatus($order3, 'SHIPPED');
        $orders->updateStatus($order3, 'DELIVERED');

        // Spread the demo orders over the last few days for a realistic dashboard.
        $order->forceFill(['created_at' => now()->subHours(5)])->save();
        $order2->forceFill(['created_at' => now()->subDays(1)])->save();
        $order3->forceFill(['created_at' => now()->subDays(3)])->save();
    }
}
