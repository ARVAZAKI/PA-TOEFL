import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function Scoreboard() {
    const { auth } = usePage<SharedData>().props;
    const { props } = usePage();
    const { username } = usePage().props as { username?: string };
    const readingScore = Number(props.readingScore) || 0;
    const listeningScore = Number(props.listeningScore) || 0;
    const speakingScore = Number(props.speakingScore) || 0;
    const writingScore = Number(props.writingScore) || 0;
    const totalScore = readingScore + listeningScore + speakingScore + writingScore;
    const maxScore = 30;

    const progressWidth = (score: number) => {
        return (score / maxScore) * 100;
    };

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
                                <span className="font-medium">
                                    Overall Score: {totalScore} / {maxScore * 4}
                                </span>
                            </div>
                            <div className="gap-8 sm:grid sm:grid-rows-1">
                                <div>
                                    <dl>
                                        <h3 className="font-medium">Reading</h3>
                                        <dd className="mb-3 flex w-full items-center">
                                            <div className="me-2 h-2.5 w-1/2 rounded-sm bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className="h-2.5 rounded-sm bg-blue-600 dark:bg-blue-500"
                                                    style={{ width: `${progressWidth(readingScore)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex w-1/3 justify-between gap-2">
                                                <p className="text-sm font-medium text-gray-600">
                                                    <span>{readingScore}</span> / <span>{maxScore}</span>
                                                </p>
                                                <p className="text-sm font-medium text-gray-600">Interdimate</p>
                                            </div>
                                        </dd>
                                    </dl>
                                    <dl>
                                        <h3 className="font-medium">Listening</h3>
                                        <dd className="mb-3 flex w-full items-center">
                                            <div className="me-2 h-2.5 w-1/2 rounded-sm bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className="h-2.5 rounded-sm bg-blue-600 dark:bg-blue-500"
                                                    style={{ width: `${progressWidth(listeningScore)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex w-1/3 justify-between gap-2">
                                                <p className="text-sm font-medium text-gray-600">
                                                    {listeningScore} / {maxScore}
                                                </p>
                                                <p className="text-sm font-medium text-gray-600">Interdimate</p>
                                            </div>
                                        </dd>
                                    </dl>
                                    <dl>
                                        <h3 className="font-medium">Speaking</h3>
                                        <dd className="mb-3 flex items-center">
                                            <div className="me-2 h-2.5 w-1/2 rounded-sm bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className="h-2.5 rounded-sm bg-blue-600 dark:bg-blue-500"
                                                    style={{ width: `${progressWidth(speakingScore)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex w-1/3 justify-between gap-2">
                                                <p className="text-sm font-medium text-gray-600">
                                                    {speakingScore} / {maxScore}
                                                </p>
                                                <p className="text-sm font-medium text-gray-600">Interdimate</p>
                                            </div>
                                        </dd>
                                    </dl>
                                    <dl>
                                        <h3 className="font-medium">Writing</h3>
                                        <dd className="flex items-center">
                                            <div className="me-2 h-2.5 w-1/2 rounded-sm bg-gray-200 dark:bg-gray-700">
                                                <div
                                                    className="h-2.5 rounded-sm bg-blue-600 dark:bg-blue-500"
                                                    style={{ width: `${progressWidth(writingScore)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex w-1/3 justify-between gap-2">
                                                <p className="text-sm font-medium text-gray-600">
                                                    <span>{writingScore}</span> / <span>{maxScore}</span>
                                                </p>
                                                <p className="text-sm font-medium text-gray-600">Interdimate</p>
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                            {/* <div className="space-y-1">
                                <div>
                                    <span className="font-medium">
                                        Reading : {readingScore} / {maxScore}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">
                                        Listening : {listeningScore} / {maxScore}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">
                                        Speaking : {speakingScore} / {maxScore}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">
                                        Writing : {writingScore} / {maxScore}
                                    </span>
                                </div>
                            </div> */}
                        </CardContent>

                        <CardFooter className="justify-end"> footer </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}
