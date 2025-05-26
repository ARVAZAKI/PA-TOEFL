import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ListeningQuestion from './components/questions/listening-questions';
import ReadingQuestion from './components/questions/reading-questions';
import SpeakingQuestion from './components/questions/speaking-questions';
import WritingQuestion from './components/questions/writing-questions';

const questionPage = [
    {
        id: 'reading-question',
        component: ReadingQuestion,
        nextId: 'listening',
    },
    {
        id: 'listening-question',
        component: ListeningQuestion,
        nextId: 'speaking',
    },
    {
        id: 'speaking-question',
        component: SpeakingQuestion,
        nextId: 'writing',
    },
    {
        id: 'writing-question',
        component: WritingQuestion,
        nextId: 'scoreboard',
    },
];

export default function TestQuestion() {
    const { section } = usePage().props as { section?: string };

    const currentPage = questionPage.find((page) => page.id === section);

    const Component = currentPage?.component ?? (() => <div>Page not found</div>); // Selalu render sesuatu

    const handleComplete = () => {
        if (currentPage?.nextId === 'scoreboard') {
            router.visit('/scoreboard');
        } else if (currentPage?.nextId) {
            router.visit(`/test/${currentPage?.nextId}`);
        }
    };

    const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 menit x 60 detik

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Head title="Question Page">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            {/* {SECTION WRAPPER} */}
            <div className="flex h-screen w-full bg-[#F2F2F2]">
                {/* {SECTION WRAPPER} */}
                <div className="fixed top-0 flex h-16 w-full items-center justify-center bg-white">
                    <div className="w-[100px] rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white">Sisa {formatTime(timeLeft)}</div>
                </div>

                <div className="mt-[70px] flex w-full items-start justify-center bg-[#F2F2F2] p-4">
                    <div className="flex h-full w-full items-start justify-center overflow-hidden">
                        <Component onComplete={handleComplete} />
                    </div>
                </div>
            </div>
        </>
    );
}
