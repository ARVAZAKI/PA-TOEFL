import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Edit, 
    Trash2, 
    Plus,
    Eye,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';

export default function ToeflManagement() {
    // Sample data - nanti akan diganti dengan data dari backend
    const toefls = [
        {
            id: 1,
            name: 'TOEFL Practice Test 1',
            status: 'active',
            totalQuestions: 120,
            sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
            completedCount: 456,
            createdAt: '2026-01-15',
        },
        {
            id: 2,
            name: 'TOEFL Practice Test 2',
            status: 'inactive',
            totalQuestions: 115,
            sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
            completedCount: 234,
            createdAt: '2026-02-01',
        },
        {
            id: 3,
            name: 'TOEFL Mock Exam',
            status: 'draft',
            totalQuestions: 0,
            sections: ['Reading', 'Listening', 'Speaking', 'Writing'],
            completedCount: 0,
            createdAt: '2026-03-01',
        },
    ];

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Admin', href: '/admin' },
                { title: 'TOEFL Tests', href: '/admin/toefls' },
            ]}
        >
            <Head title="Manage TOEFL Tests" />

            <div className="space-y-6 p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">TOEFL Tests Management</h1>
                        <p className="text-muted-foreground">Create and manage TOEFL practice tests</p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Test
                    </Button>
                </div>

                {/* Tests List */}
                <div className="grid gap-4">
                    {toefls.map((toefl) => (
                        <Card key={toefl.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle>{toefl.name}</CardTitle>
                                            <Badge 
                                                variant={
                                                    toefl.status === 'active' ? 'default' :
                                                    toefl.status === 'inactive' ? 'secondary' :
                                                    'outline'
                                                }
                                            >
                                                {toefl.status}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            Created on {new Date(toefl.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className={toefl.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                                        >
                                            {toefl.status === 'active' ? (
                                                <>
                                                    <ToggleRight className="mr-2 h-4 w-4" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft className="mr-2 h-4 w-4" />
                                                    Activate
                                                </>
                                            )}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Total Questions</p>
                                        <p className="text-2xl font-bold">{toefl.totalQuestions}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Sections</p>
                                        <p className="text-2xl font-bold">{toefl.sections.length}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Completed</p>
                                        <p className="text-2xl font-bold">{toefl.completedCount}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Avg. Score</p>
                                        <p className="text-2xl font-bold">
                                            {toefl.completedCount > 0 ? '85' : '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    {toefl.sections.map((section, idx) => (
                                        <Badge key={idx} variant="outline">
                                            {section}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
