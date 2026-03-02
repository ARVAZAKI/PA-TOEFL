<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = [
        'passage_id',
        'subtest_id',
        'question_text',
        'question_type',
        'preparation_time',
        'response_time',
        'order',
        'points',
    ];

    // Relationships
    public function passage()
    {
        return $this->belongsTo(Passage::class);
    }

    public function subtest()
    {
        return $this->belongsTo(Subtest::class);
    }

    public function choices()
    {
        return $this->hasMany(QuestionChoice::class)->orderBy('choice_label');
    }

    public function userAnswers()
    {
        return $this->hasMany(\App\Models\UserAnswer::class);
    }

    // Helper method untuk get correct answer
    public function getCorrectAnswerAttribute()
    {
        return $this->choices()->where('is_correct', true)->first();
    }
}
