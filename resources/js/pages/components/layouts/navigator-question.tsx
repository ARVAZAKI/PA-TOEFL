// type Props = {
//     onComplete: () => void;
// };

import { usePage } from '@inertiajs/react';

type Tquestionpage = {
    id: string;
    component: () => void;
    nextId: string;
};

type NavigatorBoxProps = {
    propsNav: {
        props: {
            answers: Record<number, string>;
            currentQuestionIndex: number;
        };
        setData: (field: string, value: any) => void;
        sectionQuestions: any[];
        handleSubmit: () => void;
    };
};

export default function NavigatorBox({ propsNav }: NavigatorBoxProps) {
    const { props, setData, sectionQuestions, handleSubmit } = propsNav;
    const { section } = usePage().props as { section?: string };

    const { username } = usePage().props;

    const flatQuestions = sectionQuestions.flatMap((reading) =>
        reading.questions.map((question: any) => ({
            ...question,
            readingId: reading.id,
        })),
    );

    const handleNavigateIndex = (questionIndex: number) => {
        const question = flatQuestions[questionIndex];
        const readingIndex = sectionQuestions.findIndex((r) => r.id === question.readingId);

        setData('currentIndex', readingIndex); // ubah reading yg ditampilkan
        setData('currentQuestionIndex', questionIndex); // pindah ke soal yg sesuai
    };

    return (
        <div className="w-1/6 space-y-4 rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm font-medium">{username}</div>
            <div className="text-xs text-gray-500">{section} Navigator</div>
            <div className="text-xs text-gray-500">
                {Object.keys(props.answers).length} dari {flatQuestions.length} soal telah dikerjakan
            </div>

            <div className="grid grid-cols-5 gap-2 text-sm">
                {flatQuestions.map((q, i) => {
                    const isActive = props.currentQuestionIndex === i;
                    const isAnswered = props.answers.hasOwnProperty(q.id);

                    return (
                        <button
                            key={q.id}
                            className={`h-8 w-8 cursor-pointer rounded-full border text-center ${
                                isActive ? 'bg-indigo-600 text-white' : isAnswered ? 'bg-green-700 text-white' : 'bg-gray-100 hover:bg-indigo-100'
                            }`}
                            onClick={() => handleNavigateIndex(i)}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            <button onClick={handleSubmit} type="submit" className="w-full rounded bg-orange-500 py-2 text-sm text-white hover:bg-orange-600">
                Submit
            </button>
        </div>
    );
}
