"use client"

import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { SiteContent } from "@/services/site-content"
import { cn } from "@/lib/utils"

interface DashboardCarouselProps {
    items: SiteContent[]
}

export function DashboardCarousel({ items }: DashboardCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 })
    const [selectedIndex, setSelectedIndex] = React.useState(0)

    const onSelect = React.useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    React.useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on("select", onSelect)

        const timer = setInterval(() => {
            emblaApi.scrollNext()
        }, 5000)

        return () => {
            emblaApi.off("select", onSelect)
            clearInterval(timer)
        }
    }, [emblaApi, onSelect])

    if (items.length === 0) {
        return (
            <div className="relative rounded-xl border bg-background/50 backdrop-blur shadow-2xl overflow-hidden aspect-video flex items-center justify-center text-muted-foreground">
                <p>ZPOS Dashboard Overview</p>
            </div>
        )
    }

    return (
        <div className="relative mx-auto max-w-5xl group">
            <div className="relative rounded-xl border bg-background/50 backdrop-blur shadow-2xl overflow-hidden aspect-video" ref={emblaRef}>
                <div className="flex">
                    {items.map((item) => (
                        <div key={item.id} className="flex-[0_0_100%] min-w-0 relative h-full">
                            <img
                                src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6 text-white">
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-sm opacity-90">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Indicators */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={cn(
                            "h-1.5 rounded-full transition-all",
                            selectedIndex === index ? "w-8 bg-primary" : "w-1.5 bg-primary/20"
                        )}
                        onClick={() => emblaApi?.scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    )
}
