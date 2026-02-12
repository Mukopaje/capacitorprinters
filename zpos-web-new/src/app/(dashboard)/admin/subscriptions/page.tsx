"use client"

import { useEffect, useState } from "react"
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { stripeService } from "@/services/stripe"
import { adminTenantsService } from "@/services/admin-tenants"
import { Loader2, CreditCard } from "lucide-react"

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                // Fetch Stripe subs (might be empty/error)
                const stripeData = await stripeService.getSubscriptions().catch(() => [])

                // Fetch our internal manual/recorded subs
                const internalData = await adminTenantsService.getSubscriptionHistory('all').catch(() => [])

                // Map/Combine for display
                // For now, let's prioritize internal records as they are the formal history
                const combined = [
                    ...internalData.map((s: any) => ({
                        id: s.id,
                        tenant_id: s.tenant?.business_name || s.tenant_id,
                        stripe_customer_id: s.payment_reference || 'Manual',
                        status: s.status,
                        plan_id: s.plan_id,
                        current_period_end: new Date(s.current_period_end).getTime() / 1000,
                        source: s.source
                    })),
                    // Only add Stripe subs NOT in our DB? 
                    // For now, just show both or consolidated.
                ]

                setSubscriptions(combined)
            } catch (error) {
                console.error("Failed to fetch subscriptions:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchSubscriptions()
    }, [])

    return (
        <AdminDashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Subscriptions</h2>
                    <p className="text-muted-foreground">Monitor revenue and plan distributions.</p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tenant ID</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Reference / Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Plan ID</TableHead>
                            <TableHead>Next Billing</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading subscriptions...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : subscriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <CreditCard className="h-8 w-8 opacity-20" />
                                        No active subscriptions found.
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscriptions.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-medium text-xs">
                                        {sub.tenant_id}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-[10px]">{sub.source || 'stripe'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs font-mono">{sub.stripe_customer_id}</TableCell>
                                    <TableCell>
                                        <Badge variant={sub.status === 'active' ? "default" : "destructive"}>
                                            {sub.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize text-sm">{sub.plan_id.replace('_', ' ')}</TableCell>
                                    <TableCell className="text-sm">
                                        {sub.current_period_end ? new Date(sub.current_period_end * 1000).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AdminDashboardLayout>
    )
}
