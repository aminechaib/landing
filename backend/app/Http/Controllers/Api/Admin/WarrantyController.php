<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warranty;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarrantyController extends Controller
{
    /** GET /api/admin/warranties */
    public function index(Request $request): JsonResponse
    {
        $status = strtoupper((string) $request->input('status', ''));

        $query = Warranty::query()
            ->with([
                'order:id,order_number',
                'item:id,product_name',
                'product:id,name',
            ])
            ->orderByDesc('created_at');

        // Filter on the effective status (ACTIVE warranties past end_date show as EXPIRED).
        if ($status === 'EXPIRED') {
            $query->where('status', 'ACTIVE')->where('end_date', '<', today());
        } elseif ($status !== '') {
            $query->where('status', $status);
        }

        $warranties = $query->paginate(min((int) $request->input('per_page', 25), 100));

        $warranties->getCollection()->transform(fn ($w) => [
            'id' => $w->id,
            'order_number' => $w->order?->order_number,
            'product_name' => $w->item?->product_name,
            'serial_number' => $w->serial_number,
            'warranty_months' => $w->warranty_months,
            'start_date' => $w->start_date->toDateString(),
            'end_date' => $w->end_date->toDateString(),
            'effective_status' => ($w->status === 'ACTIVE' && $w->end_date < today()) ? 'EXPIRED' : $w->status,
        ]);

        return response()->json(['data' => $warranties]);
    }

    /** PUT /api/admin/warranties/{warranty} — void a warranty. */
    public function update(Request $request, Warranty $warranty): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:ACTIVE,VOID'],
            'serial_number' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $warranty->update(array_filter($data, fn ($v) => $v !== null));

        return response()->json(['message' => "Warranty set to {$warranty->status}."]);
    }
}
