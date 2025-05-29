import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';

export default function Welcome() {
    const { data, setData, post } = useForm({
        username: '',
        //   email: '',
    });
    const { auth } = usePage<SharedData>().props;

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post('/submit-session'); // Kirim ke backend Laravel
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex h-screen w-full items-center justify-center bg-gray-200">
                <div className="flex h-1/2 w-full flex-col items-center justify-center gap-2">
                    {/* <input type="text" name="username" id="username" placeholder="Masukkan username...." className="form-control" /> */}
                    <form className="my-6 grid gap-2 border border-black p-4" onSubmit={handleSubmit}>
                        <div className="cursor-pointer border border-black p-4">
                            <Button variant="default" size="default" type="submit">
                                {/* <Link href="/test"> */}
                                <h1 className="text-xl font-medium">Welcome To Test TOEFL</h1>
                                {/* </Link> */}
                            </Button>
                        </div>
                        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-black">username</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="Masukkan username...."
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                        {/* <Button variant="default" size="default">
                            <Link href="/test">S T A R T</Link>
                        </Button> */}
                        <h1 className="text-xl font-medium">Welcome To Test TOEFL</h1>
                    </form>
                    {/* <input type="text" name='username' id='username' placeholder='Masukkan username....'/> */}
                </div>
            </div>
        </>
    );
}
