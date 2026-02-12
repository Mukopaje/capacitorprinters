"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authService } from "@/services/auth"
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Store,
    Menu,
    X,
    User,
    ShoppingBag,
    BarChart,
    FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const userData = authService.getUser()
        if (!userData) {
            router.push("/login")
        } else {
            setUser(userData)
        }
    }, [router])

    const handleLogout = () => {
        authService.logout()
        router.push("/login")
    }

    if (!user) return null // Or loading spinner

    const getNavItems = () => {
        const role = user.role || 'user'

        const common = [
            { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
            { name: "Settings", href: "/dashboard/settings", icon: Settings },
        ]

        console.log("Logged in user role:", role)

        if (role.includes('admin')) {
            return [
                ...common,
                { name: "Users", href: "/dashboard/users", icon: Users },
                { name: "Resellers", href: "/dashboard/resellers", icon: Store },
                { name: "Reports", href: "/dashboard/reports", icon: BarChart },
            ]
        }

        if (role.includes('reseller')) {
            return [
                ...common,
                { name: "Clients", href: "/dashboard/clients", icon: Users },
                { name: "Earnings", href: "/dashboard/earnings", icon: CreditCard },
            ]
        }

        // Default User/Business Owner
        return [
            ...common,
            { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
            { name: "Inventory", href: "/dashboard/inventory", icon: FileText },
            { name: "Staff", href: "/dashboard/staff", icon: Users },
        ]
    }

    const navItems = getNavItems()

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900/50">
            {/* Sidebar for Desktop */}
            <aside className="hidden w-64 border-r bg-background md:block">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            Z
                        </div>
                        <span>ZPOS</span>
                    </Link>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Top Header */}
                <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <div className="flex h-16 items-center border-b px-6">
                                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                                        Z
                                    </div>
                                    <span>ZPOS</span>
                                </Link>
                            </div>
                            <nav className="flex flex-col gap-1 p-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === item.href
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <div className="ml-auto flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder-avatar.jpg" alt="@user" />
                                        <AvatarFallback>{user.firstName?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
