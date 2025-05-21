// resources/js/pages/test-info.tsx
import { Button } from '@/components/ui/button';
import { Head, Link, usePage } from '@inertiajs/react';

const sections = [
    {
        id: 'general',
        title: 'General Information',
        content: [
            'In the <strong>Reading</strong> section, you will answer questions about reading passages. In this practice test, you will be able to review the correct answer for each question by reviewing the answer key at the end of the section.',
            'In the <strong>Listening</strong> section, you will answer questions about conversations and lectures. In this practice test, you will be able to review the correct answer for each question by reviewing the answer key at the end of the section.',
            'In the <strong>Speaking</strong> section, you will be presented with four questions. The first question is about a familiar topic. The other questions ask you to speak about reading passages, conversations, and lectures. In this practice test, your responses will not be scored. Instead, you will see sample responses to each question.',
            'In the <strong>Writing</strong> section, you will be presented with two writing tasks. The first task asks you to write about a reading passage and a lecture. The second task asks you to write a post for an academic discussion. In this practice test, your responses will not be scored. Instead, you will see sample responses to each question.',
        ],
        nextId: 'reading',
    },
    {
        id: 'reading',
        title: 'Reading Section Information',
        content: [
            'This section tests your ability to understand academic reading material.',
            'You will read passages and answer questions about them.',
        ],
        nextId: 'reading-question',
    },
    {
        id: 'listening',
        title: 'Listening Section Information',
        content: [
            'This section tests your ability to understand academic reading material.',
            'You will read passages and answer questions about them.',
        ],
        nextId: 'listening-question',
    },
    {
        id: 'speaking',
        title: 'Speaking Section Information',
        content: [
            'This section tests your ability to understand academic reading material.',
            'You will read passages and answer questions about them.',
        ],
        nextId: 'speaking-question',
    },
    {
        id: 'writing',
        title: 'Writing Section Information',
        content: [
            'This section tests your ability to understand academic reading material.',
            'You will read passages and answer questions about them.',
        ],
        nextId: 'writing-question',
    },
];

export default function TestInfoPage() {
    const { section } = usePage().props as { section?: string };

    const sectionId = section ?? 'general';

    const current = sections.find((s) => s.id === sectionId);

    if (!current) {
        return <div className="p-4">Section not found</div>;
    }

    return (
        <>
            <Head title={current.title} />
            <div className="flex h-screen w-full">
                <div className="flex w-full flex-col items-center justify-center gap-4 bg-[#F2F2F2] p-8">
                    <div className="flex w-3/4 flex-col gap-4">
                        <div className="w-max rounded-xl bg-white px-6 py-4 text-xl font-bold">
                            <h3 className="place-self-center font-bold">{current.title}</h3>
                        </div>
                        <div className="rounded bg-white p-6">
                            <ul className="list-disc space-y-4 pl-6">
                                {current.content.map((text, idx) => (
                                    <li key={idx} dangerouslySetInnerHTML={{ __html: text }} />
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-end">
                            <Link href={`/test/${current.nextId}`}>
                                <Button>Next</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
