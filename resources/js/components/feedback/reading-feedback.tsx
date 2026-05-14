import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface ReadingQuestion {
    id: number;
    passage: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
}

interface ReadingFeedbackData {
    score: number;
    total: number;
    percentage: number;
    questions: ReadingQuestion[];
}

interface Props {
    data: ReadingFeedbackData;
}

export default function ReadingFeedback({ data }: Props) {
    if (data.questions.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
                No reading answers available yet.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Your Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{data.score}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">{data.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Percentage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.percentage}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Questions Review */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Question Review</h3>
                {data.questions.map((question) => (
                    <Card key={question.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {question.isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                        <CardTitle className="text-sm">Question {question.id}</CardTitle>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">{question.question}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Passage */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700 italic">
                                    {question.passage ? `${question.passage.substring(0, 150)}...` : 'Passage not available.'}
                                </p>
                            </div>

                            {/* Answer Comparison */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold mb-2">Your Answer</p>
                                    <div className={`p-3 rounded-lg border-2 ${
                                        question.isCorrect 
                                            ? 'bg-green-50 border-green-200' 
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <p className="font-bold text-lg">{question.userAnswer}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold mb-2">Correct Answer</p>
                                    <div className="p-3 rounded-lg bg-blue-50 border-2 border-blue-200">
                                        <p className="font-bold text-lg">{question.correctAnswer}</p>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
