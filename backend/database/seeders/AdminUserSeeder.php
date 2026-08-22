<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@portage.test')],
            [
                'name' => env('ADMIN_NAME', 'Store Admin'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'admin123')),
                'email_verified_at' => now(),
            ],
        );
    }
}
