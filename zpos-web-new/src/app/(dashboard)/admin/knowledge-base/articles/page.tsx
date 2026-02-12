"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Search, FileText } from "lucide-react"
import { authService } from "@/services/auth"

interface Article {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    views: number;
    category: {
        name: string;
    };
    created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchArticles()
    }, [])

    async function fetchArticles() {
        try {
            const res = await fetch(`${API_URL}/knowledge-base/articles`, {
                headers: { Authorization: `Bearer ${authService.getToken()}` }
            })
            if (res.ok) {
                const data = await res.json()
                setArticles(data)
            }
        } catch (error) {
            console.error("Failed to fetch articles", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure? This will delete the article.")) return

        try {
            await fetch(`${API_URL}/knowledge-base/articles/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authService.getToken()}` }
            })
            fetchArticles()
        } catch (error) {
            console.error("Failed to delete article", error)
        }
    }

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category?.name.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search articles..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/admin/knowledge-base/articles/new">
                        <Plus className="mr-2 h-4 w-4" /> New Article
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-slate-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Views</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredArticles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No articles found.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredArticles.map((article) => (
                            <TableRow key={article.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        {article.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground ml-6">/{article.slug}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{article.category?.name || 'Uncategorized'}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={article.is_published ? "default" : "secondary"}>
                                        {article.is_published ? "Published" : "Draft"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{article.views}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/admin/knowledge-base/articles/${article.id}`}>
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(article.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
