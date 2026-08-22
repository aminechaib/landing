<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Category;

class CategoryAdminController extends BaseReferenceCrudController
{
    public function __construct()
    {
        $this->crud = new SimpleCrudController(Category::class, [
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:categories,id'],
        ], hasSlug: true);
    }
}
