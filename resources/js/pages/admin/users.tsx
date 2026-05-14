import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminUsers({ users = [] }: any) {
    return (
        <AdminLayout
            breadcrumbs={[{ title: 'Admin', href: '/admin' }, { title: 'Users', href: '/admin/users' }]}
        >
            <Head title="Admin - Users" />

            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-muted-foreground">List of registered users</p>
                    </div>
                    <Button>Create User</Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>Recent users and activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="text-left">
                                        <th className="px-2 py-2">ID</th>
                                        <th className="px-2 py-2">Name</th>
                                        <th className="px-2 py-2">Email</th>
                                        <th className="px-2 py-2">Role</th>
                                        <th className="px-2 py-2">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u: any) => (
                                        <tr key={u.id} className="border-t">
                                            <td className="px-2 py-3">{u.id}</td>
                                            <td className="px-2 py-3">{u.name}</td>
                                            <td className="px-2 py-3">{u.email}</td>
                                            <td className="px-2 py-3">{u.role}</td>
                                            <td className="px-2 py-3">{u.createdAt}</td>
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
