"use client"
import { useEffect, useState } from "react"
import { authService } from "@/services/auth"
import { reportsService } from "@/services/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/Overview" // We will create this
import { RecentSales } from "@/components/dashboard/RecentSales" // We will create this
import { Button } from "@/components/ui/button"
import { Users, DollarSign, CreditCard, Activity, Store, ShoppingBag } from "lucide-react"

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const userData = authService.getUser()
        setUser(userData)

        async function loadStats() {
            try {
                const data = await reportsService.getStats()
                setStats(data)
            } catch (error) {
                console.error("Failed to load stats", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadStats()
    }, [])

    if (!user || isLoading) return <div>Loading dashboard...</div>

    const role = user.role || 'user'

    // Map stats based on role response structure
    let statCards = []

    if (role.includes('admin')) {
        statCards = [
            { title: "Total Revenue", value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, trend: "System wide" },
            { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, trend: "Registered users" },
            { title: "Total Tenants", value: stats?.totalTenants || 0, icon: Store, trend: "Active businesses" },
            { title: "Resellers", value: stats?.totalResellers || 0, icon: Users, trend: "Partners" }
        ]
    } else if (role.includes('reseller')) {
        statCards = [
            { title: "Total Earnings", value: `$${stats?.totalEarnings?.toLocaleString() || 0}`, icon: DollarSign, trend: "Commission based" },
            { title: "Active Clients", value: stats?.clientsCount || 0, icon: Users, trend: "Deployed licenses" },
            { title: "Commission Rate", value: `${stats?.commissionRate || 0}%`, icon: CreditCard, trend: "Per transaction" },
        ]
    } else {
        // User/Tenant
        statCards = [
            { title: "Total Sales", value: `$${stats?.totalSales?.toLocaleString() || 0}`, icon: DollarSign, trend: "Gross sales" },
            { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingBag, trend: "Completed orders" },
            { title: "Active Staff", value: stats?.activeStaff || 0, icon: Users, trend: "Staff members" },
        ]
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    {/* Actions like Export, Date Range */}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.trend}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-slate-100 dark:bg-slate-800 rounded-md">
                            Graph Placeholder (Recharts)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales/Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Placeholder list */}
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Olivia Martin</p>
                                    <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$1,999.00</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Jackson Lee</p>
                                    <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$39.00</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
