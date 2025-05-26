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
        $readingScore = $request->input('score');

        session(['ReadingScore' => $readingScore]);

        return $request;

        // Kirim response agar Inertia tidak error
        // return response()->json(['success' => true]);
    }

    public function scoreboard()
    {
        $score = session('ReadingScore', 0); // default 0 jika belum ada

        return Inertia::render('scoreboard', [
            'readingScore' => $score,
        ]);
    }
}
