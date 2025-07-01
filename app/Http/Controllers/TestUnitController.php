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

        return redirect()->route('test.show', ['section' => 'general']);
    }


    public function subtestShow($section = 'general')
    {

        $username = session('username');
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

        switch ($section) {
            case "reading-question":
                session(['ReadingScore' => $score]);
                session(['AnsweredCountReading' => true]);
                break;
            case "listening-question":
                session(['ListeningScore' => $score]);
                session(['AnsweredCountListening' => true]);
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

    private function getReadingQuestions()
    {
        return [
            [
                'id' => 1,
                'title' => 'The Role of Pollinators in Ecosystems',
                'passage' => 'Pollinators are crucial for the reproduction of many plants, which in turn supports biodiversity and food production. Bees, butterflies, bats, and birds are some of the most common pollinators. Their decline has raised concerns about the impacts on natural ecosystems and agriculture. Various factors, including habitat loss, climate change, and pesticide use, have contributed to the decrease in pollinator populations. Conservation efforts are underway to protect these vital species and ensure the stability of ecosystems.',
                'questions' => [
                    [
                        'id' => 1,
                        'question' => 'What does the word "crucial" in the first sentence most closely mean?',
                        'choices' => [' Unnecessary', 'Essential', 'Uncertain', 'Optional'],
                        'correctAnswer' => 'Essential'
                    ],
                    [
                        'id' => 2,
                        'question' => 'According to the passage, which of the following is NOT mentioned as a factor contributing to the decline in pollinator populations?',
                        'choices' => ['Habitat loss', 'Climate change', 'Pesticide use', 'Overpopulation'],
                        'correctAnswer' => 'Overpopulation'
                    ],
                    [
                        'id' => 3,
                        'question' => 'It can be inferred from the passage that pollinators are important because . . .',
                        'choices' => ['They help increase the population of insects.', 'They play a role in plant reproduction which supports biodiversity.', 'They are a source of food for birds.', 'They are easy to conserve.'],
                        'correctAnswer' => 'They play a role in plant reproduction which supports biodiversity.'
                    ],
                    [
                        'id' => 4,
                        'question' => 'The primary purpose of the passage is to:',
                        'choices' => ['Explain the decline of pollinator populations.', 'Describe various types of pollinators.', 'Argue against the use of pesticides.', ' Highlight the importance of pollinators in ecosystems.'],
                        'correctAnswer' => 'Highlight the importance of pollinators in ecosystems.'
                    ],
                    [
                        'id' => 5,
                        'question' => 'According to the passage, which pollinator is NOT mentioned?',
                        'choices' => ['Bees', 'Butterflies', 'Ants', 'Bats'],
                        'correctAnswer' => 'Ants'
                    ],
                    [
                        'id' => 6,
                        'question' => 'The word "their" in the sentence "Their decline has raised concerns about the impacts on natural ecosystems and agriculture." refers to . . . ',
                        'choices' => ['Plants', 'Pollinators', 'Concerns', 'Ecosystems'],
                        'correctAnswer' => 'Pollinators'
                    ],
                ]
            ],
            [
                'id' => 2,
                'title' => 'The Role of the Printing Press in Spreading Knowledge',
                'passage' => 'The invention of the printing press in the mid-15th century by Johannes Gutenberg marked a significant milestone in the history of human communication. Before the advent of the printing press, books were manually copied and were primarily accessible to the wealthy elite and religious institutions. Gutenberg’s invention revolutionized the production of books, making them more accessible and affordable to the broader public.
                
                The printing press significantly sped up the process of book production, reducing the cost and effort involved in creating books. This allowed for the rapid dissemination of knowledge and ideas, which played a pivotal role in major cultural shifts such as the Renaissance and the Reformation. It enabled scholars and thinkers to share their discoveries and ideas across Europe more quickly than ever before, fostering an environment of intellectual growth and debate
                Moreover, the standardization of texts contributed to the development of national languages and literacy. As books became cheaper and more widely available, reading became a more common pastime, and literacy rates gradually increased. The accessibility of printed materials also helped in spreading literacy and educational opportunities to the masses, which had long-term impacts on society’s development.',
                'questions' => [
                    [
                        'id' => 7,
                        'question' => 'What was a direct result of the invention of the printing press?',
                        'choices' => ['Increase in manual copying of books', 'Decrease in the cost of book production', 'Decrease in literacy rates', 'Decrease in the dissemination of knowledge'],
                        'correctAnswer' => 'Decrease in the cost of book production'
                    ],
                    [
                        'id' => 8,
                        'question' => 'Which cultural shifts were influenced by the advent of the printing press?',
                        'choices' => [' Industrial Revolution', 'Renaissance and Reformation', 'The establishment of religious institutions', ' The decline of national languages'],
                        'correctAnswer' => 'Renaissance and Reformation'
                    ],
                    [
                        'id' => 9,
                        'question' => 'How did the printing press contribute to the development of national languages?',
                        'choices' => ['By increasing the complexity of texts', ' By reducing the accessibility of books', 'By standardizing texts', ' By limiting educational opportunities'],
                        'correctAnswer' => 'By standardizing texts'
                    ],
                ]
            ],
            [
                'id' => 3,
                'title' => 'The Impact of the Steam Engine on Industrial Development',
                'passage' => 'The steam engine, developed in the 18th century, became a fundamental driving force behind the Industrial Revolution. Invented by James Watt, the steam engine facilitated major advancements in manufacturing, transportation, and communication, transforming societies globally. Before its invention, most machinery was powered by human or animal labor, windmills, or watermills.
                
                The introduction of the steam engine enabled factories to increase production capabilities and efficiency as machines could now operate continuously. This led to significant increases in the volume and variety of products available, reducing costs and making goods more accessible to the general public. Furthermore, the steam engine revolutionized transportation with the development of steamships and railways, which dramatically reduced the time it took to transport goods and people over long distances.
                
                Economically, the steam engine played a pivotal role in shifting the balance of power in favor of industrialized nations, which could produce goods more efficiently and at a lower cost. Socially, it contributed to the rise of urban centers as people moved from rural areas to cities in search of work in new factories, reshaping the demographic landscape of many countries.',
                'questions' => [
                    [
                        'id' => 10,
                        'question' => 'What was a primary effect of the steam engine on factories?',
                        'choices' => ['IDecreased production capabilities', 'Increased dependency on animal labor', 'Enhanced production efficiency', 'Reduction in the variety of products'],
                        'correctAnswer' => 'Enhanced production efficiency'
                    ],
                    [
                        'id' => 11,
                        'question' => 'How did the steam engine affect transportation?',
                        'choices' => ['It increased the time required to transport goods', 'It led to the development of bicycles', 'It enabled faster movement of goods and people', ' It had no significant impact on transportation'],
                        'correctAnswer' => 'It enabled faster movement of goods and people'
                    ],
                    [
                        'id' => 12,
                        'question' => 'What social change did the steam engine encourage?',
                        'choices' => ['Migration from urban to rural areas', 'Decrease in urban populations', 'Growth of urban centers', 'Decline in factory jobs'],
                        'correctAnswer' => 'Growth of urban centers'
                    ],
                ]
            ],
            [
                'id' => 4,
                'title' => 'The Great Barrier Reef',
                'passage' => 'The Great Barrier Reef, located off the northeastern coast of Australia, is the world\'s largest coral reef system, stretching over 2,300 kilometers and encompassing approximately 900 islands and 2,900 individual reefs. This natural wonder is renowned for its extraordinary biodiversity, housing thousands of marine species, including fish, corals, mollusks, and marine mammals.
                
                The reef\'s formation began around 20 million years ago, and it has since evolved into one of the most complex and diverse ecosystems on the planet. The coral polyps, tiny animals that build the reef, create intricate structures that provide habitats and food for a wide range of marine life. However, the Great Barrier Reef faces numerous threats, including climate change, pollution, overfishing, and coastal development. Rising sea temperatures and ocean acidification, both consequences of climate change, have led to widespread coral bleaching events, severely impacting the health of the reef.
                
                Efforts to protect and preserve the Great Barrier Reef are ongoing, involving both local and international initiatives. These efforts focus on reducing carbon emissions, regulating fishing practices, and implementing marine protected areas to safeguard the reef\'s fragile ecosystem. Despite these efforts, the future of the Great Barrier Reef remains uncertain, as the impacts of climate change continue to pose significant challenges.',
                'questions' => [
                    [
                        'id' => 13,
                        'question' => 'Which of the following is a primary threat to the Great Barrier Reef mentioned in the passage?',
                        'choices' => ['Earthquakes', 'Volcanic eruptions', 'Climate change', 'Invasive species'],
                        'correctAnswer' => 'Climate change'
                    ],
                    [
                        'id' => 14,
                        'question' => 'What is the primary function of coral polyps in the Great Barrier Reef ecosystem?',
                        'choices' => ['They regulate the water temperature', 'They create habitats and food for marine life', 'They attract tourists to the reef', 'They prevent coastal erosion'],
                        'correctAnswer' => 'They create habitats and food for marine life'
                    ],
                    [
                        'id' => 15,
                        'question' => 'Which of the following measures is NOT mentioned as part of the efforts to protect the Great Barrier Reef?',
                        'choices' => ['Reducing carbon emissions', 'Implementing marine protected areas', 'Regulating fishing practices', 'Building artificial reefs'],
                        'correctAnswer' => 'Building artificial reefs'
                    ],
                ]
            ],
            [
                'id' => 5,
                'title' => 'The Silk Road',
                'passage' => 'The Silk Road was an ancient network of trade routes that connected the East and West, facilitating the exchange of goods, culture, and ideas between different civilizations. This extensive network, which began around the 2nd century BCE, spanned thousands of miles, linking China with the Mediterranean region. It played a crucial role in the development of the civilizations it connected, including those in China, India, Persia, Arabia, and the Roman Empire.The Silk Road derived its name from the lucrative trade in silk, a highly prized commodity that was produced primarily in China. However, many other goods were traded along these routes, such as spices, precious metals, gemstones, and textiles. In addition to material goods, the Silk Road also facilitated the spread of knowledge, religion, and technology. For example, Buddhism spread from India to China and other parts of Asia along these trade routes.Despite its significant contributions to cultural and economic exchanges, the Silk Road faced numerous challenges, including harsh desert environments, rugged mountain terrains, and the threat of bandit attacks. The rise of maritime trade routes in the 15th century eventually led to the decline of the overland Silk Road, as sea routes offered faster and safer alternatives for transporting goods.',
                'questions' => [
                    [
                        'id' => 16,
                        'question' => 'What was the primary commodity that gave the Silk Road its name?',
                        'choices' => ['Spices', 'Silk', 'Precious metals', 'Textiles'],
                        'correctAnswer' => 'Silk'
                    ],
                    [
                        'id' => 17,
                        'question' => 'Which of the following was NOT mentioned as a challenge faced by travelers on the Silk Road?',
                        'choices' => ['Harsh desert environments', 'Rugged mountain terrains', 'Threat of bandit attacks', 'Competition from maritime trade routes'],
                        'correctAnswer' => 'Competition from maritime trade routes'
                    ],
                    [
                        'id' => 18,
                        'question' => 'Which statement best describes the impact of the Silk Road on the spread of religion?',
                        'choices' => [
                            'The Silk Road only facilitated the exchange of material goods',
                            'Buddhism spread from India to China and other parts of Asia along the Silk Road',
                            'The Silk Road hindered the spread of religious ideas',
                            'Christianity was the only religion that spread along the Silk Road'
                        ],
                        'correctAnswer' => 'Buddhism spread from India to China and other parts of Asia along the Silk Road'
                    ],
                ]
            ],
            [
                'id' => 6,
                'title' => 'The Rise and Fall of the Maya Civilization',
                'passage' => 'The Maya Civilization thrived in Mesoamerica from approximately 2000 B.C. to the 16th century A.D., reaching its peak during the Classic Period (250–900 A.D.). This civilization is renowned for its advancements in mathematics, astronomy, and architecture, as well as its complex social and political structures.
                The Maya built impressive city-states, each ruled by a king, known as an ajaw. These cities featured grand pyramids, palaces, and ceremonial platforms, often intricately decorated with carvings and inscriptions. Notable Maya cities included Tikal, Palenque, and Copán. The Maya developed a sophisticated calendar system and were among the first to use the concept of zero in their mathematical calculations.
                Trade was a vital component of Maya society, with extensive networks connecting different city-states and regions. The Maya traded goods such as jade, obsidian, cacao, and textiles. Evidence of Maya trade connections has been found as far away as Central Mexico and Honduras, highlighting the civilization’s economic reach.
                Religion played a central role in Maya life, with a pantheon of gods and rituals that were intricately tied to their calendar and astronomical observations. The Maya believed that the actions of their rulers were crucial for maintaining the balance of the universe, leading to elaborate ceremonies and bloodletting rituals.
                Despite their achievements, the Maya civilization began to decline during the Late Classic Period (800–900 A.D.). Several factors have been proposed to explain this decline, including environmental degradation, overpopulation, warfare, and prolonged droughts. The collapse was not uniform across the region; some city-states were abandoned, while others persisted and evolved.
                The arrival of the Spanish in the 16th century marked the final blow to the remaining Maya polities. The Spanish conquest, coupled with diseases brought by Europeans, decimated the indigenous population and led to the eventual fall of the Maya civilization.

                One of the enduring mysteries of the Maya is their writing system. The Maya developed a complex hieroglyphic script, which has been partially deciphered. This script provides valuable insights into their history, culture, and daily life, yet many inscriptions remain untranslated, leaving aspects of their civilization shrouded in mystery.',
                'questions' => [
                    [
                        'id' => 19,
                        'question' => 'What was a major factor in the prosperity of the Maya Civilization?',
                        'choices' => [
                            'Military conquests in surrounding regions',
                            'Extensive trade networks with other regions',
                            'Isolation from external influences',
                            'Reliance on a single agricultural product'
                        ],
                        'correctAnswer' => 'Extensive trade networks with other regions'
                    ],
                    [
                        'id' => 20,
                        'question' => 'Which statement is true about the Maya Civilization based on the passage?',
                        'choices' => [
                            'The civilization was primarily militaristic with frequent warfare',
                            'The Maya did not have a writing system',
                            'The cities featured grand pyramids and ceremonial platforms',
                            'Maya rulers had no role in religious practices'
                        ],
                        'correctAnswer' => 'The cities featured grand pyramids and ceremonial platforms'
                    ],
                    [
                        'id' => 21,
                        'question' => 'What likely contributed to the decline of the Maya Civilization?',
                        'choices' => [
                            'Complete isolation from trade networks',
                            'Environmental degradation and prolonged droughts',
                            'Overreliance on a single crop',
                            'A sudden epidemic that wiped out the population'
                        ],
                        'correctAnswer' => 'Environmental degradation and prolonged droughts'
                    ],
                ]
            ],
            [
                'id' => 7,
                'title' => 'The Decline of the Roman Empire',
                'passage' => "The Roman Empire, one of the most powerful and influential civilizations in history, experienced a dramatic rise and fall. Founded in 27 B.C., the Empire reached its peak during the 2nd century A.D., encompassing vast territories across Europe, North Africa, and the Middle East. The Roman Empire is renowned for its advanced engineering, extensive road networks, legal systems, and monumental architecture.

                One of the most iconic features of the Roman Empire was its extensive network of roads and aqueducts, which facilitated trade, military movements, and communication across the vast territories. The Romans built impressive structures, including the Colosseum, aqueducts like the Pont du Gard, and the extensive road networks that connected the Empire's cities.

                The Roman economy thrived on agriculture, trade, and a well-organized taxation system. Rome traded extensively with neighboring regions, importing goods such as silk from China, spices from India, and grain from Egypt. The use of coinage facilitated commerce and helped integrate the diverse regions of the Empire.

                Despite its achievements, the Roman Empire began to decline in the 3rd century A.D. Several factors contributed to this decline, including political instability, economic troubles, military defeats, and external pressures from invading tribes. The Empire was divided into the Eastern and Western Roman Empires in 285 A.D., but this division only temporarily stabilized the situation.

                The Western Roman Empire faced numerous challenges, including invasions by Germanic tribes such as the Visigoths and Vandals. The sack of Rome by the Visigoths in 410 A.D. and the eventual deposition of the last Roman emperor, Romulus Augustulus, in 476 A.D. marked the end of the Western Roman Empire. The Eastern Roman Empire, known as the Byzantine Empire, continued to thrive for several more centuries until the fall of Constantinople in 1453.",
                'questions' => [
                    [
                        'id' => 22,
                        'question' => 'What was a major factor in the economic prosperity of the Roman Empire?',
                        'choices' => [
                            'Isolation from external influences',
                            'Extensive trade networks with neighboring regions',
                            'Reliance on a single agricultural product',
                            'Continuous military conquests'
                        ],
                        'correctAnswer' => 'Extensive trade networks with neighboring regions'
                    ],
                    [
                        'id' => 23,
                        'question' => 'Which statement is true about the Roman Empire based on the passage?',
                        'choices' => [
                            'The Roman Empire was primarily isolated with minimal external trade',
                            'The Roman Empire did not have a well-organized taxation system',
                            'The Roman Empire built an extensive network of roads and aqueducts',
                            'The Roman Empire\'s decline began in the 1st century A.D.'
                        ],
                        'correctAnswer' => 'The Roman Empire built an extensive network of roads and aqueducts'
                    ],
                    [
                        'id' => 24,
                        'question' => 'What are possible reasons for the decline of the Roman Empire?',
                        'choices' => [
                            'Complete isolation from neighboring regions',
                            'Political instability and external invasions',
                            'Continuous economic prosperity and stability',
                            'Invasion by European settlers'
                        ],
                        'correctAnswer' => 'Political instability and external invasions'
                    ],
                ]
            ],
            [
                'id' => 8,
                'title' => 'The Disappearance of the Dodo',
                'passage' => "The dodo, a flightless bird native to the island of Mauritius in the Indian Ocean, has become an enduring symbol of extinction. First encountered by European sailors in the late 16th century, the dodo thrived in the dense forests of Mauritius. Unfortunately, within less than a century, the dodo had disappeared, largely due to human activity. The reasons behind the dodo's extinction are multifaceted, involving habitat destruction, introduced species, and direct human exploitation.

                When the Portuguese and Dutch sailors arrived on Mauritius, they found the dodo to be an easy prey due to its lack of fear of humans and inability to fly. The dodo, which stood about one meter tall and weighed around 20 kilograms, provided a convenient source of fresh meat for the sailors. However, hunting was not the sole cause of the dodo's extinction.

                The introduction of non-native animals by the settlers had a devastating impact on the dodo population. Pigs, rats, and monkeys brought to the island preyed on dodo eggs and competed for food resources. The dodo, having evolved in an isolated environment without natural predators, was ill-equipped to deal with these new threats. Additionally, the settlers cleared large areas of forest for agriculture, destroying the dodo's natural habitat and further reducing its chances of survival.

                Another significant factor contributing to the dodo's extinction was the bird's reproductive biology. Dodos laid only one egg at a time, making their populations particularly vulnerable to any disturbances. With the high predation rates on their eggs and chicks by the introduced animals, dodo numbers declined rapidly.

                Recent studies have also explored the possibility that diseases introduced by the settlers and their animals could have contributed to the decline of the dodo. However, direct evidence supporting this theory is limited. The rapid and multifaceted nature of the dodo's extinction makes it a compelling case study for understanding the complex interactions between human activity and biodiversity loss.

                The extinction of the dodo serves as a stark reminder of the fragility of island ecosystems. With no natural predators and a limited geographical range, the dodo was particularly susceptible to the changes brought about by human colonization. Today, the story of the dodo continues to be a poignant symbol in conservation efforts, emphasizing the importance of protecting vulnerable species and their habitats.",
                'questions' => [
                    [
                        'id' => 25,
                        'question' => 'What was one major factor contributing to the extinction of the dodo according to the passage?',
                        'choices' => [
                            'Competition with other native bird species',
                            'Habitat destruction due to human colonization',
                            'Evolutionary changes reducing the dodo\'s size',
                            'Climate changes altering the island\'s ecosystem'
                        ],
                        'correctAnswer' => 'Habitat destruction due to human colonization'
                    ],
                    [
                        'id' => 26,
                        'question' => 'How did the introduction of non-native animals affect the dodo population?',
                        'choices' => [
                            'It provided new food sources for the dodo',
                            'It helped the dodo to thrive in a new environment',
                            'It led to increased predation on dodo eggs and competition for food',
                            'It caused the dodo to migrate to other islands'
                        ],
                        'correctAnswer' => 'It led to increased predation on dodo eggs and competition for food'
                    ],
                    [
                        'id' => 27,
                        'question' => 'Why might human activity have contributed to the dodo\'s extinction?',
                        'choices' => [
                            'Humans built cities that replaced dodo habitats',
                            'Humans introduced diseases that affected the dodo',
                            'Humans hunted the dodo for food and cleared forests for agriculture',
                            'Humans prevented the dodo from reaching its nesting sites'
                        ],
                        'correctAnswer' => 'Humans hunted the dodo for food and cleared forests for agriculture'
                    ],
                    [
                        'id' => 28,
                        'question' => 'What evidence suggests that the dodo\'s extinction was a result of multiple factors?',
                        'choices' => [
                            'Fossils of dodos found in mainland Asia',
                            'Remains of dodo eggs in caves on Mauritius',
                            'Historical records describing the impact of hunting, habitat destruction, and introduced species',
                            'Genetic studies showing a sudden decline in the dodo population'
                        ],
                        'correctAnswer' => 'Historical records describing the impact of hunting, habitat destruction, and introduced species'
                    ],
                ]
            ],
        ];
    }
    private function getListeningQuestions()
    {
        return [
            [
                'id' => 1,
                'title' => 'Reading 1',
                'passage' => 'Isi bacaan...',
                'questions' => [
                    ['id' => 1, 'question' => 'Apa tujuan artikel?', 'choices' => ['A', 'B', 'C', 'D'], 'correctAnswer' => 'A'],
                    // ...
                ]
            ],

        ];
    }
    private function getSpeakingQuestions()
    {
        return [
            [
                'id' => 1,
                'title' => 'Reading 1',
                'passage' => 'Isi bacaan...',
                'questions' => [
                    ['id' => 1, 'question' => 'Apa tujuan artikel?', 'choices' => ['A', 'B', 'C', 'D'], 'correctAnswer' => 'A'],
                    // ...
                ]
            ],
            // ...
        ];
    }
    private function getWritingQuestions()
    {
        return [
            [
                'id' => 1,
                'title' => 'Reading 1',
                'passage' => 'Isi bacaan...',
                'questions' => [
                    ['id' => 1, 'question' => 'Apa tujuan artikel?', 'choices' => ['A', 'B', 'C', 'D'], 'correctAnswer' => 'A'],
                    // ...
                ]
            ],
            // ...
        ];
    }

}
