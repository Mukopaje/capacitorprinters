"use client"

import Link from "next/link"
import { ArrowRight, Handshake, Globe2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ResellerCTA() {
    return (
        <section className="py-20 bg-[#30acb4] dark:bg-slate-900 text-white overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                </svg>
            </div>

            <div className="container relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-6 border border-white/30 text-white">
                            <Globe2 className="h-4 w-4" />
                            <span>Pan-African Partnership Opportunity</span>
                        </div>
                        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl mb-6">
                            Partner with ZPOS & Grow Your Revenue
                        </h2>
                        <p className="text-xl text-blue-50/90 mb-8 max-w-lg">
                            Why build from scratch? ZPOS is a proven, fiscal-ready solution built for African markets.
                            Become a reseller today and start earning commissions instantly.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" variant="secondary" asChild className="bg-white text-[#30acb4] hover:bg-white/90">
                                <Link href="/reseller/register">
                                    Become a Partner <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white">
                                <Link href="/#features">
                                    Learn More
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="lg:pl-12">
                        <div className="grid gap-6">
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                                <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">High Commission Rates</h3>
                                <p className="text-blue-100">Earn competitive recurring commissions on every client you bring to the ZPOS platform.</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                                <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                                    <Handshake className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Full Support & Training</h3>
                                <p className="text-blue-100">We provide the technical tools and marketing support you need to succeed in your market.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
