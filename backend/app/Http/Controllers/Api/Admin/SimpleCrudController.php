<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Compact CRUD for flat reference entities (categories, brands, suppliers).
 */
class SimpleCrudController extends Controller
{
    public function __construct(
        private readonly string $modelClass,
        private readonly array $rules,
        private readonly bool $hasSlug = false,
        private readonly bool $trashedAware = false,
    ) {
    }

    /** GET /api/admin/{resource} */
    public function index(): JsonResponse
    {
        /** @var Model $model */
        $model = new $this->modelClass;
        $query = $this->modelClass::query();

        if ($this->trashedAware) {
            $query->withTrashed();
        }

        return response()->json(['data' => $query->orderBy('name')->get()]);
    }

    /** POST /api/admin/{resource} */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules);

        if ($this->hasSlug) {
            $data['slug'] = Str::slug($data['name']);
            $i = 1;
            while ($this->modelClass::where('slug', $data['slug'])->exists()) {
                $data['slug'] = Str::slug($data['name']) . '-' . ++$i;
            }
        }

        $record = $this->modelClass::create($data);

        return response()->json(['message' => class_basename($this->modelClass) . ' created.', 'data' => $record], 201);
    }

    /** PUT /api/admin/{resource}/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $record = $this->modelClass::findOrFail($id);
        $data = $request->validate($this->rules);

        if ($this->hasSlug && isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $record->update($data);

        return response()->json(['message' => 'Saved.', 'data' => $record->fresh()]);
    }

    /** DELETE /api/admin/{resource}/{id} */
    public function destroy(int $id): JsonResponse
    {
        $this->modelClass::findOrFail($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
