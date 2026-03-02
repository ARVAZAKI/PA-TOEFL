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
        Schema::create('passages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('subtest_id');
            $table->foreign('subtest_id')->references('id')->on('subtests')->onDelete('cascade');
            $table->string('title');
            $table->text('content'); // Text passage atau URL audio/video
            $table->enum('type', ['reading', 'listening', 'speaking', 'writing']);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passages');
    }
};
