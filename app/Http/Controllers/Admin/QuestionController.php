<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionChoice;
use App\Models\Passage;
use App\Models\Subtest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class QuestionController extends Controller
{
    /**
     * Display questions for specific section (reading, listening, speaking, writing)
     */
    public function index($section)
    {
        $subtest = Subtest::where('name', ucfirst($section))->firstOrFail();
        
        $passages = Passage::where('subtest_id', $subtest->id)
            ->with(['questions.choices'])
            ->orderBy('order')
            ->get()
            ->map(function ($passage) {
                return [
                    'id' => $passage->id,
                    'title' => $passage->title,
                    'content' => $passage->content,
                    'audio_url' => $passage->audio_url ? Storage::url($passage->audio_url) : null,
                    'type' => $passage->type,
                    'order' => $passage->order,
                    'questionCount' => $passage->questions->count(),
                    'questions' => $passage->questions->map(function ($q) {
                        return [
                            'id' => $q->id,
                            'question_text' => $q->question_text,
                            'question_type' => $q->question_type,
                            'order' => $q->order,
                            'points' => $q->points,
                            'choicesCount' => $q->choices->count(),
                            'choices' => $q->choices->map(function ($c) {
                                return [
                                    'id' => $c->id,
                                    'choice_label' => $c->choice_label,
                                    'choice_text' => $c->choice_text,
                                    'is_correct' => (bool) $c->is_correct,
                                ];
                            }),
                        ];
                    }),
                ];
            });

        $standaloneQuestions = Question::where('subtest_id', $subtest->id)
            ->whereNull('passage_id')
            ->with('choices')
            ->orderBy('order')
            ->get()
            ->map(function ($q) {
                return [
                    'id' => $q->id,
                    'question_text' => $q->question_text,
                    'question_type' => $q->question_type,
                    'preparation_time' => $q->preparation_time,
                    'response_time' => $q->response_time,
                    'order' => $q->order,
                    'points' => $q->points,
                    'choices' => $q->choices->map(function ($c) {
                        return [
                            'id' => $c->id,
                            'choice_label' => $c->choice_label,
                            'choice_text' => $c->choice_text,
                            'is_correct' => $c->is_correct,
                        ];
                    }),
                ];
            });

        return Inertia::render("admin/questions/{$section}", [
            'section' => $section,
            'subtest' => [
                'id' => $subtest->id,
                'name' => $subtest->name,
            ],
            'passages' => $passages,
            'standaloneQuestions' => $standaloneQuestions,
        ]);
    }

    /**
     * Store new passage
     */
    public function storePassage(Request $request)
    {
        $validated = $request->validate([
            'subtest_id' => 'required|exists:subtests,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'type' => 'required|in:reading,listening,speaking,writing',
            'order' => 'nullable|integer',
            'audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a,aac|max:51200',
        ]);

        $passageData = [
            'subtest_id' => $validated['subtest_id'],
            'title' => $validated['title'],
            'content' => $validated['content'] ?? '',
            'type' => $validated['type'],
            'order' => $validated['order'] ?? 0,
        ];

        if ($request->hasFile('audio')) {
            $passageData['audio_url'] = $request->file('audio')->store('audio/listening', 'public');
        }

        $passage = Passage::create($passageData);

        return back()->with('success', 'Passage created successfully!');
    }

    /**
     * Update passage
     */
    public function updatePassage(Request $request, $id)
    {
        $passage = Passage::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'order' => 'nullable|integer',
            'audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a,aac|max:51200',
        ]);

        $updateData = [
            'title' => $validated['title'],
            'content' => $validated['content'] ?? $passage->content,
            'order' => $validated['order'] ?? $passage->order,
        ];

        if ($request->hasFile('audio')) {
            if ($passage->audio_url) {
                Storage::disk('public')->delete($passage->audio_url);
            }
            $updateData['audio_url'] = $request->file('audio')->store('audio/listening', 'public');
        }

        $passage->update($updateData);

        return back()->with('success', 'Passage updated successfully!');
    }

    /**
     * Delete passage
     */
    public function deletePassage($id)
    {
        $passage = Passage::findOrFail($id);
        $passage->delete();

        return back()->with('success', 'Passage deleted successfully!');
    }

    /**
     * Store new question
     */
    public function storeQuestion(Request $request)
    {
        $validated = $request->validate([
            'passage_id' => 'nullable|exists:passages,id',
            'subtest_id' => 'required|exists:subtests,id',
            'question_text' => 'required|string',
            'question_type' => 'required|in:multiple_choice,essay,speaking',
            'preparation_time' => 'nullable|integer',
            'response_time' => 'nullable|integer',
            'order' => 'nullable|integer',
            'points' => 'nullable|integer|min:1',
            'choices' => 'nullable|array',
            'choices.*.choice_label' => 'required_with:choices|string',
            'choices.*.choice_text' => 'required_with:choices|string',
            'choices.*.is_correct' => 'required_with:choices|boolean',
        ]);

        $question = Question::create([
            'passage_id' => $validated['passage_id'] ?? null,
            'subtest_id' => $validated['subtest_id'],
            'question_text' => $validated['question_text'],
            'question_type' => $validated['question_type'],
            'preparation_time' => $validated['preparation_time'] ?? null,
            'response_time' => $validated['response_time'] ?? null,
            'order' => $validated['order'] ?? 0,
            'points' => $validated['points'] ?? 1,
        ]);

        // Create choices if provided
        if (isset($validated['choices']) && count($validated['choices']) > 0) {
            foreach ($validated['choices'] as $choice) {
                QuestionChoice::create([
                    'question_id' => $question->id,
                    'choice_label' => $choice['choice_label'],
                    'choice_text' => $choice['choice_text'],
                    'is_correct' => $choice['is_correct'],
                ]);
            }
        }

        return back()->with('success', 'Question created successfully!');
    }

    /**
     * Update question
     */
    public function updateQuestion(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        
        $validated = $request->validate([
            'question_text' => 'required|string',
            'preparation_time' => 'nullable|integer',
            'response_time' => 'nullable|integer',
            'order' => 'nullable|integer',
            'points' => 'nullable|integer|min:1',
            'choices' => 'nullable|array',
            'choices.*.id' => 'nullable|exists:question_choices,id',
            'choices.*.choice_label' => 'required_with:choices|string',
            'choices.*.choice_text' => 'required_with:choices|string',
            'choices.*.is_correct' => 'required_with:choices|boolean',
        ]);

        $question->update([
            'question_text' => $validated['question_text'],
            'preparation_time' => $validated['preparation_time'] ?? null,
            'response_time' => $validated['response_time'] ?? null,
            'order' => $validated['order'] ?? 0,
            'points' => $validated['points'] ?? 1,
        ]);

        // Update choices
        if (isset($validated['choices'])) {
            // Delete old choices
            $question->choices()->delete();
            
            // Create new choices
            foreach ($validated['choices'] as $choice) {
                QuestionChoice::create([
                    'question_id' => $question->id,
                    'choice_label' => $choice['choice_label'],
                    'choice_text' => $choice['choice_text'],
                    'is_correct' => $choice['is_correct'],
                ]);
            }
        }

        return back()->with('success', 'Question updated successfully!');
    }

    /**
     * Delete question
     */
    public function deleteQuestion($id)
    {
        $question = Question::findOrFail($id);
        $question->delete();

        return back()->with('success', 'Question deleted successfully!');
    }
}
