"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

const navigation = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Products", href: "/#products" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Apps", href: "/apps" },
    { name: "Docs", href: "/docs" },
]

import { authService } from "@/services/auth"

export function Header() {
    const [isOpen, setIsOpen] = React.useState(false)
    const pathname = usePathname()
    const [user, setUser] = React.useState<any>(null)

    React.useEffect(() => {
        setUser(authService.getUser())
    }, [])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <img src="/images/logo.png" alt="ZPOS Logo" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`transition-colors hover:text-foreground/80 ${pathname === item.href ? "text-foreground" : "text-foreground/60"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href={user.role.includes('admin') ? '/admin' : '/dashboard'}>Dashboard</Link>
                                </Button>
                                <Button variant="outline" onClick={() => authService.logout()}>
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col gap-4 mt-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="flex flex-col gap-2 mt-4">
                                    {user ? (
                                        <>
                                            <Button variant="outline" asChild className="w-full justify-start">
                                                <Link href={user.role.includes('admin') ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)}>
                                                    Dashboard
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" className="w-full justify-start" onClick={() => { authService.logout(); setIsOpen(false); }}>
                                                Log out
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="outline" asChild className="w-full justify-start">
                                                <Link href="/login" onClick={() => setIsOpen(false)}>Log in</Link>
                                            </Button>
                                            <Button asChild className="w-full justify-start">
                                                <Link href="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
