<?php

use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public storefront API
|--------------------------------------------------------------------------
*/
Route::get('products', [CatalogController::class, 'products']);
Route::get('products/{slug}', [CatalogController::class, 'product']);
Route::get('categories', [CatalogController::class, 'categories']);
Route::get('brands', [CatalogController::class, 'brands']);
Route::get('settings', [CatalogController::class, 'settings']);

// Guest checkout (Cash on Delivery). Prices and stock are computed server-side.
Route::post('orders', [OrderController::class, 'store'])->middleware('throttle:20,1');

Route::post('newsletter', [NewsletterController::class, 'store'])->middleware('throttle:10,1');

/*
|--------------------------------------------------------------------------
| Admin API — protected by Sanctum tokens
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    Route::post('login', [Admin\AuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [Admin\AuthController::class, 'me']);
        Route::post('logout', [Admin\AuthController::class, 'logout']);

        Route::get('stats', [Admin\DashboardController::class, 'stats']);
        Route::get('recent-orders', [Admin\DashboardController::class, 'recentOrders']);

        // Products
        Route::get('products', [Admin\ProductController::class, 'index']);
        Route::get('products-all', [Admin\ProductController::class, 'options']);
        Route::post('products', [Admin\ProductController::class, 'store']);
        Route::get('products/{product}', [Admin\ProductController::class, 'show']);
        Route::put('products/{product}', [Admin\ProductController::class, 'update']);
        Route::delete('products/{product}', [Admin\ProductController::class, 'destroy']);
        Route::put('products/{product}/price', [Admin\ProductController::class, 'changePrice']);
        Route::put('products/{product}/status', [Admin\ProductController::class, 'setStatus']);
        Route::get('products/{product}/history', [Admin\ProductController::class, 'history']);
        Route::post('products/{product}/images', [Admin\ProductController::class, 'uploadImages']);
        Route::delete('product-images/{image}', [Admin\ProductController::class, 'deleteImage'])
            ->whereNumber('image');

        // Reference entities
        Route::apiResource('categories', Admin\CategoryAdminController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['categories' => 'id']);
        Route::post('categories/{id}/image', [Admin\CategoryAdminController::class, 'uploadImage'])->whereNumber('id');
        Route::delete('categories/{id}/image', [Admin\CategoryAdminController::class, 'destroyImage'])->whereNumber('id');
        Route::apiResource('brands', Admin\BrandAdminController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['brands' => 'id']);
        Route::apiResource('suppliers', Admin\SupplierAdminController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['suppliers' => 'id']);
        Route::apiResource('currencies', Admin\CurrencyAdminController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['currencies' => 'id']);

        // Orders
        Route::get('orders', [Admin\OrderController::class, 'index']);
        Route::get('orders/{order}', [Admin\OrderController::class, 'show']);
        Route::put('orders/{order}', [Admin\OrderController::class, 'update']);
        Route::put('orders/{order}/status', [Admin\OrderController::class, 'setStatus']);

        // Customers
        Route::get('customers', [Admin\CustomerController::class, 'index']);

        // Inventory
        Route::get('inventory/batches', [Admin\InventoryController::class, 'batches']);
        Route::get('inventory/movements', [Admin\InventoryController::class, 'movements']);
        Route::post('inventory/receive', [Admin\InventoryController::class, 'receive']);

        // Warranty & returns
        Route::get('warranties', [Admin\WarrantyController::class, 'index']);
        Route::put('warranties/{warranty}', [Admin\WarrantyController::class, 'update'])->whereNumber('warranty');
        Route::get('returns', [Admin\ReturnController::class, 'index']);
        Route::post('returns', [Admin\ReturnController::class, 'store']);
        Route::put('returns/{return}', [Admin\ReturnController::class, 'updateStatus'])->whereNumber('return');

        // Exports
        Route::get('export/{type}', [Admin\ExportController::class, 'export']);

        // Settings
        Route::get('settings', [Admin\SettingController::class, 'show']);
        Route::put('settings', [Admin\SettingController::class, 'update']);
    });
});
