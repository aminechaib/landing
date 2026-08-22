<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryBatch;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    public function __construct(private readonly InventoryService $inventory)
    {
    }

    /** GET /api/admin/returns */
    public function index(Request $request): JsonResponse
    {
        $returns = \App\Models\OrderReturn::query()
            ->with(['order:id,order_number', 'customer:id,first_name,last_name,phone', 'items.product:id,name'])
            ->latest()
            ->paginate(min((int) $request->input('per_page', 25), 100));

        return response()->json(['data' => $returns]);
    }

    /** POST /api/admin/returns — minimal return registration. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'reason' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.order_item_id' => ['required', 'exists:order_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.condition' => ['required', 'in:NEW,USED,DAMAGED,DEFECTIVE'],
            'items.*.action' => ['required', 'in:RESTOCK,REPAIR,REPLACE,REFUND'],
        ]);

        $order = \App\Models\Order::with('items')->findOrFail($data['order_id']);

        foreach ($data['items'] as $item) {
            $orderItem = $order->items->firstWhere('id', $item['order_item_id']);
            if (! $orderItem) {
                validation_error(["items.order_item_id" => 'Order item does not belong to this order.']);
            }
            if ($item['quantity'] > $orderItem->quantity) {
                validation_error(["items.quantity" => 'Return quantity exceeds ordered quantity.']);
            }
        }

        $return = \Illuminate\Support\Facades\DB::transaction(function () use ($data, $order, $request) {
            $return = \App\Models\OrderReturn::create([
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'status' => 'APPROVED',
                'reason' => $data['reason'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $orderItem = $order->items->firstWhere('id', $item['order_item_id']);

                $return->items()->create([
                    'order_item_id' => $orderItem->id,
                    'product_id' => $orderItem->product_id,
                    'quantity' => $item['quantity'],
                    'condition' => $item['condition'],
                    'action' => $item['action'],
                ]);

                if ($item['action'] === 'RESTOCK' && $orderItem->product_id) {
                    $this->inventory->restock(
                        Product::find($orderItem->product_id),
                        (int) $item['quantity'],
                        \App\Models\OrderReturn::class,
                        $return->id,
                        "Return of order {$order->order_number}",
                        $request->user()->id,
                    );
                }
            }

            return $return;
        });

        return response()->json(['message' => 'Return registered.', 'data' => ['id' => $return->id]], 201);
    }

    /** PUT /api/admin/returns/{return} */
    public function updateStatus(Request $request, \App\Models\OrderReturn $return): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:REQUESTED,APPROVED,COMPLETED,REJECTED']]);
        $return->update($data);

        return response()->json(['message' => "Return set to {$return->status}."]);
    }
}
