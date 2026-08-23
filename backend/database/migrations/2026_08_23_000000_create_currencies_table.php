<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();
            $table->string('name');
            $table->timestamps();
        });

        DB::table('currencies')->insert([
            ['code' => 'QAR', 'name' => 'Qatari Riyal'],
            ['code' => 'USD', 'name' => 'US Dollar'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
