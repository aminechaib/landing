<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = ['name', 'phone', 'email', 'address', 'notes'];

    public function batches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class);
    }
}
