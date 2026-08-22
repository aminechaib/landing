<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Warranty extends Model
{
    protected $fillable = [
        'order_id', 'order_item_id', 'product_id', 'serial_number',
        'warranty_months', 'start_date', 'end_date', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return ['start_date' => 'date', 'end_date' => 'date'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** Auto-expire: warranties past their end date are reported as EXPIRED. */
    public function scopeWithEffectiveStatus(Builder $query): Builder
    {
        return $query->select('warranties.*')
            ->selectRaw("CASE WHEN status = 'ACTIVE' AND end_date < date('now') THEN 'EXPIRED' ELSE status END as effective_status");
    }
}
