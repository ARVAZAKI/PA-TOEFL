import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import ReadingFeedback from '@/components/feedback/reading-feedback';
import ListeningFeedback from '@/components/feedback/listening-feedback';
import SpeakingFeedback from '@/components/feedback/speaking-feedback';
import WritingFeedback from '@/components/feedback/writing-feedback';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, ClipboardList, Sparkles } from 'lucide-react';

interface SectionBase {
    score: number;
    total: number;
}

interface ReadingQuestion {
    id: number;
    passage: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
}

interface ListeningQuestion {
    id: number;
    audio: string | null;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
}

interface SpeakingQuestion {
    id: number;
    task: string;
    userTranscript: string;
    audioFile: string | null;
    score: number | null;
    maxScore: number;
    feedback: string;
    strengths: string[];
    areasForImprovement: string[];
    criteriaScores: Record<string, number>;
    isFallback: boolean;
}

interface WritingQuestion {
    id: number;
    task: string;
    userAnswer: string;
    score: number | null;
    maxScore: number;
    feedback: string;
    strengths: string[];
    areasForImprovement: string[];
    criteriaScores: Record<string, number>;
    isFallback: boolean;
}

interface FeedbackData {
    testTitle: string;
    testDate: string;
    overallScore: number;
    reading: SectionBase & { percentage: number; questions: ReadingQuestion[] };
    listening: SectionBase & { percentage: number; questions: ListeningQuestion[] };
    speaking: SectionBase & { questions: SpeakingQuestion[] };
    writing: SectionBase & { questions: WritingQuestion[] };
}

interface Props {
    feedback: FeedbackData | null;
}

const formatOverallScore = (score: number) => Number(score || 0).toFixed(1);

export default function Feedback({ feedback }: Props) {
    if (!feedback) {
        return (
            <AppLayout>
                <Head title="Test Feedback" />
                <div className="space-y-6">
                    <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-6 text-white shadow-2xl sm:p-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Test Feedback</h1>
                            <p className="max-w-xl text-sm text-blue-100 sm:text-base">
                                No feedback data is available yet. Complete a test to see your results here.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline" className="border-slate-200 bg-white/80 hover:bg-white">
                            <Link href="/scoreboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Scoreboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Test Feedback" />
            
            <div className="space-y-6">
                <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-6 text-white shadow-2xl sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-white/15 text-white hover:bg-white/20">Feedback Center</Badge>
                                <Badge className="bg-cyan-400/20 text-cyan-50 hover:bg-cyan-400/25">Live data</Badge>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{feedback.testTitle}</h1>
                                <p className="max-w-xl text-sm text-blue-100 sm:text-base">
                                    Review selected answers, correct answers, speech transcript, and AI feedback for each section.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-blue-50">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                                    <CalendarDays className="h-4 w-4" /> {feedback.testDate}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                                    <ClipboardList className="h-4 w-4" /> Reading, Listening, Speaking, Writing
                                </span>
                            </div>
                        </div>

                        <Card className="w-full max-w-xs border-0 bg-white/95 text-slate-900 shadow-xl backdrop-blur lg:w-auto">
                            <CardHeader className="pb-3">
                                <CardDescription className="flex items-center gap-2 text-slate-500">
                                    <Sparkles className="h-4 w-4 text-blue-600" /> Overall Score
                                </CardDescription>
                                <CardTitle className="text-5xl font-black text-blue-600">{formatOverallScore(feedback.overallScore)}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600">Your overall performance on this test</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" className="border-slate-200 bg-white/80 hover:bg-white">
                        <Link href="/scoreboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Scoreboard
                        </Link>
                    </Button>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Detailed Feedback by Section</CardTitle>
                        <CardDescription>Review your answers and AI feedback for each section</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full space-y-3">
                            <AccordionItem value="reading">
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-semibold">Reading</span>
                                        <span className="text-sm text-gray-600">
                                                    Score: {feedback.reading.score}/{feedback.reading.total}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pt-4">
                                                <ReadingFeedback data={feedback.reading} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="listening">
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-semibold">Listening</span>
                                        <span className="text-sm text-gray-600">
                                                    Score: {feedback.listening.score}/{feedback.listening.total}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pt-4">
                                                <ListeningFeedback data={feedback.listening} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="speaking">
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-semibold">Speaking</span>
                                        <span className="text-sm text-gray-600">
                                                    Score: {feedback.speaking.score}/{feedback.speaking.total}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pt-4">
                                                <SpeakingFeedback data={feedback.speaking} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="writing">
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-semibold">Writing</span>
                                        <span className="text-sm text-gray-600">
                                                    Score: {feedback.writing.score}/{feedback.writing.total}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pt-4">
                                                <WritingFeedback data={feedback.writing} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
