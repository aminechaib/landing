<?php

return [

    'currency' => env('SHOP_CURRENCY', 'USD'),

    // Fallback shipping cost when the settings table has no value.
    'shipping_cost' => env('SHOP_SHIPPING_COST', 0),

    'low_stock_threshold' => env('SHOP_LOW_STOCK_THRESHOLD', 10),

];
