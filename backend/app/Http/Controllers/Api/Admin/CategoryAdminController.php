<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CategoryAdminController extends BaseReferenceCrudController
{
    public function __construct()
    {
        $this->crud = new SimpleCrudController(Category::class, [
            'name' => ['required', 'string', 'max:120'],
            'name_ar' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'show_in_collections' => ['nullable', 'boolean'],
        ], hasSlug: true);
    }

    /** POST /api/admin/categories/{id}/image */
    public function uploadImage(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif,svg', 'max:5120'],
        ]);

        $category = Category::findOrFail($id);

        // Replace: remove the previous file so storage does not accumulate orphans.
        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }

        $path = $request->file('image')->store('categories', 'public');
        $category->update(['image_path' => $path]);

        return response()->json(['message' => 'Category image uploaded.', 'data' => [
            'id' => $category->id,
            'image' => $category->url,
        ]], 201);
    }

    /** DELETE /api/admin/categories/{id}/image */
    public function destroyImage(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }
        $category->update(['image_path' => null]);

        return response()->json(['message' => 'Category image removed.']);
    }
}
