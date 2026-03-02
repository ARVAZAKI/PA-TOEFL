<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Passage extends Model
{
    protected $fillable = [
        'subtest_id',
        'title',
        'content',
        'type',
        'order',
    ];

    // Relationships
    public function subtest()
    {
        return $this->belongsTo(Subtest::class);
    }

    public function questions()
    {
        return $this->hasMany(\App\Models\Question::class)->orderBy('order');
    }
}
