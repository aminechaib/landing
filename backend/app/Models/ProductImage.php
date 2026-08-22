<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'image_path', 'alt_text', 'sort_order', 'is_primary'];

    protected function url(): Attribute
    {
        return Attribute::get(fn () => asset('storage/' . $this->image_path));
    }

    protected $appends = ['url'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
