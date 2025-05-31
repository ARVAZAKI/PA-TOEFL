import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Scoreboard() {
    const { auth } = usePage<SharedData>().props;
    const { props } = usePage();
    const { username } = usePage().props;
    const readingScore = props.readingScore || 0;
    const listeningScore = props.listeningScore || 0;
    const totalScore = readingScore + listeningScore;

    // console.log(readingScore);
    // console.log(listeningScore);

    return (
        <>
            <Head title="Scoreboard">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-gray-200">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="place-self-center">Test Result</CardTitle>
                            <CardDescription className="place-self-center">Here is your TOEFL Practice Test score.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                                <span className="font-medium">Name : {username}</span>
                            </div>
                            <div>
                                <span className="font-medium">Overall Score: {totalScore}</span>
                            </div>
                            <div className="space-y-1">
                                <div>
                                    <span className="font-medium">Reading : {readingScore}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Listening : {listeningScore}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Speaking :</span>
                                </div>
                                <div>
                                    <span className="font-medium">Writing :</span>
                                </div>
                                <div>
                                    <span className="font-bold">Total score : {totalScore}</span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="justify-end"> footer </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}
