import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { 
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuButton, 
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent
} from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    LayoutDashboard,
    FileText,
    BookOpen,
    Headphones,
    Mic,
    PenTool,
    Users,
    BarChart3,
    Settings,
    FolderOpen,
    HelpCircle
} from 'lucide-react';
import AppLogo from '../app-logo';

const mainNavGroups: NavGroup[] = [
    {
        title: 'Main Menu',
        items: [
            {
                title: 'Dashboard',
                url: '/admin/dashboard',
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Question Management',
        items: [
            {
                title: 'Reading Questions',
                url: '/admin/questions/reading',
                icon: BookOpen,
            },
            {
                title: 'Listening Questions',
                url: '/admin/questions/listening',
                icon: Headphones,
            },
            {
                title: 'Speaking Questions',
                url: '/admin/questions/speaking',
                icon: Mic,
            },
            {
                title: 'Writing Questions',
                url: '/admin/questions/writing',
                icon: PenTool,
            },
        ],
    },
    {
        title: 'Management',
        items: [
            {
                title: 'Users',
                url: '/admin/users',
                icon: Users,
            },
            {
                title: 'Test Results',
                url: '/admin/results',
                icon: BarChart3,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        url: '/admin/settings',
        icon: Settings,
    },
    {
        title: 'Help & Support',
        url: '/admin/help',
        icon: HelpCircle,
    },
];

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">TOEFL System</span>
                                    <span className="text-xs text-muted-foreground">Admin Panel</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {mainNavGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <NavMain items={group.items} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
