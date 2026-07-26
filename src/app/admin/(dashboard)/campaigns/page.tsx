"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format";
import { Megaphone, Users, Loader2, Send } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New Campaign Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [audience, setAudience] = useState("");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users?limit=1000");
      const data = await res.json();
      if (data.success) {
        setUsersList(data.data);
      }
    } catch {
      console.error("Failed to fetch users for campaign selection");
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchUsers();
  }, [fetchCampaigns, fetchUsers]);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || !audience) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (audience === "specific_users" && selectedEmails.length === 0) {
      toast.error("Please select at least one user to send the campaign to");
      return;
    }

    if (!confirm(`Are you sure you want to send this campaign to ${audience.replace('_', ' ')}?`)) {
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, linkUrl, linkText, audience, specificEmails: selectedEmails }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Campaign sent successfully!");
        setIsDialogOpen(false);
        // Reset form
        setTitle("");
        setMessage("");
        setLinkUrl("");
        setLinkText("");
        setAudience("");
        setSelectedEmails([]);
        setSearchQuery("");
        fetchCampaigns();
      } else {
        toast.error(data.error || "Failed to send campaign");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns & Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Send bulk emails to registered users and past donors.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Megaphone className="w-4 h-4 mr-2" />
            New Campaign
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Draft New Campaign</DialogTitle>
              <DialogDescription>
                Write an email to broadcast to your supporters.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendCampaign} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Subject Line <span className="text-red-500">*</span></Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g., Urgent Flood Relief Appeal" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Message Body <span className="text-red-500">*</span></Label>
                <Textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  rows={6}
                  placeholder="Type your email message here..." 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Link (Optional)</Label>
                  <Input 
                    type="url"
                    value={linkUrl} 
                    onChange={(e) => setLinkUrl(e.target.value)} 
                    placeholder="https://mangal.org/donate" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input 
                    value={linkText} 
                    onChange={(e) => setLinkText(e.target.value)} 
                    placeholder="Donate Now" 
                    disabled={!linkUrl}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Target Audience <span className="text-red-500">*</span></Label>
                <Select value={audience} onValueChange={setAudience} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">All Registered Users</SelectItem>
                    <SelectItem value="past_donors">Past Donors (Successful Payments)</SelectItem>
                    <SelectItem value="specific_users">Specific Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {audience === "specific_users" && (
                <div className="space-y-3 pt-2">
                  <Label>Select Recipients ({selectedEmails.length} selected)</Label>
                  <Input 
                    placeholder="Search users by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                    {usersList
                      .filter(u => 
                        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((u) => (
                        <label key={u._id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300"
                            checked={selectedEmails.includes(u.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmails([...selectedEmails, u.email]);
                              } else {
                                setSelectedEmails(selectedEmails.filter(email => email !== u.email));
                              }
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{u.name || "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                          </div>
                        </label>
                      ))}
                    {usersList.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">No users found.</div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-end gap-3 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSending}>
                  {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {isSending ? "Sending..." : "Blast Email"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>A log of all broadcast emails sent from the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Sent</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead className="text-right">Recipients</TableHead>
                  <TableHead>Sent By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p>No campaigns have been sent yet.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDateTime(c.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">{c.title}</TableCell>
                      <TableCell>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          {c.audience.replace('_', ' ').toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 font-bold">
                          {c.recipientsCount} <Users className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.sentBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
