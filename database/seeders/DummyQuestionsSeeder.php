<?php

namespace Database\Seeders;

use App\Models\Passage;
use App\Models\Question;
use App\Models\QuestionChoice;
use App\Models\Subtest;
use Illuminate\Database\Seeder;

class DummyQuestionsSeeder extends Seeder
{
    public function run(): void
    {
        $reading = Subtest::firstOrCreate(['name' => 'Reading']);
        $listening = Subtest::firstOrCreate(['name' => 'Listening']);
        $speaking = Subtest::firstOrCreate(['name' => 'Speaking']);
        $writing = Subtest::firstOrCreate(['name' => 'Writing']);

        $subtestIds = [$reading->id, $listening->id, $speaking->id, $writing->id];

        Question::whereIn('subtest_id', $subtestIds)->delete();
        Passage::whereIn('subtest_id', $subtestIds)->delete();

        $readingPassages = [
            [
                'title' => 'The Impact of Urbanization on Biodiversity',
                'content' => 'Urbanization changes habitats, fragments ecosystems, and challenges wildlife. Some species adapt while others decline. City planning can reduce damage through parks, corridors, and green roofs.',
                'order' => 1,
                'questions' => [
                    [
                        'text' => 'According to the passage, what is one major effect of urbanization on wildlife?',
                        'choices' => [
                            ['A', 'It increases habitat fragmentation', true],
                            ['B', 'It removes all urban species', false],
                            ['C', 'It always improves biodiversity', false],
                            ['D', 'It eliminates the need for city planning', false],
                        ],
                    ],
                    [
                        'text' => 'What does the passage suggest about some species in cities?',
                        'choices' => [
                            ['A', 'They cannot survive in cities', false],
                            ['B', 'They may adapt to urban environments', true],
                            ['C', 'They only live in forests', false],
                            ['D', 'They are unaffected by human activity', false],
                        ],
                    ],
                    [
                        'text' => 'Which solution is mentioned for supporting urban biodiversity?',
                        'choices' => [
                            ['A', 'More highways', false],
                            ['B', 'Removing all buildings', false],
                            ['C', 'Green infrastructure', true],
                            ['D', 'Stopping all public transport', false],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'The Development of Jazz Music in America',
                'content' => 'Jazz began in New Orleans, blending African American traditions with European musical structures. Improvisation became its defining feature, and the genre later influenced culture, art, and racial integration.',
                'order' => 2,
                'questions' => [
                    [
                        'text' => 'Why was New Orleans important to the development of jazz?',
                        'choices' => [
                            ['A', 'It had a diverse cultural environment', true],
                            ['B', 'It banned improvisation', false],
                            ['C', 'It was isolated from all other cities', false],
                            ['D', 'It produced only classical music', false],
                        ],
                    ],
                    [
                        'text' => 'What is the defining characteristic of jazz mentioned in the passage?',
                        'choices' => [
                            ['A', 'Improvisation', true],
                            ['B', 'Written scripts only', false],
                            ['C', 'Silent performance', false],
                            ['D', 'No rhythm', false],
                        ],
                    ],
                    [
                        'text' => 'According to the passage, jazz also contributed to',
                        'choices' => [
                            ['A', 'racial integration and cultural change', true],
                            ['B', 'the end of all other music genres', false],
                            ['C', 'the removal of all urban parks', false],
                            ['D', 'the decline of American literature', false],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($readingPassages as $passageData) {
            $passage = Passage::updateOrCreate(
                [
                    'subtest_id' => $reading->id,
                    'title' => $passageData['title'],
                ],
                [
                    'content' => $passageData['content'],
                    'type' => 'reading',
                    'order' => $passageData['order'],
                ],
            );

            foreach ($passageData['questions'] as $questionOrder => $questionData) {
                $question = Question::updateOrCreate(
                    [
                        'subtest_id' => $reading->id,
                        'passage_id' => $passage->id,
                        'question_text' => $questionData['text'],
                    ],
                    [
                        'question_type' => 'multiple_choice',
                        'order' => $questionOrder + 1,
                        'points' => 1,
                    ],
                );

                foreach ($questionData['choices'] as $choice) {
                    QuestionChoice::updateOrCreate(
                        [
                            'question_id' => $question->id,
                            'choice_label' => $choice[0],
                        ],
                        [
                            'choice_text' => $choice[1],
                            'is_correct' => $choice[2],
                        ],
                    );
                }
            }
        }

        $listeningPassage = Passage::updateOrCreate(
            [
                'subtest_id' => $listening->id,
                'title' => 'Conversation: Studying Alone vs in Groups',
            ],
            [
                'content' => 'A student and a classmate discuss how they prepare for exams. One prefers studying alone for concentration, while the other prefers group study for sharing ideas and solving problems together.',
                'type' => 'listening',
                'order' => 1,
                'audio_url' => null,
            ],
        );

        $listeningQuestions = [
            [
                'text' => 'What is the main topic of the conversation?',
                'choices' => [
                    ['A', 'Campus transportation', false],
                    ['B', 'Study preferences', true],
                    ['C', 'Sports practice', false],
                    ['D', 'Part-time jobs', false],
                ],
            ],
            [
                'text' => 'Why does one student prefer studying alone?',
                'choices' => [
                    ['A', 'It helps with concentration', true],
                    ['B', 'It is louder', false],
                    ['C', 'It allows more socializing', false],
                    ['D', 'It requires a larger room', false],
                ],
            ],
            [
                'text' => 'Why does the other student prefer group study?',
                'choices' => [
                    ['A', 'To avoid homework', false],
                    ['B', 'To share ideas and solve problems', true],
                    ['C', 'To stop taking notes', false],
                    ['D', 'To sleep less', false],
                ],
            ],
            [
                'text' => 'What does the conversation imply about study methods?',
                'choices' => [
                    ['A', 'Only one method works for everyone', false],
                    ['B', 'Different students may prefer different methods', true],
                    ['C', 'Group study is always better', false],
                    ['D', 'Studying is never useful', false],
                ],
            ],
            [
                'text' => 'What is the tone of the conversation?',
                'choices' => [
                    ['A', 'Argumentative', false],
                    ['B', 'Friendly and reflective', true],
                    ['C', 'Angry', false],
                    ['D', 'Formal and legal', false],
                ],
            ],
        ];

        foreach ($listeningQuestions as $index => $questionData) {
            $question = Question::updateOrCreate(
                [
                    'subtest_id' => $listening->id,
                    'passage_id' => $listeningPassage->id,
                    'question_text' => $questionData['text'],
                ],
                [
                    'question_type' => 'multiple_choice',
                    'order' => $index + 1,
                    'points' => 1,
                ],
            );

            foreach ($questionData['choices'] as $choice) {
                QuestionChoice::updateOrCreate(
                    [
                        'question_id' => $question->id,
                        'choice_label' => $choice[0],
                    ],
                    [
                        'choice_text' => $choice[1],
                        'is_correct' => $choice[2],
                    ],
                );
            }
        }

        Question::updateOrCreate(
            [
                'subtest_id' => $speaking->id,
                'question_text' => 'Some people prefer studying alone, while others prefer studying in groups. Which do you prefer and why?',
            ],
            [
                'question_type' => 'speaking',
                'preparation_time' => 15,
                'response_time' => 45,
                'order' => 1,
                'points' => 30,
            ],
        );

        Question::updateOrCreate(
            [
                'subtest_id' => $writing->id,
                'question_text' => 'Do you agree or disagree with the following statement? Technology has made students’ lives easier than in the past.',
            ],
            [
                'question_type' => 'essay',
                'response_time' => 600,
                'order' => 1,
                'points' => 30,
            ],
        );
    }
}