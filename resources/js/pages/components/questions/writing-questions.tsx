import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Props } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { Flag, FlagOff } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import NavigatorBox from '../layouts/navigator-question';
import SubmissionLoading from '../utils/SubmissionLoading';

const SPEAKING_DRAFT_KEY = 'toefl-speaking-draft';

const getFallbackWritingScore = (answer: string) => {
    const wordCount = answer.split(/\s+/).filter((word) => word.length > 0).length;

    if (wordCount >= 250) return 15;
    if (wordCount >= 180) return 13;
    if (wordCount >= 120) return 11;
    if (wordCount >= 80) return 8;

    return 4;
};

const buildLocalWritingAssessment = (answer: string) => {
    const wordCount = answer.split(/\s+/).filter((word) => word.length > 0).length;
    const lowerAnswer = answer.toLowerCase();
    const baseScore = getFallbackWritingScore(answer);
    const hasTransitions = ['first', 'second', 'however', 'for example', 'in conclusion'].some((marker) => lowerAnswer.includes(marker));
    const hasExample = lowerAnswer.includes('for example') || lowerAnswer.includes('for instance');
    const grammarSignals = ['has make', 'it help', 'need go', 'also have', 'many information', 'students also distracted'];
    const hasGrammarIssues = grammarSignals.some((signal) => lowerAnswer.includes(signal));

    const criteriaScores = {
        'Development of Ideas': Math.min(15, Math.max(3, baseScore + 1)),
        'Organization & Coherence': Math.min(15, Math.max(3, baseScore + 2)),
        'Grammar & Language Use': Math.min(15, Math.max(2, baseScore - 2)),
        Vocabulary: Math.min(15, Math.max(3, baseScore)),
    };

    const averageScore = Number(
        (
            Object.values(criteriaScores).reduce((sum, value) => sum + value, 0) /
            Object.keys(criteriaScores).length
        ).toFixed(1),
    );

    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    if (wordCount >= 120) {
        strengths.push('Your position is clear, and you provide enough content to support your main opinion across multiple sentences.');
    } else {
        areasForImprovement.push('Your main idea is understandable, but it still needs fuller explanation and more specific support to feel convincing.');
    }

    if (hasTransitions) {
        strengths.push('Your essay shows a recognizable structure, and transition words help guide the reader from one point to the next.');
    } else {
        areasForImprovement.push('The organization would be stronger if you used clearer transitions to connect your ideas and paragraphs more smoothly.');
    }

    if (hasExample) {
        strengths.push('You include supporting detail that helps explain why your opinion makes sense in the context of the question.');
    } else {
        areasForImprovement.push('Each argument would be stronger with a more detailed and specific example instead of staying at a general level.');
    }

    if (hasGrammarIssues) {
        areasForImprovement.push('There are still some basic grammar errors, especially in verb forms and subject-verb agreement, which reduce overall accuracy.');
    } else {
        strengths.push('Most of your sentences are understandable, and the message remains clear even when the language is still fairly simple.');
    }

    if (!areasForImprovement.length) {
        areasForImprovement.push('To raise your score further, work on more precise grammar and more mature sentence variety.');
    }

    if (!strengths.length) {
        strengths.push('You answer the prompt directly and keep your response focused on the topic.');
    }

    return {
        score: averageScore,
        feedback: hasGrammarIssues
            ? 'Your essay communicates a clear position and has a workable structure, but several grammar errors and general supporting points keep it from scoring higher.'
            : 'Your essay communicates a clear position and shows an organized structure, and it would become stronger with more detailed explanation and more precise language.',
        strengths: strengths.slice(0, 3),
        areas_for_improvement: areasForImprovement.slice(0, 3),
        criteria_scores: criteriaScores,
        fallback: true,
    };
};

