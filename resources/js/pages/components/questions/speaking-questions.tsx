import { Button } from '@/components/ui/button';
import { Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { useEffect, useState } from 'react';
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
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });

    const [flagged, setFlag] = useState<Record<number, boolean>>({}) || false;

    const flatQuestions = speakings.flatMap((speaking) => speaking.questions.map((q) => ({ ...q, speakingId: speaking.id })));

    const currentQuestion = flatQuestions[data.currentQuestionIndex];
    const currentReading = speakings.find((r) => r.id === currentQuestion.speakingId)!;

    // const currentReading = speakings[data.currentQuestionIndex];
    // const questions = currentReading.questions;

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
        flagged: flagged,
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
                        {/* Komponen Perekam */}
                        <div className="mt-4">
                            <label className="mb-2 block font-medium">Your Speaking Answer :</label>
                            <SpeakingRecorder onSave={handleSaveRecording} />
                        </div>
                    </div>
                </div>

                <div className="rounded-b-sm bg-white shadow-sm">
                    <div className="mx-2 mb-2 flex justify-between py-2">
                        <Button size="sm" onClick={handlePrev} disabled={data.currentQuestionIndex === 0}>
                            Prev Question
                        </Button>
                        <Button size="sm" onClick={handleNext}>
                            {data.currentQuestionIndex === flatQuestions.length - 1 ? 'Next Section' : 'Next Question'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
