"use client";

import React, { useState, Suspense } from "react";
import { Plus, Search, Calendar, MapPin, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEstimateStore } from "@/store/useEstimateStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function EstimatesListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { estimates, updateEstimateStatus } = useEstimateStore();
  const [search, setSearch] = useState("");

  const view = searchParams.get("view");
  const isBOQView = view === "boq";

  const filtered = estimates.filter(e => 
    e.details.clientName.toLowerCase().includes(search.toLowerCase()) ||
    e.details.projectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">
            {isBOQView ? "BOQ Reports" : "Saved Estimates"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBOQView 
              ? "Browse and export BOQ summary reports for your projects." 
              : "Browse and manage all project estimations."
            }
          </p>
        </div>
        <Link href="/estimate/new">
          <Button className="bg-navy text-white rounded-xl h-12 px-6">
            <Plus className="w-4 h-4 mr-2" /> New Estimate
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search projects or clients..." 
          className="pl-10 h-12 bg-white border-slate-200 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((estimate) => {
            const projectLink = isBOQView 
              ? `/estimate/new?id=${estimate.id}&tab=boq` 
              : `/estimate/new?id=${estimate.id}`;
            return (
              <Card key={estimate.id} className="border-none shadow-sm premium-shadow hover:scale-[1.02] transition-all group overflow-hidden">
                <div className="h-2 bg-navy" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-medium">V{estimate.version}</Badge>
                      {estimate.status === 'approved' && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-2 py-0.5 text-[10px]">Approved</Badge>}
                      {estimate.status === 'on_hold' && <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-bold px-2 py-0.5 text-[10px]">On Hold</Badge>}
                      {estimate.status === 'declined' && <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-bold px-2 py-0.5 text-[10px]">Declined</Badge>}
                      {(!estimate.status || estimate.status === 'pending') && <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold px-2 py-0.5 text-[10px]">Pending</Badge>}
                    </div>
                  </div>
                  
                  <Link href={projectLink}>
                    <h3 className="text-lg font-bold text-navy hover:text-gold hover:underline transition-colors cursor-pointer">{estimate.details.projectName}</h3>
                  </Link>
                  <p className="text-sm text-slate-500 mb-4">{estimate.details.clientName}</p>

                  <div className="bg-slate-50 p-3 rounded-xl mb-4 text-xs space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Proposal Value:</span>
                      <span className="font-bold text-navy">₹{(estimate.details.sqFtRate ? estimate.details.builtUpArea * estimate.details.sqFtRate : estimate.summary.grandTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expenses (BOQ):</span>
                      <span className="font-semibold text-slate-600">₹{estimate.summary.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/60 pt-1">
                      <span className="text-slate-400">Est. Profit:</span>
                      <span className={cn("font-bold", (estimate.details.sqFtRate ? (estimate.details.builtUpArea * estimate.details.sqFtRate - estimate.summary.grandTotal) : 0) >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        ₹{((estimate.details.sqFtRate ? estimate.details.builtUpArea * estimate.details.sqFtRate : estimate.summary.grandTotal) - estimate.summary.grandTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {estimate.details.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400" suppressHydrationWarning>
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(estimate.details.date), "MMMM d, yyyy")}
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="border-t border-slate-100 pt-4 mb-4">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Project Status</div>
                    <div className="flex items-center gap-2">
                      <button
                        title="Mark as Approved"
                        onClick={() => updateEstimateStatus(estimate.id, estimate.status === 'approved' ? 'pending' : 'approved')}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all hover:scale-102 flex justify-center items-center gap-1",
                          estimate.status === 'approved'
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50/50 hover:text-emerald-600"
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Approve
                      </button>
                      <button
                        title="Mark as On Hold"
                        onClick={() => updateEstimateStatus(estimate.id, estimate.status === 'on_hold' ? 'pending' : 'on_hold')}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all hover:scale-102 flex justify-center items-center gap-1",
                          estimate.status === 'on_hold'
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-amber-50/50 hover:text-amber-600"
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Hold
                      </button>
                      <button
                        title="Mark as Declined"
                        onClick={() => updateEstimateStatus(estimate.id, estimate.status === 'declined' ? 'pending' : 'declined')}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all hover:scale-102 flex justify-center items-center gap-1",
                          estimate.status === 'declined'
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-rose-50/50 hover:text-rose-600"
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Decline
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-lg border-slate-200 text-xs"
                      onClick={() => router.push(`/estimate/new?id=${estimate.id}&tab=boq`)}
                    >
                      View BOQ
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-lg border-slate-200 text-xs"
                      onClick={() => router.push(`/estimate/new?id=${estimate.id}`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      className="bg-slate-50 hover:bg-navy hover:text-white text-navy rounded-lg p-2 transition-all"
                      onClick={() => router.push(projectLink)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-300">
            <Plus className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No saved estimates yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EstimatesList() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50/50" />}>
      <EstimatesListContent />
    </Suspense>
  );
}
