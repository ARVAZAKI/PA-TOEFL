<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTestSession extends Model
{
    protected $fillable = [
        'user_id',
        'guest_name',
        'toefl_id',
        'started_at',
        'completed_at',
        'status',
        'total_score',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function toefl()
    {
        return $this->belongsTo(Toefl::class);
    }

    public function subtestProgress()
    {
        return $this->hasMany(UserSubtestProgress::class);
    }

    // Helper methods
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function calculateTotalScore()
    {
        $this->total_score = $this->subtestProgress()->sum('score');
        $this->save();
        return $this->total_score;
    }
}
