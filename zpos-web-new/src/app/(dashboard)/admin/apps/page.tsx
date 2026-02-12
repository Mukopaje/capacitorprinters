"use client"

import React, { useEffect, useState } from "react"
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
    CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Plus, Download, ExternalLink, Trash2, Edit,
    Smartphone, Monitor, Laptop
} from "lucide-react"
import { appsService, AppBinary } from "@/services/apps"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function AdminAppsPage() {
    const [apps, setApps] = useState<AppBinary[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentApp, setCurrentApp] = useState<Partial<AppBinary> | null>(null)

    useEffect(() => {
        fetchApps()
    }, [])

    const fetchApps = async () => {
        try {
            const data = await appsService.getAllApps()
            setApps(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            if (currentApp?.id) {
                await appsService.updateApp(currentApp.id, currentApp)
            } else {
                await appsService.createApp(currentApp || {})
            }
            setIsDialogOpen(false)
            fetchApps()
        } catch (error) {
            alert("Failed to save app link")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this link?")) return
        try {
            await appsService.deleteApp(id)
            fetchApps()
        } catch (error) {
            alert("Failed to delete app link")
        }
    }

    const getIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'windows': return <Monitor className="h-4 w-4" />
            case 'android': return <Smartphone className="h-4 w-4" />
            case 'ios': return <Laptop className="h-4 w-4" />
            default: return <Download className="h-4 w-4" />
        }
    }

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Apps & Downloads</h1>
                        <p className="text-muted-foreground">Manage Windows installers and App Store/Play Store links.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setCurrentApp({ platform: 'windows', is_active: true })}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Link
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{currentApp?.id ? 'Edit App Link' : 'Add New App Link'}</DialogTitle>
                                <DialogDescription>Enter the details for the application download or store link.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">App Name</Label>
                                    <Input
                                        id="name"
                                        value={currentApp?.name || ""}
                                        onChange={e => setCurrentApp({ ...currentApp, name: e.target.value })}
                                        placeholder="e.g. ZPOS Desktop"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="platform">Platform</Label>
                                    <select
                                        id="platform"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={currentApp?.platform || "windows"}
                                        onChange={e => setCurrentApp({ ...currentApp, platform: e.target.value })}
                                    >
                                        <option value="windows">Windows (Direct Download)</option>
                                        <option value="android">Android (Play Store)</option>
                                        <option value="ios">iOS (App Store)</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="version">Version (Optional)</Label>
                                    <Input
                                        id="version"
                                        value={currentApp?.version || ""}
                                        onChange={e => setCurrentApp({ ...currentApp, version: e.target.value })}
                                        placeholder="e.g. 1.2.0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="url">Download/Store URL</Label>
                                    <Input
                                        id="url"
                                        value={currentApp?.url || ""}
                                        onChange={e => setCurrentApp({ ...currentApp, url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Release Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={currentApp?.release_notes || ""}
                                        onChange={e => setCurrentApp({ ...currentApp, release_notes: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="active"
                                        checked={currentApp?.is_active}
                                        onCheckedChange={v => setCurrentApp({ ...currentApp, is_active: v })}
                                    />
                                    <Label htmlFor="active">Active (Visible to users)</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSave}>Save Link</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => (
                        <Card key={app.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {app.name}
                                </CardTitle>
                                {getIcon(app.platform)}
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground mb-4">
                                    Platform: <span className="capitalize">{app.platform}</span> | Version: {app.version || 'N/A'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={app.is_active ? "default" : "secondary"}>
                                        {app.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setCurrentApp(app)
                                    setIsDialogOpen(true)
                                }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(app.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    {apps.length === 0 && !isLoading && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No apps managed yet. Add your first download link above.
                        </div>
                    )}
                </div>
            </div>
        </AdminDashboardLayout>
    )
}
