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
  X,
  Plus,
  Trash2,
  Users
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // User Administration State
  const registeredUsers = useAuthStore((state) => state.registeredUsers);
  const createUserAccount = useAuthStore((state) => state.createUserAccount);
  const deleteUserAccount = useAuthStore((state) => state.deleteUserAccount);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

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

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const res = createUserAccount({
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword
    });
    if (res.success) {
      toast.success(res.message);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
    } else {
      toast.error(res.message);
    }
  };

  const handleResetData = () => {
    const password = prompt("Warning: This will permanently delete all estimates and custom rates. Enter admin password to confirm:");
    if (password === null) return; // Cancelled
    
    // Find the admin user password dynamically
    const adminUser = registeredUsers.find(u => u.role === "admin");
    const adminPassword = adminUser ? adminUser.password : "admin123";

    if (password === adminPassword) {
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
            <DialogContent className={cn("bg-slate-900 text-white border border-white/10 p-6 rounded-2xl w-full", user?.role === "admin" ? "sm:max-w-lg" : "sm:max-w-md")}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gold" />
                  Account Settings
                </DialogTitle>
              </DialogHeader>

              {user?.role === "admin" ? (
                <Tabs defaultValue="profile" className="w-full mt-4">
                  <TabsList variant="custom" className="grid grid-cols-2 bg-white/5 p-1 rounded-xl mb-4 border border-white/5 h-11">
                    <TabsTrigger value="profile" className="rounded-lg text-xs font-bold data-[state=active]:bg-gold data-[state=active]:text-navy py-2 h-full flex items-center justify-center">
                      Profile & System
                    </TabsTrigger>
                    <TabsTrigger value="users" className="rounded-lg text-xs font-bold data-[state=active]:bg-gold data-[state=active]:text-navy py-2 h-full flex items-center justify-center">
                      User Accounts ({registeredUsers.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-4">
                    <form key={user ? `${user.name}-${user.email}` : "no-user"} onSubmit={handleUpdateProfile} className="space-y-4 py-2">
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

                      <DialogFooter className="pt-2 gap-2 flex justify-end">
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
                  </TabsContent>

                  <TabsContent value="users" className="space-y-4">
                    <form onSubmit={handleCreateAccount} className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gold">Create New User Account</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 text-left">
                          <Label htmlFor="new-user-name" className="text-[10px] font-bold uppercase tracking-wider text-white/40">Name</Label>
                          <Input
                            id="new-user-name"
                            placeholder="Full Name"
                            className="h-9 bg-white/5 border-white/10 rounded-lg text-white text-xs px-2.5"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <Label htmlFor="new-user-email" className="text-[10px] font-bold uppercase tracking-wider text-white/40">Email</Label>
                          <Input
                            id="new-user-email"
                            type="email"
                            placeholder="email@velon.com"
                            className="h-9 bg-white/5 border-white/10 rounded-lg text-white text-xs px-2.5"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1 text-left">
                        <Label htmlFor="new-user-password" className="text-[10px] font-bold uppercase tracking-wider text-white/40">Password</Label>
                        <Input
                          id="new-user-password"
                          type="password"
                          placeholder="Password"
                          className="h-9 bg-white/5 border-white/10 rounded-lg text-white text-xs px-2.5 w-full"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex justify-end pt-1">
                        <Button type="submit" size="sm" className="bg-gold hover:bg-gold/90 text-navy font-bold rounded-lg h-9 text-xs px-4">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Create User
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Registered Users
                      </h4>
                      <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                        {registeredUsers.map((u) => {
                          const isSelf = u.email.toLowerCase() === user.email.toLowerCase();
                          const isPrimaryAdmin = u.email.toLowerCase() === "admin@velon.com";
                          return (
                            <div key={u.email} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-xs shrink-0">
                                  {u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                                <div className="min-w-0 text-left">
                                  <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                    {u.name}
                                    <Badge className={cn("text-[9px] font-bold px-1.5 py-0.25 border-none", u.role === "admin" ? "bg-gold/20 text-gold" : "bg-blue-500/20 text-blue-300")}>
                                      {u.role}
                                    </Badge>
                                  </p>
                                  <p className="text-[10px] text-white/40 truncate">{u.email}</p>
                                </div>
                              </div>
                              
                              {!isSelf && !isPrimaryAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete account for ${u.name}?`)) {
                                      deleteUserAccount(u.email);
                                      toast.error(`Deleted account for ${u.name}`);
                                    }
                                  }}
                                  className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                // Normal user non-admin view
                <>
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
                </>
              )}
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
