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
        Schema::create('user_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_subtest_progress_id');
            $table->foreign('user_subtest_progress_id')->references('id')->on('user_subtest_progress')->onDelete('cascade');
            $table->unsignedBigInteger('question_id');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
            $table->string('answer_text')->nullable(); // untuk multiple choice (A/B/C/D)
            $table->text('answer_content')->nullable(); // untuk essay/speaking
            $table->boolean('is_correct')->nullable(); // nullable untuk speaking/writing yang perlu manual review
            $table->boolean('is_flagged')->default(false);
            $table->integer('time_spent_seconds')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_answers');
    }
};
