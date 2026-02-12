"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, CheckCircle2, Globe, ShieldCheck, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { siteContentService, SiteContent, SiteSettings } from "@/services/site-content"
import { DashboardCarousel } from "./DashboardCarousel"
import { VideoModal } from "./VideoModal"

const defaultMessages = [
    "Fiscal Compliance Ready (ZRA Integrated)",
    "Built for African Markets",
    "Works Offline & Online",
    "Manage Multiple Locations"
]

export function Hero() {
    const [currentMessage, setCurrentMessage] = useState(0)
    const [siteData, setSiteData] = useState<{ content: SiteContent[], settings: SiteSettings }>({
        content: [],
        settings: {}
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                const data = await siteContentService.getPublicData()
                setSiteData(data)
            } catch (error) {
                console.error("Failed to fetch site data", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchSiteData()

        const timer = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % defaultMessages.length)
        }, 3000)
        return () => clearInterval(timer)
    }, [])

    const messages = siteData.content.filter(i => i.type === 'stat' || i.type === 'feature').map(i => i.title).length > 0
        ? siteData.content.filter(i => i.type === 'stat' || i.type === 'feature').map(i => i.title)
        : defaultMessages

    return (
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-28">
            <div className="container relative z-10">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="font-display text-4xl font-bold tracking-tight sm:text-6xl"
                    >
                        Manage Your Business{" "}
                        <span className="bg-gradient-to-r from-[#30acb4] to-[#f36f21] bg-clip-text text-transparent block mt-2">
                            Without Limits
                        </span>
                    </motion.h1>

                    <div className="h-8 mt-6 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentMessage}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="text-lg font-medium text-[#f36f21]"
                            >
                                {messages[currentMessage]}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-6 text-lg tracking-tight text-muted-foreground sm:text-xl"
                    >
                        ZPOS is the complete Point of Sale and Inventory Management solution for modern retailers.
                        Track sales, manage stock, and grow your business from anywhere.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-10 flex justify-center gap-x-6"
                    >
                        <Button size="lg" asChild className="h-12 px-8 text-lg rounded-full bg-[#30acb4] hover:bg-[#30acb4]/90">
                            <Link href="/signup">
                                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <VideoModal
                            url={siteData.settings.demo_video_url}
                            path={siteData.settings.demo_video_path}
                        >
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-[#30acb4] text-[#30acb4] hover:bg-[#30acb4]/10">
                                Watch Demo
                            </Button>
                        </VideoModal>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#30acb4]" />
                            <span>Fiscal Ready (ZRA)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-[#30acb4]" />
                            <span>Pan-African Solution</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-[#f36f21]" />
                            <span>14-Day Free Trial</span>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="mt-16"
                >
                    <DashboardCarousel items={siteData.content.filter(i => i.type === 'carousel')} />
                </motion.div>
            </div>

            {/* Background gradients */}
            <div className="absolute -top-24 right-0 -z-10 h-[500px] w-[500px] bg-cyan-500/10 blur-[120px] rounded-full opacity-50" />
            <div className="absolute top-1/2 left-0 -z-10 h-[500px] w-[500px] bg-blue-500/10 blur-[120px] rounded-full opacity-50" />
        </section>
    )
}
