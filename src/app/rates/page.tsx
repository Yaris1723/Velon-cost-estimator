"use client";

import React, { useState } from "react";
import { TrendingUp, Save, History, Search, Plus, Trash2 } from "lucide-react";
import { MATERIAL_CATEGORIES, MATERIAL_UNITS, INITIAL_RATES } from "@/lib/constants";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const MATERIAL_KEY_TO_CATEGORY: Record<string, string> = {
  cement: MATERIAL_CATEGORIES.CEMENT,
  steel: MATERIAL_CATEGORIES.STEEL,
  sand: MATERIAL_CATEGORIES.SAND,
  mSand: MATERIAL_CATEGORIES.MSAND,
  jalli40: MATERIAL_CATEGORIES.JALLI_40,
  jalli20: MATERIAL_CATEGORIES.JALLI_20,
  jalli12: MATERIAL_CATEGORIES.JALLI_12,
  bricks: MATERIAL_CATEGORIES.MASONRY,
  tiles: MATERIAL_CATEGORIES.FINISHING,
  paint: MATERIAL_CATEGORIES.FINISHING,
  putty: MATERIAL_CATEGORIES.FINISHING,
  electrical: MATERIAL_CATEGORIES.ELECTRICAL,
  plumbing: MATERIAL_CATEGORIES.PLUMBING,
  doors: "Woodwork",
  windows: "Fabrication",
};

export default function MarketRates() {
  const { rateLibrary, updateRateLibrary, customMaterials, addCustomMaterialRate, deleteCustomMaterialRate } = useEstimateStore();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Custom");
  const [newUnit, setNewUnit] = useState("Nos");
  const [newRate, setNewRate] = useState(0);

  const displayRates = [
    ...Object.keys(INITIAL_RATES).map(key => ({
      key,
      name: key.replace(/([A-Z0-9])/g, ' $1'),
      category: MATERIAL_KEY_TO_CATEGORY[key] || 'General',
      unit: MATERIAL_UNITS[key] || 'Unit',
      rate: rateLibrary[key] ?? INITIAL_RATES[key],
      isCustom: false,
      id: undefined as string | undefined
    })),
    ...customMaterials.map(m => ({
      key: m.key,
      name: m.name,
      category: m.category,
      unit: m.unit,
      rate: rateLibrary[m.key] ?? 0,
      isCustom: true,
      id: m.id
    }))
  ];

  const filtered = displayRates.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleRateChange = (key: string, value: string) => {
    updateRateLibrary(key, value === "" ? 0 : Math.max(0, Number(value)));
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please enter a material name");
      return;
    }
    addCustomMaterialRate({
      name: newName,
      category: newCategory,
      unit: newUnit
    }, newRate);
    toast.success(`${newName} added to rates library`);
    setIsAddOpen(false);
    setNewName("");
    setNewCategory("Custom");
    setNewUnit("Nos");
    setNewRate(0);
  };

  const saveRates = () => {
    toast.success("Default market rates updated and persisted!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Market Rates</h1>
          <p className="text-muted-foreground mt-1">Manage global default pricing for Velon Constructions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={
              <Button className="bg-gold hover:bg-gold/90 text-navy font-bold rounded-xl h-12 px-6">
                <Plus className="w-4 h-4 mr-2" /> Add Material
              </Button>
            } />
            <DialogContent className="sm:max-w-md bg-slate-900 text-white border border-white/10 p-6 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-gold" />
                  Add New Rate Item
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMaterial} className="space-y-4 py-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="new-name" className="text-xs font-bold uppercase tracking-wider text-white/50">Material Name</Label>
                  <Input 
                    id="new-name"
                    className="h-11 bg-white/5 border-white/10 rounded-xl text-white px-3"
                    placeholder="E.g. Plywood"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-cat" className="text-xs font-bold uppercase tracking-wider text-white/50">Category</Label>
                    <Input 
                      id="new-cat"
                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white px-3"
                      placeholder="E.g. Woodwork"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-unit" className="text-xs font-bold uppercase tracking-wider text-white/50">Unit</Label>
                    <Input 
                      id="new-unit"
                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white px-3"
                      placeholder="E.g. Sq.ft"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-rate" className="text-xs font-bold uppercase tracking-wider text-white/50">Default Rate (₹)</Label>
                  <Input 
                    id="new-rate"
                    type="number"
                    min="0"
                    step="any"
                    className="h-11 bg-white/5 border-white/10 rounded-xl text-white px-3"
                    value={newRate === 0 ? "" : newRate}
                    onChange={(e) => setNewRate(e.target.value === "" ? 0 : Number(e.target.value))}
                    required
                  />
                </div>
                <DialogFooter className="pt-4 gap-2 flex justify-end">
                  <DialogClose render={<Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl h-11 px-4" />}>
                    Cancel
                  </DialogClose>
                  <Button type="submit" className="bg-gold hover:bg-gold/90 text-navy font-bold rounded-xl h-11 px-6">
                    Add Item
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button className="bg-navy text-white rounded-xl h-12 px-8" onClick={saveRates}>
            <Save className="w-4 h-4 mr-2" /> Save Global Rates
          </Button>
        </div>
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
            <div className="overflow-x-auto">
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
                  {filtered.map((item) => (
                    <TableRow key={item.key} className="hover:bg-slate-50/30 transition-colors border-slate-50">
                      <TableCell className="pl-8 py-4 font-medium capitalize text-navy flex items-center gap-2">
                        {item.name}
                        {item.isCustom && <Badge className="bg-gold/20 text-gold hover:bg-gold/20 border-none font-bold text-[9px] px-1.5 py-0.5 rounded-md">Custom</Badge>}
                      </TableCell>
                      <TableCell>
                         <span className="text-xs text-slate-400 italic">
                           {item.category}
                         </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 rounded-md text-[10px] uppercase font-bold">{item.unit}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-3">
                           <span className="text-slate-400">₹</span>
                           <Input 
                              type="number" 
                              className="w-32 h-11 border-slate-200 text-right font-bold text-navy rounded-lg focus:border-gold transition-all"
                              value={item.rate === 0 ? "" : item.rate}
                              onChange={(e) => handleRateChange(item.key, e.target.value)}
                              min="0"
                           />
                           {item.isCustom && (
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg shrink-0 ml-1"
                               onClick={() => {
                                 deleteCustomMaterialRate(item.id!);
                                 toast.error(`${item.name} removed from rates`);
                               }}
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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

