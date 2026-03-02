<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAnswer extends Model
{
    protected $fillable = [
        'user_subtest_progress_id',
        'question_id',
        'answer_text',
        'answer_content',
        'is_correct',
        'is_flagged',
        'time_spent_seconds',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'is_flagged' => 'boolean',
    ];

    // Relationships
    public function userSubtestProgress()
    {
        return $this->belongsTo(\App\Models\UserSubtestProgress::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    // Helper method untuk check jawaban
    public function checkAnswer()
    {
        if ($this->question->question_type === 'multiple_choice') {
            $correctChoice = $this->question->choices()->where('is_correct', true)->first();
            if ($correctChoice) {
                $this->is_correct = ($this->answer_text === $correctChoice->choice_label);
                $this->save();
            }
        }
        // Untuk essay dan speaking, is_correct tetap null sampai di-review manual
    }
}
