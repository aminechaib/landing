<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products)
    {
    }

    /** GET /api/admin/products */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->with(['images', 'category:id,name,slug,parent_id', 'brand:id,name,slug'])
            ->withTrashed()
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', '%' . $request->string('search') . '%')
                ->orWhere('sku', 'like', '%' . $request->string('search') . '%')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', strtoupper($request->string('status'))));

        return response()->json([
            'data' => $query->orderByDesc('created_at')
                ->paginate(min((int) $request->input('per_page', 25), 100)),
        ]);
    }

    /** GET /api/admin/products-all — lightweight list for selects. */
    public function options(): JsonResponse
    {
        return response()->json([
            'data' => Product::query()
                ->where('status', 'ACTIVE')
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'stock_quantity']),
        ]);
    }

    /** POST /api/admin/products */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);
        $data['features'] = $this->parseFeatures($data['features'] ?? null);

        $product = Product::create($data);

        if (! empty($data['variants'])) {
            $this->syncVariants($product, $data['variants']);
        }

        if (! empty($data['selling_price'])) {
            $this->products->recordInitialPrice(
                $product,
                (float) $data['selling_price'],
                now()->toDateTimeString(),
                'INITIAL_PRICE',
            );
        }

        return response()->json(['data' => new ProductResource($product->load('images'))], 201);
    }

    /** GET /api/admin/products/{product} */
    public function show(Product $product): JsonResponse
    {
        $product->load(['images', 'variants', 'category', 'brand', 'prices.creator:id,name']);

        return response()->json(['data' => [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'barcode' => $product->barcode,
            'description' => $product->description,
            'features' => $product->features ?? [],
            'brand_id' => $product->brand_id,
            'category_id' => $product->category_id,
            'selling_price' => (float) $product->selling_price,
            'currency' => $product->currency,
            'warranty_months' => $product->warranty_months,
            'stock_quantity' => $product->stock_quantity,
            'status' => $product->status,
            'badge' => $product->badge,
            'is_featured' => (bool) $product->is_featured,
            'deleted_at' => $product->deleted_at?->toIso8601String(),
            'images' => $product->images->map(fn ($i) => [
                'id' => $i->id, 'url' => $i->url, 'alt_text' => $i->alt_text, 'is_primary' => $i->is_primary,
            ]),
            'variants' => $product->variants->map(fn ($v) => [
                'id' => $v->id, 'name' => $v->name, 'sku' => $v->sku, 'price' => $v->price !== null ? (float) $v->price : null,
            ]),
            'category' => ['id' => $product->category?->id, 'name' => $product->category?->name],
            'brand' => ['id' => $product->brand?->id, 'name' => $product->brand?->name],
        ]]);
    }

    /** PUT /api/admin/products/{product} */
    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $this->validated($request, forUpdate: true, ignoreId: $product->id);

        // Price changes must go through the dedicated price endpoint.
        unset($data['selling_price']);

        // Currency changes roll the price history over to a new open record.
        $newCurrency = $data['currency'] ?? null;
        unset($data['currency']);

        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'] ?? $product->slug, ignoreId: $product->id);
        if (array_key_exists('features', $data)) {
            $data['features'] = $this->parseFeatures($data['features']);
        }

        $product->update($data);

        if ($newCurrency !== null && $newCurrency !== $product->currency) {
            $product = $this->products->changeCurrency($product, $newCurrency);
        }

        if (array_key_exists('variants', $data)) {
            $this->syncVariants($product, $data['variants'] ?? []);
        }

        return response()->json(['data' => new ProductResource($product->load('images'))]);
    }

    /** PUT /api/admin/products/{product}/price — records history. */
    public function changePrice(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'price' => ['required', 'numeric', 'min:0'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $product = $this->products->changePrice($product, (float) $data['price'], $data['reason'] ?? null, $request->user()->id);

        return response()->json([
            'message' => 'Price updated and recorded in history.',
            'data' => ['selling_price' => (float) $product->selling_price],
        ]);
    }

    /** PUT /api/admin/products/{product}/status */
    public function setStatus(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:ACTIVE,INACTIVE,DISCONTINUED']]);
        $product->update($data);

        return response()->json(['message' => "Product set to {$product->status}.", 'data' => ['status' => $product->status]]);
    }

    /** DELETE /api/admin/products/{product} — soft delete. */
    public function destroy(Product $product): JsonResponse
    {
        if ($product->orderItems()->exists()) {
            // Keep products that have historical orders; just disable them.
            $product->update(['status' => 'DISCONTINUED']);

            return response()->json(['message' => 'Product has historical orders — it was discontinued instead of deleted.', 'soft_deleted' => false]);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted.', 'soft_deleted' => true]);
    }

    /** GET /api/admin/products/{product}/history */
    public function history(Product $product): JsonResponse
    {
        $orders = \App\Models\OrderItem::query()
            ->where('product_id', $product->id)
            ->with('order.customer:id,first_name,last_name')
            ->latest()
            ->limit(20)
            ->get();

        return response()->json(['data' => [
            'current_stock' => $product->stock_quantity,
            'price_history' => $product->prices()->get()->map(fn ($p) => [
                'id' => $p->id,
                'price' => (float) $p->price,
                'currency' => $p->currency,
                'valid_from' => $p->valid_from?->toIso8601String(),
                'valid_to' => $p->valid_to?->toIso8601String(),
                'reason' => $p->reason,
                'created_by' => $p->creator?->name,
            ]),
            'batches' => $product->batches()->with('supplier:id,name')->orderByDesc('arrival_date')->get()->map(fn ($b) => [
                'id' => $b->id,
                'batch_number' => $b->batch_number,
                'supplier' => $b->supplier?->name,
                'quantity_received' => $b->quantity_received,
                'quantity_remaining' => $b->quantity_remaining,
                'purchase_price' => (float) $b->purchase_price,
                'currency' => $b->currency,
                'arrival_date' => $b->arrival_date->toDateString(),
                'invoice' => $b->supplier_invoice_number,
            ]),
            'movements' => $product->movements()->with('batch:id,batch_number')->limit(50)->get()->map(fn ($m) => [
                'id' => $m->id,
                'type' => $m->type,
                'quantity' => $m->quantity,
                'batch' => $m->batch?->batch_number,
                'reference_type' => $m->reference_type,
                'reference_id' => $m->reference_id,
                'reason' => $m->reason,
                'created_at' => $m->created_at->toIso8601String(),
            ]),
            'orders' => $orders->map(fn ($item) => [
                'order_id' => $item->order_id,
                'order_number' => $item->order->order_number,
                'customer_name' => optional($item->order->customer)->first_name . ' ' . optional($item->order->customer)->last_name,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
                'status' => $item->order->status,
                'date' => $item->order->created_at->toDateString(),
            ]),
        ]]);
    }

    /** POST /api/admin/products/{product}/images */
    public function uploadImages(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:8'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp,gif,svg', 'max:5120'],
        ]);

        $sortBase = (int) $product->images()->max('sort_order');

        foreach ($request->file('images') as $index => $file) {
            $path = $file->store("products/{$product->id}", 'public');

            $product->images()->create([
                'image_path' => $path,
                'alt_text' => $product->name,
                'sort_order' => $sortBase + $index + 1,
                'is_primary' => $product->images()->count() === 0 && $index === 0,
            ]);
        }

        return response()->json(['message' => 'Images uploaded.', 'data' => [
            'images' => $product->images()->orderBy('sort_order')->get()->map(fn ($i) => [
                'id' => $i->id, 'url' => $i->url, 'is_primary' => $i->is_primary,
            ]),
        ]], 201);
    }

    /** DELETE /api/admin/product-images/{image} */
    public function deleteImage(\App\Models\ProductImage $image): JsonResponse
    {
        \Illuminate\Support\Facades\Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return response()->json(['message' => 'Image removed.']);
    }

    private function validated(Request $request, bool $forUpdate = false, ?int $ignoreId = null): array
    {
        $rules = [
            'name' => [$forUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'sku' => [$forUpdate ? 'sometimes' : 'required', 'string', 'max:100', 'unique:products,sku' . ($ignoreId ? ",{$ignoreId}" : '')],
            'barcode' => ['nullable', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'features' => ['nullable'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'selling_price' => [$forUpdate ? 'prohibited' : 'required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3', 'exists:currencies,code'],
            'warranty_months' => ['nullable', 'integer', 'min:0', 'max:120'],
            'status' => ['nullable', 'in:ACTIVE,INACTIVE,DISCONTINUED'],
            'badge' => ['nullable', 'in:NEW_ARRIVAL,BEST_SELLER,SALE'],
            'is_featured' => ['nullable', 'boolean'],
            'variants' => ['nullable', 'array', 'max:20'],
            'variants.*.name' => ['required', 'string', 'max:120'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0'],
        ];

        return $request->validate($rules);
    }

    /** Replace the variant set of a product (simple full sync). */
    private function syncVariants(Product $product, array $variants): void
    {
        $product->variants()->delete();
        foreach ($variants as $variant) {
            if (($variant['name'] ?? '') === '') {
                continue;
            }
            $product->variants()->create([
                'name' => $variant['name'],
                'price' => $variant['price'] ?? null,
            ]);
        }
    }

    /**
     * Features come from the admin form as lines of "Title | Description".
     * Stored as JSON: [{title, description}].
     */
    private function parseFeatures(mixed $value): ?array
    {
        if (is_array($value)) {
            return $value;
        }
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $features = [];
        foreach (preg_split('/\r\n|\r|\n/', trim($value)) as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }
            [$title, $description] = array_pad(array_map('trim', explode('|', $line, 2)), 2, '');
            $features[] = ['title' => $title, 'description' => $description];
        }

        return $features ?: null;
    }

    private function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = \Illuminate\Support\Str::slug($source) ?: uniqid('product-');
        $slug = $base;
        $i = 1;

        while (Product::withTrashed()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = $base . '-' . ++$i;
        }

        return $slug;
    }
}
