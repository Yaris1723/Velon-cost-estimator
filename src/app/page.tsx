"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  FileText, 
  Copy, 
  Trash2, 
  Eye, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  Calendar
} from "lucide-react";
import { useEstimateStore } from "@/store/useEstimateStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const { estimates, duplicateEstimate, deleteEstimate, clearAllData, updateEstimateStatus } = useEstimateStore();
  const [search, setSearch] = useState("");

  const handleResetData = () => {
    const password = prompt("Warning: This will permanently delete all estimates and custom rates. Enter admin password to confirm:");
    if (password === null) return; // Cancelled

    // Find the admin user password dynamically
    const registeredUsers = useAuthStore.getState().registeredUsers;
    const adminUser = registeredUsers.find(u => u.role === "admin");
    const adminPassword = adminUser ? adminUser.password : "admin123";

    if (password === adminPassword) {
      clearAllData();
      toast.success("All dashboard data has been reset successfully.");
    } else {
      toast.error("Invalid password. Reset cancelled.");
    }
  };

  // Seeding useEffect removed to allow clean slate dashboard

  const filteredEstimates = estimates.filter(e => 
    e.details.clientName.toLowerCase().includes(search.toLowerCase()) ||
    e.details.projectName.toLowerCase().includes(search.toLowerCase()) ||
    e.details.location.toLowerCase().includes(search.toLowerCase())
  );

  const getProposalValue = (e: any) => {
    return Math.round(e.details.sqFtRate ? (e.details.builtUpArea * e.details.sqFtRate) : e.summary.grandTotal);
  };

  const getProjectProfit = (e: any) => {
    return Math.round(getProposalValue(e) - e.summary.grandTotal);
  };

  const totalProposalValue = Math.round(estimates.reduce((sum, e) => sum + getProposalValue(e), 0));
  const generatedRevenue = Math.round(estimates
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + getProposalValue(e), 0));
  const totalProfitEarned = Math.round(estimates
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + getProjectProfit(e), 0));
  const activeProjectsCount = estimates.filter(e => e.status === "approved" || e.status === "on_hold").length;

  const stats = [
    { name: "Total Estimates", value: String(estimates.length).padStart(2, '0'), icon: FileText, color: "text-blue-600", borderColor: "border-t-blue-500/80" },
    { name: "Proposal Value (INR)", value: `₹${totalProposalValue.toLocaleString()}`, icon: TrendingUp, color: "text-orange-500", borderColor: "border-t-amber-500/80" },
    { name: "Revenue Earned (INR)", value: `₹${generatedRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", borderColor: "border-t-emerald-500/80" },
    { name: "Profit Earned (INR)", value: `₹${totalProfitEarned.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", borderColor: "border-t-gold" },
    { name: "Active Projects", value: String(activeProjectsCount).padStart(2, '0'), icon: CheckCircle2, color: "text-gold", borderColor: "border-t-teal-500/80" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Welcome Banner */}
      <div className="bg-gradient-to-r from-navy via-navy/95 to-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-lg border border-white/5">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gold/5 rounded-full -mr-20 -mt-20 blur-2xl" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] bg-gold/20 text-gold uppercase tracking-widest font-black px-3 py-1 rounded-full border border-gold/20">
              Administrator Portal
            </span>
            <h1 className="text-3xl font-black mt-3 text-white tracking-tight">
              Welcome back, Admin
            </h1>
            <p className="text-white/60 mt-1.5 max-w-xl text-sm leading-relaxed">
              Manage construction estimates, track project metrics, verify material BOQs, and analyze profit margins in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {estimates.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleResetData}
                className="bg-white/5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 h-12 px-5 rounded-xl transition-all font-semibold"
              >
                Reset Dashboard
              </Button>
            )}
            <Link href="/estimate/new">
              <Button className="bg-gold hover:bg-gold/90 text-navy font-bold gap-2 h-12 px-6 rounded-xl shadow-lg shadow-gold/20 transition-all hover:scale-[1.02]">
                <Plus className="w-5 h-5" />
                Create New Estimate
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className={cn("border-none border-t-4 shadow-sm premium-shadow overflow-hidden group hover:scale-[1.02] transition-transform bg-white", stat.borderColor)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-gold/10 transition-colors`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold">+12%</Badge>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.name}</p>
              <h3 className="text-2xl font-black text-navy mt-1 tracking-tight truncate" title={stat.value}>{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm premium-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 mb-4 px-8 pt-8">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            Estimates
            <Badge variant="outline" className="ml-2 font-normal">{filteredEstimates.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects, clients..." 
                className="pl-10 bg-slate-50 border-none h-10 rounded-lg focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold text-navy">Project Name</TableHead>
                  <TableHead className="font-semibold text-navy">Client</TableHead>
                  <TableHead className="font-semibold text-navy">Date</TableHead>
                  <TableHead className="font-semibold text-navy">Proposal Value</TableHead>
                  <TableHead className="font-semibold text-navy">Expenses (BOQ)</TableHead>
                  <TableHead className="font-semibold text-navy">Est. Profit</TableHead>
                  <TableHead className="font-semibold text-navy">Status</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.length > 0 ? (
                  filteredEstimates.map((estimate) => (
                    <TableRow key={estimate.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                      <TableCell>
                        <Link href={`/estimate/new?id=${estimate.id}`}>
                          <div className="font-semibold text-navy cursor-pointer hover:text-gold hover:underline transition-colors">
                            {estimate.details.projectName}
                          </div>
                        </Link>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          V{estimate.version} • {estimate.details.location}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{estimate.details.clientName}</TableCell>
                      <TableCell className="text-slate-500" suppressHydrationWarning>{format(new Date(estimate.details.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="font-bold text-navy">₹{getProposalValue(estimate).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-slate-600">₹{estimate.summary.grandTotal.toLocaleString()}</TableCell>
                      <TableCell className={cn("font-bold", getProjectProfit(estimate) >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        ₹{getProjectProfit(estimate).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                          {/* Current Status Badge */}
                          <div className="w-24 shrink-0">
                            {estimate.status === 'approved' && <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100 font-bold px-3 py-0.5 w-full justify-center">Approved</Badge>}
                            {estimate.status === 'on_hold' && <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-amber-100 font-bold px-3 py-0.5 w-full justify-center">On Hold</Badge>}
                            {estimate.status === 'declined' && <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-50 border-rose-100 font-bold px-3 py-0.5 w-full justify-center">Declined</Badge>}
                            {(!estimate.status || estimate.status === 'pending') && <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-100 font-bold px-3 py-0.5 w-full justify-center">Pending</Badge>}
                          </div>
                          
                          {/* Quick Change Action Buttons */}
                          <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                            <button
                              title="Mark as Approved"
                              onClick={() => updateEstimateStatus(estimate.id, 'approved')}
                              className={cn(
                                "w-6 h-6 flex items-center justify-center rounded-md border text-[10px] font-bold transition-all hover:scale-105",
                                estimate.status === 'approved'
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-slate-400 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                              )}
                            >
                              A
                            </button>
                            <button
                              title="Mark as On Hold"
                              onClick={() => updateEstimateStatus(estimate.id, 'on_hold')}
                              className={cn(
                                "w-6 h-6 flex items-center justify-center rounded-md border text-[10px] font-bold transition-all hover:scale-105",
                                estimate.status === 'on_hold'
                                  ? "bg-amber-500 text-white border-amber-500"
                                  : "bg-white text-slate-400 border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                              )}
                            >
                              H
                            </button>
                            <button
                              title="Mark as Declined"
                              onClick={() => updateEstimateStatus(estimate.id, 'declined')}
                              className={cn(
                                "w-6 h-6 flex items-center justify-center rounded-md border text-[10px] font-bold transition-all hover:scale-105",
                                estimate.status === 'declined'
                                  ? "bg-rose-600 text-white border-rose-600"
                                  : "bg-white text-slate-400 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                              )}
                            >
                              D
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white transition-colors" />
                            }
                          >
                            <MoreHorizontal className="w-4 h-4 text-slate-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-slate-100">
                            <DropdownMenuItem 
                              className="gap-2 py-2.5 cursor-pointer rounded-lg"
                              onClick={() => router.push(`/estimate/new?id=${estimate.id}`)}
                            >
                              <Eye className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 py-2.5 cursor-pointer rounded-lg"
                              onClick={() => {
                                duplicateEstimate(estimate.id);
                                toast.success("Estimate duplicated successfully");
                              }}
                            >
                              <Copy className="w-4 h-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 py-2.5 cursor-pointer rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                              onClick={() => {
                                deleteEstimate(estimate.id);
                                toast.error("Estimate deleted");
                              }}
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                        <FileText className="w-12 h-12" />
                        <p className="text-lg font-medium">No estimates found</p>
                        <Link href="/estimate/new">
                          <Button variant="outline" className="rounded-xl">Create your first estimate</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
