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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('passage_id')->nullable();
            $table->foreign('passage_id')->references('id')->on('passages')->onDelete('cascade');
            $table->unsignedBigInteger('subtest_id');
            $table->foreign('subtest_id')->references('id')->on('subtests')->onDelete('cascade');
            $table->text('question_text');
            $table->enum('question_type', ['multiple_choice', 'essay', 'speaking'])->default('multiple_choice');
            $table->integer('preparation_time')->nullable(); // untuk speaking (dalam detik)
            $table->integer('response_time')->nullable(); // untuk speaking/writing (dalam detik)
            $table->integer('order')->default(0);
            $table->integer('points')->default(1); // bobot nilai
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
