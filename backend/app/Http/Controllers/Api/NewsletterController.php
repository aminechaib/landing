<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    /** POST /api/newsletter */
    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email:filter', 'max:255'],
        ]);

        NewsletterSubscriber::query()->firstOrCreate(['email' => strtolower($data['email'])]);

        return response()->json(['message' => 'You are subscribed. Watch your inbox for exclusive offers.'], 201);
    }
}
