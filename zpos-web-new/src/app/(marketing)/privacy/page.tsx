"use client"

import React from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 py-20">
                <div className="container max-w-4xl px-4">
                    <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-muted-foreground mb-6">
                            Last updated: February 12, 2026
                        </p>
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                            <p>Welcome to ZPOS. We respect your privacy and are committed to protecting your personal data.</p>
                        </section>
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">2. Data Collection</h2>
                            <p>We collect information you provide directly to us when you create an account, use our services, or communicate with us.</p>
                        </section>
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">3. Data Usage</h2>
                            <p>We use your data to provide, maintain, and improve our services, and to communicate with you about updates and offers.</p>
                        </section>
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">4. Compliance</h2>
                            <p>As a fiscal-ready solution, we ensure our data handling processes comply with relevant ZRA regulations and African data protection laws.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
