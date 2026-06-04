"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Settings, 
  History,
  TrendingUp,
  HardHat
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "New Estimate", href: "/estimate/new", icon: PlusCircle },
  { name: "Saved Estimates", href: "/estimates", icon: History },
  { name: "BOQ Reports", href: "/estimates", icon: FileText },
  { name: "Market Rates", href: "/rates", icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 bg-navy text-white fixed left-0 top-0 border-r border-navy/20">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-gold rounded-lg">
          <HardHat className="w-6 h-6 text-navy" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Velon</h1>
          <p className="text-[10px] text-gold uppercase tracking-widest font-semibold">Constructions</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
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
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
              VC
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">Admin Velon</p>
              <p className="text-[10px] text-white/30 truncate">admin@velon.com</p>
            </div>
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <Settings className="w-3 h-3" />
            Account Settings
          </button>
        </div>
      </div>
    </div>
  );
}
