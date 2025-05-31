import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import NavigatorBox from '../layouts/navigator-question';

type Props = {
    onComplete: () => void;
};

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

export default function ReadingQuestion({ onComplete }: Props) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentIndex: 0,
        currentQuestionIndex: 1,
        score: 0,
    });

    const currentReading = readings[data.currentIndex];
    const questions = currentReading.questions;
    const currentQuestion = questions[data.currentQuestionIndex - 1];

    // const handleSelectAnswer = (choice: string) => {
    //     setData('answers', { ...data.answers, [currentQuestion.id]: choice });
    // };

    // const handleNavigateQuestion = (index: number) => {
    //     setData('currentIndex', index);
    // };

    const flatQuestions = readings.flatMap((reading) => reading.questions.map((q) => ({ ...q, readingId: reading.id })));

    // Fungsi ini akan mencari index global pertanyaan pertama dari reading tertentu
    const findFirstQuestionIndexByReadingId = (readingId: number) => {
        return flatQuestions.findIndex((q) => q.readingId === readingId);
    };

    const handleNextReading = () => {
        if (data.currentIndex < readings.length - 1) {
            const nextReadingIndex = data.currentIndex + 1;
            const nextReading = readings[nextReadingIndex];
            const nextQuestionIndex = findFirstQuestionIndexByReadingId(nextReading.id);

            setData('currentIndex', nextReadingIndex);
            setData('currentQuestionIndex', nextQuestionIndex); // Pindah ke pertanyaan pertama dari reading berikutnya
        }
    };

    const handlePrevReading = () => {
        if (data.currentIndex > 0) {
            const prevReadingIndex = data.currentIndex - 1;
            const prevReading = readings[prevReadingIndex];
            const prevQuestionIndex = findFirstQuestionIndexByReadingId(prevReading.id);

            setData('currentIndex', prevReadingIndex);
            setData('currentQuestionIndex', prevQuestionIndex); // Pindah ke pertanyaan pertama dari reading sebelumnya
        }
    };

    const handleSubmit = () => {
        let score = 0;

        readings.forEach((reading) =>
            reading.questions.forEach((q) => {
                const userAnswer = data.answers[q.id];
                const correctAnswer = q.correctAnswer;

                if (userAnswer?.trim().toUpperCase() === correctAnswer.trim().toUpperCase()) {
                    score++;
                }
            }),
        );

        console.log('Correct count:', score);

        const countScore = (score / flatQuestions.length) * 30;

        // Kirim seluruh data form + score ke server
        setData('score', countScore);
        // post('/submit-test', {
        //     onStart: () => console.log('start'),
        //     onError: (errors) => console.log('error:', errors),
        //     onFinish: () => {
        //         console.log('finish');
        //         setTimeout(() => onComplete(), 10);
        //     },
        // });
    };

    useEffect(() => {
        if (data.score !== 0) {
            post('/submit-test', data);
            onComplete(); // Ensuring it's called only after score updates
        }
    }, [data.score]);

    const propsNavigator = {
        props: data,
        setData: setData,
        sectionQuestions: readings,
        onComplete: onComplete,
        handleSubmit: handleSubmit,
    };

    return (
        <div className="flex w-full items-start justify-between gap-8">
            {/* NAVIGATOR */}
            <NavigatorBox propsNav={propsNavigator} />

            {/* Readings box*/}

            <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-sm bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">No. {currentReading.title}</h2>
                </div>

                <p className="text-sm break-words text-gray-700 select-none">{currentReading.passage}</p>
            </div>

            {/* QUESTIONS & Answers box*/}

            <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-sm bg-white p-1 shadow-sm">
                {questions.map((question, qIdx) => (
                    <div key={question.id} className="flex flex-col gap-2 border-b-4 border-red-400 p-4">
                        {/* Questions */}
                        <p className="text-sm leading-relaxed text-gray-700">
                            {question.id}. {question.question}
                        </p>

                        {/* Answer */}
                        <div className="space-y-2">
                            {question.choices.map((choice, index) => (
                                <label
                                    key={index}
                                    className={`block cursor-pointer rounded-md border px-4 py-2 ${
                                        data.answers[question.id] === choice ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={choice}
                                        checked={data.answers[question.id] === choice}
                                        onChange={() =>
                                            setData('answers', {
                                                ...data.answers,
                                                [question.id]: choice,
                                            })
                                        }
                                        className="mr-2"
                                    />
                                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {choice}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="mx-2 mb-2 flex justify-between">
                    <Button size="sm" onClick={handlePrevReading} disabled={data.currentIndex === 0} className="place-self-center">
                        Prev Readings
                    </Button>
                    <Button size="sm" onClick={handleNextReading} disabled={data.currentIndex === readings.length - 1} className="place-self-center">
                        Next Readings
                    </Button>
                </div>
            </div>
        </div>
    );
}
