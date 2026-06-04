"use client";

import React, { useState } from "react";
import { TrendingUp, Save, History, Search } from "lucide-react";
import { MATERIAL_CATEGORIES, MATERIAL_UNITS } from "@/lib/constants";
import { useEstimateStore } from "@/store/useEstimateStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function MarketRates() {
  const { rateLibrary, updateRateLibrary } = useEstimateStore();
  const [search, setSearch] = useState("");

  const filtered = Object.keys(rateLibrary).filter(key => 
    key.toLowerCase().includes(search.toLowerCase())
  );

  const handleRateChange = (key: string, value: string) => {
    updateRateLibrary(key, Number(value));
  };

  const saveRates = () => {
    toast.success("Default market rates updated and persisted!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy">Market Rates</h1>
          <p className="text-muted-foreground mt-1">Manage global default pricing for Velon Constructions.</p>
        </div>
        <Button className="bg-navy text-white rounded-xl h-12 px-8" onClick={saveRates}>
          <Save className="w-4 h-4 mr-2" /> Save Global Rates
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm premium-shadow">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between px-8 py-6">
            <CardTitle className="text-navy flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gold" />
              Standard Pricing List
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search materials..." 
                className="pl-10 h-10 border-slate-100 bg-slate-50 rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="pl-8 h-14 font-bold text-navy text-xs uppercase tracking-wider">Material</TableHead>
                  <TableHead className="font-bold text-navy text-xs uppercase tracking-wider">Category</TableHead>
                  <TableHead className="font-bold text-navy text-xs uppercase tracking-wider">Unit</TableHead>
                  <TableHead className="font-bold text-navy text-xs uppercase tracking-wider text-right pr-8">Default Rate (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((key) => (
                  <TableRow key={key} className="hover:bg-slate-50/30 transition-colors border-slate-50">
                    <TableCell className="pl-8 py-4 font-medium capitalize text-navy">{key.replace(/([A-Z0-9])/g, ' $1')}</TableCell>
                    <TableCell>
                       <span className="text-xs text-slate-400 italic">
                         {key.toUpperCase().includes('SAND') ? MATERIAL_CATEGORIES.SAND : 
                          key.toUpperCase().includes('JALLI') ? 'Aggregate' : 
                          key.toUpperCase().includes('CEMENT') ? MATERIAL_CATEGORIES.CEMENT : 'General'}
                       </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 rounded-md text-[10px] uppercase font-bold">{MATERIAL_UNITS[key] || "Unit"}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-3">
                         <span className="text-slate-400">₹</span>
                         <Input 
                            type="number" 
                            className="w-32 h-11 border-slate-200 text-right font-bold text-navy rounded-lg focus:border-gold transition-all"
                            value={rateLibrary[key]}
                            onChange={(e) => handleRateChange(key, e.target.value)}
                         />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm premium-shadow bg-navy text-white overflow-hidden">
             <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
             <CardHeader>
               <CardTitle className="text-lg">Price Insights</CardTitle>
               <CardDescription className="text-white/40">Market trends for Velon Projects</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm">Steel (TMT)</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none">↓ 2.4% Stable</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm">River Sand</span>
                    <Badge className="bg-rose-500/20 text-rose-400 border-none">↑ 1.1% High Demand</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm">OPC Cement</span>
                    <Badge className="bg-gold/20 text-gold border-none">Stable</Badge>
                  </div>
                </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-sm premium-shadow">
            <CardHeader>
              <CardTitle className="text-lg text-navy flex items-center gap-2">
                <History className="w-5 h-5 text-gold" />
                Library History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-gold mt-1.5" />
                    <div>
                      <p className="text-sm font-medium text-navy">Jalli rates synchronized</p>
                      <p className="text-xs text-slate-400">{i}h ago by Office Staff</p>
                    </div>
                 </div>
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

