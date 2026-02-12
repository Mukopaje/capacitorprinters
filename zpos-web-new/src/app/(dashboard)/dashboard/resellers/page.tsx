"use client"
import { useEffect, useState } from "react"
import { adminResellerService } from "@/services/admin-reseller"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ResellersPage() {
    const [resellers, setResellers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadResellers() {
            try {
                const data = await adminResellerService.getAllResellers()
                setResellers(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Failed to load resellers", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadResellers()
    }, [])

    if (isLoading) return <div>Loading resellers...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Resellers</h2>
                    <p className="text-muted-foreground">Manage your reseller partners.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Reseller
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Resellers</CardTitle>
                    <CardDescription>
                        {resellers.length} registered resellers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Commission</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resellers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">No resellers found.</TableCell>
                                </TableRow>
                            ) : (
                                resellers.map((reseller) => (
                                    <TableRow key={reseller.id}>
                                        <TableCell className="font-medium">{reseller.name}</TableCell>
                                        <TableCell>{reseller.email}</TableCell>
                                        <TableCell>{reseller.phone || '-'}</TableCell>
                                        <TableCell>{reseller.commission_percentage}%</TableCell>
                                        <TableCell>{reseller.status}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
