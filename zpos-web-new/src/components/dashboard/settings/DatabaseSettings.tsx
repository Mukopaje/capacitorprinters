"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, RefreshCw, Trash2, Calendar, HardDrive, Shield } from "lucide-react"
import { cloudService, RDSSnapshot } from "@/services/cloud"
import { toast } from "sonner"
import { format } from "date-fns"

export default function DatabaseSettings() {
    const [backups, setBackups] = useState<RDSSnapshot[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)

    const fetchBackups = async () => {
        try {
            const data = await cloudService.getBackups()
            setBackups(data)
        } catch (error: any) {
            console.error("Failed to fetch backups:", error)
            // Silently fail if not configured, as per service logic
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchBackups()
    }, [])

    const handleCreateBackup = async () => {
        setIsCreating(true)
        try {
            await cloudService.createBackup()
            toast.success("Backup creation initiated. It will appear in the list once ready.")
            // Refresh list after a short delay
            setTimeout(fetchBackups, 3000)
        } catch (error: any) {
            toast.error(error.message || "Failed to initiate backup")
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteBackup = async (id: string) => {
        if (!confirm("Are you sure you want to delete this backup? This action cannot be undone.")) return

        try {
            await cloudService.deleteBackup(id)
            toast.success("Backup deleted")
            fetchBackups()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete backup")
        }
    }

    return (
        <Card className="border-orange-500/20 bg-orange-500/5">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-orange-500" />
                        Database Management (AWS RDS)
                    </CardTitle>
                    <CardDescription>Monitor snapshots and trigger manual backups of your PostgreSQL database.</CardDescription>
                </div>
                <Button onClick={handleCreateBackup} disabled={isCreating || isLoading}>
                    {isCreating ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Database className="mr-2 h-4 w-4" />
                    )}
                    Take Manual Backup
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Snapshot Identifier</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Loading snapshots...
                                    </TableCell>
                                </TableRow>
                            ) : backups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No manual snapshots found or RDS not configured.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                backups.map((snapshot) => (
                                    <TableRow key={snapshot.DBSnapshotIdentifier}>
                                        <TableCell className="font-medium">{snapshot.DBSnapshotIdentifier}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Calendar className="h-3 w-3 opacity-50" />
                                                {format(new Date(snapshot.SnapshotCreateTime), "PPP p")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs">
                                                <HardDrive className="h-3 w-3 opacity-50" />
                                                {snapshot.AllocatedStorage} GB
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${snapshot.Status === 'available'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {snapshot.Status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteBackup(snapshot.DBSnapshotIdentifier)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t px-6 py-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                    Only manual snapshots are listed here. Automated daily backups are managed by AWS and can be restored via the AWS Console or API.
                </p>
            </CardFooter>
        </Card>
    )
}
