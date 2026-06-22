<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Subtest;
use App\Models\Passage;
use App\Models\Question;
use App\Models\QuestionChoice;
use App\Models\Toefl;
use App\Models\UserAnswer;
use App\Models\UserSubtestProgress;
use App\Models\UserTestSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class TestUnitController extends Controller
{
    public function subtestShow($section = 'general')
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $username = $user->name;
        $readingScore = session('ReadingScore', 0);
        $listeningScore = session('ListeningScore', 0);
        $speakingScore = session('SpeakingScore', 0);
        $writingScore = session('WritingScore', 0);

        $answeredCounts = [
            'reading' => (bool) session("AnsweredCountReading", false),
            'listening' => (bool) session('AnsweredCountListening', false),
            'speaking' => (bool) session('AnsweredCountSpeaking', false),
            'writing' => (bool) session('AnsweredCountWriting', false),
        ];

        // render halaman test (test-question.tsx)
        if (str_ends_with($section, '-question')) {
            //render question
            $questions = match ($section) {
                'reading-question' => $this->getReadingQuestions(),
                'listening-question' => $this->getListeningQuestions(),
                'speaking-question' => $this->getSpeakingQuestions(),
                'writing-question' => $this->getWritingQuestions(),
                default => [],
            };

            return Inertia::render('test-question', [
                'section' => $section,
                'username' => $username,
                'readingScore' => $readingScore,
                'listeningScore' => $listeningScore,
                'speakingScore' => $speakingScore,
                'writingScore' => $writingScore,
                'answeredCounts' => $answeredCounts,
                'questions' => $questions,
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
        $correctCount = $request->input('correctCount');
        $totalQuestions = $request->input('totalQuestions');
        $answers = $request->input('answers', []);
        $assessments = $request->input('assessments', []);
        $questionSnapshots = $request->input('questionSnapshots', []);
        $pendingSpeakingSubmission = $request->input('pendingSpeakingSubmission');

        if (empty($assessments) && $request->filled('assessments_json')) {
            $decodedAssessments = json_decode((string) $request->input('assessments_json'), true);
            if (is_array($decodedAssessments)) {
                $assessments = $decodedAssessments;
            }
        }

        if (empty($questionSnapshots) && $request->filled('question_snapshots_json')) {
            $decodedSnapshots = json_decode((string) $request->input('question_snapshots_json'), true);
            if (is_array($decodedSnapshots)) {
                $questionSnapshots = $decodedSnapshots;
            }
        }

        Log::info('submitTest received payload', [
            'section' => $section,
            'answers_count' => is_array($answers) ? count($answers) : 0,
            'assessments_count' => is_array($assessments) ? count($assessments) : 0,
            'question_snapshots_count' => is_array($questionSnapshots) ? count($questionSnapshots) : 0,
            'score' => $request->input('score'),
            'has_pending_speaking_submission' => is_array($pendingSpeakingSubmission),
        ]);

        if ($section === 'writing-question' && is_array($pendingSpeakingSubmission)) {
            $pendingSpeakingAnswers = $pendingSpeakingSubmission['answers'] ?? [];
            $pendingSpeakingAssessments = $pendingSpeakingSubmission['assessments'] ?? [];
            $pendingSpeakingSnapshots = $pendingSpeakingSubmission['questionSnapshots'] ?? [];
            $pendingSpeakingScore = $pendingSpeakingSubmission['score'] ?? 0;
            $pendingSpeakingSection = (string) ($pendingSpeakingSubmission['section'] ?? 'speaking-question');

            Log::info('submitTest processing pending speaking submission before writing', [
                'pending_section' => $pendingSpeakingSection,
                'pending_answers_count' => is_array($pendingSpeakingAnswers) ? count($pendingSpeakingAnswers) : 0,
                'pending_assessments_count' => is_array($pendingSpeakingAssessments) ? count($pendingSpeakingAssessments) : 0,
            ]);

            $speakingScore = $this->storeSubmission(
                $pendingSpeakingSection,
                is_array($pendingSpeakingAnswers) ? $pendingSpeakingAnswers : [],
                is_array($pendingSpeakingAssessments) ? $pendingSpeakingAssessments : [],
                is_array($pendingSpeakingSnapshots) ? $pendingSpeakingSnapshots : [],
                $pendingSpeakingScore
            );

            session(['SpeakingScore' => $speakingScore]);
            session(['AnsweredCountSpeaking' => true]);
        }

        $score = $this->storeSubmission($section, $answers, $assessments, $questionSnapshots, $request->input('score'));

        switch ($section) {
            case "reading-question":
                session(['ReadingScore' => $score]);
                session(['AnsweredCountReading' => true]);
                session(['ReadingCorrectCount' => $correctCount]);
                session(['ReadingTotalQuestions' => $totalQuestions]);
                break;
            case "listening-question":
                session(['ListeningScore' => $score]);
                session(['AnsweredCountListening' => true]);
                session(['ListeningCorrectCount' => $correctCount]);
                session(['ListeningTotalQuestions' => $totalQuestions]);
                break;
            case "speaking-question":
                session(['SpeakingScore' => $score]);
                session(['AnsweredCountSpeaking' => true]);
                break;
            case "writing-question":
                session(['WritingScore' => $score]);
                session(['AnsweredCountWriting' => true]);
                break;
        }
    }

    public function assessSpeaking(Request $request): JsonResponse
    {
        $request->validate([
            'audio' => ['required', 'file'],
            'question' => ['required', 'string'],
        ]);

        $audioFile = $request->file('audio');
        if (!$audioFile) {
            return response()->json([
                'message' => 'Audio file is required.',
            ], 422);
        }

        try {
            $response = Http::timeout(90)
                ->attach(
                    'audio',
                    file_get_contents($audioFile->getRealPath()),
                    $audioFile->getClientOriginalName() ?: 'recording.wav'
                )
                ->post($this->getAiApiBaseUrl() . '/assess-speaking', [
                    'question' => (string) $request->input('question'),
                ]);

            return response()->json($response->json() ?? [
                'message' => 'Invalid response from AI service.',
            ], $response->status());
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'AI speaking assessment is unavailable.',
                'error' => $exception->getMessage(),
            ], 503);
        }
    }

    public function assessWriting(Request $request): JsonResponse
    {
        $request->validate([
            'question' => ['required', 'string'],
            'answer' => ['required', 'string'],
        ]);

        try {
            $response = Http::timeout(90)
                ->acceptJson()
                ->post($this->getAiApiBaseUrl() . '/assess-writing', [
                    'question' => (string) $request->input('question'),
                    'answer' => (string) $request->input('answer'),
                ]);

            return response()->json($response->json() ?? [
                'message' => 'Invalid response from AI service.',
            ], $response->status());
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'AI writing assessment is unavailable.',
                'error' => $exception->getMessage(),
            ], 503);
        }
    }

    public function feedback()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $testSession = $this->getSessionForResults($user->id, [
            'toefl',
            'subtestProgress.subtest',
            'subtestProgress.userAnswers.question.choices',
            'subtestProgress.userAnswers.question.passage',
        ]);

        if (!$testSession) {
            return Inertia::render('feedback', [
                'feedback' => null,
            ]);
        }

        $subtests = $testSession->subtestProgress->keyBy(function ($progress) {
            return strtolower($progress->subtest->name);
        });

        $readingData = $this->buildReadingFeedback($subtests->get('reading'));
        $listeningData = $this->buildListeningFeedback($subtests->get('listening'));
        $speakingData = $this->buildSpeakingFeedback($subtests->get('speaking'));
        $writingData = $this->buildWritingFeedback($subtests->get('writing'));

        $testSession->calculateTotalScore();

        return Inertia::render('feedback', [
            'feedback' => [
                'testTitle' => $testSession->toefl?->name ?? 'TOEFL Practice Test',
                'testDate' => optional($testSession->started_at ?? $testSession->created_at)->format('Y-m-d'),
                'overallScore' => $testSession->total_score ?? 0,
                'reading' => $readingData,
                'listening' => $listeningData,
                'speaking' => $speakingData,
                'writing' => $writingData,
            ],
        ]);
    }

    public function resetTest()
    {
        // Clear all test-related session data
        session()->forget([
            'ReadingScore',
            'ListeningScore',
            'SpeakingScore',
            'WritingScore',
            'AnsweredCountReading',
            'AnsweredCountListening',
            'AnsweredCountSpeaking',
            'AnsweredCountWriting',
            'ReadingCorrectCount',
            'ReadingTotalQuestions',
            'ListeningCorrectCount',
            'ListeningTotalQuestions',
            'ActiveTestSessionId',
        ]);

        return redirect()->route('home');
    }

    public function scoreboard()
    {
        $readingScore = session('ReadingScore', 0);
        $listeningScore = session('ListeningScore', 0);
        $speakingScore = session('SpeakingScore', 0);
        $writingScore = session('WritingScore', 0);
        $readingCorrectCount = session('ReadingCorrectCount');
        $readingTotalQuestions = session('ReadingTotalQuestions');
        $listeningCorrectCount = session('ListeningCorrectCount');
        $listeningTotalQuestions = session('ListeningTotalQuestions');
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $username = $user->name;
        $testSession = $this->getSessionForResults($user->id, ['subtestProgress.subtest', 'subtestProgress.userAnswers']);
        if ($testSession) {
            $progressBySubtest = $testSession->subtestProgress->keyBy(function ($progress) {
                return strtolower($progress->subtest->name);
            });

            $readingProgress = $progressBySubtest->get('reading');
            $listeningProgress = $progressBySubtest->get('listening');
            $speakingProgress = $progressBySubtest->get('speaking');
            $writingProgress = $progressBySubtest->get('writing');

            $readingScore = $readingProgress?->score ?? $readingScore;
            $listeningScore = $listeningProgress?->score ?? $listeningScore;
            $speakingScore = $speakingProgress?->score ?? $speakingScore;
            $writingScore = $writingProgress?->score ?? $writingScore;

            if ($readingProgress) {
                $readingCorrectCount = $readingProgress->userAnswers->where('is_correct', true)->count();
                $readingTotalQuestions = $readingProgress->userAnswers->count();
            }

            if ($listeningProgress) {
                $listeningCorrectCount = $listeningProgress->userAnswers->where('is_correct', true)->count();
                $listeningTotalQuestions = $listeningProgress->userAnswers->count();
            }
        }

        return Inertia::render('scoreboard', [
            'readingScore' => $readingScore,
            'listeningScore' => $listeningScore,
            'speakingScore' => $speakingScore,
            'writingScore' => $writingScore,
            'readingCorrectCount' => $readingCorrectCount,
            'readingTotalQuestions' => $readingTotalQuestions,
            'listeningCorrectCount' => $listeningCorrectCount,
            'listeningTotalQuestions' => $listeningTotalQuestions,
            'username' => $username,
        ]);
    }

    private function storeSubmission(string $section, array $answers, array $assessments, array $questionSnapshots, $requestedScore = null): float
    {
        if (!Auth::check()) {
            return 0;
        }

        $subtestName = $this->resolveSubtestName($section);
        if (!$subtestName) {
            return 0;
        }

        $subtest = $this->getOrCreateSubtestByName($subtestName);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $testSession = $this->getOrCreateActiveSession($user->id);
        if (!$testSession) {
            return 0;
        }

        $subtestProgress = UserSubtestProgress::firstOrCreate(
            [
                'user_test_session_id' => $testSession->id,
                'subtest_id' => $subtest->id,
            ],
            [
                'started_at' => now(),
                'status' => 'in_progress',
            ],
        );

        $subtestProgress->status = 'completed';
        $subtestProgress->completed_at = now();

            $computedScore = is_numeric($requestedScore) ? (float) $requestedScore : 0;

        if (!empty($answers)) {
            $subtestProgress->userAnswers()->delete();

            $questionIds = array_map('intval', array_keys($answers));
            $questions = Question::with('choices')->whereIn('id', $questionIds)->get()->keyBy('id');
            $resolvedQuestions = collect();

            foreach ($answers as $questionId => $answerValue) {
                $resolvedQuestion = $questions->get((int) $questionId);
                if (!$resolvedQuestion && isset($questionSnapshots[$questionId]) && is_array($questionSnapshots[$questionId])) {
                    $resolvedQuestion = $this->resolveOrCreateQuestionFromSnapshot($subtest, $questionSnapshots[$questionId]);
                }

                if ($resolvedQuestion) {
                    $resolvedQuestions->put((int) $questionId, $resolvedQuestion->loadMissing('choices'));
                }
            }

            Log::info('storeSubmission resolved questions', [
                'section' => $section,
                'resolved_question_ids' => $resolvedQuestions->keys()->values()->all(),
                'requested_score' => $requestedScore,
            ]);

            $assessments = $this->hydrateMissingAssessments($resolvedQuestions, $answers, $assessments);

            foreach ($answers as $questionId => $answerValue) {
                $question = $resolvedQuestions->get((int) $questionId);
                if (!$question) {
                    continue;
                }

                $assessment = $assessments[$questionId] ?? null;
                $assessmentScore = is_array($assessment) && array_key_exists('score', $assessment)
                    ? (float) $assessment['score']
                    : null;
                $assessmentFeedback = is_array($assessment) && array_key_exists('feedback', $assessment)
                    ? (string) $assessment['feedback']
                    : null;

                $payload = [
                    'user_subtest_progress_id' => $subtestProgress->id,
                    'question_id' => $question->id,
                    'answer_text' => null,
                    'answer_content' => null,
                    'score' => $assessmentScore,
                    'feedback_text' => $assessmentFeedback,
                    'assessment_data' => $assessment,
                    'is_correct' => null,
                    'is_flagged' => false,
                    'time_spent_seconds' => 0,
                ];

                if ($question->question_type === 'multiple_choice') {
                    $correctChoice = $question->choices->firstWhere('is_correct', true);
                    $payload['answer_text'] = is_string($answerValue) ? $answerValue : null;
                    $payload['is_correct'] = $correctChoice
                        ? trim((string) $answerValue) === trim($correctChoice->choice_text)
                        : null;
                } else {
                    $payload['answer_content'] = is_string($answerValue) ? $answerValue : null;
                }

                Log::info('storeSubmission creating user_answer', [
                    'section' => $section,
                    'question_id' => $question->id,
                    'question_type' => $question->question_type,
                    'has_assessment' => is_array($assessment),
                    'assessment_score' => $assessmentScore,
                    'assessment_feedback' => $assessmentFeedback,
                    'assessment_keys' => is_array($assessment) ? array_keys($assessment) : [],
                ]);

                UserAnswer::create($payload);
            }

            if ($resolvedQuestions->isNotEmpty()) {
                $computedScore = $this->calculateSubmissionScore($resolvedQuestions, $answers, $assessments);
            }
        }

        Log::info('storeSubmission completed', [
            'section' => $section,
            'computed_score' => $computedScore,
            'subtest_progress_id' => $subtestProgress->id,
        ]);

        $subtestProgress->score = round($computedScore, 2);
        $subtestProgress->save();

        $testSession->calculateTotalScore();

        $this->markSessionCompletedIfReady($testSession);

        return round($computedScore, 2);
    }

    private function hydrateMissingAssessments(Collection $questions, array $answers, array $assessments): array
    {
        foreach ($questions as $originalQuestionId => $question) {
            if (!$question || $question->question_type === 'multiple_choice') {
                continue;
            }

            $answerText = trim((string) ($answers[$originalQuestionId] ?? ''));
            if ($answerText === '') {
                continue;
            }

            $existingAssessment = $assessments[$originalQuestionId] ?? null;
            $hasUsableAssessment = $this->hasUsableDetailedAssessment($question, $existingAssessment);

            if ($hasUsableAssessment) {
                Log::info('hydrateMissingAssessments using incoming assessment', [
                    'question_id' => $question->id,
                    'question_type' => $question->question_type,
                    'assessment_keys' => array_keys($existingAssessment),
                ]);
                continue;
            }

            $generatedAssessment = $question->question_type === 'speaking'
                ? $this->requestSpeakingTextAssessment($question->question_text ?? '', $answerText)
                : $this->requestWritingAssessment($question->question_text ?? '', $answerText);

            if (is_array($generatedAssessment)) {
                Log::info('hydrateMissingAssessments generated assessment', [
                    'question_id' => $question->id,
                    'question_type' => $question->question_type,
                    'generated_score' => $generatedAssessment['score'] ?? null,
                    'generated_feedback' => $generatedAssessment['feedback'] ?? null,
                    'generated_keys' => array_keys($generatedAssessment),
                ]);
                $assessments[$originalQuestionId] = $generatedAssessment;
            } else {
                Log::warning('hydrateMissingAssessments failed to generate assessment', [
                    'question_id' => $question->id,
                    'question_type' => $question->question_type,
                ]);
            }
        }

        return $assessments;
    }

    private function hasUsableDetailedAssessment(Question $question, mixed $assessment): bool
    {
        if (!is_array($assessment)) {
            return false;
        }

        $hasAnyAssessmentField = array_key_exists('feedback', $assessment)
            || array_key_exists('score', $assessment)
            || array_key_exists('strengths', $assessment)
            || array_key_exists('areas_for_improvement', $assessment);

        if (!$hasAnyAssessmentField) {
            return false;
        }

        $feedback = strtolower(trim((string) ($assessment['feedback'] ?? '')));
        $isGenericUnavailableFeedback = $feedback === 'assessment unavailable. please try again later.'
            || $feedback === 'feedback will appear after evaluation.'
            || $feedback === 'feedback not available yet.';

        $criteriaScores = $assessment['criteria_scores'] ?? null;
        $hasCriteriaScores = is_array($criteriaScores) && count($criteriaScores) > 0;

        if ($question->question_type === 'speaking' || $question->question_type === 'essay') {
            if ($isGenericUnavailableFeedback || !$hasCriteriaScores) {
                return false;
            }
        }

        return true;
    }

    private function requestSpeakingTextAssessment(string $question, string $answerText): array
    {
        if (str_contains(strtolower($answerText), 'transcription unavailable')) {
            Log::warning('requestSpeakingTextAssessment short-circuited due to unavailable transcription', [
                'question' => $question,
                'answer_excerpt' => substr($answerText, 0, 120),
            ]);
            return [
                'score' => 0,
                'feedback' => $answerText,
                'strengths' => [],
                'areas_for_improvement' => ['Please retry recording in a quieter environment with a longer response.'],
                'criteria_scores' => [
                    'Grammar & Language Use' => 0.0,
                    'Topic Development' => 0.0,
                    'Delivery / Fluency' => 0.0,
                ],
                'fallback' => true,
            ];
        }

        try {
            $response = Http::timeout(90)
                ->acceptJson()
                ->post($this->getAiApiBaseUrl() . '/assess-speaking-text', [
                    'question' => $question,
                    'answer' => $answerText,
                ]);

            $assessment = $response->json('assessment');
            if (is_array($assessment)) {
                Log::info('requestSpeakingTextAssessment received AI assessment', [
                    'status' => $response->status(),
                    'score' => $assessment['score'] ?? null,
                    'feedback' => $assessment['feedback'] ?? null,
                ]);
                return $assessment;
            }
        } catch (\Throwable $exception) {
            Log::warning('requestSpeakingTextAssessment AI request failed', [
                'error' => $exception->getMessage(),
            ]);
        }

        $wordCount = str_word_count($answerText);
        $fallbackScore = min(7.5, max(1.0, $wordCount / 20));
        $criteriaScores = [
            'Grammar & Language Use' => round(min(7.5, max(1.0, $fallbackScore - 0.4)), 1),
            'Topic Development' => round(min(7.5, max(1.0, $fallbackScore + 0.2)), 1),
            'Delivery / Fluency' => round(min(7.5, max(1.0, $fallbackScore - 0.2)), 1),
        ];
        $fallbackScore = round(array_sum($criteriaScores) / count($criteriaScores), 1);

        return [
            'score' => $fallbackScore,
            'feedback' => 'Your speaking response was saved, but the detailed AI review is temporarily unavailable.',
            'strengths' => [
                'You provide a clear attempt to answer the task and stay on topic.',
                'Your response includes enough spoken content to show your main idea.',
            ],
            'areas_for_improvement' => [
                'Add more specific supporting detail so each idea sounds more fully developed.',
                'Work on smoother delivery and more accurate grammar so the response sounds more natural and controlled.',
            ],
            'criteria_scores' => $criteriaScores,
            'fallback' => true,
        ];
    }

    private function requestWritingAssessment(string $question, string $answerText): array
    {
        try {
            $response = Http::timeout(90)
                ->acceptJson()
                ->post($this->getAiApiBaseUrl() . '/assess-writing', [
                    'question' => $question,
                    'answer' => $answerText,
                ]);

            $assessment = $response->json('assessment');
            if (is_array($assessment)) {
                Log::info('requestWritingAssessment received AI assessment', [
                    'status' => $response->status(),
                    'score' => $assessment['score'] ?? null,
                    'feedback' => $assessment['feedback'] ?? null,
                ]);
                return $assessment;
            }
        } catch (\Throwable $exception) {
            Log::warning('requestWritingAssessment AI request failed', [
                'error' => $exception->getMessage(),
            ]);
        }

        $wordCount = str_word_count($answerText);
        $fallbackScore = $wordCount >= 250 ? 15 : ($wordCount >= 180 ? 13 : ($wordCount >= 120 ? 11 : ($wordCount >= 80 ? 8 : 4)));
        $criteriaScores = [
            'Development of Ideas' => min(15, max(3, $fallbackScore + 1)),
            'Organization & Coherence' => min(15, max(3, $fallbackScore + 2)),
            'Grammar & Language Use' => min(15, max(2, $fallbackScore - 2)),
            'Vocabulary' => min(15, max(3, $fallbackScore)),
        ];
        $fallbackScore = round(array_sum($criteriaScores) / count($criteriaScores), 1);

        return [
            'score' => $fallbackScore,
            'feedback' => 'Your writing response was saved, but the detailed AI review is temporarily unavailable.',
            'strengths' => ['Response provided'],
            'areas_for_improvement' => ['Add clearer examples and improve grammar accuracy to strengthen the response.'],
            'criteria_scores' => $criteriaScores,
            'fallback' => true,
        ];
    }

    private function resolveOrCreateQuestionFromSnapshot(Subtest $subtest, array $snapshot): ?Question
    {
        $questionText = trim((string) ($snapshot['question'] ?? ''));
        if ($questionText === '') {
            return null;
        }

        $questionType = (string) ($snapshot['questionType'] ?? 'multiple_choice');
        $questionType = in_array($questionType, ['multiple_choice', 'essay', 'speaking'], true)
            ? $questionType
            : 'multiple_choice';

        $passage = null;
        if (
            $questionType === 'multiple_choice' &&
            (!empty($snapshot['passage']) || !empty($snapshot['passageTitle']) || !empty($snapshot['audioUrl']))
        ) {
            $passageType = match (strtolower($subtest->name)) {
                'listening' => 'listening',
                'speaking' => 'speaking',
                'writing' => 'writing',
                default => 'reading',
            };

            $passage = Passage::firstOrCreate(
                [
                    'subtest_id' => $subtest->id,
                    'title' => trim((string) ($snapshot['passageTitle'] ?? ($subtest->name . ' Passage'))),
                    'content' => trim((string) ($snapshot['passage'] ?? '')),
                    'type' => $passageType,
                ],
                [
                    'audio_url' => $snapshot['audioUrl'] ?? null,
                    'order' => (int) ($snapshot['order'] ?? 0),
                ],
            );

            if (!$passage->audio_url && !empty($snapshot['audioUrl'])) {
                $passage->audio_url = (string) $snapshot['audioUrl'];
                $passage->save();
            }
        }

        $question = Question::firstOrCreate(
            [
                'subtest_id' => $subtest->id,
                'passage_id' => $passage?->id,
                'question_text' => $questionText,
            ],
            [
                'question_type' => $questionType,
                'preparation_time' => $snapshot['preparationTime'] ?? null,
                'response_time' => $snapshot['responseTime'] ?? null,
                'order' => (int) ($snapshot['order'] ?? 0),
                'points' => (int) ($snapshot['points'] ?? 30),
            ],
        );

        if ($questionType === 'multiple_choice' && !empty($snapshot['choices']) && is_array($snapshot['choices'])) {
            foreach (array_values($snapshot['choices']) as $index => $choiceText) {
                $choiceText = trim((string) $choiceText);
                if ($choiceText === '') {
                    continue;
                }

                QuestionChoice::updateOrCreate(
                    [
                        'question_id' => $question->id,
                        'choice_text' => $choiceText,
                    ],
                    [
                        'choice_label' => chr(65 + $index),
                        'is_correct' => trim((string) ($snapshot['correctAnswer'] ?? '')) === $choiceText,
                    ],
                );
            }
        }

        return $question;
    }

    private function calculateSubmissionScore(Collection $questions, array $answers, array $assessments): float
    {
        if ($questions->isEmpty()) {
            return 0;
        }

        $firstQuestion = $questions->first();
        $questionType = $firstQuestion?->question_type;

        if ($questionType === 'multiple_choice') {
            $correctCount = 0;

            foreach ($answers as $questionId => $answerValue) {
                $question = $questions->get((int) $questionId);
                if (!$question) {
                    continue;
                }

                $correctChoice = $question->choices->firstWhere('is_correct', true);
                if ($correctChoice && trim((string) $answerValue) === trim($correctChoice->choice_text)) {
                    $correctCount++;
                }
            }

            return (float) round(($correctCount / max($questions->count(), 1)) * 30, 2);
        }

        $score = 0.0;

        foreach ($questions as $question) {
            $assessment = $assessments[$question->id] ?? null;
            $rawScore = is_array($assessment) && array_key_exists('score', $assessment)
                ? (float) $assessment['score']
                : 0.0;

            $maxRawScore = $question->question_type === 'speaking' ? 7.5 : 15.0;

            if ($maxRawScore <= 0) {
                continue;
            }

            $score += max(0, min($maxRawScore, $rawScore));
        }

        return round($score, 2);
    }

    private function getOrCreateSubtestByName(string $name): Subtest
    {
        return Subtest::firstOrCreate(['name' => $name]);
    }

    private function getSessionForResults(int $userId, array $with): ?UserTestSession
    {
        return UserTestSession::with($with)
            ->where('user_id', $userId)
            ->where(function ($query) {
                $query->whereHas('subtestProgress.userAnswers')
                    ->orWhereHas('subtestProgress');
            })
            ->orderByDesc('id')
            ->first();
    }

    private function markSessionCompletedIfReady(UserTestSession $testSession): void
    {
        $requiredSubtests = ['Reading', 'Listening', 'Speaking', 'Writing'];

        $completedSubtests = $testSession->subtestProgress()
            ->with('subtest')
            ->where('status', 'completed')
            ->get()
            ->pluck('subtest.name')
            ->unique()
            ->values()
            ->all();

        $allCompleted = empty(array_diff($requiredSubtests, $completedSubtests));
        if (!$allCompleted) {
            return;
        }

        $testSession->status = 'completed';
        $testSession->completed_at = now();
        $testSession->save();
        session()->forget('ActiveTestSessionId');
    }

    private function resolveSubtestName(string $section): ?string
    {
        return match ($section) {
            'reading-question' => 'Reading',
            'listening-question' => 'Listening',
            'speaking-question' => 'Speaking',
            'writing-question' => 'Writing',
            default => null,
        };
    }

    private function getOrCreateActiveSession(int $userId): ?UserTestSession
    {
        $sessionId = session('ActiveTestSessionId');
        if ($sessionId) {
            $existing = UserTestSession::where('id', $sessionId)->where('user_id', $userId)->first();
            if ($existing) {
                return $existing;
            }
        }

        $toefl = Toefl::where('status', 'active')->first()
            ?? Toefl::firstOrCreate(['name' => 'TOEFL Practice Test 1'], ['status' => 'active']);

        $session = UserTestSession::create([
            'user_id' => $userId,
            'toefl_id' => $toefl->id,
            'started_at' => now(),
            'status' => 'in_progress',
            'total_score' => 0,
        ]);

        session(['ActiveTestSessionId' => $session->id]);

        return $session;
    }

    private function getAiApiBaseUrl(): string
    {
        return rtrim((string) env('AI_API_URL', 'http://flask-ai:5000'), '/');
    }

    private function buildReadingFeedback(?UserSubtestProgress $progress): array
    {
        $questions = [];
        $totalQuestions = 0;
        $correctCount = 0;
        $score = 0;

        if ($progress) {
            $score = $progress->score ?? 0;
            foreach ($progress->userAnswers as $answer) {
                $question = $answer->question;
                $correctChoice = $question?->choices?->firstWhere('is_correct', true);
                $isCorrect = (bool) $answer->is_correct;

                $questions[] = [
                    'id' => $question?->id ?? $answer->id,
                    'passage' => $question?->passage?->content ?? '',
                    'question' => $question?->question_text ?? '',
                    'userAnswer' => $answer->answer_text ?? '',
                    'correctAnswer' => $correctChoice?->choice_text ?? '',
                    'isCorrect' => $isCorrect,
                    'explanation' => $isCorrect
                        ? 'Correct.'
                        : 'Explanation not available yet.',
                ];
            }

            $totalQuestions = count($questions);
            $correctCount = $progress->userAnswers->where('is_correct', true)->count();
        }

        $percentage = $totalQuestions > 0 ? (int) round(($correctCount / $totalQuestions) * 100) : 0;

        return [
            'score' => $score,
            'total' => 30,
            'percentage' => $percentage,
            'questions' => $questions,
        ];
    }

    private function buildListeningFeedback(?UserSubtestProgress $progress): array
    {
        $questions = [];
        $totalQuestions = 0;
        $correctCount = 0;
        $score = 0;

        if ($progress) {
            $score = $progress->score ?? 0;
            foreach ($progress->userAnswers as $answer) {
                $question = $answer->question;
                $correctChoice = $question?->choices?->firstWhere('is_correct', true);
                $isCorrect = (bool) $answer->is_correct;
                $audioUrl = null;

                if ($question?->passage?->audio_url) {
                    $audioUrl = Storage::url($question->passage->audio_url);
                }

                $questions[] = [
                    'id' => $question?->id ?? $answer->id,
                    'audio' => $audioUrl ?? asset('listening.mpeg'),
                    'question' => $question?->question_text ?? '',
                    'userAnswer' => $answer->answer_text ?? '',
                    'correctAnswer' => $correctChoice?->choice_text ?? '',
                    'isCorrect' => $isCorrect,
                    'explanation' => $isCorrect
                        ? 'Correct.'
                        : 'Explanation not available yet.',
                ];
            }

            $totalQuestions = count($questions);
            $correctCount = $progress->userAnswers->where('is_correct', true)->count();
        }

        $percentage = $totalQuestions > 0 ? (int) round(($correctCount / $totalQuestions) * 100) : 0;

        return [
            'score' => $score,
            'total' => 30,
            'percentage' => $percentage,
            'questions' => $questions,
        ];
    }

    private function buildSpeakingFeedback(?UserSubtestProgress $progress): array
    {
        $questions = [];
        $score = 0;

        if ($progress) {
            $score = $progress->score ?? 0;
            foreach ($progress->userAnswers->sortBy('question.order') as $answer) {
                $question = $answer->question;
                $assessment = $this->refreshAnswerAssessmentIfNeeded($answer, $question);
                $feedbackText = $answer->feedback_text
                    ?? ($assessment['feedback'] ?? null)
                    ?? 'Feedback will appear after evaluation.';
                $areasForImprovement = $assessment['areas_for_improvement'] ?? $assessment['areas'] ?? [];
                $criteriaScores = is_array($assessment['criteria_scores'] ?? null) ? $assessment['criteria_scores'] : [];

                $questions[] = [
                    'id' => $question?->id ?? $answer->id,
                    'task' => $question?->question_text ?? '',
                    'userTranscript' => $answer->answer_content ?? '',
                    'audioFile' => null,
                    'score' => $answer->score !== null ? (float) $answer->score : null,
                    'maxScore' => 7.5,
                    'feedback' => $feedbackText,
                    'strengths' => array_values($assessment['strengths'] ?? []),
                    'areasForImprovement' => array_values(is_array($areasForImprovement) ? $areasForImprovement : []),
                    'criteriaScores' => $criteriaScores,
                    'isFallback' => (bool) ($assessment['fallback'] ?? false),
                ];
            }
        }

        return [
            'score' => $score,
            'total' => 30,
            'questions' => $questions,
        ];
    }

    private function buildWritingFeedback(?UserSubtestProgress $progress): array
    {
        $questions = [];
        $score = 0;

        if ($progress) {
            $score = $progress->score ?? 0;
            foreach ($progress->userAnswers->sortBy('question.order') as $answer) {
                $question = $answer->question;
                $assessment = $this->refreshAnswerAssessmentIfNeeded($answer, $question);
                $feedbackText = $answer->feedback_text
                    ?? ($assessment['feedback'] ?? null)
                    ?? 'Feedback will appear after evaluation.';
                $areasForImprovement = $assessment['areas_for_improvement'] ?? $assessment['areas'] ?? [];
                $criteriaScores = is_array($assessment['criteria_scores'] ?? null) ? $assessment['criteria_scores'] : [];

                $questions[] = [
                    'id' => $question?->id ?? $answer->id,
                    'task' => $question?->question_text ?? '',
                    'userAnswer' => $answer->answer_content ?? '',
                    'score' => $answer->score !== null ? (float) $answer->score : null,
                    'maxScore' => 15,
                    'feedback' => $feedbackText,
                    'strengths' => array_values($assessment['strengths'] ?? []),
                    'areasForImprovement' => array_values(is_array($areasForImprovement) ? $areasForImprovement : []),
                    'criteriaScores' => $criteriaScores,
                    'isFallback' => (bool) ($assessment['fallback'] ?? false),
                ];
            }
        }

        return [
            'score' => $score,
            'total' => 30,
            'questions' => $questions,
        ];
    }

    private function refreshAnswerAssessmentIfNeeded(UserAnswer $answer, ?Question $question): array
    {
        $assessment = is_array($answer->assessment_data) ? $answer->assessment_data : [];

        if (!$question || $question->question_type === 'multiple_choice') {
            return $assessment;
        }

        if ($this->hasUsableDetailedAssessment($question, $assessment)) {
            return $assessment;
        }

        $answerText = trim((string) ($answer->answer_content ?? ''));
        if ($answerText === '') {
            return $assessment;
        }

        $generatedAssessment = $question->question_type === 'speaking'
            ? $this->requestSpeakingTextAssessment($question->question_text ?? '', $answerText)
            : $this->requestWritingAssessment($question->question_text ?? '', $answerText);

        if (!is_array($generatedAssessment)) {
            return $assessment;
        }

        $answer->forceFill([
            'score' => array_key_exists('score', $generatedAssessment) ? (float) $generatedAssessment['score'] : $answer->score,
            'feedback_text' => $generatedAssessment['feedback'] ?? $answer->feedback_text,
            'assessment_data' => $generatedAssessment,
        ])->save();

        Log::info('refreshAnswerAssessmentIfNeeded refreshed stored assessment', [
            'user_answer_id' => $answer->id,
            'question_id' => $question->id,
            'question_type' => $question->question_type,
            'assessment_keys' => array_keys($generatedAssessment),
        ]);

        return $generatedAssessment;
    }

    private function getReadingQuestions()
    {
        $subtest = $this->getOrCreateSubtestByName('Reading');

        if ($subtest) {
            $passages = Passage::where('subtest_id', $subtest->id)
                ->with(['questions.choices'])
                ->orderBy('order')
                ->get();

            if ($passages->isNotEmpty()) {
                return $passages->map(function ($passage) {
                    return [
                        'id' => $passage->id,
                        'title' => $passage->title,
                        'passage' => $passage->content,
                        'questions' => $passage->questions->map(function ($q) {
                            $correctChoice = $q->choices->firstWhere('is_correct', true);
                            return [
                                'id' => $q->id,
                                'question' => $q->question_text,
                                'choices' => $q->choices->pluck('choice_text')->toArray(),
                                'correctAnswer' => $correctChoice ? $correctChoice->choice_text : '',
                            ];
                        })->toArray(),
                    ];
                })->toArray();
            }
        }

        return $this->getHardcodedReadingQuestions();
    }

    private function getHardcodedReadingQuestions()
    {
        return [
            [
                'id' => 1,
                'title' => 'The Impact of Urbanization on Biodiversity',
                'passage' => 'Urbanization, the process by which rural areas become increasingly urbanized, has become one of the most significant global trends of the 21st century. As cities expand and populations concentrate in urban areas, the transformation of natural landscapes into built environments has profound consequences for biodiversity. The relationship between urban development and ecological systems is complex, involving both direct and indirect effects on species composition, habitat availability, and ecosystem functioning.

Urban environments present unique challenges for wildlife. The fragmentation of natural habitats creates isolated patches of green space, making it difficult for species to move between areas and maintain viable populations. Road networks, buildings, and other infrastructure act as barriers to animal movement, often leading to population isolation and reduced genetic diversity. Additionally, urban areas typically experience altered microclimates, with higher temperatures due to the heat island effect, changed precipitation patterns, and increased air and noise pollution.

However, urbanization does not uniformly result in biodiversity loss. Some species have adapted remarkably well to urban environments, taking advantage of new ecological niches. Urban-adapted species often exhibit behavioral flexibility, dietary generalism, and tolerance to human disturbance. Birds such as house sparrows and pigeons, as well as mammals like raccoons and urban coyotes, have successfully colonized cities worldwide. These species demonstrate that urban environments can support wildlife when appropriate conditions are present.

Conservation biologists increasingly recognize that urban areas must be incorporated into broader conservation strategies. Green infrastructure, including parks, green roofs, and wildlife corridors, can provide habitat connectivity and support urban biodiversity. The design of cities can significantly influence their ecological impact, with sustainable urban planning offering opportunities to minimize negative effects on biodiversity while creating livable environments for both humans and wildlife.',
                'questions' => [
                    [
                        'id' => 1,
                        'question' => 'According to the passage, what is one of the main challenges that urbanization poses to wildlife?',
                        'choices' => [
                            'Increased competition for food resources',
                            'Fragmentation of natural habitats into isolated patches',
                            'Excessive exposure to sunlight in urban areas',
                            'Lack of suitable nesting materials in cities'
                        ],
                        'correctAnswer' => 'Fragmentation of natural habitats into isolated patches'
                    ],
                    [
                        'id' => 2,
                        'question' => 'The word "viable" in paragraph 2 is closest in meaning to',
                        'choices' => [
                            'sustainable',
                            'diverse',
                            'large',
                            'productive'
                        ],
                        'correctAnswer' => 'sustainable'
                    ],
                    [
                        'id' => 3,
                        'question' => 'Which of the following can be inferred from paragraph 3 about urban-adapted species?',
                        'choices' => [
                            'They require specialized diets to survive in cities',
                            'They are more aggressive than their rural counterparts',
                            'They possess characteristics that help them thrive in human-dominated environments',
                            'They are primarily nocturnal to avoid human contact'
                        ],
                        'correctAnswer' => 'They possess characteristics that help them thrive in human-dominated environments'
                    ],
                    [
                        'id' => 4,
                        'question' => 'What does the author suggest about the role of green infrastructure in urban environments?',
                        'choices' => [
                            'It is too expensive to implement in most cities',
                            'It can help maintain habitat connectivity for urban wildlife',
                            'It should replace all traditional urban planning methods',
                            'It is only effective in suburban areas'
                        ],
                        'correctAnswer' => 'It can help maintain habitat connectivity for urban wildlife'
                    ],
                    [
                        'id' => 5,
                        'question' => 'The primary purpose of this passage is to',
                        'choices' => [
                            'argue against further urban development',
                            'describe specific urban wildlife conservation programs',
                            'examine the complex relationship between urbanization and biodiversity',
                            'promote the economic benefits of green infrastructure'
                        ],
                        'correctAnswer' => 'examine the complex relationship between urbanization and biodiversity'
                    ],
                    [
                        'id' => 6,
                        'question' => 'According to the passage, all of the following are effects of urbanization on wildlife EXCEPT:',
                        'choices' => [
                            'altered microclimates in urban areas',
                            'barriers to animal movement created by infrastructure',
                            'increased genetic diversity within urban populations',
                            'changes in precipitation patterns'
                        ],
                        'correctAnswer' => 'increased genetic diversity within urban populations'
                    ]
                ]
            ],
            [
                'id' => 2,
                'title' => 'The Development of Jazz Music in America',
                'passage' => 'Jazz, one of America\'s most distinctive cultural contributions to world music, emerged in the early 20th century from the cultural melting pot of New Orleans. This innovative musical form represented a synthesis of African American musical traditions, including blues and spirituals, with European harmonic structures and instrumentation. The unique social and cultural environment of New Orleans, with its diverse population and relatively relaxed racial boundaries, provided fertile ground for this musical fusion.

The early pioneers of jazz, including Buddy Bolden, Jelly Roll Morton, and later Louis Armstrong, developed techniques that would become hallmarks of the genre. Improvisation, the spontaneous creation of melody and rhythm during performance, became jazz\'s most defining characteristic. This emphasis on individual expression within a collective musical framework reflected broader American values of individualism and democratic participation.

As jazz spread from New Orleans to other major cities, particularly Chicago and New York, it underwent significant evolution. The 1920s, often called the Jazz Age, saw the music gain widespread popularity and commercial success. Big bands led by Duke Ellington and Count Basie brought jazz to mainstream audiences, while smaller ensembles continued to push the boundaries of improvisation and harmonic complexity.

The influence of jazz extended far beyond music itself. It played a crucial role in breaking down racial barriers, as integrated audiences came together to appreciate this new art form. Jazz clubs became spaces where racial mixing was more accepted than in other social contexts. Furthermore, jazz influenced literature, visual arts, and dance, contributing to a broader cultural renaissance that challenged traditional American social norms and aesthetic conventions.',
                'questions' => [
                    [
                        'id' => 7,
                        'question' => 'According to the passage, what made New Orleans particularly suitable for the development of jazz?',
                        'choices' => [
                            'Its location near major European cultural centers',
                            'Its diverse population and relaxed racial boundaries',
                            'Its large number of professional musicians',
                            'Its economic prosperity during the early 1900s'
                        ],
                        'correctAnswer' => 'Its diverse population and relaxed racial boundaries'
                    ],
                    [
                        'id' => 8,
                        'question' => 'The word "synthesis" in paragraph 1 is closest in meaning to',
                        'choices' => [
                            'analysis',
                            'combination',
                            'replacement',
                            'criticism'
                        ],
                        'correctAnswer' => 'combination'
                    ],
                    [
                        'id' => 9,
                        'question' => 'What does the author suggest about the relationship between jazz improvisation and American values?',
                        'choices' => [
                            'Jazz improvisation contradicted traditional American musical preferences',
                            'The emphasis on individual expression reflected American individualism',
                            'Improvisation was borrowed from European classical traditions',
                            'Jazz musicians rejected all forms of collective musical participation'
                        ],
                        'correctAnswer' => 'The emphasis on individual expression reflected American individualism'
                    ],
                    [
                        'id' => 10,
                        'question' => 'It can be inferred from the passage that jazz clubs were significant because they',
                        'choices' => [
                            'provided the only venues for live music performance',
                            'were exclusively patronized by wealthy audiences',
                            'served as spaces where racial integration was more accepted',
                            'featured only traditional American musical forms'
                        ],
                        'correctAnswer' => 'served as spaces where racial integration was more accepted'
                    ]
                ]
            ]
        ];
    }

    private function getListeningQuestions()
    {
        $subtest = $this->getOrCreateSubtestByName('Listening');

        if ($subtest) {
            $passages = Passage::where('subtest_id', $subtest->id)
                ->with(['questions.choices'])
                ->orderBy('order')
                ->get();

            if ($passages->isNotEmpty()) {
                return $passages->map(function ($passage) {
                    return [
                        'id' => $passage->id,
                        'title' => $passage->title,
                        'type' => $passage->type === 'listening' ? 'lecture' : $passage->type,
                        'audio_url' => $passage->audio_url ? \Illuminate\Support\Facades\Storage::url($passage->audio_url) : asset('listening.mpeg'),
                        'questions' => $passage->questions->map(function ($q) {
                            $correctChoice = $q->choices->firstWhere('is_correct', true);
                            return [
                                'id' => $q->id,
                                'question' => $q->question_text,
                                'choices' => $q->choices->pluck('choice_text')->toArray(),
                                'correctAnswer' => $correctChoice ? $correctChoice->choice_text : '',
                            ];
                        })->toArray(),
                    ];
                })->toArray();
            }
        }

        return $this->getHardcodedListeningQuestions();
    }

    private function getHardcodedListeningQuestions()
    {
        return [
            [
                'id' => 1,
                'title' => 'Conversation: Lactose Intolerance Story',
                'type' => 'conversation',
                'audio_url' => asset('listening.mpeg'),
                'audioScript' => 'A speaker tells an embarrassing story about being lactose intolerant after drinking an M&M milkshake before visiting a client\'s house. Her husband had warned her about dairy products. While at the client\'s house, her stomach reacted badly, so she went to the bathroom. The situation became more embarrassing because people were waiting outside. Inside the bathroom she made a loud fart, and after the noise there was complete silence. When she came out, she simply said thank you. At the end of the story, someone entered the bathroom and reacted to what happened.',
                'questions' => [
                    [
                        'id' => 1,
                        'question' => 'What is the main problem the speaker has?',
                        'choices' => [
                            'She hates milkshakes',
                            'She is lactose intolerant',
                            'She is allergic to chocolate',
                            'She dislikes visiting people'
                        ],
                        'correctAnswer' => 'She is lactose intolerant'
                    ],
                    [
                        'id' => 2,
                        'question' => 'What did the speaker consume before feeling sick?',
                        'choices' => [
                            'Ice cream',
                            'Cheese cake',
                            'M&M milkshake',
                            'Chocolate bar'
                        ],
                        'correctAnswer' => 'M&M milkshake'
                    ],
                    [
                        'id' => 3,
                        'question' => 'Who warned the speaker about consuming dairy products?',
                        'choices' => [
                            'Her mother',
                            'Her friend',
                            'Her husband',
                            'Her doctor'
                        ],
                        'correctAnswer' => 'Her husband'
                    ],
                    [
                        'id' => 4,
                        'question' => 'Where did the speaker go when her stomach started to react?',
                        'choices' => [
                            'Her own house',
                            'A public restroom',
                            'A client\'s house',
                            'A restaurant'
                        ],
                        'correctAnswer' => 'A client\'s house'
                    ],
                    [
                        'id' => 5,
                        'question' => 'Why did the speaker go to the bathroom?',
                        'choices' => [
                            'To wash her hands',
                            'To fix her makeup',
                            'To take a shower',
                            'Because she had stomach issues'
                        ],
                        'correctAnswer' => 'Because she had stomach issues'
                    ],
                    [
                        'id' => 6,
                        'question' => 'What made the situation more embarrassing?',
                        'choices' => [
                            'The bathroom was broken',
                            'People were waiting outside',
                            'She forgot to lock the door',
                            'She slipped on the floor'
                        ],
                        'correctAnswer' => 'People were waiting outside'
                    ],
                    [
                        'id' => 7,
                        'question' => 'What happened inside the bathroom?',
                        'choices' => [
                            'She fainted',
                            'She dropped her phone',
                            'She made a loud fart',
                            'She broke something'
                        ],
                        'correctAnswer' => 'She made a loud fart'
                    ],
                    [
                        'id' => 8,
                        'question' => 'How did the people outside react after the noise?',
                        'choices' => [
                            'They laughed loudly',
                            'They ignored it',
                            'There was silence',
                            'They knocked on the door'
                        ],
                        'correctAnswer' => 'There was silence'
                    ],
                    [
                        'id' => 9,
                        'question' => 'What did the speaker say after coming out of the bathroom?',
                        'choices' => [
                            'Sorry',
                            'Excuse me',
                            'Thank you',
                            'Nothing'
                        ],
                        'correctAnswer' => 'Thank you'
                    ],
                    [
                        'id' => 10,
                        'question' => 'What happened at the end of the story?',
                        'choices' => [
                            'The speaker ran away',
                            'Someone entered the bathroom and reacted',
                            'The speaker apologized',
                            'Everyone forgot about it'
                        ],
                        'correctAnswer' => 'Someone entered the bathroom and reacted'
                    ]
                ]
            ]
        ];
    }

    private function getSpeakingQuestions()
    {
        $subtest = $this->getOrCreateSubtestByName('Speaking');

        if ($subtest) {
            $questions = Question::where('subtest_id', $subtest->id)
                ->whereNull('passage_id')
                ->orderBy('order')
                ->get();

            if ($questions->isNotEmpty()) {
                return $questions->map(function ($q, $index) {
                    return [
                        'id' => $q->id,
                        'title' => "Speaking Task " . ($index + 1),
                        'type' => str_contains($q->question_type, 'speaking') ? 'independent' : $q->question_type,
                        'preparationTime' => $q->preparation_time ?? 15,
                        'responseTime' => $q->response_time ?? 45,
                        'question' => $q->question_text,
                        'tips' => [],
                    ];
                })->toArray();
            }
        }

        return $this->getHardcodedSpeakingQuestions();
    }

    private function getHardcodedSpeakingQuestions()
    {
        return [
            'id' => 1,
            'title' => 'Independent Speaking Task',
            'type' => 'independent',
            'preparationTime' => 15,
            'responseTime' => 45,
            'question' => 'Some people prefer studying alone, while others prefer studying in groups. Which do you prefer and why?',
            'tips' => [
                'Take 15 seconds to prepare your response',
                'Speak for 45 seconds',
                'Give specific reasons and examples',
                'Organize your thoughts clearly',
                'State your preference clearly at the beginning',
                'Use transitional phrases to connect your ideas'
            ]
        ];
    }

    private function getWritingQuestions()
    {
        $subtest = $this->getOrCreateSubtestByName('Writing');

        if ($subtest) {
            $questions = Question::where('subtest_id', $subtest->id)
                ->whereNull('passage_id')
                ->orderBy('order')
                ->get();

            if ($questions->isNotEmpty()) {
                $q = $questions->first();
                return [
                    'id' => $q->id,
                    'title' => 'Academic Discussion Writing Task',
                    'type' => 'discussion',
                    'timeLimit' => 10,
                    'wordCount' => 'At least 100 words',
                    'context' => 'Do you agree or disagree with the following statement?',
                    'passage' => 'Technology has made students’ lives easier than in the past.',
                    'question' => [
                        'id' => $q->id,
                        'question' => $q->question_text,
                    ],
                    'instructions' => [
                        'You have 10 minutes to write your response',
                        'Your response should be at least 100 words',
                        'Take a clear position and support it with reasons',
                        'Use specific examples to support your argument',
                        'Write in an academic discussion style',
                    ],
                ];
            }
        }

        return $this->getHardcodedWritingQuestions();
    }

    private function getHardcodedWritingQuestions()
    {
        return [
            'id' => 1,
            'title' => 'Academic Discussion Writing Task',
            'type' => 'discussion',
            'timeLimit' => 10,
            'wordCount' => 'At least 100 words',
            'context' => 'Do you agree or disagree with the following statement?',
            'passage' => 'Technology has made students’ lives easier than in the past.',
            'question' => [
                'id' => 1,
                'question' => 'Do you agree or disagree with the following statement? Technology has made students’ lives easier than in the past.',
            ],
            'instructions' => [
                'You have 10 minutes to write your response',
                'Your response should be at least 100 words',
                'Take a clear position and support it with reasons',
                'You may agree with one student, disagree with both, or present a different perspective',
                'Use specific examples to support your argument',
                'Write in an academic discussion style'
            ]
        ];
    }

}
