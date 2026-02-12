"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Book, FileText, ChevronRight, Loader2 } from "lucide-react"

// Define types for our data
interface Category {
    id: string;
    name: string;
    description: string;
    slug: string;
    articles: Article[];
}

interface Article {
    id: string;
    title: string;
    slug: string;
    summary: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function DocsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Article[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch(`${API_URL}/knowledge-base/categories/public`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch docs categories:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCategories();
    }, []);

    // Simple client-side search or debounce server search
    // implementing naive client side for now if categories have articles included
    // But typically we should use the search endpoint
    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`${API_URL}/knowledge-base/search?q=${searchTerm}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Hero Section */}
            <div className="bg-[#30acb4] dark:bg-slate-900 py-16 px-4 text-center ">
                <h1 className="text-3xl font-bold text-white mb-4">How can we help you?</h1>
                <div className="max-w-xl mx-auto relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                        className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-100 focus-visible:ring-white/30"
                        placeholder="Search for articles, guides, and tutorials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="container py-12 max-w-5xl mx-auto px-4">
                {/* Search Results */}
                {searchTerm && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            {isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                            Search Results
                        </h2>
                        {searchResults.length > 0 ? (
                            <div className="grid gap-4">
                                {searchResults.map((article) => (
                                    <Link key={article.id} href={`/docs/${article.slug}`} className="block group">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border hover:border-[#30acb4] transition-colors">
                                            <h3 className="font-medium text-lg text-slate-900 dark:text-slate-100 group-hover:text-[#30acb4]">
                                                {article.title}
                                            </h3>
                                            <p className="text-slate-500 text-sm mt-1 line-clamp-2">{article.summary}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            !isSearching && <p className="text-slate-500">No results found for "{searchTerm}"</p>
                        )}
                    </div>
                )}

                {/* Categories Grid */}
                {!searchTerm && (
                    <>
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-[#30acb4]" />
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map((category) => (
                                    <div key={category.id} className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm p-6">
                                        <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 text-[#30acb4]">
                                            <Book className="h-6 w-6" />
                                        </div>
                                        <h2 className="text-xl font-bold mb-2">{category.name}</h2>
                                        <p className="text-slate-500 text-sm mb-6 h-10 line-clamp-2">
                                            {category.description || "Browse articles in this category."}
                                        </p>

                                        <div className="space-y-3">
                                            {category.articles?.slice(0, 5).map((article) => (
                                                <Link key={article.id} href={`/docs/${article.slug}`} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-[#30acb4] transition-colors group">
                                                    <FileText className="h-4 w-4 text-slate-400 group-hover:text-[#30acb4]" />
                                                    <span className="line-clamp-1">{article.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        {category.articles?.length > 5 && (
                                            <Button variant="ghost" size="sm" className="mt-4 w-full text-slate-500 hover:text-[#30acb4]">
                                                View all {category.articles.length} articles <ChevronRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* If no categories found */}
                        {!isLoading && categories.length === 0 && (
                            <div className="text-center py-20">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-6">
                                    <Book className="h-8 w-8 text-slate-400" />
                                </div>
                                <h2 className="text-xl font-semibold">Documentation Coming Soon</h2>
                                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                                    We are currently building our knowledge base. Please contact support if you need immediate assistance.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
