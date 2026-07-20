"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    categoryId: "", title: "", description: "", amount: 0, image: "", isActive: true
  });

  const fetchData = async () => {
    try {
      const [pkgRes, catRes] = await Promise.all([
        fetch("/api/admin/packages"),
        fetch("/api/admin/categories")
      ]);
      const pkgJson = await pkgRes.json();
      const catJson = await catRes.json();
      
      if (pkgJson.success) setPackages(pkgJson.data);
      if (catJson.success) setCategories(catJson.data);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (pkg?: any) => {
    if (pkg) {
      setEditingId(pkg._id);
      setFormData({
        categoryId: pkg.categoryId?._id || pkg.categoryId,
        title: pkg.title,
        description: pkg.description,
        amount: pkg.amount,
        image: pkg.image || "",
        isActive: pkg.isActive
      });
    } else {
      setEditingId(null);
      setFormData({ categoryId: "", title: "", description: "", amount: 0, image: "", isActive: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      const url = editingId ? `/api/admin/packages/${editingId}` : "/api/admin/packages";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      
      if (res.ok) {
        toast.success(`Package ${editingId ? "updated" : "created"}`);
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast.error(json.error || "Something went wrong");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Package deleted");
        fetchData();
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
        <h1 className="text-3xl font-bold tracking-tight">Donation Packages</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4" /> Add Package</Button>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Package" : "Add New Package"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.categoryId} onValueChange={(val) => setFormData({...formData, categoryId: val || ""})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Sponsor a child" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input type="number" required min="1" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} />
              </div>

              <div className="space-y-2">
                <Label>Image URL (Optional)</Label>
                <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
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
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : packages.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No packages found.</TableCell></TableRow>
            ) : (
              packages.map(pkg => (
                <TableRow key={pkg._id}>
                  <TableCell className="font-medium">{pkg.title}</TableCell>
                  <TableCell>{pkg.categoryId?.title || "Unknown"}</TableCell>
                  <TableCell>₹{pkg.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${pkg.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pkg)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(pkg._id)}><Trash2 className="h-4 w-4" /></Button>
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
