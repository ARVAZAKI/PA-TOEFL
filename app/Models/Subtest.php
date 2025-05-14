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
}
