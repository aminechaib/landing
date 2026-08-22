<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Supplier;

class SupplierAdminController extends BaseReferenceCrudController
{
    public function __construct()
    {
        $this->crud = new SimpleCrudController(Supplier::class, [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
