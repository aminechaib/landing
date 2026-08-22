<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the storefront with a complete, consistent demo dataset.
     * All stock and orders flow through the services so batches,
     * movements and product stock stay in sync.
     */
    public function run(): void
    {
        $this->call([
            SettingsSeeder::class,
            AdminUserSeeder::class,
            CatalogSeeder::class,
            InventorySeeder::class,
            DemoSalesSeeder::class,
        ]);
    }
}
