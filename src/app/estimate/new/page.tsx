"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  FileCheck, 
  Calculator, 
  IndianRupee, 
  Download,
  Share2,
  Printer,
  ChevronRight,
  HardHat,
  MapPin,
  Calendar as CalendarIcon,
  Plus
} from "lucide-react";
import { useEstimateStore, ProjectDetails, MaterialItem } from "@/store/useEstimateStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

function NewEstimateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const tabParam = searchParams.get("tab");
  const { estimates, addEstimate, updateEstimate, calculateQuantities } = useEstimateStore();
  const [activeTab, setActiveTab] = useState("details");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Progress state
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Step 1: Project Details
  const [details, setDetails] = useState<ProjectDetails>({
    projectName: "",
    clientName: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    projectType: "residential",
    builtUpArea: 0,
    floors: 1,
    foundationType: "Isolated Footing",
    wallThickness: "9 inch",
    slabThickness: "5 inch",
    rooms: 2,
    bathrooms: 2,
    staircase: true,
    parking: true,
  });

  // Step 2 & 3: Materials & Rates
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  
  // Summary State
  const [summary, setSummary] = useState({
    materialTotal: 0,
    labourCost: 0,
    contractorMargin: 10,
    wastage: 5,
    transportation: 0,
    miscellaneous: 0,
    grandTotal: 0,
  });

  // Load existing estimate data if editing
  useEffect(() => {
    if (editId && estimates.length > 0 && !isDataLoaded) {
      const existing = estimates.find(e => e.id === editId);
      if (existing) {
        setDetails(existing.details);
        setMaterials(existing.materials);
        setSummary(existing.summary);
        setIsDataLoaded(true);
      }
    }
  }, [editId, estimates, isDataLoaded]);

  // Set active tab if tab param is present
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Auto-calculate quantities when details change (skip if loading initial edit data)
  useEffect(() => {
    if (editId && !isDataLoaded) {
      return;
    }
    if (details.builtUpArea > 0) {
      const initialMaterials = calculateQuantities(details);
      setMaterials(initialMaterials);
    }
  }, [details.builtUpArea, details.projectType, editId, isDataLoaded]);

  // Calculate totals whenever materials or summary factors change
  useEffect(() => {
    const matTotal = materials.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const wastageAmt = (matTotal * summary.wastage) / 100;
    const subtotal = matTotal + wastageAmt + summary.labourCost + summary.transportation + summary.miscellaneous;
    const marginAmt = (subtotal * summary.contractorMargin) / 100;
    
    setSummary(prev => ({
      ...prev,
      materialTotal: matTotal,
      grandTotal: subtotal + marginAmt
    }));
  }, [materials, summary.labourCost, summary.contractorMargin, summary.wastage, summary.transportation, summary.miscellaneous]);

  const handleDetailChange = (field: keyof ProjectDetails, value: any) => {
    let sanitizedValue = value;
    if (field === 'builtUpArea') {
      sanitizedValue = Math.max(0, Number(value));
    } else if (field === 'floors') {
      sanitizedValue = Math.max(1, Number(value));
    }
    setDetails(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const handleMaterialChange = (id: string, field: 'quantity' | 'rate' | 'category' | 'name', value: any) => {
    let sanitizedValue = value;
    if (field === 'quantity' || field === 'rate') {
      sanitizedValue = Math.max(0, Number(value));
    }
    setMaterials(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: sanitizedValue };
        if (field === 'quantity' || field === 'rate') {
          updated.total = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSummaryChange = (field: keyof typeof summary, value: number) => {
    setSummary(prev => ({ ...prev, [field]: Math.max(0, value) }));
  };

  const addCustomMaterial = () => {
    const newItem: MaterialItem = {
      id: crypto.randomUUID(),
      name: "New Material",
      category: "Custom",
      unit: "Nos",
      quantity: 1,
      rate: 0,
      total: 0
    };
    setMaterials([...materials, newItem]);
    toast.success("Custom material added");
  };

  const handleSave = () => {
    if (editId) {
      updateEstimate(editId, {
        details,
        materials,
        summary,
      });
      toast.success("Estimate updated successfully!");
    } else {
      const newEstimate = {
        id: crypto.randomUUID(),
        details,
        materials,
        summary,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addEstimate(newEstimate);
      toast.success("Estimate saved successfully!");
    }
    router.push("/");
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(10, 25, 47); // Navy
    doc.text("VELON CONSTRUCTIONS", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("Premium Quality Construction & Engineering", 105, 26, { align: "center" });
    
    doc.setDrawColor(197, 160, 89); // Gold
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // Project Details
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Project: ${details.projectName}`, 20, 45);
    doc.text(`Client: ${details.clientName}`, 20, 52);
    doc.text(`Location: ${details.location}`, 20, 59);
    doc.text(`Date: ${details.date}`, 140, 45);
    doc.text(`Type: ${details.projectType}`, 140, 52);
    doc.text(`Area: ${details.builtUpArea} sq.ft`, 140, 59);

    // Items Table
    const tableData = materials.map(m => [m.name, m.category, m.quantity, m.unit, m.rate, m.total.toLocaleString()]);
    doc.autoTable({
      startY: 70,
      head: [['Material', 'Category', 'Qty', 'Unit', 'Rate (INR)', 'Amount (INR)']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [10, 25, 47], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { top: 70 }
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Material Subtotal:`, 130, finalY);
    doc.text(`INR ${summary.materialTotal.toLocaleString()}`, 170, finalY, { align: "right" });
    
    doc.text(`Labour Cost:`, 130, finalY + 7);
    doc.text(`INR ${summary.labourCost.toLocaleString()}`, 170, finalY + 7, { align: "right" });
    
    doc.text(`Transportation:`, 130, finalY + 14);
    doc.text(`INR ${summary.transportation.toLocaleString()}`, 170, finalY + 14, { align: "right" });

    doc.setDrawColor(10, 25, 47);
    doc.line(130, finalY + 18, 180, finalY + 18);
    
    doc.setFontSize(12);
    doc.setTextColor(10, 25, 47);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total:`, 130, finalY + 25);
    doc.text(`INR ${summary.grandTotal.toLocaleString()}`, 170, finalY + 25, { align: "right" });

    doc.save(`${details.projectName}_BOQ.pdf`);
    toast.success("PDF Exported");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(materials.map(m => ({
      Material: m.name,
      Category: m.category,
      Quantity: m.quantity,
      Unit: m.unit,
      Rate: m.rate,
      Total: m.total
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BOQ");
    XLSX.writeFile(wb, `${details.projectName}_BOQ.xlsx`);
    toast.success("Excel exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-navy">Create New Estimate</h1>
            <p className="text-sm text-muted-foreground">Follow the steps to generate a professional BOQ.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button className="bg-navy hover:bg-navy/90 text-white rounded-xl shadow-lg shadow-navy/10" onClick={handleSave}>
            <FileCheck className="w-4 h-4 mr-2" /> Finalize Estimate
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-16 bg-white p-1 rounded-2xl shadow-sm premium-shadow border border-slate-100">
          <TabsTrigger value="details" className="rounded-xl data-[state=active]:bg-navy data-[state=active]:text-white transition-all gap-2">
            <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">1</div>
            Project Details
          </TabsTrigger>
          <TabsTrigger value="quantities" className="rounded-xl data-[state=active]:bg-navy data-[state=active]:text-white transition-all gap-2">
             <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">2</div>
            Quantities
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-xl data-[state=active]:bg-navy data-[state=active]:text-white transition-all gap-2">
             <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">3</div>
            Rates & Pricing
          </TabsTrigger>
          <TabsTrigger value="boq" className="rounded-xl data-[state=active]:bg-navy data-[state=active]:text-white transition-all gap-2">
             <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px]">4</div>
            BOQ Summary
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm premium-shadow">
              <CardHeader className="border-b border-slate-50 px-8 py-6">
                <CardTitle className="text-navy flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-gold" />
                  Basic Project Information
                </CardTitle>
                <CardDescription>Enter the core details of the construction project.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Name</Label>
                    <Input 
                      placeholder="E.g. Emerald Heights Residency" 
                      className="h-12 border-slate-200 focus:border-gold rounded-xl transition-all"
                      value={details.projectName}
                      onChange={(e) => handleDetailChange('projectName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Client Name</Label>
                    <Input 
                      placeholder="Name of the client" 
                      className="h-12 border-slate-200 focus:border-gold rounded-xl"
                      value={details.clientName}
                      onChange={(e) => handleDetailChange('clientName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Site Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="District / City" 
                        className="h-12 pl-10 border-slate-200 focus:border-gold rounded-xl"
                        value={details.location}
                        onChange={(e) => handleDetailChange('location', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="date" 
                        className="h-12 pl-10 border-slate-200 focus:border-gold rounded-xl"
                        value={details.date}
                        onChange={(e) => handleDetailChange('date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Type</Label>
                    <Select value={details.projectType} onValueChange={(v) => handleDetailChange('projectType', v)}>
                      <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential House</SelectItem>
                        <SelectItem value="villa">Luxury Villa</SelectItem>
                        <SelectItem value="commercial">Commercial Building</SelectItem>
                        <SelectItem value="warehouse">Industrial Warehouse</SelectItem>
                        <SelectItem value="interior">Interior Fit-out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-12 h-px bg-slate-100" />

                <div className="mt-12">
                   <h3 className="text-lg font-bold text-navy mb-6 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-gold" />
                    Measurement & Structural Inputs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Built-up Area (sq.ft)</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        min="0"
                        className="h-12 border-slate-200 font-bold text-lg rounded-xl"
                        value={details.builtUpArea || ""}
                        onChange={(e) => handleDetailChange('builtUpArea', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Number of Floors</Label>
                      <Input 
                        type="number" 
                        min="1"
                        className="h-12 border-slate-200 rounded-xl"
                        value={details.floors}
                        onChange={(e) => handleDetailChange('floors', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Foundation Type</Label>
                      <Select value={details.foundationType} onValueChange={(v) => handleDetailChange('foundationType', v)}>
                        <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Isolated Footing">Isolated Footing</SelectItem>
                          <SelectItem value="Raft Foundation">Raft Foundation</SelectItem>
                          <SelectItem value="Pile Foundation">Pile Foundation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 group">
                      <div className="flex items-center justify-between h-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Label className="text-sm font-medium cursor-pointer">Staircase Included?</Label>
                        <Switch 
                          checked={details.staircase} 
                          onCheckedChange={(v) => handleDetailChange('staircase', v)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-8 flex justify-end gap-3 rounded-b-2xl">
                <Button 
                  size="lg" 
                  className="bg-navy text-white px-8 rounded-xl"
                  onClick={() => {
                    if (details.builtUpArea <= 0) {
                      toast.error("Please enter a valid built-up area");
                      return;
                    }
                    setActiveTab("quantities");
                  }}
                >
                  Calculate Quantities <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="quantities" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm premium-shadow">
              <CardHeader className="px-8 py-6 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-navy">Auto-Calculated Material Quantities</CardTitle>
                  <CardDescription>Based on {details.builtUpArea} sq.ft {details.projectType} thumb rules.</CardDescription>
                </div>
                <Badge variant="outline" className="text-gold border-gold/30 bg-gold/5 px-4 py-1">
                  Adjustable Fields
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="pl-8 font-bold text-navy h-14">Material Name</TableHead>
                      <TableHead className="font-bold text-navy">Category</TableHead>
                      <TableHead className="font-bold text-navy">Unit</TableHead>
                      <TableHead className="font-bold text-navy w-40">Estimated Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-8 py-4">
                           <Input 
                            value={item.name}
                            onChange={(e) => handleMaterialChange(item.id, 'name', e.target.value)}
                            className="bg-transparent border-none p-0 font-medium text-navy focus-visible:ring-0 focus-visible:underline"
                           />
                        </TableCell>
                        <TableCell>
                           <Input 
                            value={item.category}
                            onChange={(e) => handleMaterialChange(item.id, 'category', e.target.value)}
                            className="bg-transparent border-none p-0 text-slate-500 text-sm focus-visible:ring-0 focus-visible:underline"
                           />
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-md font-medium">{item.unit}</Badge></TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="0"
                            className="w-28 h-10 border-slate-200 focus:bg-white rounded-lg font-semibold"
                            value={item.quantity}
                            onChange={(e) => handleMaterialChange(item.id, 'quantity', Number(e.target.value))}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-emerald-50/30 hover:bg-emerald-50/30">
                      <TableCell colSpan={4} className="py-4 pl-8">
                         <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={addCustomMaterial}>
                           <Plus className="w-4 h-4 mr-2" /> Add Custom Material
                         </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-8 flex justify-between rounded-b-2xl">
                <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setActiveTab("details")}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back to Details
                </Button>
                <Button size="lg" className="bg-navy text-white px-8 rounded-xl" onClick={() => setActiveTab("pricing")}>
                  Set Rates & Pricing <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm premium-shadow">
              <CardHeader className="px-8 py-6 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-navy flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-gold" />
                    Market Rates & Pricing Entry
                  </CardTitle>
                  <CardDescription>Enter current market rates for each material.</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Material Cost</p>
                  <p className="text-2xl font-black text-navy">₹{summary.materialTotal.toLocaleString()}</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="pl-8 font-bold text-navy h-14">Material</TableHead>
                      <TableHead className="font-bold text-navy">Category</TableHead>
                      <TableHead className="font-bold text-navy text-right">Qty / Unit</TableHead>
                      <TableHead className="font-bold text-navy">Rate (₹)</TableHead>
                      <TableHead className="text-right pr-8 font-bold text-navy">Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-8 font-medium text-navy">{item.name}</TableCell>
                        <TableCell className="text-slate-500 text-sm italic">{item.category}</TableCell>
                        <TableCell className="text-right text-navy font-medium">{item.quantity} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium">₹</span>
                            <Input 
                              type="number" 
                              min="0"
                              className="w-28 h-10 border-slate-200 rounded-lg font-bold text-navy"
                              value={item.rate}
                              onChange={(e) => handleMaterialChange(item.id, 'rate', Number(e.target.value))}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-8 font-bold text-navy">₹{(item.quantity * item.rate).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-8 flex justify-between rounded-b-2xl">
                <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setActiveTab("quantities")}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back to Quantities
                </Button>
                <Button size="lg" className="bg-navy text-white px-8 rounded-xl" onClick={() => setActiveTab("boq")}>
                  View BOQ Summary <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="boq" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm premium-shadow">
                  <CardHeader className="bg-navy rounded-t-2xl text-white px-8 py-10 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gold rounded-lg shadow-lg">
                          <HardHat className="text-navy w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Velon Constructions</h2>
                      </div>
                      <div className="flex flex-wrap gap-x-12 gap-y-4">
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Project</p>
                          <p className="text-lg font-semibold">{details.projectName}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Client</p>
                          <p className="text-lg font-semibold">{details.clientName}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Built-up Area</p>
                          <p className="text-lg font-semibold">{details.builtUpArea} sq.ft</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Estimate Date</p>
                          <p className="text-lg font-semibold">{details.date}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 border-x border-slate-50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableHead className="pl-8 h-12 text-xs font-bold uppercase tracking-wider text-slate-500">Material / Category</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Qty</TableHead>
                          <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Rate</TableHead>
                          <TableHead className="text-right pr-8 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materials.map((m, idx) => (
                           <TableRow key={m.id} className="border-slate-50 hover:bg-slate-50/20 transition-colors">
                            <TableCell className="pl-8 py-3.5">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-300 font-mono">{String(idx+1).padStart(2, '0')}</span>
                                <div>
                                  <p className="font-bold text-navy text-sm">{m.name}</p>
                                  <p className="text-[10px] text-slate-400 italic">{m.category}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-500 text-xs">{m.unit}</TableCell>
                            <TableCell className="text-navy font-semibold text-xs">{m.quantity}</TableCell>
                            <TableCell className="text-navy text-xs italic">₹{m.rate}</TableCell>
                            <TableCell className="text-right pr-8 font-bold text-navy">₹{m.total.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex flex-col gap-3 rounded-b-2xl">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Material Subtotal</span>
                      <span className="font-semibold text-navy">₹{summary.materialTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Labour & Transportation</span>
                      <span className="font-semibold text-navy">₹{(summary.labourCost + summary.transportation).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-navy/10 mt-2">
                       <span className="text-lg font-bold text-navy">Grand Total Estimate</span>
                       <span className="text-2xl font-black text-navy tracking-tight">₹{summary.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-sm premium-shadow">
                  <CardHeader className="border-b border-slate-50">
                    <CardTitle className="text-lg text-navy">Project Parameters</CardTitle>
                    <CardDescription>Adjust margins and buffer charges.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Labour Cost (INR)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={summary.labourCost} 
                        onChange={(e) => handleSummaryChange('labourCost', Number(e.target.value))}
                        className="h-11 rounded-lg font-bold text-navy"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contractor Margin (%)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={summary.contractorMargin} 
                        onChange={(e) => handleSummaryChange('contractorMargin', Number(e.target.value))}
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Wastage Buffer (%)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={summary.wastage} 
                        onChange={(e) => handleSummaryChange('wastage', Number(e.target.value))}
                        className="h-11 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Transportation (INR)</Label>
                      <Input 
                        type="number" 
                        min="0"
                        value={summary.transportation} 
                        onChange={(e) => handleSummaryChange('transportation', Number(e.target.value))}
                        className="h-11 rounded-lg"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                   <Button 
                    className="w-full h-14 bg-navy hover:bg-navy/90 text-white rounded-xl shadow-lg border-none"
                    onClick={exportPDF}
                   >
                     <Download className="w-4 h-4 mr-2" /> Download PDF BOQ
                   </Button>
                   <Button 
                    variant="outline" 
                    className="w-full h-14 border-slate-200 rounded-xl bg-white hover:bg-slate-50"
                    onClick={exportExcel}
                   >
                     <Share2 className="w-4 h-4 mr-2" /> Export to Excel
                   </Button>
                   <Button 
                    variant="outline" 
                    className="w-full h-14 border-slate-200 rounded-xl bg-white hover:bg-slate-50"
                    onClick={() => window.print()}
                   >
                     <Printer className="w-4 h-4 mr-2" /> Print Estimate
                   </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default function NewEstimate() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold">Loading estimate details...</div>}>
      <NewEstimateForm />
    </Suspense>
  );
}

