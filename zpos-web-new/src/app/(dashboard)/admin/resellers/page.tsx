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
import { adminResellerService } from "@/services/admin-reseller"
import { Loader2, Plus } from "lucide-react"
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
import { toast } from "sonner"

export default function AdminResellersPage() {
    const [resellers, setResellers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [newReseller, setNewReseller] = useState({
        name: "",
        email: "",
        phone: ""
    })

    const fetchResellers = async () => {
        setIsLoading(true)
        try {
            const data = await adminResellerService.getAllResellers()
            setResellers(data)
        } catch (error) {
            console.error("Failed to fetch resellers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchResellers()
    }, [])

    const handleInvite = async () => {
        try {
            await adminResellerService.inviteReseller(newReseller)
            setIsInviteOpen(false)
            setNewReseller({ name: "", email: "", phone: "" })
            toast.success("Invitation sent successfully")
            fetchResellers()
        } catch (error: any) {
            toast.error(error.message || "Failed to send invitation")
        }
    }

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reseller Partners</h2>
                    <p className="text-muted-foreground">Manage and monitor reseller performance.</p>
                </div>
                <Button onClick={() => setIsInviteOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Reseller
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Partner Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Commission</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading resellers...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : resellers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No resellers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            resellers.map((reseller, idx) => (
                                <TableRow key={reseller.id}>
                                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                                    <TableCell className="font-medium">
                                        {reseller.name}
                                    </TableCell>
                                    <TableCell>{reseller.email}</TableCell>
                                    <TableCell>{reseller.phone || '-'}</TableCell>
                                    <TableCell>{reseller.commission_percentage}%</TableCell>
                                    <TableCell>
                                        <Badge variant={reseller.status === 'active' ? "default" : "secondary"}>
                                            {reseller.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(reseller.created_at).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Reseller Partner</DialogTitle>
                        <DialogDescription>Send an invitation to a new reseller partner.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Reseller / Company Name</Label>
                            <Input
                                id="name"
                                value={newReseller.name}
                                onChange={e => setNewReseller({ ...newReseller, name: e.target.value })}
                                placeholder="e.g. Acme Resellers"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newReseller.email}
                                onChange={e => setNewReseller({ ...newReseller, email: e.target.value })}
                                placeholder="partner@example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number (Optional)</Label>
                            <Input
                                id="phone"
                                value={newReseller.phone}
                                onChange={e => setNewReseller({ ...newReseller, phone: e.target.value })}
                                placeholder="+260..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                        <Button onClick={handleInvite}>Send Invitation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
