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
        Schema::create('user_subtest_progress', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_test_session_id');
            $table->foreign('user_test_session_id')->references('id')->on('user_test_sessions')->onDelete('cascade');
            $table->unsignedBigInteger('subtest_id');
            $table->foreign('subtest_id')->references('id')->on('subtests')->onDelete('cascade');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('score')->default(0);
            $table->enum('status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_subtest_progress');
    }
};
