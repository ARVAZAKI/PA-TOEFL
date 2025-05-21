import { useForm } from '@inertiajs/react';

type Props = {
    onComplete: () => void;
};

const questions = [
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    { question: 'Tono membaca artikel dan menyimpulkan...', choices: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
    // Tambahkan soal lainnya...
];

export default function ReadingQuestion({ onComplete }: Props) {
    const { data, setData, post } = useForm({
        answers: {} as Record<number, string>,
        currentQuestionIndex: 1,
        correctCount: 0,
    });

    const handleSelectAnswer = (choice: string) => {
        setData('answers', { ...data.answers, [data.currentQuestionIndex]: choice });
    };

    const handleNavigateQuestion = (index: number) => {
        setData('currentQuestionIndex', index);
    };

    const handleSubmit = () => {
        let correctCount = 0; // Start with 0 correct answers
        let answeredCount = Object.keys(data.answers).length;

        // Loop through the questions and check if the user's answers are correct
        for (let i = 0; i < questions.length; i++) {
            const userAnswer = data.answers[i + 1]; // because currentQuestionIndex starts from 1
            const correctAnswer = questions[i].correctAnswer;

            if (userAnswer === correctAnswer) {
                correctCount++;
            }
        }

        // Update the correctCount in the form data

        setData('correctCount', correctCount);
        // Submit the data
        post('/submit-test', {
            // correctCount,
            onStart: () => console.log('start'),

            onError: (errors) => {
                console.log('error:', errors);
            },
            onFinish: () => {
                console.log('finish');
                setTimeout(() => {
                    onComplete();
                }, 5);
            },
        });
    };

    const currentQuestion = questions[data.currentQuestionIndex - 1];

    return (
        <div className="flex items-start justify-between gap-8">
            <div className="flex-1 space-y-4 rounded-sm bg-white p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">No. {data.currentQuestionIndex}</h2>
                </div>
                {/* QUESTIONS */}
                <p className="text-sm leading-relaxed text-gray-700">{currentQuestion.question}</p>

                {/* Answer */}
                <div className="space-y-2">
                    {currentQuestion.choices.map((choice, index) => (
                        <label
                            key={index}
                            className={`block cursor-pointer rounded-md border px-4 py-2 hover:border-blue-500 ${
                                data.answers[data.currentQuestionIndex] === choice ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                        >
                            <input
                                type="radio"
                                name="answer"
                                value={choice}
                                className="mr-2"
                                checked={data.answers[data.currentQuestionIndex] === choice}
                                onChange={() => handleSelectAnswer(choice)}
                            />
                            <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {choice}
                        </label>
                    ))}
                </div>
            </div>

            {/* NAVIGATOR */}
            <div className="w-[220px] space-y-4 rounded-lg border bg-white p-4 shadow-sm">
                <div className="text-sm font-medium">Danur Isa Prabutama</div>
                <div className="text-xs text-gray-500">Penalaran Umum</div>
                <div className="text-xs text-gray-500">
                    {data.currentQuestionIndex} dari {questions.length} Soal dikerjakan
                </div>

                <div className="grid grid-cols-5 gap-2 text-sm">
                    {questions.map((_, i) => {
                        const questionNumber = i + 1;
                        return (
                            <button
                                key={questionNumber}
                                className={`h-8 w-8 cursor-pointer rounded-full border text-center ${
                                    data.currentQuestionIndex === questionNumber
                                        ? 'bg-indigo-600 text-white'
                                        : data.answers[questionNumber]
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gray-100 hover:bg-indigo-100'
                                }`}
                                onClick={() => handleNavigateQuestion(questionNumber)}
                            >
                                {questionNumber}
                            </button>
                        );
                    })}
                </div>

                {/* <button className="w-full rounded bg-orange-500 py-2 text-sm text-white hover:bg-orange-600">Selesai</button> */}
                <button onClick={handleSubmit} className="w-full rounded bg-orange-500 py-2 text-sm text-white hover:bg-orange-600">
                    Selesai
                </button>
            </div>
        </div>
    );
}
