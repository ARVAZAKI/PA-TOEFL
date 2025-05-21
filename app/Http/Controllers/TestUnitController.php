<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TestUnitController extends Controller
{
    public function subtestShow($section = 'general')
    {
        // render halaman test (test-question.tsx)
        if (str_ends_with($section, '-question')) {
            return Inertia::render('test-question', [
                'section' => $section,
            ]);
        }

        // render halaman info (test-unit.tsx)
        return Inertia::render('test-unit', [
            'section' => $section,
        ]);
    }

    public function submitTest(Request $request)
    {
        return $request;
        // return response()->json(['success' => true]);

        // return redirect()->route('scoreboard');
    }
}
