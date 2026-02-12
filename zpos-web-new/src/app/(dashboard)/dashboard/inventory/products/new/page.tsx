"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { productsService } from "@/services/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // We might need to create this or use standard textarea
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        category: '',
        price: '',
        cost: '',
        stock_quantity: '',
        description: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await productsService.create({
                name: formData.name,
                sku: formData.sku,
                barcode: formData.barcode,
                category: formData.category,
                price: parseFloat(formData.price) || 0,
                cost: parseFloat(formData.cost) || 0,
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                description: formData.description
            })
            router.push('/dashboard/inventory/products')
        } catch (error) {
            console.error("Failed to create product", error)
            alert("Failed to create product. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/inventory/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                        <CardDescription>Enter the basic information for your new product.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Coca Cola 500ml" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Beverages" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input id="barcode" name="barcode" value={formData.barcode} onChange={handleChange} placeholder="Scan barcode" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Selling Price *</Label>
                                <Input id="price" name="price" type="number" step="0.01" required value={formData.price} onChange={handleChange} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Cost Price</Label>
                                <Input id="cost" name="cost" type="number" step="0.01" value={formData.cost} onChange={handleChange} placeholder="0.00" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock_quantity">Initial Stock</Label>
                                <Input id="stock_quantity" name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleChange} placeholder="0" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="Stock Keeping Unit" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" value={formData.description} onChange={handleChange} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Product
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
