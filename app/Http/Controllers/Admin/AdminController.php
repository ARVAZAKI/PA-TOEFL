<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Toefl;
use App\Models\User;
use App\Models\UserTestSession;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Get statistics for dashboard
        $totalUsers = User::where('role', 'student')->count();
        $activeTests = Toefl::where('status', 'active')->count();
        $completedToday = UserTestSession::where('status', 'completed')
            ->whereDate('completed_at', today())
            ->count();
        $inProgress = UserTestSession::where('status', 'in_progress')->count();

        // Get recent test submissions
        $recentTests = UserTestSession::with(['user', 'toefl'])
            ->where('status', 'completed')
            ->latest('completed_at')
            ->take(5)
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'user' => $session->user ? $session->user->name : $session->guest_name,
                    'test' => $session->toefl->name,
                    'score' => $session->total_score,
                    'date' => $session->completed_at->diffForHumans(),
                ];
            });

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'activeTests' => $activeTests,
                'completedToday' => $completedToday,
                'inProgress' => $inProgress,
            ],
            'recentTests' => $recentTests,
        ]);
    }

    public function toefls()
    {
        $toefls = Toefl::withCount(['subtests', 'userTestSessions'])
            ->with('subtests')
            ->latest()
            ->get()
            ->map(function ($toefl) {
                return [
                    'id' => $toefl->id,
                    'name' => $toefl->name,
                    'status' => $toefl->status,
                    'totalQuestions' => 0, // TODO: Calculate from questions
                    'sections' => $toefl->subtests->pluck('name'),
                    'completedCount' => $toefl->user_test_sessions_count,
                    'createdAt' => $toefl->created_at->toDateString(),
                ];
            });

        return Inertia::render('admin/toefls', [
            'toefls' => $toefls,
        ]);
    }

    public function users()
    {
        $users = User::latest()
            ->withCount('testSessions')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'testsCompleted' => $user->test_sessions_count,
                    'createdAt' => $user->created_at->toDateString(),
                ];
            });

        return Inertia::render('admin/users', [
            'users' => $users,
        ]);
    }

    public function results()
    {
        $results = UserTestSession::with(['user', 'toefl', 'subtestProgress.subtest'])
            ->where('status', 'completed')
            ->latest('completed_at')
            ->paginate(20)
            ->through(function ($session) {
                return [
                    'id' => $session->id,
                    'user' => $session->user ? $session->user->name : $session->guest_name,
                    'email' => $session->user ? $session->user->email : '-',
                    'test' => $session->toefl->name,
                    'totalScore' => $session->total_score,
                    'sections' => $session->subtestProgress->map(function ($progress) {
                        return [
                            'name' => $progress->subtest->name,
                            'score' => $progress->score,
                        ];
                    }),
                    'completedAt' => $session->completed_at->format('d M Y, H:i'),
                ];
            });

        return Inertia::render('admin/results', [
            'results' => $results,
        ]);
    }
}
