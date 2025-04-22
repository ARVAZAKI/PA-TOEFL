import { Head, Link } from '@inertiajs/react';

const choices = ['Pasti benar', 'Kemungkinan besar benar', 'Pasti salah', 'Kemungkinan besar salah'];

export default function TestQuestion() {
    return (
        <>
            <Head title="Question Page">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex h-screen w-full">
                <div className="fixed top-0 flex h-16 w-full items-center justify-center bg-white">
                    <div className="w-[100px] rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white">Sisa 17:38</div>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-2 bg-[#F2F2F2]">
                    <div className="flex w-3/4 flex-col items-start justify-center gap-2">
                        <div className="flex items-start justify-between gap-8">
                            {/* QUESTIONS*/}
                            <div className="flex-1 space-y-4 rounded-sm bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">No. 20</h2>
                                </div>

                                <p className="text-sm leading-relaxed text-gray-700">
                                    Pesepeda dan pelari memiliki permasalahan yang mirip yaitu cedera lutut... <br />
                                    <br />
                                    Tono seorang pelari membaca artikel di atas. Lalu tono menyimpulkan bahwa deker lutut dapat ia gunakan untuk
                                    mencegah terjadinya cedera lutut saat ia berlari. Bagaimana kah kualitas simpulan tono?
                                </p>

                                <div className="space-y-2">
                                    {choices.map((choice, index) => (
                                        <label
                                            key={index}
                                            className="block cursor-pointer rounded-md border border-gray-300 px-4 py-2 hover:border-blue-500"
                                        >
                                            <input type="radio" name="answer" className="mr-2" />
                                            <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {choice}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* NAVIGATOR */}
                            <div className="w-[220px] space-y-4 rounded-lg border bg-white p-4 shadow-sm">
                                <div className="text-sm font-medium">Danur Isa Prabutama</div>
                                <div className="text-xs text-gray-500">Penalaran Umum</div>
                                <div className="text-xs text-gray-500">1 dari 30 Soal dikerjakan</div>

                                <div className="grid grid-cols-5 gap-2 text-sm">
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <button
                                            key={i}
                                            className={`h-8 w-8 rounded-full border text-center ${
                                                i === 19 ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-indigo-100'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button className="w-full rounded bg-orange-500 py-2 text-sm text-white hover:bg-orange-600">
                                    <Link href="/scoreboard">Selesai</Link>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
