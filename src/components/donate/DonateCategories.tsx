"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Shirt, GraduationCap, Heart, Landmark } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  if (lower.includes("temple") || lower.includes("mandir")) return Landmark;
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
  const [donationId, setDonationId] = useState<string | null>(null);

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
    setDonationId(null);
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

      setDonationId(json.donationId);

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {categories.map((category, index) => {
            const IconComponent = getIconForCategory(category.title);
            
            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col bg-white border border-gray-100 shadow-2xl hover:shadow-3xl transition-shadow duration-500 rounded-2xl overflow-hidden group"
              >
                
                {/* Image Side - Shorter Aspect Ratio */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg text-rose-500">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  {/* Subtle colorful gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                  <h2 className="absolute bottom-4 left-4 font-heading text-2xl md:text-3xl text-white drop-shadow-md">
                    {category.title}
                  </h2>
                </div>

                {/* Content Side - Reduced Padding */}
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-gray-600 font-light text-sm mb-6 leading-relaxed flex-grow line-clamp-3">
                    {category.description}
                  </p>

                  {category.budget && category.budget.effectiveTarget > 0 && (
                    <div className="mb-5">
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                        <span>
                          Raised ₹{category.budget.raised.toLocaleString("en-IN")}
                        </span>
                        <span className="text-gray-500">
                          Goal ₹{category.budget.effectiveTarget.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-700"
                          style={{ width: `${category.budget.progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1.5">
                        ₹{category.budget.remaining.toLocaleString("en-IN")} still
                        needed this month
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 -mx-6 -mb-6 p-6 border-t border-gray-100">
                    <h3 className="font-bold uppercase tracking-[0.15em] text-xs text-gray-500 mb-4 flex items-center gap-2">
                      <Heart className="w-3 h-3 text-rose-500" /> Choose Amount
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {category.packages?.map((pkg: any) => (
                        <button 
                          key={pkg._id}
                          onClick={() => openDonateDialog(category, pkg)}
                          className="relative overflow-hidden border-2 border-rose-100 bg-white py-3 px-2 rounded-xl text-charcoal font-bold hover:border-rose-500 hover:text-white hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-1 group/btn"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-orange-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -z-10" />
                          <span className="text-[10px] uppercase tracking-wider opacity-80 group-hover/btn:opacity-100 line-clamp-1">{pkg.title}</span>
                          <span className="text-lg group-hover/btn:scale-110 transition-transform duration-300">₹{pkg.amount}</span>
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => openDonateDialog(category, null, true)}
                      className="w-full relative overflow-hidden border border-gray-200 bg-white py-3 px-2 rounded-xl text-gray-600 font-bold hover:border-gray-800 hover:text-white transition-all duration-300 group/btn2 text-sm"
                    >
                      <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover/btn2:opacity-100 transition-opacity duration-300 -z-10" />
                      Enter Custom Amount
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
              {donationId && (
                <a href={`/receipt/${donationId}`} target="_blank" rel="noreferrer" className="w-full mt-6">
                  <Button variant="outline" className="w-full rounded-none tracking-widest uppercase">
                    Download Receipt
                  </Button>
                </a>
              )}
              <Button className="mt-2 w-full rounded-none px-8 tracking-widest uppercase" onClick={() => setIsDialogOpen(false)}>
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
