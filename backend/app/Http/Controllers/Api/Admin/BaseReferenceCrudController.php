<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Delegates reference-entity CRUD to a configured SimpleCrudController.
 * Subclasses wire the model + validation rules in their constructor.
 */
abstract class BaseReferenceCrudController extends Controller
{
    protected SimpleCrudController $crud;

    /** GET /api/admin/{resource} */
    public function index(): JsonResponse
    {
        return $this->crud->index();
    }

    /** POST /api/admin/{resource} */
    public function store(Request $request): JsonResponse
    {
        return $this->crud->store($request);
    }

    /** PUT /api/admin/{resource}/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        return $this->crud->update($request, $id);
    }

    /** DELETE /api/admin/{resource}/{id} */
    public function destroy(int $id): JsonResponse
    {
        return $this->crud->destroy($id);
    }
}
