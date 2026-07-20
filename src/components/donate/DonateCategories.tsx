"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Shirt, GraduationCap, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Helper to pick an icon based on title (since icons can't be stored easily in DB as components)
const getIconForCategory = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("food")) return Utensils;
  if (lower.includes("cloth")) return Shirt;
  if (lower.includes("women") || lower.includes("edu")) return GraduationCap;
  return Heart;
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function DonateCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  
  const [formData, setFormData] = useState({
    donorName: "", email: "", phone: "", pan: "", isAnonymous: false, message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await fetch("/api/public/categories");
        const json = await res.json();
        if (json.success) setCategories(json.data);
      } catch (e) {
        toast.error("Failed to load donation categories");
      } finally {
        setLoading(false);
      }
    }
    fetchCats();
  }, []);

  const openDonateDialog = (category: any, pkg: any, isCust: boolean = false) => {
    setSelectedCategory(category);
    setSelectedPackage(pkg);
    setIsCustom(isCust);
    setCustomAmount("");
    setSuccess(false);
    setIsDialogOpen(true);
  };

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
      finalAmount = selectedPackage.amount;
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
          categoryId: selectedCategory._id,
          packageId: isCustom ? null : selectedPackage._id,
          amount: finalAmount
        })
      });
      const json = await res.json();
      
      if (!res.ok) {
        toast.error(json.error || "Failed to process donation request");
        setSubmitting(false);
        return;
      }

      // Initialize Razorpay
      const options = {
        key: json.keyId,
        amount: json.amount,
        currency: json.currency,
        name: "Mangal Guruji Foundation",
        description: `Donation for ${selectedCategory?.title}`,
        order_id: json.orderId,
        handler: async function (response: any) {
          // Verify Payment
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
              setFormData({ donorName: "", email: "", phone: "", pan: "", isAnonymous: false, message: "" });
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

  if (loading) {
    return (
      <section className="py-24 bg-white border-b border-gray-200 min-h-[60vh] flex items-center justify-center">
        <div className="text-xl tracking-widest uppercase font-light text-gray-500 animate-pulse">
          Loading Initiatives...
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="space-y-32">
          {categories.map((category, index) => {
            const IconComponent = getIconForCategory(category.title);
            
            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col lg:flex-row gap-16 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                
                {/* Image Side */}
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-none border border-gray-100 shadow-xl group">
                    <img 
                      src={category.image} 
                      alt={category.title} 
                      className="absolute inset-0 w-full h-full object-cover grayscale-0 md:grayscale transition-all duration-700 md:group-hover:grayscale-0"
                    />
                    <div className="absolute top-6 left-6 bg-white p-4 rounded-full shadow-lg">
                      <IconComponent className="w-8 h-8 text-black" />
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <h2 className="font-heading text-4xl md:text-5xl text-charcoal mb-6">{category.title}</h2>
                  <p className="text-gray-600 font-light text-lg mb-8 leading-relaxed">
                    {category.description}
                  </p>

                  
                  <h3 className="font-bold uppercase tracking-[0.2em] text-xs text-gray-500 mb-4">Select Contribution</h3>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {category.packages?.map((pkg: any) => (
                      <button 
                        key={pkg._id}
                        onClick={() => openDonateDialog(category, pkg)}
                        className="border border-gray-300 py-4 px-2 text-sm font-medium text-gray-700 hover:border-black hover:bg-black hover:text-white transition-colors flex flex-col items-center justify-center gap-1"
                      >
                        <span>{pkg.title}</span>
                        <span className="font-bold">₹{pkg.amount}</span>
                      </button>
                    ))}
                    <button 
                      onClick={() => openDonateDialog(category, null, true)}
                      className="border border-gray-300 py-4 px-2 text-sm font-medium text-gray-700 hover:border-black hover:bg-black hover:text-white transition-colors"
                    >
                      Custom Amount
                    </button>
                  </div>
                  
                </div>

              </motion.div>
            );
          })}
        </div>
        
      </div>

      {/* Donation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 rounded-none shadow-2xl">
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
              <Button className="mt-8 rounded-none px-8 tracking-widest uppercase" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-charcoal text-white p-6">
                <DialogTitle className="text-xl font-heading">
                  Donate to {selectedCategory?.title}
                </DialogTitle>
                <DialogDescription className="text-gray-300 mt-2">
                  {isCustom ? "Enter your custom amount" : `Selected: ${selectedPackage?.title} (₹${selectedPackage?.amount})`}
                </DialogDescription>
              </div>
              <form onSubmit={handleDonate} className="p-6 space-y-4 bg-white">
                
                {isCustom && (
                  <div className="space-y-2">
                    <Label>Donation Amount (₹)</Label>
                    <Input type="number" required min="1" value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="rounded-none border-gray-300" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-none border-gray-300" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-none border-gray-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>PAN (Optional, for tax benefits)</Label>
                  <Input value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})} className="rounded-none border-gray-300 uppercase" />
                </div>

                <div className="space-y-2">
                  <Label>Message (Optional)</Label>
                  <Textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-none border-gray-300" rows={2} />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" className="rounded-none" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="rounded-none bg-charcoal hover:bg-black text-white px-8" disabled={submitting}>
                    {submitting ? "Processing..." : "Proceed to Payment"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

    </section>
  );
}
