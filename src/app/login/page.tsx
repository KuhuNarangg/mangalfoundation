"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loginRole, setLoginRole] = useState<"donor" | "member" | "volunteer" | "admin">("donor");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const requestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setStep("otp");
        setCooldown(60);
      } else {
        toast.error(data.error || "Failed to send OTP");
        if (res.status === 429) {
          // If rate limited, just jump to OTP step anyway so they can enter the one they already have
          setStep("otp");
          // Try to extract seconds from error message if possible, or just default to 60
          const match = data.error.match(/(\d+)s/);
          setCooldown(match ? parseInt(match[1]) : 60);
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Logged in successfully!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(data.error || "Invalid OTP");
        if (data.error.includes("expired")) {
          setStep("email");
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }
    if (loginRole === "admin" && !adminCode) {
      toast.error("Please enter Admin Security Code");
      return;
    }

    setLoading(true);
    try {
      if (loginRole === "admin") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loginType: "admin", username, password, adminCode }),
        });
        const data = await res.json();
        
        if (res.ok) {
          toast.success("Logged in successfully!");
          router.push("/admin");
          router.refresh();
        } else {
          toast.error(data.error || "Invalid credentials");
        }
      } else {
        const res = await fetch("/api/public/auth/login-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, loginRole }),
        });
        const data = await res.json();
        
        if (res.ok) {
          toast.success("Logged in successfully!");
          if (loginRole === "member" || loginRole === "volunteer") {
            router.push("/member");
          } else {
            router.push("/dashboard");
          }
          router.refresh();
        } else {
          toast.error(data.error || "Invalid credentials");
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-beige-light flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="bg-white border border-sand rounded-2xl shadow-xl w-full max-w-md p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10">
            <Heart className="w-40 h-40 text-rose-500 fill-current" />
          </div>
          
          <div className="relative z-10 text-center mb-8">
            <h1 className="font-heading text-3xl text-charcoal mb-2">
              {loginRole === "member" ? "Member Portal" : loginRole === "volunteer" ? "Volunteer Portal" : loginRole === "admin" ? "Admin Portal" : "Donor Login"}
            </h1>
            <p className="text-charcoal-light font-light text-sm">
              Sign in to view your {loginRole === "donor" ? "donation history" : "dashboard"} and manage your account.
            </p>
          </div>

          <div className="relative z-10 flex p-1 bg-beige-light rounded-xl mb-8 flex-wrap">
            <button
              onClick={() => setLoginRole("donor")}
              className={`flex-1 min-w-[70px] py-2 text-sm font-bold rounded-lg transition-all ${loginRole === "donor" ? "bg-white text-charcoal shadow-sm" : "text-charcoal-light hover:text-charcoal"}`}
            >
              Donor
            </button>
            <button
              onClick={() => setLoginRole("member")}
              className={`flex-1 min-w-[70px] py-2 text-sm font-bold rounded-lg transition-all ${loginRole === "member" ? "bg-white text-charcoal shadow-sm" : "text-charcoal-light hover:text-charcoal"}`}
            >
              Member
            </button>
            <button
              onClick={() => setLoginRole("volunteer")}
              className={`flex-1 min-w-[70px] py-2 text-sm font-bold rounded-lg transition-all ${loginRole === "volunteer" ? "bg-white text-charcoal shadow-sm" : "text-charcoal-light hover:text-charcoal"}`}
            >
              Volunteer
            </button>
            <button
              onClick={() => setLoginRole("admin")}
              className={`flex-1 min-w-[70px] py-2 text-sm font-bold rounded-lg transition-all ${loginRole === "admin" ? "bg-white text-charcoal shadow-sm" : "text-charcoal-light hover:text-charcoal"}`}
            >
              Admin
            </button>
          </div>

          {loginRole === "donor" ? (
            step === "email" ? (
              <form onSubmit={requestOTP} className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-charcoal-light uppercase text-xs font-bold tracking-widest">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="py-6 bg-beige-light/50 border-sand text-charcoal focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 py-6 font-bold text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Login Code"}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyOTP} className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-charcoal-light uppercase text-xs font-bold tracking-widest">
                    Enter 6-digit Code
                  </Label>
                  <p className="text-xs text-charcoal-light mb-3">
                    We sent a code to <span className="font-semibold text-charcoal">{email}</span>.
                  </p>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    required
                    className="py-6 text-center text-2xl tracking-[0.5em] font-bold bg-beige-light/50 border-sand text-charcoal focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 py-6 font-bold text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                </Button>
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => requestOTP()}
                    disabled={cooldown > 0 || loading}
                    className="text-sm font-medium text-charcoal-light hover:text-rose-500 transition-colors disabled:opacity-50"
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                  </button>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => { setStep("email"); setOtp(""); }}
                      className="text-xs text-charcoal-light underline hover:text-charcoal transition-colors"
                    >
                      Change email address
                    </button>
                  </div>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={loginWithPassword} className="relative z-10 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-charcoal-light uppercase text-xs font-bold tracking-widest">
                    {loginRole === "admin" ? "Admin Username" : "Email or Member ID"}
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={loginRole === "admin" ? "admin" : "Enter email or Member ID"}
                    required
                    className="py-6 bg-beige-light/50 border-sand text-charcoal focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-charcoal-light uppercase text-xs font-bold tracking-widest">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="py-6 bg-beige-light/50 border-sand text-charcoal focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                {loginRole === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="adminCode" className="text-charcoal-light uppercase text-xs font-bold tracking-widest">
                      Admin Security Code
                    </Label>
                    <Input
                      id="adminCode"
                      type="password"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      placeholder="Required for access"
                      required
                      className="py-6 bg-beige-light/50 border-sand text-charcoal focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 py-6 font-bold text-white shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </Button>
            </form>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
