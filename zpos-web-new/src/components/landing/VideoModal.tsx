"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Play } from "lucide-react"

interface VideoModalProps {
    url?: string
    path?: string
    children: React.ReactNode
}

export function VideoModal({ url, path, children }: VideoModalProps) {
    const videoUrl = path
        ? (path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_API_URL}${path}`)
        : url

    if (!videoUrl) return <>{children}</>

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none aspect-video">
                <DialogTitle className="sr-only">ZPOS Demo Video</DialogTitle>
                <DialogDescription className="sr-only">
                    Watch the ZPOS presentation video to learn more about our features and capabilities.
                </DialogDescription>
                <div className="w-full h-full flex items-center justify-center">
                    {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                        <iframe
                            className="w-full h-full"
                            src={videoUrl.replace('watch?v=', 'embed/')}
                            title="ZPOS Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            controls
                            autoPlay
                            className="w-full h-full"
                        >
                            <source src={videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
