<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

if (! function_exists('validation_error')) {
    /** Throw a 422 ValidationException from anywhere (services included). */
    function validation_error(array $errors): never
    {
        throw ValidationException::withMessages($errors);
    }
}

if (! function_exists('api_success')) {
    function api_success(mixed $data = null, ?string $message = null, int $status = 200): JsonResponse
    {
        return response()->json(array_filter([
            'data' => $data,
            'message' => $message,
        ], fn ($v) => $v !== null), $status);
    }
}
