import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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
    const { props } = usePage();
    const [answeredCount, setAnsweredCount] = useState<boolean>(false);
    const { section, questions, answeredCounts } = usePage().props as unknown as {
        section?: string;
        questions?: any[];
        answeredCounts: {
            reading: boolean;
            listening: boolean;
            speaking: boolean;
            writing: boolean;
        };
    };

    const [openDialog, setOpenDialog] = useState(false);
    const [message, setMessage] = useState('');

    const [timeLeft, setTimeLeft] = useState(0.25 * 60); // 20 mins x 60 sec

    const sectionRef = useRef<{ handleSubmit: () => void }>(null); // access handlesubmit from child component

    const currentPage = questionPage.find((page) => page.id === section);
    const sectionActive = section?.replace('-question', ' section');

    const Component = currentPage?.component ?? (() => <div>Page not found</div>);

    const handleComplete = () => {
        if (currentPage?.nextId === 'scoreboard') {
            router.visit('/scoreboard');
        } else if (currentPage?.nextId) {
            router.visit(`/test/${currentPage?.nextId}`);
        }
    };

    const handleDialogSubmit = () => {
        if (sectionRef.current) {
            sectionRef.current.handleSubmit(); // trigger handleSubmit from child
        }
    };

    const handleButtonDialog = () => {
        if (timeLeft <= 1) {
            handleDialogSubmit();
        } else {
            handleComplete();
        }
        setOpenDialog(false);
        setMessage('');
    };

    useEffect(() => {
        console.log('awal :', answeredCount);
        switch (section) {
            case 'reading-question':
                setAnsweredCount(answeredCounts.reading);
                break;
            case 'listening-question':
                setAnsweredCount(answeredCounts.listening);
                break;
            case 'speaking-question':
                setAnsweredCount(answeredCounts.speaking);
                break;
            case 'writing-question':
                setAnsweredCount(answeredCounts.writing);
                break;
        }

        if (answeredCount) {
            setOpenDialog(true);
            setMessage(`You're already finished this test ${sectionActive} !`);
            return;
        }
        console.log(section);
        console.log('akhir :', answeredCount);

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    setOpenDialog(true);
                    setMessage('Your time for this section has expired. Please proceed to the next section or submit your answer.');
                    clearInterval(timer); // Stop timer saat 0
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [section, timeLeft]);

    const isWarning = timeLeft <= 300; // changes border timer

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
            <div className="flex h-screen w-full bg-[#F2F2F2]">
                {/* {SECTION WRAPPER} */}
                <div className="fixed top-0 flex h-16 w-full items-center justify-center bg-white">
                    <div
                        className={`w-[140px] place-items-center rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white ${isWarning ? 'bg-yellow-500' : 'bg-blue-600'}`}
                    >
                        <p>timer left : {formatTime(timeLeft)}</p>
                    </div>
                </div>

                <div className="mt-[70px] flex w-full items-start justify-center bg-[#F2F2F2] p-4">
                    <div className="flex h-full w-full items-start justify-center overflow-hidden">
                        <Component ref={sectionRef} onComplete={handleComplete} section={currentPage?.id} questions={questions} />
                        <Dialog open={openDialog} onOpenChange={setOpenDialog} modal={true}>
                            <DialogContent
                                onInteractOutside={(event) => {
                                    event.preventDefault(); // trigger handleSubmit when user click outside a component
                                    handleButtonDialog();
                                }}
                            >
                                <DialogHeader>
                                    <DialogTitle>Message</DialogTitle>
                                    <DialogDescription>{message}</DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        onClick={() => {
                                            handleButtonDialog();
                                        }}
                                        className="rounded bg-blue-500 px-4 py-2 text-white"
                                    >
                                        Next Section
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </>
    );
}
