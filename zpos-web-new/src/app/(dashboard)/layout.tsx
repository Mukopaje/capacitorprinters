"use client"

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const user = authService.getUser();
        const token = authService.getToken();

        if (!token || !user) {
            router.push("/login");
            return;
        }

        // Protection logic for specific routes
        if (pathname.startsWith("/admin") && !user.role.includes("admin")) {
            router.push("/dashboard");
            return;
        }

        if (pathname.startsWith("/reseller") && !user.role.includes("reseller")) {
            router.push("/dashboard");
            return;
        }

        setIsLoading(false);
    }, [router, pathname]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
