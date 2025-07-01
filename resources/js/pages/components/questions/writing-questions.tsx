import { Button } from '@/components/ui/button';
import { Props } from '@/types';
import { useForm } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import NavigatorBox from '../layouts/navigator-question';

// const writings = [
//     {
//         id: 1,
//         title: 'Reading 1',
//         passage: `A topic of increasing relevance to the conservation of marine life is bycatch—fish and other animals that are unintentionally
//                     caught in the process of fishing for a targeted population of fish. Bycatch is a common occurrence in longline fishing, which
//                     utilizes a long heavy fishing line- with baited hooks placed at intervals, and in trawling, which utilizes a fishing net (trawl)
//                     that is dragged along the ocean floor or through the mid-ocean waters. Few fisheries employ gear that can catch one species to the
//                     exclusion of all others. Dolphins, whales, and turtles are frequently captured in nets set for tunas and billfishes, and seabirds
//                     and turtles are caught in longline sets. Because bycatch often goes unreported, it is difficult to accurately estimate its extent.
//                     Available data indicate that discarded biomass (organic matter from living things) amounts to 25–30 percent of official catch, or
//                     about 30 million metric tons. The bycatch problem is particularly acute when trawl nets with small mesh sizes (smallerthan-average
//                     holes in the net material) are dragged along the bottom of the ocean in pursuit of groundfish or shrimp. Because of the small mesh
//                     size of the shrimp trawl nets, most of the fishes captured are either juveniles (young), smaller than legal size limits, or
//                     undesirable small species. Even larger mesh sizes do not prevent bycatch because once the net begins to fill with fish or shrimp,
//                     small individuals caught subsequently are trapped without ever encountering the mesh. In any case, these incidental captures are
//                     unmarketable and are usually shoveled back over the side of the vessel dead or dying.`,
//         questions: [{ id: 1, question: 'Tono membaca artikel dan menyimpulkan...' }],
//     },
// ];

const WritingQuestion = forwardRef(function WritingQuestion({ onComplete, section, questions }: Props, ref) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentIndex: 0,
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });

    const [flagged, setFlag] = useState<Record<number, boolean>>({}) || false;

    const flatQuestions = questions.flatMap((writing) => writing.questions.map((q) => ({ ...q, writingId: writing.id })));

    const currentQuestion = flatQuestions[data.currentQuestionIndex];
    const currentWriting = questions.find((r) => r.id === currentQuestion.writingId)!;

    const handleAnswerChange = (questionId: number, value: string) => {
        if (value) {
            setData('answers', {
                ...data.answers,
                [questionId]: value,
            });
        } else {
            // Hapus key jika kosong
            const newAnswers = { ...data.answers };
            delete newAnswers[questionId];
            setData('answers', newAnswers);
        }
    };

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

    const handleSubmit = async () => {
        if (Object.values(data.answers).length < currentWriting.questions.length) {
            alert("Test isn't Finish !!!");
        }
        let totalScore = 0;

        for (const writing of questions) {
            for (const q of writing.questions) {
                const answer = data.answers[q.id];
                if (!answer) continue; // Lewatkan jika belum dijawab

                const payload = {
                    question: q.question,
                    answer: answer,
                };

                try {
                    const response = await fetch('http://127.0.0.1:5000/assess-writing', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });

                    const result = await response.json();

                    if (response.ok) {
                        const score = Number(result.assessment.score || 0);
                        totalScore += score;
                        console.log(`Score for question ${q.id}:`, score);
                    } else {
                        console.warn(`Skipping question ${q.id}:`, result.error);
                    }
                } catch (error) {
                    console.error(`Error processing question ${q.id}:`, error);
                }
            }
        }

        setData('score', totalScore);
    };

    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

    useEffect(() => {
        if (data.score !== 0) {
            post('/submit-test', data);
            onComplete(); // Ensuring it's called only after score updates
        }
    }, [data.score]);

    const propsNavigator = {
        props: data,
        setData: setData,
        sectionQuestions: questions,
        onComplete: onComplete,
        handleSubmit: handleSubmit,
        flagged: flagged,
    };

    return (
        <div className="flex w-full items-start justify-between gap-8">
            {/* NAVIGATOR */}
            <NavigatorBox propsNav={propsNavigator} />

            {/* Reading BOX */}
            <div className="max-h-[85vh] w-1/25 flex-1 space-y-4 overflow-auto rounded-sm bg-white p-4 shadow-sm">
                <p>Hint : Min 400 word </p>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{currentWriting.title}</h2>
                </div>

                <p className="text-sm break-words text-gray-700 select-none">{currentWriting.passage}</p>
            </div>

            {/* Question & Answer Box */}
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
                        {/* Answer */}
                        <div className="space-y-2">
                            <label htmlFor="answer" className="mb-1 block font-medium">
                                Your Answer
                            </label>
                            <textarea
                                id="answer"
                                key={`question-${currentQuestion.id}`}
                                name={`question-${currentQuestion.id}`}
                                className="min-h-[200px] w-full resize-none rounded border p-3"
                                placeholder="Type your answer here . . . ."
                                value={data.answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            />
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
});
export default WritingQuestion;
