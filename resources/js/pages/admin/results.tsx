import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminResults({ results = [] }: any) {
    const rows = results.data ? results.data : results;
    const currentPage = results.current_page ?? 1;
    const perPage = results.per_page ?? rows.length ?? 0;

    return (
        <AdminLayout
            breadcrumbs={[{ title: 'Admin', href: '/admin' }, { title: 'Results', href: '/admin/results' }]}
        >
            <Head title="Admin - Results" />

            <div className="p-6 space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">Test Results</h1>
                    <p className="text-muted-foreground">Completed test sessions</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>Latest completed sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="text-left">
                                        <th className="px-2 py-2">No</th>
                                        <th className="px-2 py-2">User</th>
                                        <th className="px-2 py-2">Email</th>
                                        <th className="px-2 py-2">Test</th>
                                        <th className="px-2 py-2">Total Score</th>
                                        <th className="px-2 py-2">Completed At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r: any, index: number) => (
                                        <tr key={r.id} className="border-t">
                                            <td className="px-2 py-3">{(currentPage - 1) * perPage + index + 1}</td>
                                            <td className="px-2 py-3">{r.user}</td>
                                            <td className="px-2 py-3">{r.email}</td>
                                            <td className="px-2 py-3">{r.test}</td>
                                            <td className="px-2 py-3">{r.totalScore}</td>
                                            <td className="px-2 py-3">{r.completedAt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
