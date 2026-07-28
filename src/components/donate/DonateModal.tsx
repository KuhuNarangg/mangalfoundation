"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function DonateModal({
  category,
  pkg,
  isCustom,
  isOpen,
  onClose,
  categories = [],
  onSuccess
}: {
  category: any;
  pkg: any;
  isCustom: boolean;
  isOpen: boolean;
  onClose: () => void;
  categories?: any[];
  onSuccess?: () => void;
}) {
  const [customAmount, setCustomAmount] = useState("");
  const [customCategoryId, setCustomCategoryId] = useState(category?._id || "");
  
  const [formData, setFormData] = useState({
    donorName: "", email: "", phone: "", pan: "", gst: "", isAnonymous: false, message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [donationId, setDonationId] = useState<string | null>(null);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalAmount = 0;
    if (isCustom) {
      finalAmount = Number(customAmount);
      if (finalAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
    } else {
      finalAmount = pkg.amount;
    }

    setSubmitting(true);
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Failed to load payment gateway. Please check your connection.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/public/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          donorName: formData.isAnonymous ? "Anonymous" : formData.donorName,
          categoryId: isCustom ? (customCategoryId || category?._id) : category?._id,
          packageId: isCustom ? null : pkg?._id,
          amount: finalAmount
        })
      });
      const json = await res.json();
      
      if (!res.ok) {
        toast.error(json.error || "Failed to process donation request");
        setSubmitting(false);
        return;
      }

      setDonationId(json.donationId);

      const options = {
        key: json.keyId,
        amount: json.amount,
        currency: json.currency,
        name: "Mangal Guruji Foundation",
        description: `Donation for ${category?.title || "Custom"}`,
        order_id: json.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/public/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyJson = await verifyRes.json();
            if (verifyRes.ok) {
              setSuccess(true);
              setFormData({ donorName: "", email: "", phone: "", pan: "", gst: "", isAnonymous: false, message: "" });
              if (onSuccess) onSuccess();
            } else {
              toast.error(verifyJson.error || "Payment verification failed");
            }
          } catch (e) {
            toast.error("An error occurred during verification");
          }
        },
        prefill: {
          name: formData.isAnonymous ? "Anonymous" : formData.donorName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      paymentObject.open();

    } catch (e) {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSuccess(false);
    setDonationId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[90vh] border-0 rounded-none shadow-2xl">
        {success ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 bg-white">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-heading text-charcoal">Thank You!</h3>
            <p className="text-gray-600 font-light text-center">
              Your donation has been verified successfully. <br/>
              An email receipt will be sent to you shortly.
            </p>
            {donationId && (
              <a href={`/receipt/${donationId}`} target="_blank" rel="noreferrer" className="w-full mt-6">
                <Button variant="outline" className="w-full rounded-none tracking-widest uppercase">
                  Download Receipt
                </Button>
              </a>
            )}
            <Button className="mt-2 w-full rounded-none px-8 tracking-widest uppercase" onClick={resetAndClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-charcoal text-white p-6">
              <DialogTitle className="text-xl font-heading">
                {isCustom ? "Make a Custom Donation" : `Donate to ${category?.title}`}
              </DialogTitle>
              <DialogDescription className="text-gray-300 mt-2">
                {isCustom ? "Choose a category and enter your custom amount" : `Selected: ${pkg?.title} (₹${pkg?.amount})`}
              </DialogDescription>
            </div>
            <form onSubmit={handleDonate} className="p-6 space-y-4 bg-white">
              
              {isCustom && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Category</Label>
                    <Select value={customCategoryId || category?._id} onValueChange={(v: string | null) => setCustomCategoryId(v || "")}>
                      <SelectTrigger className="w-full rounded-none border-gray-300">
                        <SelectValue placeholder="Select a cause to support" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c: any) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Donation Amount (₹)</Label>
                    <Input type="number" required min="1" value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="rounded-none border-gray-300" />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pb-2">
                <Checkbox 
                  id="isAnonymous" 
                  checked={formData.isAnonymous} 
                  onCheckedChange={(checked) => setFormData({...formData, isAnonymous: checked === true})} 
                />
                <Label htmlFor="isAnonymous">Donate Anonymously (Gupt Daan)</Label>
              </div>

              {!formData.isAnonymous && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input required value={formData.donorName} onChange={e => setFormData({...formData, donorName: e.target.value})} className="rounded-none border-gray-300" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-none border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-none border-gray-300" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PAN (Optional)</Label>
                  <Input value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value.toUpperCase()})} className="rounded-none border-gray-300" placeholder="ABCDE1234F" />
                </div>
                <div className="space-y-2">
                  <Label>GST (Optional)</Label>
                  <Input value={formData.gst} onChange={e => setFormData({...formData, gst: e.target.value.toUpperCase()})} className="rounded-none border-gray-300" placeholder="22AAAAA0000A1Z5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Message (Optional)</Label>
                <Textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-none border-gray-300" rows={2} />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" className="rounded-none" onClick={resetAndClose}>Cancel</Button>
                <Button type="submit" className="rounded-none bg-charcoal hover:bg-black text-white px-8" disabled={submitting}>
                  {submitting ? "Processing..." : "Proceed to Payment"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
