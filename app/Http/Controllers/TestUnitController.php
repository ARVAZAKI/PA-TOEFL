<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Subtest;
use App\Models\Passage;
use App\Models\Question;

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
        $score = $request->input('score'); // jawaban user
        $correctCount = $request->input('correctCount');
        $totalQuestions = $request->input('totalQuestions');

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

    private function getReadingQuestions()
    {
        $subtest = Subtest::where('name', 'Reading')->first();

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
        $subtest = Subtest::where('name', 'Listening')->first();

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
                        'audio_url' => $passage->audio_url ? \Illuminate\Support\Facades\Storage::url($passage->audio_url) : null,
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
        $subtest = Subtest::where('name', 'Speaking')->first();

        if ($subtest) {
            $questions = Question::where('subtest_id', $subtest->id)
                ->whereNull('passage_id')
                ->orderBy('order')
                ->get();

            if ($questions->isNotEmpty()) {
                // Return array of speaking questions
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
                })->first(); // Speaking component expects single object (not array)
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
            'question' => 'Some people prefer to live in a small town while others prefer to live in a big city. Which do you prefer? Use specific reasons and examples to support your answer.',
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
        $subtest = Subtest::where('name', 'Writing')->first();

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
                    'context' => '',
                    'passage' => '',
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
            'context' => 'Your professor is teaching a class on urban planning. You have been assigned to post in an online discussion forum for the class. Your professor asks:',
            'passage' => 'Many cities around the world are facing rapid population growth, leading to overcrowding and strain on infrastructure. Some urban planners believe that building vertically (constructing taller buildings) is the best solution, while others advocate for horizontal expansion (spreading the city outward). Which approach do you think is more effective for managing urban growth? Why?

Previous student responses:

Emma: "I think vertical growth is definitely the way to go. Building upward allows cities to accommodate more people without consuming additional land. This is especially important for preserving natural areas and farmland around cities. Plus, when people live in denser areas, public transportation becomes more efficient and cost-effective. Look at cities like Tokyo or New York - they handle millions of people efficiently because of their vertical development."

Marcus: "I disagree with Emma. Horizontal expansion is more sustainable in the long run. When cities spread outward, there\'s more space for parks, gardens, and recreational areas, which improve quality of life. Also, if there\'s an emergency like a fire or earthquake, it\'s much safer to evacuate low-rise buildings. Vertical cities create too much stress on infrastructure like water, electricity, and waste management systems. Suburbs also offer more affordable housing options for families."',
            'question' => [
                'id' => 1,
                'question' => 'In your response, take a clear position on whether vertical or horizontal urban development is more effective. You may agree with Emma, agree with Marcus, or present your own perspective. Support your argument with specific reasons and examples. Write at least 100 words in an academic discussion style.',
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

