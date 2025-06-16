import { Button } from '@/components/ui/button';
import { Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import NavigatorBox from '../layouts/navigator-question';

const readings = [
    {
        id: 1,
        title: 'Reading 1',
        passage: `A topic of increasing relevance to the conservation of marine life is bycatch—fish and other animals that are unintentionally
                    caught in the process of fishing for a targeted population of fish. Bycatch is a common occurrence in longline fishing, which
                    utilizes a long heavy fishing line- with baited hooks placed at intervals, and in trawling, which utilizes a fishing net (trawl)
                    that is dragged along the ocean floor or through the mid-ocean waters. Few fisheries employ gear that can catch one species to the
                    exclusion of all others. Dolphins, whales, and turtles are frequently captured in nets set for tunas and billfishes, and seabirds
                    and turtles are caught in longline sets. Because bycatch often goes unreported, it is difficult to accurately estimate its extent.
                    Available data indicate that discarded biomass (organic matter from living things) amounts to 25–30 percent of official catch, or
                    about 30 million metric tons. The bycatch problem is particularly acute when trawl nets with small mesh sizes (smallerthan-average
                    holes in the net material) are dragged along the bottom of the ocean in pursuit of groundfish or shrimp. Because of the small mesh
                    size of the shrimp trawl nets, most of the fishes captured are either juveniles (young), smaller than legal size limits, or
                    undesirable small species. Even larger mesh sizes do not prevent bycatch because once the net begins to fill with fish or shrimp,
                    small individuals caught subsequently are trapped without ever encountering the mesh. In any case, these incidental captures are
                    unmarketable and are usually shoveled back over the side of the vessel dead or dying.`,
        questions: [
            { id: 1, question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            { id: 2, question: 'Apa tujuan utama artikel?', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
            { id: 3, question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            { id: 4, question: 'Apa tujuan utama artikel?', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
            { id: 5, question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
        ],
    },
    {
        id: 2,
        title: 'Reading 2',
        passage: `A topic of increasing relevance to the conservation of marine life is bycatch—fish and other animals that are unintentionally
                    caught in the process of fishing for a targeted population of fish. Bycatch is a common occurrence in longline fishing, which
                    utilizes a long heavy fishing line- with baited hooks placed at intervals, and in trawling, which utilizes a fishing net (trawl)
                    that is dragged along the ocean floor or through the mid-ocean waters. Few fisheries employ gear that can catch one species to the
                    exclusion of all others. Dolphins, whales, and turtles are frequently captured in nets set for tunas and billfishes, and seabirds
                    and turtles are caught in longline sets. Because bycatch often goes unreported, it is difficult to accurately estimate its extent.
                    Available data indicate that discarded biomass (organic matter from living things) amounts to 25–30 percent of official catch, or
                    about 30 million metric tons. The bycatch problem is particularly acute when trawl nets with small mesh sizes (smallerthan-average
                    holes in the net material) are dragged along the bottom of the ocean in pursuit of groundfish or shrimp. Because of the small mesh
                    size of the shrimp trawl nets, most of the fishes captured are either juveniles (young), smaller than legal size limits, or
                    undesirable small species. Even larger mesh sizes do not prevent bycatch because once the net begins to fill with fish or shrimp,
                    small individuals caught subsequently are trapped without ever encountering the mesh. In any case, these incidental captures are
                    unmarketable and are usually shoveled back over the side of the vessel dead or dying.`,
        questions: [
            { id: 6, question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            { id: 7, question: 'Apa tujuan utama artikel?', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
            { id: 8, question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            { id: 9, question: 'Apa tujuan utama artikel?', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
            { id: 10, question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
        ],
    },
];

export default function ReadingQuestion({ onComplete, section }: Props) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });

    const [flagged, setFlag] = useState<Record<number, boolean>>({}) || false;

    const flatQuestions = readings.flatMap((reading) => reading.questions.map((q) => ({ ...q, readingId: reading.id })));

    const currentQuestion = flatQuestions[data.currentQuestionIndex];
    const currentReading = readings.find((r) => r.id === currentQuestion.readingId)!;

    const toggleFlag = (id: number) => {
        setFlag((prev) => ({ ...prev, [id]: !prev[id] }));
        console.log(flagged);
    };

    const handlePrev = () => {
        if (data.currentQuestionIndex > 0) {
            setData('currentQuestionIndex', data.currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (data.currentQuestionIndex < flatQuestions.length - 1) {
            setData('currentQuestionIndex', data.currentQuestionIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        let score = 0;
        flatQuestions.forEach((q) => {
            const userAnswer = data.answers[q.id];
            const correctAnswer = q.correctAnswer;
            if (userAnswer?.trim().toUpperCase() === correctAnswer.trim().toUpperCase()) {
                score++;
                console.log(score);
            }
        });

        const finalScore = (score / flatQuestions.length) * 30;
        setData('score', finalScore);
    };

    useEffect(() => {
        if (data.score !== 0) {
            post('/submit-test', data);
            onComplete(); // Setelah kirim
        }
    }, [data.score]);

    const propsNavigator = {
        props: data,
        setData: setData,
        sectionQuestions: readings,
        onComplete: onComplete,
        handleSubmit: handleSubmit,
        flagged: flagged,
    };

    return (
        <div className="flex w-full items-start justify-between gap-8">
            {/* Navigator */}
            <NavigatorBox propsNav={propsNavigator} />

            {/* Reading Box */}
            <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-sm bg-white p-4 shadow-sm">
                <h2 className="text-xl font-semibold">{currentReading.title}</h2>
                <p className="text-sm break-words text-gray-700 select-none">{currentReading.passage}</p>
            </div>

            {/* Question Box */}
            <div className="max-h-[100vh] w-1/3">
                <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-sm bg-white p-4 shadow-sm">
                    <div key={currentQuestion.id} className="flex flex-col gap-2">
                        <div className="flex justify-between gap-2">
                            <p className="text-sm leading-relaxed text-gray-700">
                                {currentQuestion.id}. {currentQuestion.question}
                            </p>
                            <Button variant={'outline'} onClick={() => toggleFlag(currentQuestion.id)}>
                                {flagged[currentQuestion.id] ? (
                                    <FlagOff className="h-5 w-5 text-red-600" />
                                ) : (
                                    <Flag className="'h-5 w-5 text-red-600" />
                                )}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {currentQuestion.choices.map((choice, index) => (
                                <label
                                    key={index}
                                    className={`block cursor-pointer rounded-md border px-4 py-2 ${
                                        data.answers[currentQuestion.id] === choice
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-blue-400'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value={choice}
                                        checked={data.answers[currentQuestion.id] === choice}
                                        onChange={() =>
                                            setData('answers', {
                                                ...data.answers,
                                                [currentQuestion.id]: choice,
                                            })
                                        }
                                        className="mr-2"
                                    />
                                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {choice}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="rounded-b-sm bg-white shadow-sm">
                    <div className="mx-2 mb-2 flex justify-between py-2">
                        <Button size="sm" onClick={handlePrev} disabled={data.currentQuestionIndex === 0}>
                            Prev
                        </Button>
                        <Button size="sm" onClick={handleNext}>
                            {data.currentQuestionIndex === flatQuestions.length - 1 ? 'Next Section' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
