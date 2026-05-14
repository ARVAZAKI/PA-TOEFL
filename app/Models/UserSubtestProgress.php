<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSubtestProgress extends Model
{
    protected $fillable = [
        'user_test_session_id',
        'subtest_id',
        'started_at',
        'completed_at',
        'score',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'score' => 'float',
    ];

    // Relationships
    public function userTestSession()
    {
        return $this->belongsTo(UserTestSession::class);
    }

    public function subtest()
    {
        return $this->belongsTo(Subtest::class);
    }

    public function userAnswers()
    {
        return $this->hasMany(UserAnswer::class);
    }

    // Helper methods
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function calculateScore()
    {
        $correctAnswers = $this->userAnswers()->where('is_correct', true)->count();
        $totalQuestions = $this->userAnswers()->count();
        
        // Score maksimal per section adalah 30
        if ($totalQuestions > 0) {
            $this->score = round(($correctAnswers / $totalQuestions) * 30);
        } else {
            $this->score = 0;
        }
        
        $this->save();
        return $this->score;
    }
}
