"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronRight, ArrowLeft, Calendar, User, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Article {
    id: string;
    title: string;
    content: string;
    summary: string;
    updated_at: string;
    category: {
        id: string;
        name: string;
        slug: string;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function ArticlePage() {
    const params = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchArticle() {
            try {
                const res = await fetch(`${API_URL}/knowledge-base/articles/public/${params.slug}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        router.push('/404'); // Or handle gracefully
                        return;
                    }
                    throw new Error('Failed to fetch article');
                }
                const data = await res.json();
                setArticle(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        if (params.slug) {
            fetchArticle();
        }
    }, [params.slug, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-[#30acb4]" />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Article Not Found</h1>
                <p className="text-slate-500 mb-6">The article you are looking for does not exist or has been moved.</p>
                <Button asChild>
                    <Link href="/docs">Back to Documentation</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Breadcrumb / Nav */}
            <div className="bg-white dark:bg-slate-800 border-b">
                <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center text-sm">
                    <Link href="/docs" className="text-slate-500 hover:text-[#30acb4] flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" /> Back to Docs
                    </Link>
                    <ChevronRight className="h-4 w-4 text-slate-300 mx-2" />
                    <span className="text-slate-500">{article.category?.name}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 mx-2" />
                    <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px] md:max-w-xs">
                        {article.title}
                    </span>
                </div>
            </div>

            <article className="container max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm p-8 md:p-12">
                    <header className="mb-8 border-b pb-8">
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                                {article.category?.name}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(article.updated_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                5 min read
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                            {article.title}
                        </h1>
                    </header>

                    {/* Content */}
                    <div
                        className="prose prose-slate dark:prose-invert max-w-none 
                        prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                        prose-a:text-[#30acb4] prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-xl prose-img:border"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </div>

                <div className="mt-8 flex justify-center">
                    <p className="text-sm text-slate-500">
                        Was this article helpful? <a href="#" className="text-[#30acb4] hover:underline">Contact Support</a> if you need more help.
                    </p>
                </div>
            </article>
        </div>
    )
}
