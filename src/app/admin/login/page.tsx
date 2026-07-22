"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, adminCode }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Logged in successfully");
        router.push("/admin");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-950 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/yannis-h-uaPaEM7MiQQ-unsplash.jpg"
          alt="Mangal Guruji Foundation"
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="relative z-10 p-10">
          <a href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Logo" className="h-12 w-12 rounded-full bg-white p-1 object-cover" />
            <span className="text-white text-xl font-bold tracking-wide">Mangal Guruji</span>
          </a>
        </div>
        
        <div className="relative z-10 px-10 pt-10 flex-1 flex flex-col justify-center">
          <div className="max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/quote.jpg" 
              alt="Mangal Guruji" 
              className="w-full h-auto rounded-xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
        
        <div className="relative z-10 p-10 mt-auto">
          <blockquote className="space-y-4 text-white">
            <p className="text-3xl font-medium leading-tight">
              &ldquo;Empowering communities through self-reliance, education, and compassion.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400 font-medium tracking-wide uppercase">Admin Portal</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:flex-none lg:w-1/2 lg:px-20 xl:px-32 relative bg-background">
        {/* Mobile Logo - Visible only on mobile */}
        <div className="lg:hidden absolute top-8 left-6">
          <a href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Logo" className="h-10 w-10 rounded-full shadow-md object-cover" />
          </a>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-[400px] mt-12 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your secure credentials to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 bg-muted/50 border-transparent focus-visible:bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-muted/50 border-transparent focus-visible:bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminCode" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin Security Code</Label>
              <Input 
                id="adminCode" 
                type="password"
                placeholder="Required for access"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                required
                className="h-12 bg-muted/50 border-transparent focus-visible:bg-transparent"
              />
            </div>
            <Button className="w-full h-12 text-base font-medium mt-6 shadow-md transition-all hover:shadow-lg active:scale-[0.98]" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Sign in to Dashboard"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
