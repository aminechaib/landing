<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Setting;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /** GET /api/products */
    public function products(Request $request): JsonResponse
    {
        $query = Product::query()
            ->where('status', 'ACTIVE')
            ->with(['images', 'category', 'brand']);

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category = $request->string('category')->toString()) {
            // Accept a parent category (e.g. "audio") and include all descendants.
            $categoryModel = Category::query()->where('slug', $category)->first();
            if ($categoryModel) {
                $query->whereIn('category_id', $this->descendantIds($categoryModel));
            }
        }

        if ($brand = $request->string('brand')->toString()) {
            $query->whereHas('brand', fn ($q) => $q->where('slug', $brand));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($badge = $request->string('badge')->toString()) {
            $query->where('badge', strtoupper($badge));
        }

        match ($request->string('sort')->toString()) {
            'price_asc' => $query->orderBy('selling_price'),
            'price_desc' => $query->orderByDesc('selling_price'),
            default => $query->orderByDesc('created_at'),
        };

        return response()->json([
            'data' => ProductResource::collection(
                $query->paginate(min((int) $request->input('per_page', 12), 48))
            ),
        ]);
    }

    private function descendantIds(Category $category): array
    {
        $ids = [$category->id];

        foreach ($category->children as $child) {
            $ids = array_merge($ids, $this->descendantIds($child));
        }

        return $ids;
    }

    /** GET /api/products/{slug} */
    public function product(string $slug): JsonResponse
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('status', 'ACTIVE')
            ->with(['images', 'variants', 'category.parent', 'brand'])
            ->firstOrFail();

        return response()->json(['data' => new ProductDetailResource($product)]);
    }

    /** GET /api/categories */
    public function categories(): JsonResponse
    {
        // Roots flagged out by the admin are hidden from the storefront entirely.
        $roots = Category::query()
            ->whereNull('parent_id')
            ->where('show_in_collections', true)
            ->with('children')
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => \App\Http\Resources\CategoryResource::collection($roots)]);
    }

    /** GET /api/brands */
    public function brands(): JsonResponse
    {
        return response()->json(['data' => Brand::query()->orderBy('name')->get(['id', 'name', 'slug'])]);
    }

    /** GET /api/settings — public storefront configuration. */
    public function settings(): JsonResponse
    {
        return response()->json([
            'data' => [
                'store_name' => Setting::get('store_name', config('app.name')),
                'promo_code' => Setting::get('promo_code'),
                'promo_percent' => (float) Setting::get('promo_percent', '0'),
                'promo_title' => Setting::get('promo_title'),
                'promo_title_ar' => Setting::get('promo_title_ar'),
                'shipping_cost' => (float) Setting::get('shipping_cost', config('shop.shipping_cost')),
                'support_email' => Setting::get('support_email'),
                'support_phone' => Setting::get('support_phone'),
                // Bilingual homepage content blocks, stored as JSON strings.
                'home' => json_decode((string) Setting::get('home_content'), true),
                'testimonials' => json_decode((string) Setting::get('testimonials'), true),
                // Story source: built-in defaults or the admin-managed rows above.
                'testimonials_mode' => Setting::get('testimonials_mode') ?: 'custom',
                // Which homepage sections the admin has enabled (missing = visible).
                'sections' => json_decode((string) Setting::get('home_sections'), true),
            ],
        ]);
    }
}
