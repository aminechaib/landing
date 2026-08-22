<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Brand;

class BrandAdminController extends BaseReferenceCrudController
{
    public function __construct()
    {
        $this->crud = new SimpleCrudController(Brand::class, [
            'name' => ['required', 'string', 'max:120'],
        ], hasSlug: true);
    }
}
