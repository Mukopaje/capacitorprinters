"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface SimpleEditorProps {
    value: string
    onChange: (value: string) => void
    label?: string
    placeholder?: string
    className?: string
}

export function SimpleEditor({ value, onChange, label, placeholder, className }: SimpleEditorProps) {
    return (
        <div className={className}>
            {label && <Label className="mb-2 block">{label}</Label>}
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="min-h-[300px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
                Supports HTML and Markdown. Use &lt;h1&gt;, &lt;p&gt;, &lt;b&gt; etc. for formatting.
            </p>
        </div>
    )
}
