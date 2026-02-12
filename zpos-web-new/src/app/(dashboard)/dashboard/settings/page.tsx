"use client"
import { useEffect, useState } from "react"
import { authService } from "@/services/auth"
import { subscriptionsService } from "@/services/subscriptions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ExternalLink, History, Calendar, CheckCircle2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const u = authService.getUser()
        setUser(u)
        if (u) {
            subscriptionsService.getMyHistory().then(setHistory).catch(console.error)
        }
    }, [])

    const handleManageSubscription = async () => {
        setIsLoading(true)
        try {
            const token = authService.getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/stripe/portal`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.message || 'Failed to open billing portal');
                return;
            }

            const { url } = await response.json();
            if (url) window.location.href = url;
        } catch (error) {
            console.error("Billing portal error:", error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    if (!user) return <div>Loading...</div>

    const activeSub = history[0]; // Assuming order by date desc

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account settings and subscription.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input defaultValue={user.firstName} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input defaultValue={user.lastName} disabled />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input defaultValue={user.email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input defaultValue={user.role} disabled className="capitalize" />
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                Active Subscription
                            </CardTitle>
                            <CardDescription>Your current active plan and status.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {activeSub ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                                            <p className="text-xl font-bold capitalize">{activeSub.plan_id.replace('_', ' ')}</p>
                                        </div>
                                        <Badge className="bg-green-500">{activeSub.status}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Expiry Date</p>
                                            <p className="font-medium">{new Date(activeSub.current_period_end).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Payment Source</p>
                                            <p className="font-medium capitalize">{activeSub.source}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-muted-foreground">No active formal subscription found.</p>
                                    <p className="text-xs mt-2">Contact support for manual subscription records.</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <Button size="sm" variant="outline" className="w-full" onClick={handleManageSubscription} disabled={isLoading}>
                                {isLoading ? 'Opening...' : 'Stripe Billing Portal'} <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Payment Methods
                            </CardTitle>
                            <CardDescription>Manage how you pay for your plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                For Stripe-based subscriptions, use the billing portal to manage cards.
                                For manual payments, contact ZPOS billing support.
                            </p>
                            <div className="rounded-lg border p-4 bg-slate-50 dark:bg-slate-900">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Billing Currency</p>
                                <p className="font-medium">ZMW - Zambian Kwacha</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* History Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            Subscription History
                        </CardTitle>
                        <CardDescription>Full record of your payments and plan extensions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>New Expiry</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                                            No subscription records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-xs">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium capitalize">{item.plan_id.replace('_', ' ')}</TableCell>
                                            <TableCell className="text-xs">
                                                {item.payment_method}
                                                {item.payment_reference && <div className="text-[10px] text-muted-foreground leading-tight">{item.payment_reference}</div>}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{item.currency} {item.amount}</TableCell>
                                            <TableCell className="text-xs">{new Date(item.current_period_end).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase">{item.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
