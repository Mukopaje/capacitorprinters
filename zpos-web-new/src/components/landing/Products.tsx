"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { siteContentService, SiteContent } from "@/services/site-content"

export function Products() {
    const [solutions, setSolutions] = useState<SiteContent[]>([])

    useEffect(() => {
        siteContentService.getPublicData().then(data => {
            if (data.grouped?.solution?.length > 0) {
                setSolutions(data.grouped.solution)
            }
        }).catch(err => console.error("Failed to fetch solutions", err))
    }, [])

    const displaySolutions = solutions.length > 0 ? solutions : [
        {
            title: "Retail POS",
            description: "Perfect for boutiques, grocery stores, and general retail.",
            linkUrl: "/signup?solution=retail",
            imageUrl: "bg-blue-500",
            metadata: {
                features: ["Inventory Tracking", "Sales Reports", "Customer Management", "Barcode Scanning"],
                popular: false
            }
        },
        {
            title: "Hospitality POS",
            description: "Advanced features for restaurants, cafes, and bars.",
            linkUrl: "/signup?solution=hospitality",
            imageUrl: "bg-[#f36f21]",
            metadata: {
                features: ["Table Management", "Kitchen Display", "Staff Permissions", "Menu Customization"],
                popular: true
            }
        },
    ]

    return (
        <section id="products" className="py-20 lg:py-32">
            <div className="container px-4">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-[#1a1a1a]">
                        Choose the right solution for your business
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Tailored experiences for different industries. Select your path to get started.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:max-w-5xl lg:mx-auto">
                    {displaySolutions.map((solution: any) => (
                        <div
                            key={solution.title}
                            className={`relative flex flex-col rounded-3xl border bg-card p-8 shadow-sm transition-all hover:shadow-md ${solution.metadata?.popular ? "border-[#f36f21] ring-1 ring-[#f36f21]" : ""
                                }`}
                        >
                            {solution.metadata?.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#f36f21] px-4 py-1 text-sm font-medium text-white">
                                    Most Popular
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold">{solution.title}</h3>
                                <p className="mt-4 text-muted-foreground">
                                    {solution.description}
                                </p>
                                <ul className="mt-8 space-y-4">
                                    {Array.isArray(solution.metadata?.features) && solution.metadata.features.map((feature: string) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-[#f36f21] flex-shrink-0" />
                                            <span className="text-sm text-foreground/80">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button asChild className={`mt-10 w-full ${solution.metadata?.popular ? "bg-[#f36f21] hover:bg-[#d95f1c] text-white" : ""}`} variant={solution.metadata?.popular ? "default" : "outline"}>
                                <Link href={solution.linkUrl || "/signup"}>Learn More</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
