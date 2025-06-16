<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TestUnitController extends Controller
{
    public function ThrowSession(Request $request)
    {
        $username = $request->input('username');
        session(['username' => $username]);

        // Bisa redirect saja
        return redirect()->route('test.show', ['section' => 'general']);
    }


    public function subtestShow($section = 'general')
    {

        $username = session('username');
        $readingScore = session('ReadingScore', 0);
        $listeningScore = session('ListeningScore', 0);
        $speakingScore = session('SpeakingScore', 0);
        $writingScore = session('WritingScore', 0);
        $username = session('username');

        // render halaman test (test-question.tsx)
        if (str_ends_with($section, '-question')) {
            return Inertia::render('test-question', [
                'section' => $section,
                'username' => $username,
                'readingScore' => $readingScore,
                'listeningScore' => $listeningScore,
                'speakingScore' => $speakingScore,
                'writingScore' => $writingScore,
            ]);
        }

        // render halaman info (test-unit.tsx)
        return Inertia::render('test-unit', [
            'section' => $section,
            'username' => $username,
            'readingScore' => $readingScore,
            'listeningScore' => $listeningScore,
            'speakingScore' => $speakingScore,
            'writingScore' => $writingScore,
        ]);
    }

    public function submitTest(Request $request)
    {
        $section = $request->input('section');
        $score = $request->input('score'); // jawaban user

        switch ($section) {
            case "reading-question":
                session(['ReadingScore' => $score]);
                break;
            case "listening-question":
                session(['ListeningScore' => $score]);
                break;
            case "speaking-question":
                session(['SpeakingScore' => $score]);
                break;
            case "writing-question":
                session(['WritingScore' => $score]);
                break;

        }
    }



    public function scoreboard()
    {
        $readingScore = session('ReadingScore', 0);
        $listeningScore = session('ListeningScore', 0);
        $speakingScore = session('SpeakingScore', 0);
        $writingScore = session('WritingScore', 0);
        $username = session('username');

        return Inertia::render('scoreboard', [
            'readingScore' => $readingScore,
            'listeningScore' => $listeningScore,
            'speakingScore' => $speakingScore,
            'writingScore' => $writingScore,
            'username' => $username
        ]);
    }

}
