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
            'shipping_cost' => '0',
            'support_email' => 'support@portage.store',
            'support_phone' => '+1 555 010 2030',
        ];

        foreach ($settings as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
