<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    public const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

    public const SOURCES = ['DIRECT', 'INSTAGRAM', 'FACEBOOK', 'SNAPCHAT', 'TIKTOK', 'GOOGLE', 'WHATSAPP', 'OTHER'];

    protected $fillable = [
        'order_number', 'customer_id',
        'status', 'payment_method', 'payment_status', 'shipping_method', 'shipping_status',
        'subtotal', 'shipping_cost', 'discount', 'total', 'currency',
        'source', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
        'discount_code', 'customer_notes', 'internal_notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function warranties(): HasMany
    {
        return $this->hasMany(Warranty::class);
    }
}
