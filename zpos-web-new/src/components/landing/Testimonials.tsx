"use client"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
    {
        name: "Mohammed Patel",
        role: "Managing Director, The Cake Bar",
        content: "ZPOS, amongst other things, has allowed me to implement time based promos where the price automatically changes during 'happy hour'. Sales have picked up because of this.",
        initials: "MP",
    },
    {
        name: "Abigail Mwailengi",
        role: "CEO, Mummies and Munchkins",
        content: "Inventory is my favorite. Every evening, I pull up my reports and can be able to look at my stock fluctuations and plan on what needs to be purchased without me entering the store. I now run my business remotely.",
        initials: "AM",
    },
    {
        name: "Choomba",
        role: "Shop Keeper",
        content: "ZPOS tells me exactly what my end of day sales were and I spend no time calculating anything.",
        initials: "C",
    },
    {
        name: "Watson",
        role: "Store Owner",
        content: "ZPOS tells me what stock is left in his grocery shop so I spend little time and effort doing stock-taking.",
        initials: "W",
    },
]

export function Testimonials() {
    return (
        <section id="testimonials" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
            <div className="container">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                        Trusted by Business Owners
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        See what our customers are saying about ZPOS.
                    </p>
                </div>

                <div className="mx-auto max-w-4xl px-8">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {testimonials.map((testimonial) => (
                                <CarouselItem key={testimonial.name} className="md:basis-1/2 lg:basis-1/2">
                                    <div className="p-1">
                                        <Card className="h-full">
                                            <CardContent className="flex flex-col justify-between h-full p-6">
                                                <blockquote className="mt-2 text-muted-foreground italic">
                                                    "&quot;{testimonial.content}&quot;"
                                                </blockquote>
                                                <div className="flex items-center gap-4 mt-6">
                                                    <Avatar>
                                                        <AvatarImage src="" />
                                                        <AvatarFallback>{testimonial.initials}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-semibold leading-none">{testimonial.name}</p>
                                                        <p className="text-sm text-muted-foreground mt-1">{testimonial.role}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            </div>
        </section>
    )
}
