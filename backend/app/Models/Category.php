<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'parent_id', 'sort_order', 'image_path', 'show_in_collections'];

    protected function casts(): array
    {
        return [
            'show_in_collections' => 'boolean',
        ];
    }

    protected function url(): Attribute
    {
        return Attribute::get(fn () => $this->image_path ? asset('storage/' . $this->image_path) : null);
    }

    /** @var array<int, string> */
    protected $appends = ['url'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
