import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface WritingQuestion {
    id: number;
    task: string;
    userAnswer: string;
    score: number | null;
    maxScore: number;
    feedback: string;
    strengths: string[];
    areasForImprovement: string[];
    isFallback: boolean;
}

interface WritingFeedbackData {
    score: number;
    total: number;
    questions: WritingQuestion[];
}

interface Props {
    data: WritingFeedbackData;
}

export default function WritingFeedback({ data }: Props) {
    const rawAverageScore =
        data.questions.length > 0
            ? (
                  data.questions.reduce((sum, question) => sum + (question.score ?? 0), 0) / data.questions.length
              ).toFixed(1)
            : '0.0';

    if (data.questions.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
                No writing answers available yet.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Your Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{data.score}/{data.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Average Gemini Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{rawAverageScore}/15</div>
                    </CardContent>
                </Card>
            </div>

            {/* Questions Review */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Essay Review</h3>
                {data.questions.map((question) => (
                    <Card key={question.id}>
                        <CardHeader>
                            <CardTitle className="text-sm">Essay {question.id}</CardTitle>
                            <p className="text-sm text-gray-600 font-medium mt-2">{question.task}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    Score: {question.score?.toFixed(1) ?? '0.0'}/{question.maxScore}
                                </span>
                                {question.isFallback && (
                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                        Fallback review
                                    </span>
                                )}
                            </div>

                            {/* User's Answer */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 font-semibold mb-3">Your Essay</p>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {question.userAnswer || 'No answer available.'}
                                </p>
                            </div>

                            {/* AI Feedback */}
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm font-semibold text-purple-900 mb-2">AI Feedback (Gemini)</p>
                                        <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-wrap">
                                            {question.feedback || 'Feedback not available yet.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {question.strengths.length > 0 && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <p className="text-xs text-green-800 font-semibold mb-3">Strengths</p>
                                    <ul className="space-y-2 text-sm text-green-700">
                                        {question.strengths.map((strength, index) => (
                                            <li key={`${question.id}-strength-${index}`}>- {strength}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {question.areasForImprovement.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-900 font-semibold mb-3">Areas for Improvement</p>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        {question.areasForImprovement.map((area, index) => (
                                            <li key={`${question.id}-area-${index}`}>- {area}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
