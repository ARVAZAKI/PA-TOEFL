import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import NavigatorBox from '../layouts/navigator-question';
import SpeakingRecorder from '../utils/speaking-recorder';
import { Props } from '@/types';

const speakings = [
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
            { id: 4, question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
            { id: 5, question: 'Apa tujuan utama artikel?', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
        ],
    },
];

export default function SpeakingQuestion({ onComplete, section }: Props) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        recordings: {} as Record<number, Blob>,
        currentIndex: 0,
        currentQuestionIndex: 1,
        score: 0,
        section: section,
    });

    const currentReading = speakings[data.currentIndex];
    const questions = currentReading.questions;
    const currentQuestion = speakings[data.currentQuestionIndex - 1];

    const flatQuestions = speakings.flatMap((speaking) => speaking.questions.map((q) => ({ ...q, speakingId: speaking.id })));

    const findFirstQuestionIndexBySpeakingId = (speakingId: number) => {
        return flatQuestions.findIndex((q) => q.speakingId === speakingId);
    };

    const handleNextReading = () => {
        if (data.currentIndex < speakings.length - 1) {
            const nextReadingIndex = data.currentIndex + 1;
            const nextReading = speakings[nextReadingIndex];
            const nextQuestionIndex = findFirstQuestionIndexBySpeakingId(nextReading.id);

            setData('currentIndex', nextReadingIndex);
            setData('currentQuestionIndex', nextQuestionIndex); // Pindah ke pertanyaan pertama dari reading berikutnya
        }
    };

    const handlePrevReading = () => {
        if (data.currentIndex > 0) {
            const prevReadingIndex = data.currentIndex - 1;
            const prevReading = speakings[prevReadingIndex];
            const prevQuestionIndex = findFirstQuestionIndexBySpeakingId(prevReading.id);

            setData('currentIndex', prevReadingIndex);
            setData('currentQuestionIndex', prevQuestionIndex); // Pindah ke pertanyaan pertama dari reading sebelumnya
        }
    };

    const handleSaveRecording = (blob: Blob) => {
        setData('recordings', { ...data.recordings, [data.currentQuestionIndex]: blob });
    };

    const handleSubmit = () => {
        let correctCount = 0;

        for (let i = 0; i < questions.length; i++) {
            const userAnswer = data.answers[i + 1];
            const correctAnswer = questions[i].correctAnswer;
            if (userAnswer === correctAnswer) {
                correctCount++;
            }
        }

        setData('score', correctCount);

        // post('/submit-test', {
        //     onStart: () => console.log('start'),
        //     onError: (errors) => console.log('error:', errors),
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
        sectionQuestions: speakings,
        onComplete: onComplete,
        handleSubmit: handleSubmit,
    };

    return (
        <div className="flex w-full items-start justify-between gap-8">
            {/* Sidebar Navigator */}
            <NavigatorBox propsNav={propsNavigator} />

            <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-sm bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">No. {currentReading.title}</h2>
                </div>

                <p className="text-sm break-words text-gray-700 select-none">{currentReading.passage}</p>
            </div>

            {/* Soal */}
            <div className="max-h-[85vh] w-1/3 flex-1 space-y-4 overflow-auto rounded-sm bg-white p-1 shadow-sm">
                {questions.map((question, qidx) => (
                    <div key={question.id} className="flex-1 space-y-4 rounded-sm bg-white p-4 shadow-sm">
                        <h2 className="text-xl font-semibold">No. {question.id}</h2>
                        <p className="text-sm text-gray-700">{question.question}</p>

                        {/* Komponen Perekam */}
                        <div className="mt-4">
                            <label className="mb-2 block font-medium">Your Speaking Answer :</label>
                            <SpeakingRecorder onSave={handleSaveRecording} />
                        </div>
                    </div>
                ))}
                <div className="mx-2 mb-2 flex justify-between">
                    <Button size="sm" onClick={handlePrevReading} disabled={data.currentIndex === 0} className="place-self-center">
                        Prev Readings
                    </Button>
                    <Button size="sm" onClick={handleNextReading} disabled={data.currentIndex === speakings.length - 1} className="place-self-center">
                        Next Readings
                    </Button>
                </div>
            </div>
        </div>
    );
}
