"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Download,
    Smartphone,
    Monitor,
    Apple,
    ChevronRight,
    ShieldCheck,
    Zap,
    Cloud
} from "lucide-react"
import { appsService, AppBinary } from "@/services/apps"

export default function DownloadsPage() {
    const [apps, setApps] = useState<AppBinary[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        appsService.getPublicApps()
            .then(setApps)
            .catch(err => console.error("Failed to fetch apps", err))
            .finally(() => setIsLoading(false))
    }, [])

    const windowsApps = apps.filter(a => a.platform === 'windows')
    const mobileApps = apps.filter(a => a.platform !== 'windows')

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 bg-linear-to-b from-primary/5 to-background">
                    <div className="container px-4 text-center">
                        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" variant="secondary">
                            Get ZPOS Everywhere
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Download the ZPOS Experience
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Available on all your devices. Manage your business from your desktop, your tablet, or your phone.
                        </p>
                    </div>
                </section>

                <section className="py-16 container px-4">
                    <div className="grid gap-12 md:grid-cols-2">
                        {/* Windows Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Monitor className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-3xl font-bold">Desktop Edition</h2>
                            </div>
                            <p className="text-lg text-muted-foreground">
                                Our powerful Windows application for full-scale operations, offline support, and specialized hardware integration.
                            </p>
                            <div className="grid gap-4">
                                {windowsApps.map(app => (
                                    <Card key={app.id} className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
                                        <CardHeader>
                                            <CardTitle>{app.name}</CardTitle>
                                            <CardDescription>Version {app.version} | Released {new Date(app.created_at).toLocaleDateString()}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4">{app.release_notes || "Stable release for production environments."}</p>
                                            <Button className="w-full" asChild>
                                                <a href={app.url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download for Windows
                                                </a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                                {windowsApps.length === 0 && !isLoading && (
                                    <Card className="p-8 text-center bg-muted/30 border-dashed">
                                        <p className="text-muted-foreground">The Windows installer is currently being updated. Please check back soon.</p>
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* Mobile Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Smartphone className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-3xl font-bold">Mobile Apps</h2>
                            </div>
                            <p className="text-lg text-muted-foreground">
                                Take ZPOS on the go with our Android and iOS applications. Syncs perfectly with your business data.
                            </p>
                            <div className="grid gap-6">
                                {mobileApps.map(app => (
                                    <a
                                        key={app.id}
                                        href={app.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-6 rounded-xl border-2 border-muted hover:border-primary/30 transition-all group bg-card"
                                    >
                                        <div className="p-4 bg-muted rounded-xl group-hover:bg-primary/5 mr-4 transition-colors">
                                            {app.platform === 'ios' ? <Apple className="h-8 w-8" /> : <Smartphone className="h-8 w-8" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl">{app.name}</h3>
                                            <p className="text-muted-foreground">Available on {app.platform === 'ios' ? 'App Store' : 'Google Play'}</p>
                                        </div>
                                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </a>
                                ))}
                                {mobileApps.length === 0 && !isLoading && (
                                    <div className="space-y-4">
                                        <div className="flex items-center p-6 rounded-xl border-2 border-muted opacity-60">
                                            <div className="p-4 bg-muted rounded-xl mr-4">
                                                <Smartphone className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-xl">ZPOS Android</h3>
                                                <p className="text-muted-foreground">Searching on Play Store...</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center p-6 rounded-xl border-2 border-muted opacity-60">
                                            <div className="p-4 bg-muted rounded-xl mr-4">
                                                <Apple className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-xl">ZPOS iOS</h3>
                                                <p className="text-muted-foreground">Available soon on App Store</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features section for trust */}
                <section className="py-24 bg-muted/30">
                    <div className="container px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <ShieldCheck className="h-10 w-10 text-primary" />
                                <h3 className="text-xl font-bold">Secure Downloads</h3>
                                <p className="text-muted-foreground">Every build is verified and scanned to ensure your business data and devices stay safe.</p>
                            </div>
                            <div className="space-y-4">
                                <Zap className="h-10 w-10 text-primary" />
                                <h3 className="text-xl font-bold">Fast Performance</h3>
                                <p className="text-muted-foreground">Our native apps are optimized for speed, even under heavy transaction loads.</p>
                            </div>
                            <div className="space-y-4">
                                <Cloud className="h-10 w-10 text-primary" />
                                <h3 className="text-xl font-bold">Seamless Sync</h3>
                                <p className="text-muted-foreground">Start a sale on your phone, finish it on your desktop. Your data is always synced across all devices.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "secondary" | "outline" | "destructive" }) {
    const variants = {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-input bg-background",
        destructive: "bg-destructive text-destructive-foreground",
    }
    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
            {children}
        </span>
    )
}
