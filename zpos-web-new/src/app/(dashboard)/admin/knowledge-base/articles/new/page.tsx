"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RichEditor } from "@/components/ui/rich-editor"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { authService } from "@/services/auth"
import { Textarea } from "@/components/ui/textarea"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function NewArticlePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])

    // Form state
    const [title, setTitle] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [content, setContent] = useState("")
    const [summary, setSummary] = useState("")
    const [isPublished, setIsPublished] = useState(false)

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
                if (data.length > 0) setCategoryId(data[0].id)
            }
        } catch (error) {
            console.error("Failed to fetch categories", error)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch(`${API_URL}/knowledge-base/articles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    title,
                    content,
                    categoryId,
                    summary,
                    isPublished
                })
            })

            if (res.ok) {
                router.push('/admin/knowledge-base/articles')
            } else {
                console.error("Failed to create article")
            }
        } catch (error) {
            console.error("Error creating article", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/knowledge-base/articles">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">New Article</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/knowledge-base/articles">Cancel</Link>
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" /> Save Article
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 bg-white dark:bg-slate-900 p-6 rounded-lg border shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Article Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. How to get started"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                        id="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Brief description for search results..."
                        maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground text-right">{summary.length}/200</p>
                </div>

                <RichEditor
                    value={content}
                    onChange={setContent}
                    label="Content"
                    placeholder="Write your article here..."
                />

                <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                        <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                        <Label htmlFor="published">Publish immediately</Label>
                    </div>
                </div>
            </div>
        </div>
    )
}
