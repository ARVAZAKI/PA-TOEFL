import { Button } from '@/components/ui/button';
import { Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import NavigatorBox from '../layouts/navigator-question';
import SpeakingRecorder from '../utils/speaking-recorder';

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
        questions: [{ id: 1, question: 'Tono membaca artikel dan menyimpulkan...' }],
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
        questions: [{ id: 2, question: 'Tono membaca artikel dan menyimpulkan...' }],
    },
    {
        id: 3,
        title: 'Reading 3',
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
        questions: [{ id: 3, question: 'Tono membaca artikel dan menyimpulkan...' }],
    },
    {
        id: 4,
        title: 'Reading 4',
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
        questions: [{ id: 4, question: 'Tono membaca artikel dan menyimpulkan...' }],
    },
];

export default function SpeakingQuestion({ onComplete, section }: Props) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        recordings: {} as Record<number, Blob>,
        scoreRecords: {} as Record<number, number>,
        // currentIndex: 0,
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });

    const currentReading = speakings[data.currentQuestionIndex];
    const questions = currentReading.questions;

    const handleNextSpeaking = () => {
        if (data.currentQuestionIndex < speakings.length - 1) {
            const nextQuestionIndex = data.currentQuestionIndex + 1;
            const nextSpeaking = speakings[nextQuestionIndex];

            console.log('index : ', nextQuestionIndex);

            // setData('currentIndex', nextQuestionIndex);  bisa dihapus jika tidak dipakai lagi
            setData('currentQuestionIndex', nextQuestionIndex);
        }
    };

    const handlePrevSpeaking = () => {
        if (data.currentQuestionIndex > 0) {
            const prevQuestionIndex = data.currentQuestionIndex - 1;
            const prevSpeaking = speakings[prevQuestionIndex];
            console.log('index : ', prevQuestionIndex);

            // setData('currentIndex', prevQuestionIndex); bisa dihapus jika tidak dipakai lagi
            setData('currentQuestionIndex', prevQuestionIndex);
        }
    };

    const handleSaveRecording = async (blob: Blob) => {
        const currentSpeakings = speakings[data.currentQuestionIndex];
        const currentQuestion = currentSpeakings.questions[0];

        if (!currentQuestion) {
            alert('Pertanyaan tidak ditemukan.');
            return;
        }

        // Simpan ke state
        setData('recordings', { ...data.recordings, [data.currentQuestionIndex]: blob });

        // Kirim ke Flask
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        formData.append('question', currentQuestion.question);

        try {
            const response = await fetch('http://127.0.0.1:5000/assess-speaking', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                const score = Number(result.assessment.score);
                console.log('Transkrip:', result.transcription);
                console.log('Score:', result.assessment.score);
                setData('answers', {
                    ...data.answers,
                    [currentQuestion.id]: result.transcription,
                });
                setData('scoreRecords', { ...data.scoreRecords, [currentQuestion.id]: score });
            } else {
                console.error('Gagal transkripsi:', result);
                alert('Gagal mentranskripsi audio.');
            }
        } catch (error) {
            console.error('Error kirim audio:', error);
            alert('Gagal menghubungi server Flask.');
        }
    };

    const handleSubmit = () => {
        const totalScore = Object.values(data.scoreRecords).reduce((sum, val) => sum + val, 0);
        setData('score', totalScore);
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

    useEffect(() => {
        if (data.score !== 0) {
            post('/submit-test', data);
            onComplete(); // Ensuring it's called only after score updates
        }
    }, [data.score]);

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
            <div className="max-h-[100vh] w-1/3">
                <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-sm bg-white p-1 shadow-sm">
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
                </div>
                <div className="rounded-b-sm bg-white shadow-sm">
                    <div className="mx-2 mb-2 flex justify-between py-2">
                        <Button size="sm" onClick={handlePrevSpeaking} disabled={data.currentQuestionIndex === 0} className="place-self-center">
                            Prev Readings
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleNextSpeaking}
                            disabled={data.currentQuestionIndex === speakings.length - 1}
                            className="place-self-center"
                        >
                            Next Readings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
