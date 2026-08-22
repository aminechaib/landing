<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    private const KEYS = ['store_name', 'promo_code', 'promo_percent', 'promo_title', 'shipping_cost', 'support_email', 'support_phone'];

    /** GET /api/admin/settings */
    public function show(): JsonResponse
    {
        return response()->json(['data' => collect(self::KEYS)->mapWithKeys(
            fn ($key) => [$key => Setting::get($key)]
        )]);
    }

    /** PUT /api/admin/settings */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'store_name' => ['nullable', 'string', 'max:120'],
            'promo_code' => ['nullable', 'string', 'max:50'],
            'promo_percent' => ['nullable', 'numeric', 'min:0', 'max:90'],
            'promo_title' => ['nullable', 'string', 'max:255'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'support_phone' => ['nullable', 'string', 'max:30'],
        ]);

        foreach (self::KEYS as $key) {
            if (array_key_exists($key, $data)) {
                Setting::set($key, $data[$key] !== null ? (string) $data[$key] : null);
            }
        }

        return response()->json(['message' => 'Settings saved.']);
    }
}
