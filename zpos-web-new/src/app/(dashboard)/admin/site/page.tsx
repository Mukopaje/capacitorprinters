"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, Edit, Save, Video, Image as ImageIcon, Settings, Upload, CheckCircle2, X, BarChart3, Box, MapPin, Smartphone, CreditCard, Users, Shield, Zap } from "lucide-react"
import { siteContentService, SiteContent, SiteSettings } from "@/services/site-content"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const ICON_OPTIONS = [
    { name: 'BarChart3', icon: BarChart3 },
    { name: 'Box', icon: Box },
    { name: 'MapPin', icon: MapPin },
    { name: 'Smartphone', icon: Smartphone },
    { name: 'CreditCard', icon: CreditCard },
    { name: 'Users', icon: Users },
    { name: 'Shield', icon: Shield },
    { name: 'Zap', icon: Zap },
]

export default function AdminSitePage() {
    const [content, setContent] = useState<SiteContent[]>([])
    const [settings, setSettings] = useState<SiteSettings>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentItem, setCurrentItem] = useState<Partial<SiteContent> | null>(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [contentData, settingsData] = await Promise.all([
                siteContentService.getAllContent(),
                siteContentService.getSettings()
            ])
            setContent(contentData)
            setSettings(settingsData)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveItem = async () => {
        try {
            if (currentItem?.id) {
                await siteContentService.updateContent(currentItem.id, currentItem)
            } else {
                await siteContentService.createContent(currentItem || {})
            }
            setIsDialogOpen(false)
            fetchData()
        } catch (error) {
            alert("Failed to save item")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            await siteContentService.deleteContent(id)
            fetchData()
        } catch (error) {
            alert("Failed to delete item")
        }
    }

    const handleUpdateSetting = async (key: string, value: string) => {
        try {
            await siteContentService.updateSetting(key, value)
            setSettings({ ...settings, [key]: value })
        } catch (error) {
            alert("Failed to update setting")
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const url = await siteContentService.uploadFile(file, type)
            if (currentItem) {
                setCurrentItem({ ...currentItem, imageUrl: url })
            } else if (type === 'demo') {
                await handleUpdateSetting('demo_video_path', url)
            }
        } catch (error) {
            alert("Upload failed")
        } finally {
            setUploading(false)
        }
    }

    const openEdit = (item: SiteContent) => {
        setCurrentItem({ ...item })
        setIsDialogOpen(true)
    }

    const openAdd = (type: any) => {
        const defaults: any = {
            type,
            isActive: true,
            order: content.filter(i => i.type === type).length,
            metadata: {}
        }
        if (type === 'solution') defaults.metadata = { features: [], color: 'bg-blue-500', popular: false }
        if (type === 'pricing') defaults.metadata = { price: 0, period: 'month', features: [], highlighted: false }

        setCurrentItem(defaults)
        setIsDialogOpen(true)
    }

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
                    <p className="text-muted-foreground">Manage your landing page content, sections, and global settings.</p>
                </div>

                <Tabs defaultValue="carousel" className="space-y-4">
                    <TabsList className="bg-muted p-1 rounded-lg">
                        <TabsTrigger value="carousel"><ImageIcon className="mr-2 h-4 w-4" />Carousel</TabsTrigger>
                        <TabsTrigger value="solutions"><CheckCircle2 className="mr-2 h-4 w-4" />Solutions</TabsTrigger>
                        <TabsTrigger value="pricing"><CheckCircle2 className="mr-2 h-4 w-4" />Pricing</TabsTrigger>
                        <TabsTrigger value="features"><CheckCircle2 className="mr-2 h-4 w-4" />Features</TabsTrigger>
                        <TabsTrigger value="demo"><Video className="mr-2 h-4 w-4" />Video</TabsTrigger>
                        <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="carousel" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Hero Carousel Items</h2>
                            <Button onClick={() => openAdd('carousel')}><Plus className="mr-2 h-4 w-4" />Add Slide</Button>
                        </div>
                        <ContentTable items={content.filter(i => i.type === 'carousel')} onEdit={openEdit} onDelete={handleDelete} />
                    </TabsContent>

                    <TabsContent value="solutions" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Solutions (Choose your path)</h2>
                            <Button onClick={() => openAdd('solution')}><Plus className="mr-2 h-4 w-4" />Add Solution</Button>
                        </div>
                        <ContentTable items={content.filter(i => i.type === 'solution')} onEdit={openEdit} onDelete={handleDelete} />
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Pricing Plans</h2>
                            <Button onClick={() => openAdd('pricing')}><Plus className="mr-2 h-4 w-4" />Add Plan</Button>
                        </div>
                        <ContentTable items={content.filter(i => i.type === 'pricing')} onEdit={openEdit} onDelete={handleDelete} />
                    </TabsContent>

                    <TabsContent value="features" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Key Features</h2>
                            <Button onClick={() => openAdd('feature')}><Plus className="mr-2 h-4 w-4" />Add Feature</Button>
                        </div>
                        <ContentTable items={content.filter(i => i.type === 'feature')} onEdit={openEdit} onDelete={handleDelete} />
                    </TabsContent>

                    <TabsContent value="demo">
                        <Card>
                            <CardHeader>
                                <CardTitle>Demo Video Settings</CardTitle>
                                <CardDescription>Configure the landing page demo video.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>YouTube/External URL</Label>
                                    <div className="flex gap-2">
                                        <Input value={settings.demo_video_url || ""} onChange={e => setSettings({ ...settings, demo_video_url: e.target.value })} />
                                        <Button onClick={() => handleUpdateSetting('demo_video_url', settings.demo_video_url || "")}>Save</Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Direct MP4 Upload</Label>
                                    <div className="flex items-center gap-2">
                                        <Input type="file" onChange={e => handleFileUpload(e, 'demo')} disabled={uploading} />
                                        {settings.demo_video_path && <Badge>Active</Badge>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card>
                            <CardHeader><CardTitle>Global Site Settings</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label>Active Storage Provider</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={settings.storage_provider || "local"}
                                            onChange={e => handleUpdateSetting('storage_provider', e.target.value)}
                                        >
                                            <option value="local">Local</option>
                                            <option value="aws">S3</option>
                                            <option value="gcp">GCP</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{currentItem?.id ? 'Edit Item' : 'New Item'}</DialogTitle>
                            <DialogDescription asChild>
                                <div className="text-sm text-muted-foreground">
                                    Content Type: <Badge variant="outline">{currentItem?.type}</Badge>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Title / Heading</Label>
                                <Input value={currentItem?.title || ""} onChange={e => setCurrentItem({ ...currentItem, title: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Description / Subtext</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={currentItem?.description || ""}
                                    onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                                />
                            </div>

                            {/* Metadata sections */}
                            {currentItem?.type === 'solution' && (
                                <div className="space-y-4 border-t pt-4">
                                    <Label className="font-bold">Solution Details</Label>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Inclusion Features</Label>
                                        <ChipInput
                                            values={currentItem.metadata?.features || []}
                                            onChange={features => setCurrentItem({ ...currentItem, metadata: { ...currentItem.metadata, features } })}
                                            placeholder="Add a feature..."
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={currentItem.metadata?.popular} onCheckedChange={v => setCurrentItem({ ...currentItem, metadata: { ...currentItem.metadata, popular: v } })} />
                                        <Label>Mark as Popular</Label>
                                    </div>
                                </div>
                            )}

                            {currentItem?.type === 'pricing' && (
                                <div className="space-y-4 border-t pt-4">
                                    <Label className="font-bold">Pricing Details</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Amount (ZMW)</Label>
                                            <Input type="number" placeholder="Price" value={currentItem.metadata?.price} onChange={e => setCurrentItem({ ...currentItem, metadata: { ...currentItem.metadata, price: parseFloat(e.target.value) } })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Billing Period</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={currentItem.metadata?.period || "month"}
                                                onChange={e => setCurrentItem({ ...currentItem, metadata: { ...currentItem.metadata, period: e.target.value } })}
                                            >
                                                <option value="month">Per Month</option>
                                                <option value="year">Per Year</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Included Features</Label>
                                        <ChipInput
                                            values={currentItem.metadata?.features || []}
                                            onChange={features => setCurrentItem({ ...currentItem, metadata: { ...currentItem.metadata, features } })}
                                            placeholder="Add a feature..."
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={currentItem.metadata?.highlighted} onCheckedChange={v => setCurrentItem({ ...currentItem, metadata: { ...currentItem.metadata, highlighted: v } })} />
                                        <Label>Highlight as Best Value</Label>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2 border-t pt-4">
                                <Label className="font-bold">{currentItem?.type === 'feature' ? 'Assign Icon' : 'Image / Cover'}</Label>
                                {currentItem?.type === 'feature' ? (
                                    <IconSelector
                                        selected={currentItem.imageUrl || ""}
                                        onSelect={icon => setCurrentItem({ ...currentItem, imageUrl: icon })}
                                    />
                                ) : (
                                    <div className="flex gap-2">
                                        <Input value={currentItem?.imageUrl || ""} onChange={e => setCurrentItem({ ...currentItem, imageUrl: e.target.value })} />
                                        <Button variant="outline" size="icon" className="relative">
                                            <Upload className="h-4 w-4" />
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload(e, 'site')} disabled={uploading} />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Order</Label>
                                    <Input type="number" value={currentItem?.order || 0} onChange={e => setCurrentItem({ ...currentItem, order: parseInt(e.target.value) })} />
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <Switch checked={currentItem?.isActive} onCheckedChange={v => setCurrentItem({ ...currentItem, isActive: v })} />
                                    <Label>Active</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button className="w-full" onClick={handleSaveItem}>Save Section Content</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

function ChipInput({ values, onChange, placeholder }: { values: string[], onChange: (v: string[]) => void, placeholder?: string }) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!values.includes(inputValue.trim())) {
                onChange([...values, inputValue.trim()]);
            }
            setInputValue("");
        }
    };

    const removeChip = (index: number) => {
        const newValues = [...values];
        newValues.splice(index, 1);
        onChange(newValues);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20 min-h-[40px]">
                {values.map((val, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {val}
                        <button onClick={() => removeChip(i)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                {values.length === 0 && <span className="text-xs text-muted-foreground p-1">No features added.</span>}
            </div>
            <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="h-8 text-xs"
            />
        </div>
    );
}

function IconSelector({ selected, onSelect }: { selected: string, onSelect: (v: string) => void }) {
    return (
        <div className="grid grid-cols-4 gap-2 border rounded-md p-3 bg-muted/10">
            {ICON_OPTIONS.map(({ name, icon: Icon }) => (
                <button
                    key={name}
                    type="button"
                    onClick={() => onSelect(name)}
                    className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-md border transition-all hover:bg-primary/10",
                        selected === name ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" : "border-transparent bg-background text-muted-foreground"
                    )}
                >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-[10px] truncate w-full text-center">{name}</span>
                </button>
            ))}
        </div>
    );
}

function ContentTable({ items, onEdit, onDelete }: { items: SiteContent[], onEdit: (i: SiteContent) => void, onDelete: (id: string) => void }) {
    return (
        <Card className="overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell className="capitalize text-xs text-muted-foreground">{item.type}</TableCell>
                            <TableCell>{item.order}</TableCell>
                            <TableCell><Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Active" : "Hidden"}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No items found for this section.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Card>
    )
}
