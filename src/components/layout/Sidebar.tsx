"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Settings, 
  History,
  TrendingUp,
  HardHat,
  LogOut,
  X
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEstimateStore } from "@/store/useEstimateStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "New Estimate", href: "/estimate/new", icon: PlusCircle },
  { name: "Saved Estimates", href: "/estimates", icon: History },
  { name: "BOQ Reports", href: "/estimates?view=boq", icon: FileText },
  { name: "Market Rates", href: "/rates", icon: TrendingUp },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const clearAllData = useEstimateStore((state) => state.clearAllData);

  const [nameInput, setNameInput] = useState(user?.name || "");
  const [emailInput, setEmailInput] = useState(user?.email || "");

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput) {
      toast.error("Please fill in all fields");
      return;
    }
    updateProfile(emailInput, nameInput);
    toast.success("Profile updated successfully!");
  };

  const handleResetData = () => {
    const password = prompt("Warning: This will permanently delete all estimates and custom rates. Enter admin password to confirm:");
    if (password === null) return; // Cancelled
    if (password === "admin123") {
      clearAllData();
      toast.success("Application data reset successfully!");
    } else {
      toast.error("Invalid password. Reset cancelled.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-navy text-white border-r border-navy/20">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold rounded-lg">
            <HardHat className="w-6 h-6 text-navy" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Velon</h1>
            <p className="text-[10px] text-gold uppercase tracking-widest font-semibold">Constructions</p>
          </div>
        </div>
        {onCloseMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            className="text-white hover:bg-white/10 md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isBOQReportItem = item.name === "BOQ Reports";
          const isSavedEstimateItem = item.name === "Saved Estimates";
          
          let isActive = false;
          if (isBOQReportItem) {
            isActive = pathname === "/estimates" && view === "boq";
          } else if (isSavedEstimateItem) {
            isActive = pathname === "/estimates" && view !== "boq";
          } else {
            isActive = pathname === item.href;
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-gold text-navy font-semibold shadow-lg shadow-gold/10" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-navy" : "text-white/40 group-hover:text-white"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-white/40 mb-2">Logged in as</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "VC"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-white">{user?.name || "Admin Velon"}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email || "admin@velon.com"}</p>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger
              render={
                <button className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                  <Settings className="w-3 h-3" />
                  Account Settings
                </button>
              }
            />
            <DialogContent className="sm:max-w-md bg-slate-900 text-white border border-white/10 p-6 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gold" />
                  Edit Profile Settings
                </DialogTitle>
              </DialogHeader>
              <form key={user ? `${user.name}-${user.email}` : "no-user"} onSubmit={handleUpdateProfile} className="space-y-4 py-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="profile-name" className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Full Name
                  </Label>
                  <Input
                    id="profile-name"
                    type="text"
                    className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-gold focus:ring-1 focus:ring-gold/30 text-white placeholder:text-white/20 transition-all w-full px-3"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                  />
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Email Address
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-gold focus:ring-1 focus:ring-gold/30 text-white placeholder:text-white/20 transition-all w-full px-3"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-4 gap-2 flex justify-end">
                  <DialogClose render={<Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl h-11 px-4" />}>
                    Cancel
                  </DialogClose>
                  <DialogClose render={
                    <Button 
                      type="submit" 
                      onClick={handleUpdateProfile}
                      className="bg-gold hover:bg-gold/90 text-navy font-bold rounded-xl h-11 px-6" 
                    />
                  }>
                    Save Changes
                  </DialogClose>
                </DialogFooter>
              </form>

              <div className="pt-4 border-t border-white/10 mt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">Danger Zone</h4>
                <p className="text-[10px] text-white/50 mb-3">This will permanently delete all estimates and reset rates to standard defaults.</p>
                <DialogClose render={
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={handleResetData}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-10 text-xs" 
                  />
                }>
                  Reset All Application Data
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>

          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
