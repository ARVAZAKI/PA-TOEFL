import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import NavigatorBox from '../layouts/navigator-question';

type Props = {
    onComplete: () => void;
};

const writings = [
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
            { id: 1, question: 'Tono membaca artikel dan menyimpulkan...', correctAnswer: 'saya sedang memasak' },
            { id: 2, question: 'Apa tujuan utama artikel?', correctAnswer: 'untuk memberitahukan bahwa bumi itu lonjong' },
        ],
    },
];

export default function WritingQuestion({ onComplete }: Props) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentIndex: 0,
        currentQuestionIndex: 1,
        score: 0,
    });

    const currentWriting = writings[data.currentIndex];
    const questions = currentWriting.questions;

    const flatQuestions = writings.flatMap((writings) => writings.questions.map((q) => ({ ...q, writingId: writings.id })));

    const findFirstQuestionIndexByReadingId = (writingId: number) => {
        return flatQuestions.findIndex((q) => q.writingId === writingId);
    };

    const handleAnswerChange = (questionId: number, value: string) => {
        setData('answers', {
            ...data.answers,
            [questionId]: value,
        });
    };

    const handleNextReading = () => {
        if (data.currentIndex < writings.length - 1) {
            const nextWritingIndex = data.currentIndex + 1;
            const nextWriting = writings[nextWritingIndex];
            const nextQuestionIndex = findFirstQuestionIndexByReadingId(nextWriting.id);

            setData('currentIndex', nextWritingIndex);
            setData('currentQuestionIndex', nextQuestionIndex); // Pindah ke pertanyaan pertama dari reading berikutnya
        }
    };

    const handlePrevReading = () => {
        if (data.currentIndex > 0) {
            const prevReadingIndex = data.currentIndex - 1;
            const prevReading = writings[prevReadingIndex];
            const prevQuestionIndex = findFirstQuestionIndexByReadingId(prevReading.id);

            setData('currentIndex', prevReadingIndex);
            setData('currentQuestionIndex', prevQuestionIndex); // Pindah ke pertanyaan pertama dari reading sebelumnya
        }
    };

    const handleSubmit = () => {
        let score = 0; // Start with 0 correct answers
        let answeredCount = Object.keys(data.answers).length;

        writings.forEach((writing) =>
            writing.questions.forEach((q) => {
                const userAnswer = data.answers[q.id];
                const correctAnswer = q.correctAnswer;

                console.log(userAnswer);
                console.log(correctAnswer);

                if (userAnswer?.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
                    score++;
                }
            }),
        );

        console.log(score);
        // Update the correctCount in the form data

        setData('score', score);
        // Submit the data
        // post('/submit-test', {
        //     // correctCount,
        //     onStart: () => console.log('start'),

        //     onError: (errors) => {
        //         console.log('error:', errors);
        //     },
        //     onFinish: () => {
        //         console.log('finish');
        //         setTimeout(() => {
        //             onComplete();
        //         }, 5);
        //     },
        // });
    };

    const propsNavigator = {
        props: data,
        setData: setData,
        sectionQuestions: writings,
        onComplete: onComplete,
        handleSubmit: handleSubmit,
    };

    return (
        <div className="flex w-full items-start justify-between gap-8">
            {/* NAVIGATOR */}
            <NavigatorBox propsNav={propsNavigator} />

            {/* Reading BOX */}
            <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-sm bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{currentWriting.title}</h2>
                </div>

                <p className="text-sm break-words text-gray-700 select-none">{currentWriting.passage}</p>
            </div>

            {/* Question & Answer Box */}
            <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-sm bg-white p-1 shadow-sm">
                {questions.map((question, qidx) => (
                    <div key={question.id} className="flex flex-col gap-2 border-b-4 border-red-400 p-4">
                        {/* Question */}
                        <p className="text-sm leading-relaxed text-gray-700">
                            {question.id}. {question.question}
                        </p>

                        {/* Answer */}
                        <div className="space-y-2">
                            <label htmlFor="answer" className="mb-1 block font-medium">
                                Your Answer
                            </label>
                            <textarea
                                id="answer"
                                key={`question-${question.id}`}
                                name={`question-${question.id}`}
                                className="min-h-[200px] w-full resize-none rounded border p-3"
                                placeholder="Type your answer here . . . ."
                                value={data.answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            />
                        </div>
                    </div>
                ))}

                <div className="mx-2 mb-2 flex justify-between">
                    <Button size="sm" onClick={handlePrevReading} disabled={data.currentIndex === 0} className="place-self-center">
                        Prev Readings
                    </Button>
                    <Button size="sm" onClick={handleNextReading} disabled={data.currentIndex === writings.length - 1} className="place-self-center">
                        Next Readings
                    </Button>
                </div>
            </div>
        </div>
    );
}
