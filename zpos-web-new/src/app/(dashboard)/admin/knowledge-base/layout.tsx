import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function KnowledgeBaseLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
                    <p className="text-muted-foreground">Manage help articles and documentation categories.</p>
                </div>
            </div>

            <Tabs defaultValue="articles" className="w-full">
                <TabsList>
                    <Link href="/admin/knowledge-base/articles">
                        <TabsTrigger value="articles">Articles</TabsTrigger>
                    </Link>
                    <Link href="/admin/knowledge-base/categories">
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                    </Link>
                </TabsList>
                {/* We don't put content inside TabsContent because we use routing for tabs */}
            </Tabs>

            <div>{children}</div>
        </div>
    )
}
