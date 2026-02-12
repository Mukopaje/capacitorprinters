"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { siteContentService, SiteContent } from "@/services/site-content"

export function Pricing() {
    const [isYearly, setIsYearly] = useState(true)
    const [plans, setPlans] = useState<SiteContent[]>([])

    useEffect(() => {
        siteContentService.getPublicData().then(data => {
            if (data.grouped?.pricing?.length > 0) {
                setPlans(data.grouped.pricing)
            }
        }).catch(err => console.error("Failed to fetch pricing", err))
    }, [])

    const displayPlans = plans.length > 0 ? plans : [
        {
            title: "ZPOS Mobile",
            description: "Essential tools for small businesses.",
            metadata: {
                price: 10,
                period: "month",
                features: ["Single User", "Sales Recording", "Basic Inventory", "Daily Reports", "Offline Mode"],
                highlighted: false
            },
            linkUrl: "/signup?plan=mobile"
        },
        {
            title: "ZPOS Enterprise",
            description: "Complete solution for growing businesses.",
            metadata: {
                price: 29,
                period: "month",
                features: ["Multi-Location Support", "Table Management", "Staff Roles", "Advanced Analytics", "Priority Support"],
                highlighted: true
            },
            linkUrl: "/signup?plan=enterprise"
        },
    ]

    return (
        <section id="pricing" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
            <div className="container">
                <div className="mx-auto max-w-2xl text-center mb-10">
                    <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Start with a 14-day free trial. No credit card required.
                    </p>
                </div>

                <div className="flex justify-center items-center mb-12 gap-4">
                    <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
                    <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                    <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Yearly <span className="text-green-500 font-bold ml-1">(Save 20%)</span></span>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto px-4">
                    {displayPlans.map((plan: any) => {
                        const monthlyPrice = plan.metadata?.price || 0
                        const price = isYearly ? monthlyPrice * 10 : monthlyPrice
                        const period = isYearly ? "year" : "month"

                        return (
                            <div
                                key={plan.title}
                                className={`relative rounded-2xl border bg-card p-8 shadow-sm flex flex-col ${plan.metadata?.highlighted ? "border-[#f36f21] ring-1 ring-[#f36f21] shadow-lg scale-105 z-10" : ""
                                    }`}
                            >
                                {plan.metadata?.highlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#f36f21] px-4 py-1 text-sm font-medium text-white">
                                        Best Value
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold">{plan.title}</h3>
                                    <p className="mt-2 text-muted-foreground">{plan.description}</p>
                                    <div className="mt-6 flex items-baseline">
                                        <span className="text-4xl font-bold tracking-tight">
                                            ${price}
                                        </span>
                                        {monthlyPrice > 0 && (
                                            <span className="text-sm font-semibold text-muted-foreground ml-1">
                                                /{period}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ul className="mb-6 space-y-4 flex-1">
                                    {Array.isArray(plan.metadata?.features) && plan.metadata.features.map((feature: string) => (
                                        <li key={feature} className="flex items-center gap-3">
                                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span className="text-sm text-foreground/80">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button asChild className={`w-full ${plan.metadata?.highlighted ? "bg-[#f36f21] hover:bg-[#d95f1c] text-white" : ""}`} variant={plan.metadata?.highlighted ? "default" : "outline"}>
                                    <Link href={plan.linkUrl || "/signup"}>Start Free Trial</Link>
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