const WritingQuestion = forwardRef(function WritingQuestion({ onComplete, section, questions }: Props, ref) {
    const { data, setData } = useForm({
        answers: {} as Record<number, string>,
        assessments: {} as Record<number, { score: number; feedback: string; strengths?: string[]; areas?: string[] }>,
        currentIndex: 0,
        currentQuestionIndex: 0,
        score: 0,
        section: section,
    });

    const [flagged, setFlag] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [message, setMessage] = useState('');
    const [submissionMessage, setSubmissionMessage] = useState('Saving your essay and calculating score');

    const questionBlocks = Array.isArray(questions) ? (questions as any[]) : [questions as any];
    const flatQuestions = questionBlocks.flatMap((writing: any) => {
        if (Array.isArray(writing?.questions) && writing.questions.length > 0) {
            return writing.questions.map((q: any) => ({ ...q, writingId: writing.id }));
        }

        if (writing?.question) {
            return [
                {
                    ...(typeof writing.question === 'string' ? { question: writing.question } : writing.question),
                    writingId: writing.id,
                },
            ];
        }

        if (writing?.question_text) {
            return [
                {
                    id: writing.id,
                    question: writing.question_text,
                    writingId: writing.id,
                },
            ];
        }

        return [];
    });

    const currentQuestion = flatQuestions[data.currentQuestionIndex];
    const currentWriting = questionBlocks.find((r: any) => r?.id === currentQuestion?.writingId) ?? questionBlocks[0];

    // Safety check untuk memastikan currentWriting dan currentQuestion ada
    if (!currentQuestion || !currentWriting) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">No writing questions available</p>
                </div>
            </div>
        );
    }

    const handleAnswerChange = (questionId: number, value: string) => {
        setData('answers', {
            ...data.answers,
            [questionId]: value,
        });
    };

    const toggleFlag = (id: number) => {
        setFlag((prev) => ({ ...prev, [id]: !prev[id] }));
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
            // Last question → tampilkan dialog konfirmasi
            const unansweredQuestions = flatQuestions.filter((q) => !data.answers[q.id]);
            if (unansweredQuestions.length > 0) {
                setMessage(`You have ${unansweredQuestions.length} unanswered questions. Do you want to submit and proceed to the next section?`);
            } else {
                setMessage('Do you really want to submit and proceed to the next section?');
            }
            setOpenDialog(true);
        }
    };

    const handleButtonDialog = () => {
        const unansweredQuestions = flatQuestions.filter((q) => !data.answers[q.id]);
        if (unansweredQuestions.length > 0) {
            setMessage(`You have ${unansweredQuestions.length} unanswered questions. Do you want to submit and proceed to the next section ?`);
        } else {
            setMessage('Do you really want to submit and proceed to the next section ?');
        }
        setOpenDialog(false);
        setMessage('');
    };

    const handleSubmit = async () => {
        if (isSubmitting) return; // Prevent double submission

        setIsSubmitting(true);
        setSubmissionMessage('Saving your essay and calculating score');

        try {
            const answeredQuestions = flatQuestions.filter((q: any) => data.answers[q.id]?.trim());

            if (answeredQuestions.length === 0) {
                alert('Please answer at least one question before submitting.');
                setIsSubmitting(false);
                return;
            }

            const assessmentMap: Record<number, {
                score: number;
                feedback: string;
                strengths?: string[];
                areas_for_improvement?: string[];
                criteria_scores?: Record<string, number>;
                fallback?: boolean;
            }> = {};
            const scores = answeredQuestions.map((q: any) => {
                const answer = data.answers[q.id]?.trim();
                if (!answer) return 0;

                const localAssessment = buildLocalWritingAssessment(answer);
                assessmentMap[q.id] = localAssessment;

                return localAssessment.score;
            });

            const totalScore = scores.reduce((sum, score) => sum + score, 0);
            const sectionMaxScore = Math.min(flatQuestions.length * 15, 30);
            const finalScore = Math.min(totalScore, sectionMaxScore);

            setSubmissionMessage('Finalizing your test results');
            const pendingSpeakingSubmission = await collectPendingSpeakingDraftForSubmission();

            setData('score', finalScore);
            setData('assessments', assessmentMap);

            router.post('/submit-test', {
                section,
                score: finalScore,
                answers: data.answers,
                assessments: assessmentMap,
                assessments_json: JSON.stringify(assessmentMap),
                questionSnapshots,
                question_snapshots_json: JSON.stringify(questionSnapshots),
                pendingSpeakingSubmission,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    if (typeof window !== 'undefined') {
                        window.sessionStorage.removeItem(SPEAKING_DRAFT_KEY);
                    }
                    onComplete();
                },
                onFinish: () => setIsSubmitting(false),
            });
        } catch (error) {
            console.error('Error submitting writing test:', error);
            setIsSubmitting(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

    const collectPendingSpeakingDraftForSubmission = async () => {
        if (typeof window === 'undefined') {
            return null;
        }

        const rawDraft = window.sessionStorage.getItem(SPEAKING_DRAFT_KEY);
        if (!rawDraft) {
            return null;
        }

        let draft: {
            section?: string;
            answers?: Record<number, string>;
            assessments?: Record<number, { score?: number }>;
            questionSnapshots?: Record<number, unknown>;
            pendingQuestionIds?: number[];
        } | null = null;

        try {
            draft = JSON.parse(rawDraft);
        } catch (error) {
            console.error('Failed to parse speaking draft:', error);
            window.sessionStorage.removeItem(SPEAKING_DRAFT_KEY);
            return null;
        }

        const waitUntilReady = async () => {
            const timeoutAt = Date.now() + 30000;

            while (Date.now() < timeoutAt) {
                const latestRawDraft = window.sessionStorage.getItem(SPEAKING_DRAFT_KEY);
                if (!latestRawDraft) {
                    return null;
                }

                try {
                    const latestDraft = JSON.parse(latestRawDraft);
                    if (!Array.isArray(latestDraft.pendingQuestionIds) || latestDraft.pendingQuestionIds.length === 0) {
                        return latestDraft;
                    }
                } catch {
                    return null;
                }

                setSubmissionMessage('Speaking assessment is still processing. Finalizing results...');
                await new Promise((resolve) => window.setTimeout(resolve, 600));
            }

            const latestRawDraft = window.sessionStorage.getItem(SPEAKING_DRAFT_KEY);
            return latestRawDraft ? JSON.parse(latestRawDraft) : null;
        };

        const readyDraft = await waitUntilReady();
        if (!readyDraft?.answers || !readyDraft?.assessments || !readyDraft?.questionSnapshots) {
            return null;
        }

        const speakingScore = Math.min(
            30,
            Object.values(readyDraft.assessments).reduce((sum: number, assessment: { score?: number }) => {
                return sum + Number(assessment?.score ?? 0);
            }, 0),
        );

        return {
            section: readyDraft.section ?? 'speaking-question',
            score: Number(speakingScore.toFixed(1)),
            answers: readyDraft.answers,
            assessments: readyDraft.assessments,
            assessments_json: JSON.stringify(readyDraft.assessments),
            questionSnapshots: readyDraft.questionSnapshots,
            question_snapshots_json: JSON.stringify(readyDraft.questionSnapshots),
        };
    };

    // Get word count for current answer
    const getCurrentWordCount = () => {
        const answer = data.answers[(currentQuestion as any)?.id] || '';
        return answer
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
    };

    // Check if all questions are answered
    const allQuestionsAnswered = flatQuestions.every((q: any) => data.answers[q.id]?.trim());

    // Get progress percentage
    const answeredCount = Object.keys(data.answers).filter((key) => data.answers[parseInt(key)]?.trim()).length;
    const progressPercentage = (answeredCount / flatQuestions.length) * 100;

    const propsNavigator = {
        props: data,
        setData: setData,
        sectionQuestions: questionBlocks,
        onComplete: onComplete,
        handleSubmit: handleSubmit,
        flagged: flagged,
    };

    const questionSnapshots = Object.fromEntries(
        flatQuestions.map((question: any, index: number) => [
            question.id,
            {
                question: question.question,
                questionType: 'essay',
                passageTitle: (currentWriting as any)?.title ?? 'Writing Task',
                passage: (currentWriting as any)?.passage || (currentWriting as any)?.context || '',
                responseTime: (currentWriting as any)?.timeLimit ? Number((currentWriting as any).timeLimit) * 60 : null,
                order: index + 1,
                points: Math.round(30 / Math.max(flatQuestions.length, 1)),
            },
        ]),
    );

    const currentWordCount = getCurrentWordCount();
    const isMinWordsMet = currentWordCount >= 400;

    return (
        <>
            <SubmissionLoading isVisible={isSubmitting} message={submissionMessage} />

            <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                {/* NAVIGATOR */}
                <NavigatorBox propsNav={propsNavigator} />

                {/* Reading/Prompt BOX */}
                <div className="w-full flex-1 space-y-4 overflow-auto rounded-lg border border-gray-200 bg-white p-6 shadow-lg lg:max-h-[85vh] lg:w-1/3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <h2 className="text-xl font-bold text-gray-800">{(currentWriting as any)?.title ?? 'Writing Task'}</h2>
                        <div className="text-sm text-gray-500">Writing Section</div>
                    </div>

                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="font-semibold text-blue-800">Writing Guidelines</span>
                        </div>
                        <ul className="space-y-1 text-sm text-blue-700">
                            <li>• Minimum 400 words required</li>
                            <li>• Express your opinion clearly</li>
                            <li>• Use examples to support your points</li>
                            <li>• Check grammar and spelling</li>
                        </ul>
                    </div>

                    <div className="prose prose-sm max-w-none">
                        <p className="text-justify leading-relaxed text-gray-700">
                            {(currentWriting as any)?.passage || (currentWriting as any)?.context || 'Read the prompt carefully before answering.'}
                        </p>
                    </div>
                </div>

                {/* Question & Answer Box */}
                <div className="w-full lg:max-h-[100vh] lg:w-1/3">
                    <div className="max-h-[80vh] flex-1 space-y-4 overflow-auto rounded-t-lg border border-gray-200 bg-white p-6 shadow-lg">
                        <div key={(currentQuestion as any)?.id} className="flex flex-col gap-4">
                            <div className="flex justify-between gap-2 border-b border-gray-200 pb-3">
                                <div className="flex-1">
                                    <h3 className="mb-2 font-semibold text-gray-800">Question {data.currentQuestionIndex + 1}</h3>
                                    <p className="leading-relaxed text-gray-700">{(currentQuestion as any)?.question}</p>
                                </div>
                                <Button variant={'outline'} size="sm" onClick={() => toggleFlag((currentQuestion as any)?.id)}>
                                    {flagged[(currentQuestion as any)?.id] ? (
                                        <FlagOff className="h-4 w-4 text-red-600" />
                                    ) : (
                                        <Flag className="h-4 w-4 text-red-600" />
                                    )}
                                </Button>
                            </div>

                            {/* Answer Area */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="answer" className="block font-semibold text-gray-700">
                                        Your Essay
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                isMinWordsMet
                                                    ? 'bg-green-100 text-green-700'
                                                    : currentWordCount > 0
                                                      ? 'bg-yellow-100 text-yellow-700'
                                                      : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {currentWordCount} words
                                        </span>
                                        {isMinWordsMet && <span className="text-xs text-green-600">✓ Min requirement met</span>}
                                    </div>
                                </div>
                                <textarea
                                    id="answer"
                                    key={`question-${(currentQuestion as any)?.id}`}
                                    name={`question-${(currentQuestion as any)?.id}`}
                                    className="min-h-[200px] w-full resize-none rounded-lg border border-gray-300 p-4 text-sm leading-relaxed transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 lg:min-h-[300px]"
                                    placeholder="Write your essay here. Express your opinion clearly and support it with specific examples. Remember to aim for at least 400 words..."
                                    value={data.answers[(currentQuestion as any)?.id] || ''}
                                    onChange={(e) => handleAnswerChange((currentQuestion as any)?.id, e.target.value)}
                                />

                                {/* Progress indicator */}
                                <div className="h-1.5 rounded-full bg-gray-200">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${isMinWordsMet ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min((currentWordCount / 400) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-lg">
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <Button size="sm" variant="outline" onClick={handlePrev} disabled={data.currentQuestionIndex === 0} className="px-6">
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </Button>

                                <div className="text-center text-xs text-gray-500">
                                    <div>
                                        {answeredCount} of {flatQuestions.length} answered
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Question {data.currentQuestionIndex + 1} of {flatQuestions.length}
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className={`px-6 ${data.currentQuestionIndex === flatQuestions.length - 1 ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="mr-2 -ml-1 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            {data.currentQuestionIndex === flatQuestions.length - 1 ? 'Submit Writing' : 'Next'}
                                            {data.currentQuestionIndex < flatQuestions.length - 1 && (
                                                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Show completion status */}
                            {allQuestionsAnswered && (
                                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                                    <p className="text-sm text-green-700">✓ All questions answered! Ready to submit.</p>
                                </div>
                            )}

                            {/* Word count warning */}
                            {!isMinWordsMet && data.answers[(currentQuestion as any)?.id] && (
                                <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-center">
                                    <p className="text-sm text-yellow-700">
                                        ⚠️ Try to write at least {400 - currentWordCount} more words for a better score.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Dialog */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent
                        className="max-w-md"
                        onInteractOutside={(event) => {
                            event.preventDefault();
                            handleButtonDialog();
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <span>Section Status</span>
                            </DialogTitle>
                            <DialogDescription className="leading-relaxed text-gray-600">{message}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setOpenDialog(false)} // Cancel
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={() => {
                                    setOpenDialog(false);
                                    handleSubmit(); // Submit & next section
                                }}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                            >
                                Continue
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
});

export default WritingQuestion;
