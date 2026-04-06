import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Welcome Banner */}
                <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">
                                    Welcome back, {auth.user?.name}!
                                </h2>
                                <p className="text-blue-100">
                                    Ready to practice your English proficiency?
                                </p>
                            </div>
                            <Link href="/test/general">
                                <Button
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                                >
                                    Start TOEFL Test
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Sections Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: 'Reading', description: 'Academic passages & comprehension', icon: '📖', color: 'text-blue-600' },
                        { title: 'Listening', description: 'Conversations & lectures', icon: '🎧', color: 'text-green-600' },
                        { title: 'Speaking', description: 'Independent & integrated tasks', icon: '🎤', color: 'text-purple-600' },
                        { title: 'Writing', description: 'Academic discussion tasks', icon: '✍️', color: 'text-orange-600' },
                    ].map((section) => (
                        <Card key={section.title} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="text-3xl mb-1">{section.icon}</div>
                                <CardTitle className={`text-base ${section.color}`}>{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{section.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
