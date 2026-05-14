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
        Schema::table('user_answers', function (Blueprint $table) {
            $table->decimal('score', 5, 2)->nullable()->after('answer_content');
            $table->text('feedback_text')->nullable()->after('score');
            $table->json('assessment_data')->nullable()->after('feedback_text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_answers', function (Blueprint $table) {
            $table->dropColumn(['score', 'feedback_text', 'assessment_data']);
        });
    }
};
