"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { authService } from "@/services/auth"
import {
    LayoutDashboard,
    Users,
    Settings,
    CreditCard,
    LogOut,
    Menu,
    Shield,
    Activity,
    MessageSquare,
    Network,
    Building,
    Smartphone,
    Monitor,
    Book
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AdminDashboardLayoutProps {
    children: React.ReactNode
}

const adminNavItems = [
    {
        title: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "User Management",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Businesses",
        href: "/admin/tenants",
        icon: Building,
    },
    {
        title: "Resellers",
        href: "/admin/resellers",
        icon: Network,
    },
    {
        title: "Communications",
        href: "/admin/communications",
        icon: MessageSquare,
    },
    {
        title: "Subscriptions",
        href: "/admin/subscriptions",
        icon: CreditCard,
    },
    {
        title: "Apps & Downloads",
        href: "/admin/apps",
        icon: Smartphone,
    },
    {
        title: "System Health",
        href: "/admin/health",
        icon: Activity,
    },
    {
        title: "Site Management",
        href: "/admin/site",
        icon: Monitor,
    },
    {
        title: "Knowledge Base",
        href: "/admin/knowledge-base/articles",
        icon: Book,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
]

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
    const pathname = usePathname()

    const [user, setUser] = React.useState<any>(null)

    React.useEffect(() => {
        setUser(authService.getUser())
    }, [])

    const handleLogout = () => {
        authService.logout()
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Mobile Sidebar */}
            <Sheet>
                <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:hidden">
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="mr-4">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <div className="flex w-full items-center justify-between">
                        <span className="font-bold text-lg">ZPOS Admin</span>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#30acb4] text-white">
                                {user?.firstName?.[0] || 'A'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
                        <div className="flex h-full flex-col">
                            <div className="h-16 flex items-center border-b px-6">
                                <span className="font-bold text-lg text-[#30acb4]">ZPOS Admin</span>
                            </div>
                            <div className="flex-1 overflow-auto py-4">
                                <nav className="grid items-start px-4 text-sm font-medium">
                                    {adminNavItems.map((item, index) => (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-[#30acb4] ${pathname === item.href ? "bg-[#30acb4]/10 text-[#30acb4]" : "text-muted-foreground"
                                                }`}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </SheetContent>
                </header>

                {/* Desktop Sidebar */}
                <aside className="hidden w-64 flex-col border-r bg-slate-50/50 dark:bg-slate-900/50 md:flex">
                    <div className="flex h-16 items-center border-b px-6">
                        <Link href="/admin" className="flex items-center gap-2 font-bold text-[#30acb4]">
                            <Shield className="h-6 w-6" />
                            <span>ZPOS Admin</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid items-start px-4 text-sm font-medium space-y-1">
                            {adminNavItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-[#30acb4] ${pathname === item.href ? "bg-[#30acb4]/10 text-[#30acb4] font-semibold" : "text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto border-t p-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar>
                                <AvatarFallback className="bg-[#30acb4] text-white">
                                    {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'D'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-sm truncate">
                                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground hover:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </Button>
                    </div>
                </aside>
            </Sheet>

            {/* Main Content */}
            <main className="flex-1 bg-background p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}
