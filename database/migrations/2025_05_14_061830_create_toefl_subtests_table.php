<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('toefl_subtests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('toefl_id');
            $table->foreign('toefl_id')->references('id')->on('toefls')->onDelete('cascade');
            $table->unsignedBigInteger('subtest_id');
            $table->foreign('subtest_id')->references('id')->on('subtests')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toefl_subtests');
    }
};
