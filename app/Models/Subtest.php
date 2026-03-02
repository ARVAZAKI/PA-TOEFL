<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subtest extends Model
{
    protected $fillable = [
        'name'
    ];

    public function toefls()
    {
        return $this->belongsToMany(Toefl::class, 'toefl_subtests', 'subtest_id', 'toefl_id');
    }

    public function passages()
    {
        return $this->hasMany(Passage::class)->orderBy('order');
    }

    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function userSubtestProgress()
    {
        return $this->hasMany(UserSubtestProgress::class);
    }
}
