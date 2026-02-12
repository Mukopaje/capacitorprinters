"use client"
import { useEffect, useState } from "react"
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Lock, Globe, Database, Shield, CreditCard, RefreshCw } from "lucide-react"
import { siteContentService } from "@/services/site-content"
import { communicationService } from "@/services/communication"
import { toast } from "sonner"
import DatabaseSettings from "@/components/dashboard/settings/DatabaseSettings"

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({
        STRIPE_MODE: 'test',
        STRIPE_TEST_SECRET_KEY: '',
        STRIPE_LIVE_SECRET_KEY: '',
        STRIPE_WEBHOOK_SECRET: '',
        SYSTEM_DEFAULT_TPIN: '1000000000',
        ENABLE_2FA: 'true',
        STRICT_PASSWORD_POLICY: 'true',
        AUTO_FISCALIZATION: 'true',
        WHATSAPP_PROVIDER: 'placeholder',
        WHATSAPP_PHONE_NUMBER: '',
        WHATSAPP_API_KEY: ''
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [broadcastMessage, setBroadcastMessage] = useState("")

    useEffect(() => {
        siteContentService.getSettings()
            .then(data => {
                setSettings((prev: any) => ({ ...prev, ...data }))
            })
            .catch(err => console.error("Failed to fetch settings:", err))
            .finally(() => setIsLoading(false))
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            for (const [key, value] of Object.entries(settings)) {
                await siteContentService.updateSetting(key, String(value))
            }
            toast.success("Settings saved successfully")
        } catch (error) {
            console.error("Save failed:", error)
            toast.error("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    const handleBroadcast = async (target: 'users' | 'resellers') => {
        try {
            await communicationService.broadcast(broadcastMessage, target)
            toast.success(`Broadcast sent to ${target}`)
            setBroadcastMessage("")
        } catch (error: any) {
            toast.error(error.message || "Failed to send broadcast")
        }
    }

    const updateSetting = (key: string, value: string) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }))
    }

    if (isLoading) return <div className="p-8">Loading settings...</div>

    return (
        <AdminDashboardLayout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-muted-foreground">Configure global system parameters and security policies.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save All Changes"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Stripe Configuration */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Stripe Gateway Configuration
                        </CardTitle>
                        <CardDescription>Manage your payment environment and API credentials.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                            <div className="space-y-0.5">
                                <Label className="text-base">Production Mode</Label>
                                <p className="text-sm text-muted-foreground">Switch between Sandbox (Test) and Live environments.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold uppercase ${settings.STRIPE_MODE === 'test' ? 'text-orange-500' : 'text-muted-foreground'}`}>Test</span>
                                <Switch
                                    checked={settings.STRIPE_MODE === 'live'}
                                    onCheckedChange={(v) => updateSetting('STRIPE_MODE', v ? 'live' : 'test')}
                                />
                                <span className={`text-xs font-bold uppercase ${settings.STRIPE_MODE === 'live' ? 'text-green-500' : 'text-muted-foreground'}`}>Live</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="test_key">Stripe Test Secret Key</Label>
                                    <Input
                                        id="test_key"
                                        type="password"
                                        placeholder="sk_test_..."
                                        value={settings.STRIPE_TEST_SECRET_KEY}
                                        onChange={e => updateSetting('STRIPE_TEST_SECRET_KEY', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="live_key">Stripe Live Secret Key</Label>
                                    <Input
                                        id="live_key"
                                        type="password"
                                        placeholder="sk_live_..."
                                        value={settings.STRIPE_LIVE_SECRET_KEY}
                                        onChange={e => updateSetting('STRIPE_LIVE_SECRET_KEY', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="webhook_secret">Webhook Secret</Label>
                                    <Input
                                        id="webhook_secret"
                                        type="password"
                                        placeholder="whsec_..."
                                        value={settings.STRIPE_WEBHOOK_SECRET}
                                        onChange={e => updateSetting('STRIPE_WEBHOOK_SECRET', e.target.value)}
                                    />
                                </div>
                                <div className="p-3 bg-muted rounded-md border text-xs break-all">
                                    <p className="font-bold mb-1 opacity-70">WEBHOOK ENDPOINT URL:</p>
                                    <code>{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/stripe/webhook</code>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security Policies
                        </CardTitle>
                        <CardDescription>Manage password requirements and access controls.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Two-Factor Authentication</Label>
                                <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts.</p>
                            </div>
                            <Switch
                                checked={settings.ENABLE_2FA === 'true'}
                                onCheckedChange={v => updateSetting('ENABLE_2FA', String(v))}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Strict Password Policy</Label>
                                <p className="text-sm text-muted-foreground">Enforce complexity and expiration.</p>
                            </div>
                            <Switch
                                checked={settings.STRICT_PASSWORD_POLICY === 'true'}
                                onCheckedChange={v => updateSetting('STRICT_PASSWORD_POLICY', String(v))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5" />
                            ZRA Compliance Settings
                        </CardTitle>
                        <CardDescription>Global configuration for fiscalization services.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tpin">System Default TPIN</Label>
                            <Input
                                id="tpin"
                                value={settings.SYSTEM_DEFAULT_TPIN}
                                onChange={e => updateSetting('SYSTEM_DEFAULT_TPIN', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Automatic Fiscalization</Label>
                                <p className="text-sm text-muted-foreground">Enable real-time reporting by default for new tenants.</p>
                            </div>
                            <Switch
                                checked={settings.AUTO_FISCALIZATION === 'true'}
                                onCheckedChange={v => updateSetting('AUTO_FISCALIZATION', String(v))}
                            />
                        </div>
                    </CardContent>
                </Card>
                <DatabaseSettings />

                <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-blue-500" />
                            Communication & Broadcast
                        </CardTitle>
                        <CardDescription>Manage WhatsApp notifications and system-wide announcements.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">WhatsApp Configuration</Label>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="wa_provider">Provider</Label>
                                    <select
                                        id="wa_provider"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={settings.WHATSAPP_PROVIDER || 'placeholder'}
                                        onChange={e => updateSetting('WHATSAPP_PROVIDER', e.target.value)}
                                    >
                                        <option value="placeholder">Placeholder (No real sending)</option>
                                        <option value="meta">Meta Business API</option>
                                        <option value="twilio">Twilio</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="wa_number">System WhatsApp Number</Label>
                                    <Input
                                        id="wa_number"
                                        placeholder="+260..."
                                        value={settings.WHATSAPP_PHONE_NUMBER || ''}
                                        onChange={e => updateSetting('WHATSAPP_PHONE_NUMBER', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2 col-span-2">
                                    <Label htmlFor="wa_key">API Key / Access Token</Label>
                                    <Input
                                        id="wa_key"
                                        type="password"
                                        placeholder="Enter token..."
                                        value={settings.WHATSAPP_API_KEY || ''}
                                        onChange={e => updateSetting('WHATSAPP_API_KEY', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <Label className="text-base font-semibold">System Broadcast</Label>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="broadcast_msg">Message Content</Label>
                                    <textarea
                                        id="broadcast_msg"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="Type your message to all users..."
                                        value={broadcastMessage}
                                        onChange={e => setBroadcastMessage(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => handleBroadcast('users')}
                                        disabled={!broadcastMessage}
                                    >
                                        Send to Users
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => handleBroadcast('resellers')}
                                        disabled={!broadcastMessage}
                                    >
                                        Send to Resellers
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminDashboardLayout>
    )
}
