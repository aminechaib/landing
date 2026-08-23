<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    /**
     * Mirror of the DB column defaults (create_catalog_tables migration).
     * Keeps the in-memory model consistent right after create() when the
     * request omits these fields (e.g. currency for the initial price row).
     */
    protected $attributes = [
        'currency' => 'QAR',
        'warranty_months' => 12,
        'status' => 'ACTIVE',
        'stock_quantity' => 0,
        'is_featured' => false,
    ];

    protected $fillable = [
        'sku', 'barcode', 'name', 'slug', 'description', 'features',
        'brand_id', 'category_id', 'selling_price', 'currency',
        'warranty_months', 'status', 'badge', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'selling_price' => 'decimal:2',
            'features' => 'array',
            'is_featured' => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order');
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ProductPrice::class)->latest('valid_from');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class)->latest();
    }
}
