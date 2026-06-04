"use client";

import React, { useState, useEffect } from "react";
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
import { useEstimateStore, MOCK_ESTIMATES } from "@/store/useEstimateStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { estimates, duplicateEstimate, deleteEstimate, addEstimate } = useEstimateStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (estimates.length === 0) {
      MOCK_ESTIMATES.forEach(e => addEstimate(e));
    }
  }, [estimates.length, addEstimate]);

  const filteredEstimates = estimates.filter(e => 
    e.details.clientName.toLowerCase().includes(search.toLowerCase()) ||
    e.details.projectName.toLowerCase().includes(search.toLowerCase()) ||
    e.details.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = estimates.reduce((sum, e) => sum + e.summary.grandTotal, 0);

  const stats = [
    { name: "Total Estimates", value: String(estimates.length).padStart(2, '0'), icon: FileText, color: "text-blue-600" },
    { name: "Total Value (INR)", value: `₹${totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600" },
    { name: "Active Projects", value: String(estimates.length).padStart(2, '0'), icon: CheckCircle2, color: "text-gold" },
    { name: "New Clients", value: String(new Set(estimates.map(e => e.details.clientName)).size).padStart(2, '0'), icon: Users, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Welcome back, Admin</h1>
          <p className="text-muted-foreground mt-1">Manage your construction estimates and BOQs.</p>
        </div>
        <Link href="/estimate/new">
          <Button className="bg-navy hover:bg-navy/90 text-white gap-2 px-6 py-6 rounded-xl shadow-lg shadow-navy/10 transition-all hover:scale-[1.02]">
            <Plus className="w-5 h-5" />
            Create New Estimate
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm premium-shadow overflow-hidden group hover:scale-[1.02] transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-gold/10 transition-colors`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold">+12%</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <h3 className="text-3xl font-bold text-navy mt-1">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm premium-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 mb-4 px-8 pt-8">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            Recent Estimates
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
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-semibold text-navy">Project Name</TableHead>
                <TableHead className="font-semibold text-navy">Client</TableHead>
                <TableHead className="font-semibold text-navy">Date</TableHead>
                <TableHead className="font-semibold text-navy">Value (INR)</TableHead>
                <TableHead className="font-semibold text-navy">Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimates.length > 0 ? (
                filteredEstimates.map((estimate) => (
                  <TableRow key={estimate.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell>
                      <div className="font-semibold text-navy">{estimate.details.projectName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        V{estimate.version} • {estimate.details.location}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{estimate.details.clientName}</TableCell>
                    <TableCell className="text-slate-500" suppressHydrationWarning>{format(new Date(estimate.details.date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-bold text-navy">₹{estimate.summary.grandTotal.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100 font-medium px-3">Completed</Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}
