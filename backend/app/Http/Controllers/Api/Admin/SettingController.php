<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    private const KEYS = ['store_name', 'promo_code', 'promo_percent', 'promo_title', 'promo_title_ar', 'shipping_cost', 'support_email', 'support_phone', 'testimonials_mode'];

    private const JSON_KEYS = ['home_content', 'testimonials', 'home_sections'];

    /** GET /api/admin/settings */
    public function show(): JsonResponse
    {
        $data = collect(self::KEYS)->mapWithKeys(
            fn ($key) => [$key => Setting::get($key)]
        )->all();

        foreach (self::JSON_KEYS as $jsonKey) {
            $data[$jsonKey] = json_decode((string) Setting::get($jsonKey), true);
        }

        return response()->json(['data' => $data]);
    }

    /** PUT /api/admin/settings */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'store_name' => ['nullable', 'string', 'max:120'],
            'promo_code' => ['nullable', 'string', 'max:50'],
            'promo_percent' => ['nullable', 'numeric', 'min:0', 'max:90'],
            'promo_title' => ['nullable', 'string', 'max:255'],
            'promo_title_ar' => ['nullable', 'string', 'max:255'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'support_phone' => ['nullable', 'string', 'max:30'],
            // Bilingual homepage blocks — stored as JSON strings.
            'home_content' => ['nullable', 'array'],
            'testimonials' => ['nullable', 'array'],
            'home_sections' => ['nullable', 'array'],
            'testimonials_mode' => ['nullable', 'in:default,custom'],
        ]);

        // Keep only known blocks per language ("hero", "guarantees"); drop anything else.
        if (isset($data['home_content'])) {
            $data['home_content'] = array_map(
                fn ($block) => is_array($block)
                    ? array_intersect_key($block, array_flip(['hero', 'guarantees']))
                    : $block,
                $data['home_content']
            );
        }

        foreach ($data as $key => $value) {
            Setting::set($key, is_array($value)
                ? json_encode($value, JSON_UNESCAPED_UNICODE)
                : ($value !== null ? (string) $value : null));
        }

        return response()->json(['message' => 'Settings saved.']);
    }

    /**
     * POST /api/admin/settings/hero-image
     * One shared hero picture for both languages. Replaces the previous file
     * so storage does not accumulate orphans.
     */
    public function uploadHeroImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif,svg', 'max:5120'],
        ]);

        $content = json_decode((string) Setting::get('home_content'), true) ?: [];
        $oldPath = $this->storedHeroPath($content);

        $path = $request->file('image')->store('home', 'public');

        if ($oldPath && $oldPath !== $path) {
            Storage::disk('public')->delete($oldPath);
        }

        // Shared image across both languages; stored as a full URL like other media.
        $url = asset('storage/' . $path);
        foreach (['en', 'ar'] as $locale) {
            data_set($content, "{$locale}.hero.image", $url);
        }
        Setting::set('home_content', json_encode($content, JSON_UNESCAPED_UNICODE));

        return response()->json(['message' => 'Hero image uploaded.', 'data' => [
            'image' => $url,
        ]], 201);
    }

    /** DELETE /api/admin/settings/hero-image — storefront falls back to the built-in art. */
    public function destroyHeroImage(): JsonResponse
    {
        $content = json_decode((string) Setting::get('home_content'), true) ?: [];
        $oldPath = $this->storedHeroPath($content);

        if ($oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        foreach (['en', 'ar'] as $locale) {
            data_set($content, "{$locale}.hero.image", null);
        }
        Setting::set('home_content', json_encode($content, JSON_UNESCAPED_UNICODE));

        return response()->json(['message' => 'Hero image removed.']);
    }

    /**
     * Extracts the storage disk path from the stored hero image URL,
     * ignoring built-in static art ("/hero.svg" and friends).
     */
    private function storedHeroPath(array $content): ?string
    {
        $url = $content['en']['hero']['image'] ?? null;

        return is_string($url) && str_contains($url, '/storage/')
            ? \Illuminate\Support\Str::after($url, '/storage/')
            : null;
    }
}
