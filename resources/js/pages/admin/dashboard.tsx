import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Users, 
    FileText, 
    CheckCircle, 
    Clock,
    TrendingUp,
    ArrowUpRight,
    BookOpen,
    Headphones,
    Mic,
    PenTool
} from 'lucide-react';

export default function AdminDashboard() {
    // Sample data - nanti akan diganti dengan data dari backend
    const stats = [
        {
            title: 'Total Users',
            value: '1,234',
            change: '+12.5%',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Active Tests',
            value: '45',
            change: '+5.2%',
            icon: FileText,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Completed Today',
            value: '89',
            change: '+23.1%',
            icon: CheckCircle,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'In Progress',
            value: '12',
            change: '-4.3%',
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    const questionStats = [
        { section: 'Reading', count: 120, icon: BookOpen, color: 'bg-blue-500' },
        { section: 'Listening', count: 95, icon: Headphones, color: 'bg-green-500' },
        { section: 'Speaking', count: 48, icon: Mic, color: 'bg-purple-500' },
        { section: 'Writing', count: 36, icon: PenTool, color: 'bg-orange-500' },
    ];

    const recentTests = [
        { id: 1, user: 'John Doe', test: 'TOEFL Practice Test 1', score: 95, date: '2 hours ago' },
        { id: 2, user: 'Jane Smith', test: 'TOEFL Practice Test 1', score: 87, date: '5 hours ago' },
        { id: 3, user: 'Bob Wilson', test: 'TOEFL Practice Test 2', score: 92, date: '1 day ago' },
        { id: 4, user: 'Alice Brown', test: 'TOEFL Practice Test 1', score: 78, date: '1 day ago' },
        { id: 5, user: 'Charlie Davis', test: 'TOEFL Practice Test 2', score: 85, date: '2 days ago' },
    ];

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin' },
                { title: 'Dashboard', href: '/admin/dashboard' },
            ]}
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
                    </div>
                    <Button>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Reports
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <div className={`${stat.bgColor} rounded-lg p-2`}>
                                        <Icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                        {stat.change} from last month
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Question Bank Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Question Bank Statistics</CardTitle>
                        <CardDescription>Total questions available by section</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {questionStats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={index} className="flex items-center gap-4 rounded-lg border p-4">
                                        <div className={`${stat.color} rounded-lg p-3 text-white`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stat.count}</p>
                                            <p className="text-sm text-muted-foreground">{stat.section}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Tests */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Test Submissions</CardTitle>
                            <CardDescription>Latest completed tests from students</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                            View All
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTests.map((test) => (
                                <div key={test.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                                            {test.user.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-medium">{test.user}</p>
                                            <p className="text-sm text-muted-foreground">{test.test}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">{test.score}</p>
                                            <p className="text-xs text-muted-foreground">Score</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">{test.date}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions removed as requested */}
            </div>
        </AdminLayout>
    );
}
