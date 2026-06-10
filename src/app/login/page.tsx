"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HardHat, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        const currentUser = useAuthStore.getState().user;
        toast.success(`Welcome back, ${currentUser?.name || "User"}!`);
        router.push("/");
      } else {
        toast.error("Invalid email or password");
      }
      setIsLoading(false);
    }, 800);
  };

  const handleDemoFill = () => {
    setEmail("admin@velon.com");
    setPassword("admin123");
    toast.info("Demo credentials pre-filled!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      {/* Background blobs for premium glassmorphic depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-navy/40 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="h-2 bg-gradient-to-r from-navy via-gold to-navy" />
        
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto w-14 h-14 bg-gold rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20 mb-3 animate-bounce-slow">
            <HardHat className="w-8 h-8 text-navy" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-white">
            Velon Constructions
          </CardTitle>
          <CardDescription className="text-white/60">
            Internal Cost Estimator Portal
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-white/50">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@velon.com"
                  required
                  className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:border-gold focus:ring-1 focus:ring-gold/30 text-white placeholder:text-white/20 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-white/50">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:border-gold focus:ring-1 focus:ring-gold/30 text-white placeholder:text-white/20 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gold hover:bg-gold/90 text-navy font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] gap-2 mt-4"
            >
              {isLoading ? "Signing in..." : "Access Portal"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-8 pb-8 flex flex-col space-y-4">
          <div className="w-full h-px bg-white/10" />
          
          <div 
            onClick={handleDemoFill}
            className="w-full p-4 bg-white/5 border border-white/5 hover:border-gold/30 rounded-2xl cursor-pointer transition-all hover:bg-white/10 text-center"
          >
            <p className="text-xs text-white/40 mb-1">Click here to auto-fill credentials</p>
            <p className="text-sm font-bold text-gold">admin@velon.com / admin123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
