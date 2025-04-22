import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex h-screen w-full items-center justify-center bg-gray-200">
                <div className="flex h-1/2 w-full flex-col items-center justify-center gap-2">
                    <h1 className="text-xl font-medium">Welcome To Test TOEFL</h1>
                    <Button variant="default" size="default">
                        <Link href="/test">S T A R T</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
