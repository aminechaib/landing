<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyAdminController extends Controller
{
    /** GET /api/admin/currencies */
    public function index(): JsonResponse
    {
        return response()->json(['data' => Currency::query()->orderBy('code')->get()]);
    }

    /** POST /api/admin/currencies */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        return response()->json(['message' => 'Currency created.', 'data' => Currency::create($data)], 201);
    }

    /** PUT /api/admin/currencies/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $currency = Currency::findOrFail($id);
        $currency->update($this->validated($request, ignoreId: $id));

        return response()->json(['message' => 'Saved.', 'data' => $currency->fresh()]);
    }

    /** DELETE /api/admin/currencies/{id} */
    public function destroy(int $id): JsonResponse
    {
        $code = Currency::findOrFail($id)->code;

        // Keep currencies referenced by existing records.
        if (Product::where('currency', $code)->exists()) {
            return response()->json(['message' => "Currency {$code} is used by products and cannot be deleted."], 422);
        }

        Currency::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'size:3', 'unique:currencies,code' . ($ignoreId ? ",{$ignoreId}" : '')],
            'name' => ['required', 'string', 'max:60'],
        ]);
    }
}
