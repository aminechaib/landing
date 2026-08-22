<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryBatch;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(private readonly InventoryService $inventory)
    {
    }

    /** POST /api/admin/inventory/receive — new arrival, new batch. */
    public function receive(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'arrival_date' => ['nullable', 'date'],
            'supplier_invoice_number' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $product = Product::findOrFail($data['product_id']);
        $batch = $this->inventory->receive($product, $data, $request->user()->id);

        return response()->json([
            'message' => "Received {$batch->quantity_received} units of {$product->name} (batch {$batch->batch_number}).",
            'data' => [
                'batch_number' => $batch->batch_number,
                'stock_quantity' => $product->fresh()->stock_quantity,
            ],
        ], 201);
    }

    /** GET /api/admin/inventory/batches */
    public function batches(Request $request): JsonResponse
    {
        $batches = InventoryBatch::query()
            ->with(['product:id,name,sku', 'supplier:id,name'])
            ->when($request->filled('product_id'), fn ($q) => $q->where('product_id', $request->input('product_id')))
            ->orderByDesc('arrival_date')
            ->paginate(min((int) $request->input('per_page', 25), 100));

        return response()->json(['data' => $batches]);
    }

    /** GET /api/admin/inventory/movements */
    public function movements(Request $request): JsonResponse
    {
        $movements = InventoryMovement::query()
            ->with(['product:id,name,sku', 'batch:id,batch_number'])
            ->when($request->filled('product_id'), fn ($q) => $q->where('product_id', $request->input('product_id')))
            ->when($request->filled('type'), fn ($q) => $q->where('type', strtoupper($request->input('type'))))
            ->latest()
            ->paginate(min((int) $request->input('per_page', 25), 100));

        return response()->json(['data' => $movements]);
    }
}
