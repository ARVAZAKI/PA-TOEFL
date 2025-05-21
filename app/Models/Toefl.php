<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Toefl extends Model
{
    protected $fillable = [
        'name',
        'status'
    ];

     public function subtests()
    {
        return $this->belongsToMany(Subtest::class, 'toefl_subtests', 'toefl_id', 'subtest_id');
    }
}
