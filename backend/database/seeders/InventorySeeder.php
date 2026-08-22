<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Supplier;
use App\Services\InventoryService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InventorySeeder extends Seeder
{
    public function run(InventoryService $inventory): void
    {
        $techsource = Supplier::create([
            'name' => 'TechSource Distribution',
            'phone' => '+1 555 014 2200',
            'email' => 'sales@techsource.example',
            'address' => '12 Harbor Industrial Park, Rotterdam',
            'notes' => 'Main supplier for audio equipment.',
        ]);

        $globalparts = Supplier::create([
            'name' => 'Global Parts Trading',
            'phone' => '+1 555 014 3399',
            'email' => 'orders@globalparts.example',
            'address' => '88 Export Zone 4, Shenzhen',
            'notes' => 'Bulk electronics components.',
        ]);

        $nova = Supplier::create([
            'name' => 'Nova Retail Supply',
            'phone' => '+1 555 014 8111',
            'email' => 'contact@novaretail.example',
            'address' => '5 Commerce Ave, Dubai',
        ]);

        $bySku = Product::query()->pluck('id', 'sku');

        // product sku => [supplier, quantity, purchase_price, months ago, invoice]
        $arrivals = [
            'AUR-STX1' => [[$techsource, 100, 210.00, 7], [$globalparts, 60, 222.00, 4], [$techsource, 80, 205.00, 1]],
            'SON-AIRP' => [[$globalparts, 150, 78.00, 6], [$nova, 50, 81.00, 2]],
            'AUR-WVS2' => [[$techsource, 80, 185.00, 5], [$nova, 40, 192.00, 1]],
            'NIM-BND1' => [[$globalparts, 120, 42.00, 4]],
            'VOL-HOM1' => [[$techsource, 100, 112.00, 6], [$globalparts, 60, 118.00, 3]],
            'VOL-TWR3' => [[$techsource, 45, 255.00, 2]],
            'KAI-SB30' => [[$nova, 70, 160.00, 1]],
            'NIM-PODS' => [[$globalparts, 140, 52.00, 5]],
            'VOL-GO'   => [[$nova, 100, 31.00, 1]],
            'KAI-CAM4' => [[$techsource, 60, 110.00, 3]],
        ];

        foreach ($arrivals as $sku => $batches) {
            $product = Product::withTrashed()->find($bySku[$sku]);
            if (! $product) {
                continue;
            }

            foreach ($batches as [$supplier, $quantity, $price, $monthsAgo]) {
                $inventory->receive($product, [
                    'supplier_id' => $supplier->id,
                    'quantity' => $quantity,
                    'purchase_price' => $price,
                    'arrival_date' => now()->subMonths($monthsAgo)->toDateString(),
                    'supplier_invoice_number' => strtoupper(Str::random(2)) . '-' . random_int(10000, 99999),
                    'notes' => null,
                ]);
            }
        }
    }
}
