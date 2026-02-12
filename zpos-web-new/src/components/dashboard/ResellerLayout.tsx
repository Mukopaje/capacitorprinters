"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Settings,
    CreditCard,
    LogOut,
    Menu,
    Briefcase,
    FileText
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ResellerDashboardLayoutProps {
    children: React.ReactNode
}

const resellerNavItems = [
    {
        title: "Overview",
        href: "/reseller",
        icon: LayoutDashboard,
    },
    {
        title: "My Clients",
        href: "/reseller/clients",
        icon: Users,
    },
    {
        title: "Earnings",
        href: "/reseller/earnings",
        icon: CreditCard,
    },
    {
        title: "Resources",
        href: "/reseller/resources",
        icon: FileText,
    },
    {
        title: "Settings",
        href: "/reseller/settings",
        icon: Settings,
    },
]

export default function ResellerDashboardLayout({ children }: ResellerDashboardLayoutProps) {
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
                        <span className="font-bold text-lg">Reseller Portal</span>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-green-500 text-white">RE</AvatarFallback>
                        </Avatar>
                    </div>
                    <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
                        <div className="flex h-full flex-col">
                            <div className="h-16 flex items-center border-b px-6">
                                <span className="font-bold text-lg text-green-600">Reseller Portal</span>
                            </div>
                            <div className="flex-1 overflow-auto py-4">
                                <nav className="grid items-start px-4 text-sm font-medium">
                                    {resellerNavItems.map((item, index) => (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-green-600 ${pathname === item.href ? "bg-green-100 text-green-600" : "text-muted-foreground"
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
                        <Link href="/reseller" className="flex items-center gap-2 font-bold text-green-600">
                            <Briefcase className="h-6 w-6" />
                            <span>Reseller Portal</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid items-start px-4 text-sm font-medium space-y-1">
                            {resellerNavItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-green-600 ${pathname === item.href ? "bg-green-100 text-green-600 dark:bg-green-900/20 font-semibold" : "text-muted-foreground hover:bg-muted"
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
                                <AvatarFallback className="bg-green-500 text-white">RE</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <p className="font-medium">Reseller Partner</p>
                                <p className="text-xs text-muted-foreground">partner@zpos.com</p>
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
