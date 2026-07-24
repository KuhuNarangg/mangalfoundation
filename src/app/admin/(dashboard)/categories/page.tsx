"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Wallet, BarChart3 } from "lucide-react";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { formatINR } from "@/lib/format";

const EMPTY = {
  title: "",
  slug: "",
  description: "",
  image: "",
  monthlyTarget: 0,
  isActive: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY });
  const [budgetCat, setBudgetCat] = useState<any>(null);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
        return json.data as any[];
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
    return [];
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openDialog = (category?: any) => {
    if (category) {
      setEditingId(category._id);
      setFormData({
        title: category.title,
        slug: category.slug,
        description: category.description,
        image: category.image,
        monthlyTarget: category.monthlyTarget,
        isActive: category.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({ ...EMPTY });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Category ${editingId ? "updated" : "created"}`);
        setIsDialogOpen(false);
        fetchCategories();
      } else {
        toast.error(json.error || "Something went wrong");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else {
      toast.error(json.error || "Failed to delete");
    }
  };

  const applyBudget = async (op: string) => {
    if (!budgetCat) return;
    const amount = Number(budgetAmount);
    if (op !== "reset" && (!amount || amount <= 0)) {
      toast.error("Enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${budgetCat._id}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op, amount: op === "reset" ? undefined : amount }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Budget updated (${op})`);
        setBudgetAmount("");
        const fresh = await fetchCategories();
        const updated = fresh.find((c) => c._id === budgetCat._id);
        if (updated) setBudgetCat(updated);
      } else {
        toast.error(json.error || "Failed");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="bg-card rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Raised (Month)</TableHead>
              <TableHead className="w-40">Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/categories/${cat._id}`} className="hover:text-rose-600 hover:underline">
                      {cat.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">{cat.slug}</div>
                  </TableCell>
                  <TableCell>{formatINR(cat.budget?.effectiveTarget ?? cat.monthlyTarget)}</TableCell>
                  <TableCell>{formatINR(cat.budget?.raised)}</TableCell>
                  <TableCell>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-orange-500"
                        style={{ width: `${cat.budget?.progress || 0}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {cat.budget?.progress || 0}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        cat.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Link href={`/admin/categories/${cat._id}`}>
                      <Button variant="ghost" size="icon" title="View details & donation logs">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" title="Budget" onClick={() => setBudgetCat(cat)}>
                      <Wallet className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => openDialog(cat)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete" className="text-red-500" onClick={() => handleDelete(cat._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. food-donation" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex gap-2">
                <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://... or upload" />
                <CloudinaryUpload
                  folder="mangal/categories"
                  accept="image/*"
                  label="Upload"
                  onUploaded={(m) => setFormData((f) => ({ ...f, image: m[0].url }))}
                />
              </div>
              {formData.image && (
                <div className="relative h-32 w-full rounded-md overflow-hidden border mt-2">
                  <Image src={formData.image} alt="preview" fill className="object-cover" sizes="400px" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Monthly Target (₹)</Label>
              <Input type="number" required min="0" value={formData.monthlyTarget} onChange={(e) => setFormData({ ...formData, monthlyTarget: Number(e.target.value) })} />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={(c) => setFormData({ ...formData, isActive: c === true })} />
              <Label htmlFor="isActive">Active (visible to donors)</Label>
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Budget dialog */}
      <Dialog open={!!budgetCat} onOpenChange={(o) => !o && setBudgetCat(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Budget — {budgetCat?.title}</DialogTitle>
          </DialogHeader>
          {budgetCat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Monthly Target" value={formatINR(budgetCat.budget?.monthlyTarget)} />
                <Stat label="Emergency" value={formatINR(budgetCat.budget?.emergencyBudget)} />
                <Stat label="Carry Forward" value={formatINR(budgetCat.budget?.carryForward)} />
                <Stat label="Effective Target" value={formatINR(budgetCat.budget?.effectiveTarget)} />
                <Stat label="Raised (Month)" value={formatINR(budgetCat.budget?.raised)} />
                <Stat label="Remaining" value={formatINR(budgetCat.budget?.remaining)} />
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-orange-500"
                  style={{ width: `${budgetCat.budget?.progress || 0}%` }}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" min="0" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="e.g. 10000" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={busy} onClick={() => applyBudget("increase")}>Increase Target</Button>
                <Button variant="outline" disabled={busy} onClick={() => applyBudget("decrease")}>Decrease Target</Button>
                <Button variant="outline" disabled={busy} onClick={() => applyBudget("set")}>Set Target</Button>
                <Button variant="outline" disabled={busy} onClick={() => applyBudget("emergency")}>Add Emergency</Button>
                <Button variant="outline" disabled={busy} onClick={() => applyBudget("carryforward")}>Carry Forward</Button>
                <Button variant="outline" disabled={busy} className="text-red-600" onClick={() => applyBudget("reset")}>Reset Extras</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-md p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
