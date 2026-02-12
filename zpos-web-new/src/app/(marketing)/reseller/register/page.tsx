"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Store, BadgeCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

// We'll update the services to include reseller registration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function ResellerRegisterPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            password: formData.get('password') as string,
        }

        try {
            // Direct fetch since we haven't updated the service file yet
            // In a real app, addTo authService or resellerService
            const response = await fetch(`${API_URL}/reseller/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            // Login automatically or redirect to login?
            // Since the endpoint returns the saved reseller but not a token (yet),
            // we should redirect to login.
            router.push('/login?registered=reseller')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900/50 px-4 py-8">
            <Card className="w-full max-w-lg border-orange-200 dark:border-orange-900/50">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                            <BadgeCheck className="h-8 w-8 text-orange-600 dark:text-orange-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Become a Partner</CardTitle>
                    <CardDescription>
                        Join our reseller program and earn commissions by helping businesses grow with ZPOS.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={onSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" name="email" type="email" placeholder="partner@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="+260..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Create Password</Label>
                            <Input id="password" name="password" type="password" required />
                            <p className="text-xs text-muted-foreground">This will be used to access your reseller dashboard.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 mt-4">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Register as Partner
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Already a partner?{" "}
                            <Link href="/login" className="font-medium text-orange-600 hover:underline">
                                Log in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
