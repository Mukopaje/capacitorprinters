"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
    CreditCard,
    LogOut,
    Menu,
    Box,
    Monitor
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardLayoutProps {
    children: React.ReactNode
}

const sidebarNavItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Sales",
        href: "/dashboard/sales",
        icon: ShoppingBag,
    },
    {
        title: "Inventory",
        href: "/dashboard/inventory",
        icon: Box,
    },
    {
        title: "Terminals",
        href: "/dashboard/terminals",
        icon: Monitor,
    },
    {
        title: "Staff",
        href: "/dashboard/staff",
        icon: Users,
    },
    {
        title: "Billing",
        href: "/dashboard/billing",
        icon: CreditCard,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()

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
                        <span className="font-bold text-lg">ZPOS Dashboard</span>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                    </div>
                    <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
                        <div className="flex h-full flex-col">
                            <div className="h-16 flex items-center border-b px-6">
                                <span className="font-bold text-lg">ZPOS</span>
                            </div>
                            <div className="flex-1 overflow-auto py-4">
                                <nav className="grid items-start px-4 text-sm font-medium">
                                    {sidebarNavItems.map((item, index) => (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
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
                        <Link href="/" className="flex items-center gap-2 font-bold">
                            <div className="h-6 w-6 bg-blue-600 rounded-md"></div>
                            <span>ZPOS</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid items-start px-4 text-sm font-medium space-y-1">
                            {sidebarNavItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === item.href ? "bg-blue-100/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold" : "text-muted-foreground hover:bg-muted"
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
                                <AvatarImage src="" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <p className="font-medium">John Doe</p>
                                <p className="text-xs text-muted-foreground">mybusiness@zpos.com</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive">
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
