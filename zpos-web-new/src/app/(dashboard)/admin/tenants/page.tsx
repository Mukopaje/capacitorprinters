"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { adminTenantsService } from "@/services/admin-tenants"
import { Loader2, Edit, Trash2, Key, Calendar, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminTenantsPage() {
    const [tenants, setTenants] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // UI States
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isLicenseOpen, setIsLicenseOpen] = useState(false)
    const [isManualSubOpen, setIsManualSubOpen] = useState(false)
    const [selectedTenant, setSelectedTenant] = useState<any>(null)
    const [newExpiry, setNewExpiry] = useState("")

    // Manual Sub state
    const [manualSub, setManualSub] = useState({
        planId: "enterprise_monthly",
        months: 1,
        amount: 290,
        paymentMethod: "Bank Transfer",
        reference: ""
    })

    const fetchTenants = async () => {
        setIsLoading(true)
        try {
            const data = await adminTenantsService.getAllTenants()
            setTenants(data)
        } catch (error) {
            console.error("Failed to fetch tenants:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTenants()
    }, [])

    const handleUpdate = async () => {
        try {
            await adminTenantsService.updateTenant(selectedTenant.id, selectedTenant)
            setIsEditOpen(false)
            fetchTenants()
        } catch (error) {
            alert("Failed to update business")
        }
    }

    const handleLicenseExtension = async () => {
        try {
            await adminTenantsService.updateLicense(selectedTenant.id, newExpiry)
            setIsLicenseOpen(false)
            fetchTenants()
        } catch (error) {
            alert("Failed to extend license")
        }
    }

    const handleCreateManualSub = async () => {
        try {
            await adminTenantsService.createManualSubscription({
                tenantId: selectedTenant.id,
                ...manualSub
            })
            setIsManualSubOpen(false)
            fetchTenants()
            alert("Manual subscription created and email sent!")
        } catch (error: any) {
            alert(error.message || "Failed to create formal subscription")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this business? This action is irreversible.")) return
        try {
            await adminTenantsService.deleteTenant(id)
            fetchTenants()
        } catch (error) {
            alert("Failed to delete business")
        }
    }

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Business Tenants</h2>
                    <p className="text-muted-foreground">Manage subscriptions and support registered businesses.</p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Owner Email</TableHead>
                            <TableHead>License Key</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading tenants...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : tenants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No tenants found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tenants.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell className="font-medium">
                                        {tenant.business_name}
                                    </TableCell>
                                    <TableCell>{tenant.owner_email}</TableCell>
                                    <TableCell className="text-xs font-mono">{tenant.license_key}</TableCell>
                                    <TableCell>
                                        <Badge variant={tenant.status === 'active' ? "default" : "secondary"}>
                                            {tenant.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={new Date(tenant.license_expires_at) < new Date() ? "text-destructive font-bold" : ""}>
                                            {new Date(tenant.license_expires_at).toLocaleDateString()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 text-nowrap">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                title="Formal Subscription"
                                                className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                                                onClick={() => {
                                                    setSelectedTenant(tenant);
                                                    setIsManualSubOpen(true);
                                                }}
                                            >
                                                <CreditCard className="h-4 w-4 mr-1" />
                                                Sub
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                title="Quick License Update"
                                                onClick={() => {
                                                    setSelectedTenant(tenant);
                                                    setNewExpiry(tenant.license_expires_at.split('T')[0]);
                                                    setIsLicenseOpen(true);
                                                }}
                                            >
                                                <Key className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTenant(tenant);
                                                    setIsEditOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(tenant.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Business Details</DialogTitle>
                        <DialogDescription>Modify the business profile and settings.</DialogDescription>
                    </DialogHeader>
                    {selectedTenant && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Business Name</Label>
                                <Input
                                    id="name"
                                    value={selectedTenant.business_name}
                                    onChange={e => setSelectedTenant({ ...selectedTenant, business_name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Owner Email</Label>
                                <Input
                                    id="email"
                                    value={selectedTenant.owner_email}
                                    onChange={e => setSelectedTenant({ ...selectedTenant, owner_email: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={selectedTenant.status}
                                    onChange={e => setSelectedTenant({ ...selectedTenant, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Quick License Dialog (kept for legacy/overrides) */}
            <Dialog open={isLicenseOpen} onOpenChange={setIsLicenseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Quick License Extension</DialogTitle>
                        <DialogDescription>
                            Grant temporal licenses or override dates without formal records.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTenant && (
                        <div className="grid gap-4 py-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm font-medium">Business: {selectedTenant.business_name}</p>
                                <p className="text-sm text-muted-foreground">Current Expiry: {new Date(selectedTenant.license_expires_at).toLocaleDateString()}</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="expiry">New Expiry Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="expiry"
                                        type="date"
                                        className="pl-10"
                                        value={newExpiry}
                                        onChange={e => setNewExpiry(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLicenseOpen(false)}>Cancel</Button>
                        <Button onClick={handleLicenseExtension}>Update License</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Formal Manual Subscription Dialog */}
            <Dialog open={isManualSubOpen} onOpenChange={setIsManualSubOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Manual Subscription</DialogTitle>
                        <DialogDescription>
                            Apply a formal subscription, create record, and send email receipt.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTenant && (
                        <div className="grid gap-4 py-4">
                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <p className="text-sm font-bold text-primary">{selectedTenant.business_name}</p>
                                <p className="text-xs text-muted-foreground">Owner: {selectedTenant.owner_email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Plan</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={manualSub.planId}
                                        onChange={e => setManualSub({ ...manualSub, planId: e.target.value })}
                                    >
                                        <option value="mobile_monthly">Mobile (Monthly)</option>
                                        <option value="mobile_yearly">Mobile (Yearly)</option>
                                        <option value="enterprise_monthly">Enterprise (Monthly)</option>
                                        <option value="enterprise_yearly">Enterprise (Yearly)</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Duration (Months)</Label>
                                    <Input
                                        type="number"
                                        value={manualSub.months}
                                        onChange={e => setManualSub({ ...manualSub, months: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Amount Paid (ZMW)</Label>
                                    <Input
                                        type="number"
                                        value={manualSub.amount}
                                        onChange={e => setManualSub({ ...manualSub, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Payment Method</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={manualSub.paymentMethod}
                                        onChange={e => setManualSub({ ...manualSub, paymentMethod: e.target.value })}
                                    >
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Mobile Money">Mobile Money</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Payment Reference</Label>
                                <Input
                                    placeholder="TXN ID / Receipt Number"
                                    value={manualSub.reference}
                                    onChange={e => setManualSub({ ...manualSub, reference: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsManualSubOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateManualSub} className="bg-primary hover:bg-primary/90">
                            Apply & Send Receipt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
