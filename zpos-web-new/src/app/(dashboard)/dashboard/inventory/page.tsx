"use client"
import { useEffect, useState } from "react"
import { inventoryService } from "@/services/inventory"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Package, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function InventoryPage() {
    const [valueStats, setValueStats] = useState<any>(null)
    const [lowStock, setLowStock] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const val = await inventoryService.getInventoryValue()
                setValueStats(val)
                const low = await inventoryService.getLowStock()
                setLowStock(low)
            } catch (error) {
                console.error("Failed to load inventory stats", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) return <div>Loading inventory...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
                <div className="flex gap-2">
                    <Link href="/dashboard/inventory/products/new">
                        <Button>Add Product</Button>
                    </Link>
                    <Link href="/dashboard/inventory/products">
                        <Button variant="outline">View All Products</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">K{valueStats?.totalValue?.toLocaleString() || '0.00'}</div>
                        <p className="text-xs text-muted-foreground">
                            across {valueStats?.itemCount || 0} items
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStock.length}</div>
                        <p className="text-xs text-muted-foreground">
                            items below reorder point
                        </p>
                    </CardContent>
                </Card>

                {/* Placeholder for stock movements or other metrics */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Movements</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+24</div>
                        <p className="text-xs text-muted-foreground">
                            transactions today
                        </p>
                    </CardContent>
                </Card>
            </div>

            {lowStock.length > 0 && (
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" /> Low Stock Warnings
                        </CardTitle>
                        <CardDescription>The following items are running low and need restocking.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {lowStock.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-2 rounded bg-red-50">
                                    <span className="font-medium">{item.product_id?.name || 'Unknown Product'}</span>
                                    <span className="text-red-600 font-bold">{item.quantity} remaining</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
