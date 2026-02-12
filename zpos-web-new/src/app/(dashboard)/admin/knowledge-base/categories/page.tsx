"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { authService } from "@/services/auth"

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    order: number;
    articles: any[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    // Form states
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [order, setOrder] = useState<number>(0)

    useEffect(() => {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        try {
            const res = await fetch(`${API_URL}/knowledge-base/categories`, {
                headers: { Authorization: `Bearer ${authService.getToken()}` }
            })
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error("Failed to fetch categories", error)
        } finally {
            setIsLoading(false)
        }
    }

    function handleEdit(category: Category) {
        setEditingCategory(category)
        setName(category.name)
        setDescription(category.description)
        setOrder(category.order)
        setIsOpen(true)
    }

    function handleNew() {
        setEditingCategory(null)
        setName("")
        setDescription("")
        setOrder(0)
        setIsOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSaving(true)

        try {
            const url = editingCategory
                ? `${API_URL}/knowledge-base/categories/${editingCategory.id}`
                : `${API_URL}/knowledge-base/categories`

            const method = editingCategory ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({ name, description, order: Number(order) })
            })

            if (res.ok) {
                setIsOpen(false)
                fetchCategories()
            } else {
                console.error("Failed to save category")
            }
        } catch (error) {
            console.error("Error saving category", error)
        } finally {
            setIsSaving(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure? This will delete the category.")) return

        try {
            await fetch(`${API_URL}/knowledge-base/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authService.getToken()}` }
            })
            fetchCategories()
        } catch (error) {
            console.error("Failed to delete category", error)
        }
    }

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Categories</h2>
                <Button onClick={handleNew}>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-slate-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>{category.order}</TableCell>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(category.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
                        <DialogDescription>
                            Organize your knowledge base articles.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="order">Sort Order</Label>
                                <Input id="order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
