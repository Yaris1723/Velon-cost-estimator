"use client";

import React, { useState } from "react";
import { Plus, Search, Calendar, MapPin, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEstimateStore } from "@/store/useEstimateStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export default function EstimatesList() {
  const router = useRouter();
  const { estimates } = useEstimateStore();
  const [search, setSearch] = useState("");

  const filtered = estimates.filter(e => 
    e.details.clientName.toLowerCase().includes(search.toLowerCase()) ||
    e.details.projectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Saved Estimates</h1>
          <p className="text-muted-foreground mt-1">Browse and manage all project estimations.</p>
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
          filtered.map((estimate) => (
            <Card key={estimate.id} className="border-none shadow-sm premium-shadow hover:scale-[1.02] transition-all group overflow-hidden">
              <div className="h-2 bg-navy" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-medium">V{estimate.version}</Badge>
                  <span className="text-xl font-black text-navy">₹{estimate.summary.grandTotal.toLocaleString()}</span>
                </div>
                
                <h3 className="text-lg font-bold text-navy group-hover:text-gold transition-colors">{estimate.details.projectName}</h3>
                <p className="text-sm text-slate-500 mb-6">{estimate.details.clientName}</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {estimate.details.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400" suppressHydrationWarning>
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(estimate.details.date), "MMMM d, yyyy")}
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
                    onClick={() => router.push(`/estimate/new?id=${estimate.id}`)}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
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
