import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function TestUnit() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Test Info">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex h-screen w-full">
                <div className="fixed top-0 h-16 w-full bg-white"></div>
                <div className="flex w-full flex-col items-center justify-center gap-2 bg-[#F2F2F2]">
                    <div className="flex w-3/4 flex-col items-start justify-center gap-2">
                        <div className="flex h-12 w-1/4 items-center justify-center rounded-sm border-solid bg-white">
                            <h1 className="p-2 font-bold">General Information</h1>
                        </div>
                        <div className="flex size-fit items-center rounded-sm border-solid bg-white">
                            <ul className="p-8">
                                <li>
                                    In the <strong>Reading</strong> section, you will answer questions about reading passages. In this practice test,
                                    you will be able to review the correct answer for each question by reviewing the answer key at the end of the
                                    section.
                                </li>
                                <li>
                                    In the <strong>Listening</strong> section, you will answer questions about conversations and lectures. In this
                                    practice test, you will be able to review the correct answer for each question by reviewing the answer key at the
                                    end of the section.
                                </li>
                                <li>
                                    In the <strong>Speaking</strong> section, you will be presented with four questions. The first question is about a
                                    familiar topic. The other questions ask you to speak about reading passages, conversations, and lectures. In this
                                    practice test, your responses will not be scored. Instead, you will see sample responses to each question.
                                </li>
                                <li>
                                    In the <strong>Writing</strong> section, you will be presented with two writing tasks. The first task asks you to
                                    write about a reading passage and a lecture. The second task asks you to write a post for an academic discussion.
                                    In this practice test, your responses will not be scored. Instead, you will see sample responses to each question.
                                </li>
                            </ul>
                        </div>
                        <Button variant="default" size="default" className="place-self-end">
                            <Link href="/question">Next</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
