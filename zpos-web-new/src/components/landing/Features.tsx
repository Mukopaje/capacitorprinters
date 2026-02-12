"use client"

import { BarChart3, Box, MapPin, Smartphone, CreditCard, Users, Shield, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { siteContentService, SiteContent } from "@/services/site-content"

const ICON_MAP: Record<string, any> = {
    BarChart3, Box, MapPin, Smartphone, CreditCard, Users, Shield, Zap
}

export function Features() {
    const [features, setFeatures] = useState<SiteContent[]>([])

    useEffect(() => {
        siteContentService.getPublicData().then(data => {
            if (data.grouped?.feature?.length > 0) {
                setFeatures(data.grouped.feature)
            }
        })
    }, [])

    // Fallback features for initial load/empty DB
    const displayFeatures = features.length > 0 ? features : [
        { title: "Real-time Sales Reports", description: "Track your sales as they happen.", imageUrl: "BarChart3" },
        { title: "Smart Inventory", description: "Never run out of stock.", imageUrl: "Box" },
        { title: "Multi-Location Support", description: "Manage all your shops.", imageUrl: "MapPin" },
        { title: "Works Offline", description: "Keep selling even without internet.", imageUrl: "Zap" },
        { title: "Staff Management", description: "Create staff accounts.", imageUrl: "Users" },
        { title: "Secure Payments", description: "Accept all payment methods.", imageUrl: "CreditCard" },
    ]

    return (
        <section id="features" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
            <div className="container">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                        Everything you need to run your business
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Powerful features designed to help you save time, reduce costs, and increase profits.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {displayFeatures.map((feature: any) => {
                        const Icon = ICON_MAP[feature.imageUrl] || Zap
                        return (
                            <Card key={feature.title} className="border-none shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-[#f36f21]/10 flex items-center justify-center text-[#f36f21] mb-4">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base text-muted-foreground">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
