"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Mail, Phone, ExternalLink, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminCommunicationsPage() {
    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Communications</h2>
                    <p className="text-muted-foreground">Monitor and manage email, SMS, and WhatsApp alerts.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Phone className="mr-2 h-4 w-4" />
                        WhatsApp Config
                    </Button>
                    <Button>
                        <Send className="mr-2 h-4 w-4" />
                        Send Broadcast
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">WhatsApp Logs</CardTitle>
                        <MessageSquare className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,204</div>
                        <p className="text-xs text-muted-foreground">Sent this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Email Delivery</CardTitle>
                        <Mail className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98.2%</div>
                        <p className="text-xs text-muted-foreground">Successful delivery rate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
                        <Activity className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Failed messages (last 24h)</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 order-md border bg-card rounded-md overflow-hidden">
                <div className="p-4 border-b font-semibold bg-muted/50">Recent Activity</div>
                <div className="divide-y">
                    {[
                        { type: 'WhatsApp', recipient: '+260 970 000 000', event: 'Daily Report', status: 'delivered', time: '10 mins ago' },
                        { type: 'Email', recipient: 'tenant@example.com', event: 'Invoice Generated', status: 'sent', time: '1 hour ago' },
                        { type: 'WhatsApp', recipient: '+260 971 111 111', event: 'Stock Alert', status: 'failed', time: '3 hours ago' },
                    ].map((log, i) => (
                        <div key={i} className="flex h-16 items-center px-4 justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-muted rounded-full">
                                    {log.type === 'WhatsApp' ? <MessageSquare className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{log.event}</p>
                                    <p className="text-xs text-muted-foreground">{log.recipient}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={log.status === 'failed' ? 'destructive' : 'default'} className="capitalize">
                                    {log.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{log.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

import { Activity } from "lucide-react"
