"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", slug: "", description: "", image: "", monthlyTarget: 0, isActive: true
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (e) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingId(category._id);
      setFormData({
        title: category.title,
        slug: category.slug,
        description: category.description,
        image: category.image,
        monthlyTarget: category.monthlyTarget,
        isActive: category.isActive
      });
    } else {
      setEditingId(null);
      setFormData({ title: "", slug: "", description: "", image: "", monthlyTarget: 0, isActive: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      
      if (res.ok) {
        toast.success(`Category ${editingId ? "updated" : "created"}`);
        setIsDialogOpen(false);
        fetchCategories();
      } else {
        toast.error(json.error || "Something went wrong");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error("Failed to delete");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. food-donation" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Monthly Target (₹)</Label>
                <Input type="number" required min="0" value={formData.monthlyTarget} onChange={e => setFormData({...formData, monthlyTarget: Number(e.target.value)})} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData({...formData, isActive: checked === true})} />
                <Label htmlFor="isActive">Active (Visible to users)</Label>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No categories found.</TableCell></TableRow>
            ) : (
              categories.map(cat => (
                <TableRow key={cat._id}>
                  <TableCell className="font-medium">{cat.title}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>₹{cat.monthlyTarget.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${cat.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(cat)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(cat._id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
