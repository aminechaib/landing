<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /** GET /api/admin/customers */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query()
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->when($request->filled('search'), fn ($q) => $q->where(fn ($w) => $w
                ->where('first_name', 'like', '%' . $request->string('search') . '%')
                ->orWhere('last_name', 'like', '%' . $request->string('search') . '%')
                ->orWhere('phone', 'like', '%' . $request->string('search') . '%')));

        $customers = $query->orderByDesc('created_at')->paginate(min((int) $request->input('per_page', 25), 100));

        $customers->getCollection()->transform(fn ($customer) => array_merge($customer->toArray(), [
            'lifetime_value' => (float) ($customer->orders_sum_total ?? 0),
        ]));

        return response()->json(['data' => $customers]);
    }
}
