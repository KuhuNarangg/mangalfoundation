"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/upload-client";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    memberId: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    profilePicture: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/member/profile");
      const data = await res.json();
      if (res.ok) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          bloodGroup: data.bloodGroup || "",
          memberId: data.memberId || "",
          emergencyContactName: data.emergencyContactName || "",
          emergencyContactPhone: data.emergencyContactPhone || "",
          emergencyContactRelation: data.emergencyContactRelation || "",
          profilePicture: data.profilePicture || "",
        });
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info("Uploading image...");
      const results = await uploadFiles([file]);
      if (results && results.length > 0) {
        setFormData({ ...formData, profilePicture: results[0].url });
        toast.success("Image uploaded!");
      }
    } catch {
      toast.error("Failed to upload image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/member/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and emergency contacts.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden border">
                {formData.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">No Img</div>
                )}
              </div>
              <div>
                <Label htmlFor="picture" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
                  Change Picture
                </Label>
                <input id="picture" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Member ID</Label>
                <Input value={formData.memberId} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.name} disabled />
                <p className="text-xs text-muted-foreground">Contact admin to change name</p>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={formData.bloodGroup || ""} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>Who should we contact in case of an emergency during an event?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input value={formData.emergencyContactRelation} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })} placeholder="Parent / Sibling / Spouse" />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
