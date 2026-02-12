import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

const footerLinks = {
    product: [
        { name: "Features", href: "/#features" },
        { name: "Pricing", href: "/#pricing" },
        { name: "Apps & Downloads", href: "/apps" },
        { name: "ZPOS Enterprise", href: "/signup?plan=enterprise" },
    ],
    company: [
        { name: "Partners", href: "/signup?role=reseller" },
        { name: "Contact", href: "mailto:hello@zpos.co.zm" },
    ],
    resources: [
        { name: "Apps", href: "/apps" },
        { name: "Support", href: "mailto:support@zpos.co.zm" },
    ],
    legal: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
    ],
}

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container py-12 md:py-16">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2">
                            <img src="/images/logo.png" alt="ZPOS Logo" className="h-8 w-auto" />
                        </Link>
                        <p className="mt-4 text-sm text-foreground/60 max-w-xs">
                            The modern Point of Sale solution for retail and hospitality businesses.
                            Manage inventory, sales, and staff from anywhere.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <Link href="https://facebook.com/zpos" target="_blank" className="text-foreground/60 hover:text-foreground">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="https://twitter.com/zpos" target="_blank" className="text-foreground/60 hover:text-foreground">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="https://instagram.com/zpos" target="_blank" className="text-foreground/60 hover:text-foreground">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="https://youtube.com/zpos" target="_blank" className="text-foreground/60 hover:text-foreground">
                                <Youtube className="h-5 w-5" />
                                <span className="sr-only">YouTube</span>
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Product</h3>
                        <ul className="space-y-2 text-sm">
                            {footerLinks.product.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-foreground/60 hover:text-foreground transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Company</h3>
                        <ul className="space-y-2 text-sm">
                            {footerLinks.company.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-foreground/60 hover:text-foreground transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            {footerLinks.resources.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-foreground/60 hover:text-foreground transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
                    <p>&copy; {new Date().getFullYear()} Outsource Now. All rights reserved.</p>
                    <div className="flex gap-6">
                        {footerLinks.legal.map((item) => (
                            <Link key={item.name} href={item.href} className="hover:text-foreground">
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
