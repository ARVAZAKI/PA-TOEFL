import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Top Right Nav */}
                <div className="absolute top-6 right-6 z-20">
                    {auth.user ? (
                        <Link href={(auth.user as any).role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                            <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                                Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <div className="flex gap-3">
                            <Link href="/login">
                                <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                                    Login
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Main Card */}
                <div className="relative w-full max-w-md">
                    {/* Decorative background blur */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25"></div>
                    
                    {/* Main content card */}
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
                        {/* Header Section */}
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                                Welcome to TOEFL Test
                            </h1>
                            <p className="text-gray-600 text-sm font-medium">
                                {auth.user
                                    ? `Hello, ${auth.user.name}! Ready to start your assessment?`
                                    : 'Please login to begin your assessment'}
                            </p>
                        </div>

                        {/* Action Section */}
                        {auth.user ? (
                            <div className="space-y-4">
                                <Link href="/test/general" className="block">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                                        <div className="flex items-center justify-center space-x-2">
                                            <span>Start Test</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </Button>
                                </Link>
                                <div className="grid grid-cols-2 gap-2 text-center text-xs text-gray-500">
                                    <div className="bg-blue-50 rounded-lg p-2">
                                        <div className="font-semibold text-blue-700">4 Sections</div>
                                        <div>Reading · Listening · Speaking · Writing</div>
                                    </div>
                                    <div className="bg-indigo-50 rounded-lg p-2">
                                        <div className="font-semibold text-indigo-700">Timed Test</div>
                                        <div>5 minutes per section</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Link href="/login" className="block">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
                                        Login to Start Test
                                    </Button>
                                </Link>

                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200/50">
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Your information is secure and private</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}