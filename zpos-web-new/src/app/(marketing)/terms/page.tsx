"use client"

import React from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 py-20">
                <div className="container max-w-4xl px-4">
                    <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-muted-foreground mb-6">
                            Last updated: February 12, 2026
                        </p>
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                            <p>By accessing or using ZPOS, you agree to be bound by these Terms of Service.</p>
                        </section>
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">2. Use of License</h2>
                            <p>ZPOS grants you a limited, non-exclusive license to use the platform for your business operations in accordance with these terms.</p>
                        </section>
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">3. Fiscal Compliance</h2>
                            <p>Users are responsible for ensuring they provide accurate information for fiscalization reporting to ZRA.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
