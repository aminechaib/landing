<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductPrice;
use Illuminate\Support\Facades\DB;

class ProductService
{
    /**
     * Change the selling price while preserving history:
     * close the currently open price record, open a new one.
     * Historical orders are never affected (they carry snapshots).
     */
    public function changePrice(Product $product, float $newPrice, ?string $reason = null, ?int $userId = null): Product
    {
        return DB::transaction(function () use ($product, $newPrice, $reason, $userId) {
            $product = Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();

            $current = (float) $product->selling_price;

            if (abs($current - $newPrice) < 0.001) {
                return $product;
            }

            ProductPrice::query()
                ->where('product_id', $product->id)
                ->whereNull('valid_to')
                ->update(['valid_to' => now()]);

            ProductPrice::create([
                'product_id' => $product->id,
                'price' => $newPrice,
                'currency' => $product->currency,
                'valid_from' => now(),
                'valid_to' => null,
                'reason' => $reason ?? 'PRICE_UPDATE',
                'created_by' => $userId,
            ]);

            $product->update(['selling_price' => $newPrice]);

            return $product->fresh();
        });
    }

    /** Seed/initial price record for a product. */
    public function recordInitialPrice(Product $product, float $price, string $validFrom, ?string $reason = 'INITIAL_PRICE'): void
    {
        ProductPrice::create([
            'product_id' => $product->id,
            'price' => $price,
            'currency' => $product->currency,
            'valid_from' => $validFrom,
            'valid_to' => null,
            'reason' => $reason,
        ]);
    }

    /**
     * Change the pricing currency without converting amounts: closes the open
     * price record and opens a new one at the same numeric price, so history
     * always shows which currency each price was valid in.
     */
    public function changeCurrency(Product $product, string $newCurrency): Product
    {
        return DB::transaction(function () use ($product, $newCurrency) {
            $product = Product::query()->whereKey($product->id)->lockForUpdate()->firstOrFail();

            if ($product->currency === $newCurrency) {
                return $product;
            }

            ProductPrice::query()
                ->where('product_id', $product->id)
                ->whereNull('valid_to')
                ->update(['valid_to' => now()]);

            ProductPrice::create([
                'product_id' => $product->id,
                'price' => (float) $product->selling_price,
                'currency' => $newCurrency,
                'valid_from' => now(),
                'valid_to' => null,
                'reason' => 'CURRENCY_CHANGE',
            ]);

            $product->update(['currency' => $newCurrency]);

            return $product->fresh();
        });
    }
}
